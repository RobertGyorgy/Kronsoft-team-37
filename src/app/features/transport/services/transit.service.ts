import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TransitService {
  private http = inject(HttpClient);
  
  public smartStops = signal<any[]>([]);
  public isLoaded = signal(false);

  public stopSequences = new Map<string, any[]>(); // Key: "lineName_target"

  async loadData() {
    if (this.isLoaded()) return;
    try {
      const timestamp = new Date().getTime();
      const data = await firstValueFrom(this.http.get<any[]>(`/gtfs_transit_data.json?v=${timestamp}`));
      this.smartStops.set(data);
      this.buildStopSequences(data);
      this.isLoaded.set(true);
    } catch (err) {
      console.error('Failed to load transit data:', err);
    }
  }

  private buildStopSequences(data: any[]) {
    const tempSequences = new Map<string, any[]>();

    data.forEach(stop => {
      Object.keys(stop.lines).forEach(lineKey => {
        const line = stop.lines[lineKey];
        const seqKey = `${line.name}_${line.target}`;
        
        if (!tempSequences.has(seqKey)) tempSequences.set(seqKey, []);
        
        // Get earliest time to determine sequence order
        const schedule = line.timetable['Mo-Fr'] || line.timetable['Sa-Su'] || [];
        if (schedule.length > 0) {
          tempSequences.get(seqKey)!.push({
            ...stop,
            firstTime: schedule[0]
          });
        }
      });
    });

    // Sort each sequence by time
    tempSequences.forEach((stops, key) => {
      stops.sort((a, b) => {
        const [hA, mA] = a.firstTime.split(':').map(Number);
        const [hB, mB] = b.firstTime.split(':').map(Number);
        return (hA * 60 + mA) - (hB * 60 + mB);
      });
      this.stopSequences.set(key, stops);
    });
  }

  findBoardingStation(userLat: number, userLon: number, destLat: number, destLon: number, threshold: number = 2000) {
    const data = this.smartStops();
    if (!data || data.length === 0) return null;

    const byName = new Map<string, any[]>();
    for (const stop of data) {
      if (!byName.has(stop.name)) byName.set(stop.name, []);
      byName.get(stop.name)!.push(stop);
    }

    let bestStop: any = null;
    let bestScore = -Infinity;
    const lonFactor = Math.cos(userLat * Math.PI / 180);

    data.forEach(stop => {
      const dist = this.calculateDistance(userLat, userLon, stop.lat, stop.lon);
      if (dist > threshold) return;

      const toDest = { lat: destLat - stop.lat, lon: (destLon - stop.lon) * lonFactor };
      let maxStopAlignment = -1;
      const lineCount = Object.keys(stop.lines || {}).length;
      
      Object.values(stop.lines as Record<string, any>).forEach((line: any) => {
        const termini = byName.get(line.target);
        if (!termini || termini.length === 0) return;
        const terminus = termini[0];
        const toTerminus = { lat: terminus.lat - stop.lat, lon: (terminus.lon - stop.lon) * lonFactor };
        const mag1 = Math.sqrt(toDest.lat**2 + toDest.lon**2);
        const mag2 = Math.sqrt(toTerminus.lat**2 + toTerminus.lon**2);
        if (mag1 === 0 || mag2 === 0) return;
        const dot = (toDest.lat * toTerminus.lat + toDest.lon * toTerminus.lon) / (mag1 * mag2);
        if (dot > maxStopAlignment) maxStopAlignment = dot;
      });

      // LOGICAL HUB PRIORITY
      // 1. alignment * 5000 (Directional priority)
      // 2. pow(lineCount, 1.8) * 30 (Aggressive Hub Gravity)
      // 3. dist * 1.5 (Exponential walking penalty to favor the nearest hub)
      const score = (maxStopAlignment * 5000) + (Math.pow(lineCount, 1.8) * 30) - Math.pow(dist, 1.2);
      
      if (score > bestScore) {
        bestScore = score;
        bestStop = { ...stop, distance: dist };
      }
    });

    return bestStop;
  }

  findTopHubs(userLat: number, userLon: number, destLat: number, destLon: number, limit: number = 3, threshold: number = 2000) {
    const data = this.smartStops();
    if (!data || data.length === 0) return [];

    const byName = new Map<string, any[]>();
    for (const stop of data) {
      if (!byName.has(stop.name)) byName.set(stop.name, []);
      byName.get(stop.name)!.push(stop);
    }

    const scored = data.map(stop => {
      const dist = this.calculateDistance(userLat, userLon, stop.lat, stop.lon);
      if (dist > threshold) return { stop, score: -Infinity };

      const lonFactor = Math.cos(userLat * Math.PI / 180);
      const toDest = { lat: destLat - stop.lat, lon: (destLon - stop.lon) * lonFactor };
      let maxStopAlignment = -1;
      const lineCount = Object.keys(stop.lines || {}).length;
      
      Object.values(stop.lines as Record<string, any>).forEach((line: any) => {
        const termini = byName.get(line.target);
        if (termini?.[0]) {
          const terminus = termini[0];
          const toTerminus = { lat: terminus.lat - stop.lat, lon: (terminus.lon - stop.lon) * lonFactor };
          const mag1 = Math.sqrt(toDest.lat**2 + toDest.lon**2);
          const mag2 = Math.sqrt(toTerminus.lat**2 + toTerminus.lon**2);
          if (mag1 > 0 && mag2 > 0) {
            const dot = (toDest.lat * toTerminus.lat + toDest.lon * toTerminus.lon) / (mag1 * mag2);
            if (dot > maxStopAlignment) maxStopAlignment = dot;
          }
        }
      });

      const score = (maxStopAlignment * 5000) + (Math.pow(lineCount, 1.8) * 30) - Math.pow(dist, 1.2);
      return { stop, score };
    })
    .filter(s => s.score > -Infinity)
    .sort((a, b) => b.score - a.score);

    // Ensure we don't return duplicate names
    const unique: any[] = [];
    const seen = new Set<string>();
    for (const s of scored) {
      if (!seen.has(s.stop.name)) {
        unique.push({ ...s.stop, totalScore: s.score });
        seen.add(s.stop.name);
      }
      if (unique.length >= limit) break;
    }
    return unique;
  }

  getTravelTimeMinutes(line: string, target: string, boardingId: string, alightingId: string): number {
    const sequence = this.getTripSequence(line, target, boardingId, alightingId);
    if (sequence.length < 2) return 0;

    const firstStop = sequence[0];
    const lastStop = sequence[sequence.length - 1];

    const [h1, m1] = firstStop.firstTime.split(':').map(Number);
    const [h2, m2] = lastStop.firstTime.split(':').map(Number);

    const t1 = h1 * 60 + m1;
    const t2 = h2 * 60 + m2;

    let diff = t2 - t1;
    if (diff < 0) diff += 1440; // Wrap around midnight

    return diff;
  }

  getTripSequence(line: string, target: string, boardingId: string, alightingId: string) {
    const seqKey = `${line}_${target}`;
    const sequence = this.stopSequences.get(seqKey);
    if (!sequence) return [];

    const bIdx = sequence.findIndex(s => s.id === boardingId);
    const aIdx = sequence.findIndex(s => s.id === alightingId);

    if (bIdx === -1 || aIdx === -1 || bIdx >= aIdx) return [];
    return sequence.slice(bIdx, aIdx + 1);
  }

  findBestTransitTrip(userLat: number, userLon: number, destLat: number, destLon: number, walkingThreshold: number = 2000) {
    const data = this.smartStops();
    const possibleBoardingStops = data.filter(s => this.calculateDistance(userLat, userLon, s.lat, s.lon) <= walkingThreshold);
    const possibleAlightingStops = data.filter(s => this.calculateDistance(destLat, destLon, s.lat, s.lon) <= walkingThreshold);

    let bestTrip: any = null;
    let minWalk = Infinity;
    let maxIdx = -1;

    possibleBoardingStops.forEach(bStop => {
      possibleAlightingStops.forEach(aStop => {
        Object.keys(bStop.lines).forEach(bLineKey => {
          const bLine = bStop.lines[bLineKey];
          Object.keys(aStop.lines).forEach(aLineKey => {
            const aLine = aStop.lines[aLineKey];

            if (bLine.name === aLine.name && bLine.target === aLine.target) {
              const seqKey = `${bLine.name}_${bLine.target}`;
              const sequence = this.stopSequences.get(seqKey);
              if (!sequence) return;

              const bIdx = sequence.findIndex(s => s.id === bStop.id);
              const aIdx = sequence.findIndex(s => s.id === aStop.id);

              if (bIdx !== -1 && aIdx !== -1 && bIdx < aIdx) {
                const bDist = this.calculateDistance(userLat, userLon, bStop.lat, bStop.lon);
                const aDist = this.calculateDistance(destLat, destLon, aStop.lat, aStop.lon);
                let totalWalk = bDist + aDist;

                const isSignificantlyCloser = totalWalk < minWalk - 300;
                const isComparableButBetterSeq = Math.abs(totalWalk - minWalk) <= 50 && bIdx > maxIdx;

                if (isSignificantlyCloser || isComparableButBetterSeq) {
                  minWalk = totalWalk;
                  maxIdx = bIdx;
                  bestTrip = {
                    boarding: { ...bStop, distance: bDist },
                    alighting: { ...aStop, distance: aDist },
                    line: bLine.name,
                    target: bLine.target,
                    stopsInBetween: aIdx - bIdx
                  };
                }
              }
            }
          });
        });
      });
    });

    return bestTrip;
  }

  findLocalJourney(userLat: number, userLon: number, destLat: number, destLon: number, threshold: number = 1500) {
    const data = this.smartStops();
    if (!data || data.length === 0) return null;

    const boardingStops = data.filter(s => this.calculateDistance(userLat, userLon, s.lat, s.lon) <= threshold);
    const alightingStops = data.filter(s => this.calculateDistance(destLat, destLon, s.lat, s.lon) <= threshold);

    let bestJourney: any = null;
    let minTotalTime = Infinity;

    // 1. Check for Direct Trips
    boardingStops.forEach(bStop => {
      alightingStops.forEach(aStop => {
        Object.values(bStop.lines as Record<string, any>).forEach(bLine => {
          Object.values(aStop.lines as Record<string, any>).forEach(aLine => {
            if (bLine.name === aLine.name && bLine.target === aLine.target) {
              const travelTime = this.getTravelTimeMinutes(bLine.name, bLine.target, bStop.id, aStop.id);
              if (travelTime > 0) {
                // Approximate first wait
                const firstWait = 10; 
                const total = travelTime + firstWait + (this.calculateDistance(userLat, userLon, bStop.lat, bStop.lon) / 80);
                if (total < minTotalTime) {
                  minTotalTime = total;
                  bestJourney = {
                    type: 'DIRECT',
                    legs: [{ line: bLine.name, target: bLine.target, boarding: bStop, alighting: aStop, duration: travelTime }]
                  };
                }
              }
            }
          });
        });
      });
    });

    // 2. Check for 1-Transfer Trips (The "Thinking" part)
    if (!bestJourney || minTotalTime > 60) {
      boardingStops.forEach(bStop => {
        Object.values(bStop.lines as Record<string, any>).forEach(bLine => {
          const sequence = this.getTripSequence(bLine.name, bLine.target, bStop.id, null as any);
          sequence.forEach(transferStop => {
            if (transferStop.id === bStop.id) return;
            
            Object.values(transferStop.lines as Record<string, any>).forEach(tLine => {
              alightingStops.forEach(aStop => {
                Object.values(aStop.lines as Record<string, any>).forEach(finalLine => {
                  if (tLine.name === finalLine.name && tLine.target === finalLine.target) {
                    const time1 = this.getTravelTimeMinutes(bLine.name, bLine.target, bStop.id, transferStop.id);
                    const time2 = this.getTravelTimeMinutes(tLine.name, tLine.target, transferStop.id, aStop.id);
                    
                    if (time1 > 0 && time2 > 0) {
                      const total = time1 + time2 + 15; // 15 min buffer for transfer and wait
                      if (total < minTotalTime) {
                        minTotalTime = total;
                        bestJourney = {
                          type: 'TRANSFER',
                          legs: [
                            { line: bLine.name, target: bLine.target, boarding: bStop, alighting: transferStop, duration: time1 },
                            { line: tLine.name, target: tLine.target, boarding: transferStop, alighting: aStop, duration: time2 }
                          ]
                        };
                      }
                    }
                  }
                });
              });
            });
          });
        });
      });
    }

    return bestJourney;
  }

  getArrivalsForStep(stopName: string, lineName: string, coords: {lat: number, lng: number}, timeOffsetSeconds: number = 0, stationId?: string) {
    const data = this.smartStops();
    if (!data || data.length === 0) return [];

    const normalize = (s: string) => s ? s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim() : '';
    const targetName = normalize(stopName);
    const cleanLine = (lineName || '').toString().replace(/[^0-9A-Z]/gi, '').toLowerCase();

    // 1. Find the station
    let station = stationId ? data.find(s => s.id === stationId) : null;
    
    if (!station) {
      station = data.find(s => 
        normalize(s.name) === targetName || 
        normalize(s.displayName || '') === targetName ||
        targetName.includes(normalize(s.name)) ||
        normalize(s.name).includes(targetName)
      );
    }
    
    if (!station) {
      // Check platforms
      data.forEach(s => {
        if (s.allPlatforms) {
          const found = s.allPlatforms.find((p: any) => p.id === stationId || normalize(p.name) === targetName || targetName.includes(normalize(p.name)));
          if (found) station = found;
        }
      });
    }

    if (!station && !stationId) {
      station = data.reduce((prev, curr) => {
        const dPrev = this.calculateDistance(coords.lat, coords.lng, prev.lat, prev.lon);
        const dCurr = this.calculateDistance(coords.lat, coords.lng, curr.lat, curr.lon);
        return (dCurr < dPrev) ? curr : prev;
      });
      if (this.calculateDistance(coords.lat, coords.lng, station.lat, station.lon) > 300) {
        station = null;
      }
    }

    if (!station) return [];

    // 2. Calculate arrivals with time offset
    const arrivals: any[] = [];
    const now = new Date();
    // Apply the journey duration offset to our 'reference' time
    const referenceTime = new Date(now.getTime() + timeOffsetSeconds * 1000);
    const refH = referenceTime.getHours();
    const refM = referenceTime.getMinutes();
    const serviceIds = this.getCurrentServiceIds();

    Object.keys(station.lines).forEach(lineKey => {
      const lineData = station.lines[lineKey];
      const dbLine = (lineData.name || lineKey.split('_')[0]).toString().replace(/[^0-9A-Z]/gi, '').toLowerCase();
      
      if (dbLine === cleanLine) {
        let bestEtas: any[] = [];
        serviceIds.forEach(serviceId => {
          const schedule = lineData.timetable[serviceId];
          if (!schedule) return;
          
          schedule.forEach((timeStr: string) => {
            const [hStr, mStr] = timeStr.split(':');
            let h = parseInt(hStr, 10);
            const m = parseInt(mStr, 10);
            if (h >= 24) h -= 24;
            
            let diff = (h * 60 + m) - (refH * 60 + refM);
            // Handling wraps around midnight
            if (diff < -120) diff += 1440; 
            
            if (diff >= 0 && diff <= 1440) {
              bestEtas.push({ 
                time: `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`, 
                wait: diff 
              });
            }
          });
        });
        arrivals.push(...bestEtas);
      }
    });

    // Deduplicate, sort and slice (Top 3)
    const unique = Array.from(new Map(arrivals.map(item => [item.time, item])).values());
    return unique.sort((a, b) => a.wait - b.wait).slice(0, 3);
  }

  private getCurrentServiceIds(): string[] {
    const day = new Date().getDay();
    if (day === 0) return ['Sa-Su', 'Su'];
    if (day === 6) return ['Sa-Su', 'Sa'];
    if (day === 5) return ['Mo-Fr', 'green_fridays', 'TE:Mo-Fr'];
    return ['Mo-Fr', 'TE:Mo-Fr'];
  }

  public calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2) * Math.sin(Δλ/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  }
}
