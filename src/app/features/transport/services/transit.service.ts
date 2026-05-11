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

  async loadData() {
    if (this.isLoaded()) return;
    try {
      const timestamp = new Date().getTime();
      const data = await firstValueFrom(this.http.get<any[]>(`/gtfs_transit_data.json?v=${timestamp}`));
      this.smartStops.set(data);
      this.isLoaded.set(true);
    } catch (err) {
      console.error('Failed to load transit data:', err);
    }
  }

  getArrivalsForStep(stopName: string, lineName: string, coords: {lat: number, lng: number}, timeOffsetSeconds: number = 0) {
    const data = this.smartStops();
    if (!data || data.length === 0) return [];

    const normalize = (s: string) => s ? s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim() : '';
    const targetName = normalize(stopName);
    const cleanLine = (lineName || '').toString().replace(/[^0-9A-Z]/gi, '').toLowerCase();

    // 1. Find the station
    let station = data.find(s => 
      normalize(s.name) === targetName || 
      normalize(s.displayName || '') === targetName ||
      targetName.includes(normalize(s.name)) ||
      normalize(s.name).includes(targetName)
    );
    
    if (!station) {
      // Check platforms
      data.forEach(s => {
        if (s.allPlatforms) {
          const found = s.allPlatforms.find((p: any) => normalize(p.name) === targetName || targetName.includes(normalize(p.name)));
          if (found) station = found;
        }
      });
    }

    if (!station) {
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

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2) * Math.sin(Δλ/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  }
}
