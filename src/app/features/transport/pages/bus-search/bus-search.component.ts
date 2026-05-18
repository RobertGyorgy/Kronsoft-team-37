import { ChangeDetectionStrategy, Component, signal, OnInit, OnDestroy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { TransitService } from '../../services/transit.service';

@Component({
  selector: 'app-bus-search',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <main class="bus-shell" [style.--bus-theme-color]="selectedBus()?.color || '#188038'" [style.--bus-theme-text-color]="selectedBus()?.textColor || '#ffffff'">
      <!-- Header Area -->
      <header class="top-nav-modern" [class.themed-nav]="selectedBus()">
        <div class="nav-card">
          <div class="nav-header-row">
            @if (selectedBus()) {
              <button class="minimal-back-btn" (click)="selectBus(null)">
                <span class="material-icons">arrow_back</span>
              </button>
              <div class="bus-badge-container">
                <span class="bus-badge-pill" [style.background]="selectedBus()?.color" [style.color]="selectedBus()?.textColor">
                  {{ selectedBus()?.shortName }}
                </span>
                <div class="bus-badge-details">
                  <span class="target-title">{{ selectedBus()?.origin }} ➔ {{ selectedBus()?.target }}</span>
                  <span class="subtitle-text">Traseu complet</span>
                </div>
              </div>
            } @else {
              <button class="minimal-back-btn" routerLink="/transport/bus">
                <span class="material-icons">arrow_back</span>
              </button>
              <div class="header-title-box">
                <h1 class="header-title">Orar Autobuze</h1>
                <span class="header-subtitle">Liniile urbane Brașov</span>
              </div>
            }
          </div>
        </div>
      </header>

      <!-- Main Content Area -->
      <section class="content-view">
        @if (isLoading()) {
          <div class="loading-container">
            <div class="spinner"></div>
            <p>Se încarcă baza de date...</p>
          </div>
        } @else {
          @if (selectedBus()) {
            <!-- Detail Timetable Page -->
            <div class="timetable-page">
              <!-- Day Type Tabs Switcher -->
              <div class="tabs-switcher">
                <button [class.active]="selectedDayType() === 'weekday'" (click)="selectedDayType.set('weekday')">
                  <span class="material-icons">work</span>
                  Luni - Vineri
                </button>
                <button [class.active]="selectedDayType() === 'weekend'" (click)="selectedDayType.set('weekend')">
                  <span class="material-icons">weekend</span>
                  Sâmbătă - Duminică
                </button>
              </div>

              <!-- Stations Timeline List -->
              <div class="stations-timeline">
                @for (station of selectedBus()?.stations; track station.stationId; let idx = $index) {
                  <div class="timeline-station-card" 
                       [class.expanded]="expandedStationId() === station.stationId"
                       (click)="toggleStation(station.stationId)">
                    <div class="timeline-indicator">
                      <div class="node-badge" [style.background]="selectedBus()?.color" [style.color]="selectedBus()?.textColor">
                        {{ idx + 1 }}
                      </div>
                      @if (idx < (selectedBus()?.stations?.length || 0) - 1) {
                        <div class="connector-line" [style.background]="selectedBus()?.color"></div>
                      }
                    </div>
                    
                    <div class="station-details">
                      <div class="station-header-row">
                        <div class="station-title-col">
                          <h3 class="station-name">{{ station.stationName }}</h3>
                          @if (expandedStationId() !== station.stationId) {
                            <span class="station-click-hint">Apasă pentru orar complet</span>
                          }
                        </div>
                        <button class="navigate-to-station-btn" (click)="planRouteTo(station); $event.stopPropagation()" title="Planifică traseu până aici">
                          <span class="material-icons">directions</span>
                        </button>
                      </div>
                      
                      <!-- Timetable Accordion Expanded Content -->
                      @if (expandedStationId() === station.stationId) {
                        <div class="hourly-schedule-grid" (click)="$event.stopPropagation()">
                          @for (group of getTimesGroupedByHour(station, selectedDayType()); track group.hour) {
                            <div class="hourly-row">
                              <div class="hour-cell" [style.background]="selectedBus()?.color + '15'" [style.color]="selectedBus()?.color">
                                {{ group.hour }}
                              </div>
                              <div class="minutes-cell">
                                @for (min of group.minutes; track min) {
                                  <span class="minute-pill" [style.border-color]="selectedBus()?.color + '30'">
                                    {{ min }}
                                  </span>
                                }
                              </div>
                            </div>
                          } @empty {
                            <div class="no-service-pill">Nu sunt plecări în această zi</div>
                          }
                        </div>
                      }
                    </div>
                  </div>
                }
              </div>
            </div>
          } @else {
            <!-- List of All Buses Page -->
            <div class="bus-list-page">
              <!-- Search Bar -->
              <div class="search-bar-box">
                <span class="material-icons search-icon">search</span>
                <input type="text" 
                       placeholder="Caută o linie de autobuz..." 
                       [value]="busSearchQuery()" 
                       (input)="onSearchInput($event)">
                @if (busSearchQuery()) {
                  <button class="clear-search-btn" (click)="busSearchQuery.set('')">
                    <span class="material-icons">close</span>
                  </button>
                }
              </div>

              <!-- Grouped Buses Grid -->
              <div class="buses-grid">
                @for (group of filteredGroups(); track group.shortName) {
                  <div class="bus-group-card">
                    <div class="group-header">
                      <span class="bus-badge" [style.background]="group.color" [style.color]="group.textColor">
                        {{ group.shortName }}
                      </span>
                      <div class="group-info">
                        <span class="group-title">Linia {{ group.shortName }}</span>
                        <span class="group-subtitle">{{ group.routes.length }} trasee active</span>
                      </div>
                    </div>
                    
                    <div class="group-routes-list">
                      @for (route of group.routes; track route.origin + '_' + route.target) {
                        <button class="route-select-row" (click)="selectBus(route)">
                          <div class="route-left">
                            <span class="material-icons route-icon">swap_calls</span>
                            <span class="route-path">{{ route.origin }} ➔ {{ route.target }}</span>
                          </div>
                          <div class="route-right">
                            <span class="route-stations-count">{{ route.stations.length }} stații</span>
                            <span class="material-icons route-arrow">chevron_right</span>
                          </div>
                        </button>
                      }
                    </div>
                  </div>
                } @empty {
                  <div class="empty-state">
                    <span class="material-icons">directions_bus_filled</span>
                    <h3>Nu am găsit nicio linie</h3>
                    <p>Încearcă o altă căutare.</p>
                  </div>
                }
              </div>
            </div>
          }
        }
      </section>
    </main>
  `,
  styles: [`
    .bus-shell { height: 100dvh; width: 100%; overflow: hidden; background: var(--bg-primary); font-family: 'Outfit', sans-serif; color: var(--text-primary); display: flex; flex-direction: column; position: relative; }
    
    .top-nav-modern { padding: calc(var(--safe-top) + 1rem) 1rem 0.5rem; z-index: 100; background: var(--bg-primary); }
    .nav-card { background: var(--bg-secondary); border-radius: 24px; border: 1px solid var(--border-color); padding: 1rem 1.25rem; box-shadow: 0 8px 32px rgba(0,0,0,0.02); transition: all 0.3s ease; }
    .nav-header-row { display: flex; align-items: center; gap: 1rem; }
    .minimal-back-btn { background: transparent; border: none; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--text-primary); cursor: pointer; transition: background 0.2s; }
    .minimal-back-btn:active { background: rgba(0,0,0,0.05); }
    
    /* Themed Header */
    .top-nav-modern.themed-nav .nav-card {
      background: var(--bus-theme-color);
      border-color: rgba(255,255,255,0.15);
      color: var(--bus-theme-text-color);
      box-shadow: 0 8px 24px rgba(0,0,0,0.08);
    }
    .top-nav-modern.themed-nav .minimal-back-btn {
      color: var(--bus-theme-text-color);
    }
    .top-nav-modern.themed-nav .minimal-back-btn:active {
      background: rgba(255,255,255,0.15);
    }
    .top-nav-modern.themed-nav .subtitle-text {
      color: var(--bus-theme-text-color);
      opacity: 0.85;
    }
    
    .header-title-box { display: flex; flex-direction: column; }
    .header-title { font-size: 1.6rem; font-weight: 800; margin: 0; letter-spacing: -0.03em; line-height: 1.1; }
    .header-subtitle { font-size: 0.85rem; color: var(--text-secondary); font-weight: 600; }
    
    .bus-badge-container { display: flex; align-items: center; gap: 1rem; flex: 1; min-width: 0; }
    .bus-badge-pill { font-size: 1.3rem; font-weight: 900; padding: 6px 16px; border-radius: 999px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); flex-shrink: 0; }
    .bus-badge-details { display: flex; flex-direction: column; min-width: 0; }
    .target-title { font-size: 1.05rem; font-weight: 800; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .subtitle-text { font-size: 0.8rem; color: var(--text-secondary); font-weight: 600; }
    
    .content-view { flex: 1; overflow-y: auto; padding: 0.5rem 1rem 3rem; -webkit-overflow-scrolling: touch; }
    
    .loading-container { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 50vh; color: var(--text-secondary); }
    .spinner { width: 36px; height: 36px; border: 3px solid var(--border-color); border-top-color: #188038; border-radius: 50%; animation: spin 0.8s linear infinite; margin-bottom: 1rem; }
    
    /* Bus List Page */
    .bus-list-page { display: flex; flex-direction: column; gap: 1rem; }
    .search-bar-box { background: var(--bg-secondary); border-radius: 16px; border: 1px solid var(--border-color); display: flex; align-items: center; padding: 0 1rem; height: 52px; gap: 0.75rem; }
    .search-icon { color: var(--text-secondary); }
    .search-bar-box input { border: none; background: transparent; flex: 1; font-family: 'Outfit', sans-serif; font-size: 0.95rem; font-weight: 600; outline: none; color: var(--text-primary); }
    .clear-search-btn { background: transparent; border: none; padding: 0; color: var(--text-secondary); cursor: pointer; display: flex; align-items: center; }
    
    .buses-grid { display: flex; flex-direction: column; gap: 1rem; }
    
    /* Grouped Bus Layout Styles */
    .bus-group-card { background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 24px; padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem; box-shadow: 0 4px 20px rgba(0,0,0,0.01); }
    .group-header { display: flex; align-items: center; gap: 1rem; border-bottom: 1px dashed var(--border-color); padding-bottom: 0.75rem; }
    .bus-badge { font-size: 1.1rem; font-weight: 800; width: 52px; height: 52px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.05); flex-shrink: 0; }
    .group-info { display: flex; flex-direction: column; }
    .group-title { font-size: 1.25rem; font-weight: 800; color: var(--text-primary); letter-spacing: -0.02em; }
    .group-subtitle { font-size: 0.8rem; color: var(--text-secondary); font-weight: 600; }
    .group-routes-list { display: flex; flex-direction: column; gap: 0.5rem; }
    
    .route-select-row { width: 100%; display: flex; justify-content: space-between; align-items: center; background: var(--bg-card); border: 1px solid var(--border-color); padding: 0.85rem 1rem; border-radius: 16px; text-align: left; cursor: pointer; transition: all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1); }
    .route-select-row:active { transform: scale(0.98); background: rgba(0,0,0,0.02); }
    .route-left { display: flex; align-items: center; gap: 0.75rem; min-width: 0; flex: 1; }
    .route-icon { color: var(--text-secondary); opacity: 0.6; font-size: 1.1rem; }
    .route-path { font-size: 0.95rem; font-weight: 700; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .route-right { display: flex; align-items: center; gap: 0.5rem; flex-shrink: 0; }
    .route-stations-count { font-size: 0.75rem; color: var(--text-secondary); font-weight: 600; background: var(--bg-primary); padding: 4px 8px; border-radius: 99px; border: 1px solid var(--border-color); }
    .route-arrow { color: var(--text-secondary); opacity: 0.5; font-size: 1.2rem; }
    
    .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 3rem 1.5rem; text-align: center; color: var(--text-secondary); }
    .empty-state .material-icons { font-size: 3rem; margin-bottom: 0.75rem; }
    .empty-state h3 { font-size: 1.2rem; font-weight: 800; margin: 0; color: var(--text-primary); }
    .empty-state p { font-size: 0.9rem; margin: 0.25rem 0 0; }
    
    /* Timetable Page */
    .timetable-page { display: flex; flex-direction: column; gap: 1.25rem; position: relative; }
    .timetable-page::before { content: ''; position: absolute; top: -40px; left: 50%; transform: translateX(-50%); width: 300px; height: 300px; background: var(--bus-theme-color); filter: blur(150px); opacity: 0.15; pointer-events: none; z-index: 0; }
    
    .tabs-switcher { display: grid; grid-template-columns: 1fr 1fr; background: var(--bg-secondary); border-radius: 999px; border: 1px solid var(--border-color); padding: 4px; gap: 4px; z-index: 10; position: relative; }
    .tabs-switcher button { border: none; background: transparent; padding: 0.75rem; border-radius: 999px; font-family: 'Outfit', sans-serif; font-size: 0.9rem; font-weight: 700; color: var(--text-secondary); display: flex; align-items: center; justify-content: center; gap: 0.5rem; cursor: pointer; transition: all 0.2s; }
    .tabs-switcher button.active { background: var(--bus-theme-color); color: #ffffff; box-shadow: 0 4px 14px rgba(0,0,0,0.1); }
    
    /* Accordion Timeline List */
    .stations-timeline { display: flex; flex-direction: column; position: relative; padding-left: 0.25rem; z-index: 10; }
    .timeline-station-card { display: flex; gap: 1.25rem; position: relative; cursor: pointer; border-radius: 20px; padding: 0.85rem 1rem; border: 1px solid transparent; transition: all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1); }
    .timeline-station-card:hover { background: rgba(0,0,0,0.02); }
    .timeline-station-card.expanded { background: var(--bg-secondary); border: 1px solid var(--border-color); box-shadow: 0 8px 30px rgba(0,0,0,0.02); margin-bottom: 0.75rem; padding: 1.25rem; }
    
    .timeline-indicator { display: flex; flex-direction: column; align-items: center; width: 32px; flex-shrink: 0; position: relative; }
    .node-badge { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.85rem; font-weight: 800; z-index: 5; box-shadow: 0 2px 8px rgba(0,0,0,0.08); transition: transform 0.2s; }
    .timeline-station-card.expanded .node-badge { transform: scale(1.1); }
    .connector-line { width: 3px; position: absolute; top: 32px; bottom: -16px; left: 50%; transform: translateX(-50%); z-index: 2; opacity: 0.6; }
    
    .station-details { flex: 1; min-width: 0; }
    
    .station-header-row { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
    .station-title-col { display: flex; flex-direction: column; min-width: 0; }
    .station-name { font-size: 1.05rem; font-weight: 800; color: var(--text-primary); margin: 0; line-height: 1.2; }
    .station-click-hint { font-size: 0.75rem; color: var(--text-secondary); opacity: 0.6; font-weight: 600; margin-top: 2px; }
    .navigate-to-station-btn { background: var(--bg-primary); border: 1px solid var(--border-color); color: #188038; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; flex-shrink: 0; }
    .navigate-to-station-btn:active { transform: scale(0.9); background: rgba(0,0,0,0.05); }
    
    /* Hourly Grid Schedule Styling */
    .hourly-schedule-grid {
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
      margin-top: 1.25rem;
      border-top: 1px solid var(--border-color);
      padding-top: 1rem;
      animation: slideDown 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
    }
    .hourly-row {
      display: flex;
      align-items: center;
    }
    .hour-cell {
      font-size: 0.95rem;
      font-weight: 900;
      width: 38px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 0.85rem;
      flex-shrink: 0;
    }
    .minutes-cell {
      display: flex;
      flex-wrap: wrap;
      gap: 0.35rem;
    }
    .minute-pill {
      font-size: 0.8rem;
      font-weight: 700;
      padding: 3px 8px;
      border: 1px solid var(--border-color);
      border-radius: 6px;
      background: var(--bg-primary);
      color: var(--text-primary);
      box-shadow: 0 1px 3px rgba(0,0,0,0.02);
    }
    
    .no-service-pill { font-size: 0.8rem; color: var(--text-secondary); font-weight: 600; padding: 6px 12px; background: rgba(0,0,0,0.02); border-radius: 999px; margin-top: 0.5rem; text-align: center; }
    
    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BusSearchComponent implements OnInit, OnDestroy {
  private transitService = inject(TransitService);
  private router = inject(Router);

  isLoading = signal(false);
  selectedBus = signal<any>(null);
  selectedDayType = signal<'weekday' | 'weekend'>('weekday');
  busSearchQuery = signal('');
  expandedStationId = signal<string | null>(null);

  // Compute all unique bus lines and directions strictly how the GTFS/database defines them
  allBuses = computed(() => {
    const stops = this.transitService.smartStops();
    const busesMap = new Map<string, any>();
    
    stops.forEach((stop: any) => {
      if (!stop.lines) return;
      Object.keys(stop.lines).forEach((lineKey) => {
        const line = stop.lines[lineKey];
        const shortName = line.name || lineKey.split('_')[0];
        const target = line.target || 'Direcție Urbană';
        
        // Group strictly by the GTFS lineKey (e.g. 52_0, 52_1) to match the database exactly
        const compositeKey = lineKey;
        
        if (!busesMap.has(compositeKey)) {
          busesMap.set(compositeKey, {
            shortName: shortName,
            lineKey: lineKey,
            color: line.color || '#188038',
            textColor: line.textColor || '#ffffff',
            target: target,
            _targetCounts: { [target]: 1 },
            stations: []
          });
        } else {
          const bus = busesMap.get(compositeKey);
          bus._targetCounts[target] = (bus._targetCounts[target] || 0) + 1;
        }
        
        const bus = busesMap.get(compositeKey);
        const alreadyExists = bus.stations.some((s: any) => s.stationName === stop.name);
        if (!alreadyExists) {
          bus.stations.push({
            stationId: stop.id,
            stationName: stop.name,
            lat: stop.lat,
            lon: stop.lon,
            timetable: line.timetable || {}
          });
        }
      });
    });
    
    // Helper to calculate distance in meters
    const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const R = 6371000;
      const phi1 = lat1 * Math.PI / 180;
      const phi2 = lat2 * Math.PI / 180;
      const deltaPhi = (lat2 - lat1) * Math.PI / 180;
      const deltaLambda = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
                Math.cos(phi1) * Math.cos(phi2) *
                Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };

    // Helper to topologically sort stations
    const sortStationsTopologically = (stations: any[], targetName: string, shortName: string) => {
      if (stations.length <= 1) return stations;

      // For standard lines, use simple and robust chronological sorting
      if (shortName !== '52') {
        const getEarliest = (timetable: any) => {
          let min = Infinity;
          Object.values(timetable).forEach((times: any) => {
            if (Array.isArray(times)) {
              times.forEach((t: string) => {
                const [h, m] = t.split(':').map(Number);
                const val = h * 60 + m;
                if (val < min) min = val;
              });
            }
          });
          return min === Infinity ? 9999 : min;
        };
        return [...stations].sort((a, b) => getEarliest(a.timetable) - getEarliest(b.timetable));
      }

      // Spatio-temporal reconstructor ONLY for Line 52
      const parsedStations = stations.map(s => {
        const allTimes: number[] = [];
        Object.values(s.timetable || {}).forEach((times: any) => {
          if (Array.isArray(times)) {
            times.forEach((t: string) => {
              const [h, m] = t.split(':').map(Number);
              allTimes.push(h * 60 + m);
            });
          }
        });
        return {
          ...s,
          times: Array.from(new Set(allTimes)).sort((a, b) => a - b)
        };
      });

      let bestTrace: any[] = [];
      
      parsedStations.forEach(startStop => {
        startStop.times.forEach((startTime: number) => {
          const trace = [{ ...startStop, time: startTime }];
          const visited = new Set([startStop.stationName]);
          let currTime = startTime;
          
          while (true) {
            let nextStop: any = null;
            let nextTime = 0;
            let minDiff = Infinity;
            
            parsedStations.forEach(s => {
              if (visited.has(s.stationName)) return;
              
              const last = trace[trace.length - 1];
              const dist = getDistance(last.lat, last.lon, s.lat, s.lon);
              
              // Spatial filter: typical adjacent city stops are within 1.6 km
              if (dist > 1600) return;
              
              s.times.forEach((t: number) => {
                const diff = t - currTime;
                if (diff >= 1 && diff <= 4 && diff < minDiff) {
                  // Speed filter: max 12.5 m/s (45 km/h) average speed between stops
                  const speed = dist / (diff * 60);
                  if (speed > 12.5) return;
                  
                  minDiff = diff;
                  nextStop = s;
                  nextTime = t;
                }
              });
            });
            
            if (nextStop) {
              trace.push({ ...nextStop, time: nextTime });
              visited.add(nextStop.stationName);
              currTime = nextTime;
            } else {
              break;
            }
          }
          
          if (trace.length > bestTrace.length) {
            bestTrace = trace;
          }
        });
      });

      const traceNames = new Set(bestTrace.map(t => t.stationName));
      const missing = parsedStations.filter(s => !traceNames.has(s.stationName));
      if (missing.length > 0) {
        const getMinTime = (s: any) => s.times.length > 0 ? s.times[0] : 9999;
        missing.sort((a, b) => getMinTime(a) - getMinTime(b));
        bestTrace = [...bestTrace, ...missing];
      }

      // Rotate loop so that the target stop is at the very end
      const targetIdx = bestTrace.findIndex(t => 
        t.stationName.toLowerCase().includes(targetName.toLowerCase()) ||
        targetName.toLowerCase().includes(t.stationName.toLowerCase())
      );
      
      if (targetIdx !== -1 && targetIdx < bestTrace.length - 1) {
        const part1 = bestTrace.slice(0, targetIdx + 1);
        const part2 = bestTrace.slice(targetIdx + 1);
        bestTrace = [...part2, ...part1];
      }

      return bestTrace.map(t => {
        const { times, time, ...rest } = t;
        return rest;
      });
    };

    // Post-process to resolve the most frequent destination string and sort stations chronologically
    busesMap.forEach((bus) => {
      let bestTarget = bus.target;
      let maxCount = 0;
      Object.keys(bus._targetCounts).forEach(t => {
        if (bus._targetCounts[t] > maxCount) {
          maxCount = bus._targetCounts[t];
          bestTarget = t;
        }
      });
      bus.target = bestTarget;

      bus.stations = sortStationsTopologically(bus.stations, bus.target, bus.shortName);
      bus.origin = bus.stations.length > 0 ? bus.stations[0].stationName : 'Origine necunoscută';
      bus.target = bus.stations.length > 0 ? bus.stations[bus.stations.length - 1].stationName : bus.target;
    });

    // Sort by line number first, then by destination name
    return Array.from(busesMap.values()).sort((a: any, b: any) => {
      const aNum = parseInt(a.shortName, 10);
      const bNum = parseInt(b.shortName, 10);
      if (!isNaN(aNum) && !isNaN(bNum)) {
        if (aNum !== bNum) return aNum - bNum;
        return a.target.localeCompare(b.target);
      }
      if (a.shortName !== b.shortName) return a.shortName.localeCompare(b.shortName);
      return a.target.localeCompare(b.target);
    });
  });

  // Group all buses by line name (e.g., shortName) to group both directions in pairs/groups
  groupedBuses = computed(() => {
    const buses = this.allBuses();
    const groupsMap = new Map<string, { shortName: string, color: string, textColor: string, routes: any[] }>();
    
    buses.forEach((bus) => {
      if (!groupsMap.has(bus.shortName)) {
        groupsMap.set(bus.shortName, {
          shortName: bus.shortName,
          color: bus.color,
          textColor: bus.textColor,
          routes: []
        });
      }
      groupsMap.get(bus.shortName)!.routes.push(bus);
    });
    
    // Sort groups by shortName (numeric if possible, otherwise string)
    return Array.from(groupsMap.values()).sort((a, b) => {
      const aNum = parseInt(a.shortName, 10);
      const bNum = parseInt(b.shortName, 10);
      if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
      return a.shortName.localeCompare(b.shortName);
    });
  });

  // Filter grouped buses based on search bar input
  filteredGroups = computed(() => {
    const query = this.busSearchQuery().toLowerCase().trim();
    const groups = this.groupedBuses();
    if (!query) return groups;
    
    return groups.map(g => {
      const isLineMatch = g.shortName.toLowerCase().includes(query);
      if (isLineMatch) {
        return g;
      }
      const matchingRoutes = g.routes.filter(r => 
        r.origin.toLowerCase().includes(query) || 
        r.target.toLowerCase().includes(query)
      );
      return { ...g, routes: matchingRoutes };
    }).filter(g => g.routes.length > 0);
  });

  constructor() {
    if (typeof window !== 'undefined') {
      const justEntered = sessionStorage.getItem('just_entered_transport_search');
      if (!justEntered) {
        sessionStorage.setItem('just_entered_transport_search', 'true');
        window.location.reload();
        return;
      }
    }
  }

  ngOnInit() {
    this.isLoading.set(true);
    this.transitService.loadData().then(() => {
      this.isLoading.set(false);
    });
  }

  ngOnDestroy() {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('just_entered_transport_search');
    }
  }

  onSearchInput(event: Event) {
    const input = event.target as HTMLInputElement;
    this.busSearchQuery.set(input.value);
  }

  selectBus(bus: any) {
    this.selectedBus.set(bus);
    if (bus && bus.stations.length > 0) {
      this.expandedStationId.set(bus.stations[0].stationId);
    } else {
      this.expandedStationId.set(null);
    }
  }

  toggleStation(stationId: string) {
    if (this.expandedStationId() === stationId) {
      this.expandedStationId.set(null);
    } else {
      this.expandedStationId.set(stationId);
    }
  }

  getTimesGroupedByHour(station: any, dayType: 'weekday' | 'weekend'): { hour: string, minutes: string[] }[] {
    const times = this.getTimetableTimes(station, dayType).filter(t => t !== '–');
    const groups: { [hour: string]: string[] } = {};
    times.forEach(t => {
      const [h, m] = t.split(':');
      if (!groups[h]) groups[h] = [];
      groups[h].push(m);
    });
    return Object.keys(groups).sort().map(h => ({
      hour: h,
      minutes: groups[h].sort()
    }));
  }

  planRouteTo(station: any) {
    this.router.navigate(['/transport/bus/program'], {
      queryParams: {
        destLat: station.lat,
        destLon: station.lon,
        destName: station.stationName
      }
    });
  }

  // Resolve and sort times for horizontal scroll
  getTimetableTimes(station: any, dayType: 'weekday' | 'weekend'): string[] {
    const bus = this.selectedBus();
    const timetable = station.timetable || {};
    const serviceKeys = dayType === 'weekday' 
      ? ['Mo-Fr', 'TE:Mo-Fr', 'green_fridays'] 
      : ['Sa-Su', 'Sa', 'Su'];

    const getTimesInMinutes = (st: any) => {
      let times: string[] = [];
      serviceKeys.forEach(key => {
        if (st.timetable && st.timetable[key]) {
          times = [...times, ...st.timetable[key]];
        }
      });
      return Array.from(new Set(times)).map(tStr => {
        const [h, m] = tStr.split(':').map(Number);
        return h * 60 + m;
      }).sort((a, b) => a - b);
    };

    if (bus && bus.shortName === '52') {
      const staticOffsets: { [key: string]: { [station: string]: number } } = {
        '52_0': {
          'Panselelor': 0, 'Parc Industrial Metrom': 1, 'Poienelor': 2, 'Roman': 3,
          'Carrefour': 5, 'Cometei': 7, 'Neptun': 8, 'Complexul Mare': 10, 'Gemenii': 12,
          'Scriitorilor': 14, 'Liceul Meșotă': 17, 'Onix': 19, 'Sanitas': 22, 'Primărie': 24,
          'Biserica Neagră': 28, 'Brâncoveanu': 29, 'Piața Unirii': 31, 'Tocile': 32
        },
        '52_1': {
          'Tocile': 0, 'Piața Unirii': 2, 'Liceul Șaguna': 3, 'Bălcescu': 6, 'Star': 8,
          'Patria': 10, 'Hidro A': 11, 'Toamnei': 14, 'Traian': 15, 'Gemenii': 17,
          'Complexul Mare': 19, 'Neptun': 20, 'Cometei': 21, 'Saturn': 22, 'Roman': 22,
          'Poienelor': 24, 'Parc Industrial Metrom': 25, 'Panselelor': 26
        }
      };

      const key = bus.lineKey;
      if (key && staticOffsets[key]) {
        const offsets = staticOffsets[key];
        const currentOffset = offsets[station.stationName] ?? 10;
        
        // Find reference trip times based on the Tocile station
        const referenceStationName = 'Tocile';
        const referenceStation = bus.stations.find((s: any) => s.stationName === referenceStationName);
        
        if (referenceStation) {
          const refTimes = getTimesInMinutes(referenceStation);
          
          // Trip start times are reference times minus the reference offset
          const refOffset = offsets[referenceStationName];
          const tripStartTimes = refTimes.map(t => t - refOffset);
          
          const currentTimes = getTimesInMinutes(station);
          
          return tripStartTimes.map(tStart => {
            const expected = tStart + currentOffset;
            const match = currentTimes.find(t => Math.abs(t - expected) <= 2);
            if (match !== undefined) {
              const h = Math.floor(match / 60);
              const m = match % 60;
              return h.toString().padStart(2, '0') + ':' + m.toString().padStart(2, '0');
            }
            return '–';
          });
        }
      }
    }

    // Standard fallback logic for all other buses
    let allTimes: string[] = [];
    serviceKeys.forEach(key => {
      if (timetable[key]) {
        allTimes = [...allTimes, ...timetable[key]];
      }
    });
    
    return Array.from(new Set(allTimes)).sort((a, b) => {
      const [aH, aM] = a.split(':').map(Number);
      const [bH, bM] = b.split(':').map(Number);
      return (aH * 60 + aM) - (bH * 60 + bM);
    });
  }
}
