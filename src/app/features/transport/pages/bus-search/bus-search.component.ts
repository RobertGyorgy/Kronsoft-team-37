import { ChangeDetectionStrategy, Component, signal, OnDestroy, PLATFORM_ID, inject, OnInit, afterNextRender, ViewEncapsulation, DestroyRef, ElementRef, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

declare const google: any;

@Component({
  selector: 'app-bus-search',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="transport-container">
      <header class="top-nav">
        <button class="back-pill" (click)="goBack()">
          <span class="material-icons">arrow_back</span>
          <span>Înapoi</span>
        </button>
        <div class="search-wrap">
          <div class="search-pill">
            <span class="material-icons search-ico">search</span>
            <input 
              type="text" 
              placeholder="Caută stație..." 
              (input)="onSearch($any($event.target).value)"
              [value]="searchTerm()"
            />
            <button class="locate-btn" (click)="findNearbyStation()" title="Stații apropiate">
              <span class="material-icons">my_location</span>
            </button>
          </div>
        </div>
      </header>

      @if (searchResults().length > 0) {
        <div class="search-overlay">
          <div class="results-container">
            @for (station of searchResults(); track station.id) {
              <div class="result-card" (click)="selectStation(station)">
                <div class="res-icon">
                  <span class="material-icons">directions_bus</span>
                </div>
                <div class="res-body">
                  <div class="res-name-row">
                    <span class="res-name">{{ station.isHub ? station.name : (station.displayName || station.name) }}</span>
                    @if (station.isHub) { <span class="hub-chip">TERMINAL</span> }
                  </div>
                  <div class="res-lines">
                    @for (lineName of getUniqueLineNames(station.lines); track lineName) {
                      <span class="mini-line" [style.background]="station.lines[getFirstKey(station.lines, lineName)].color">{{ lineName }}</span>
                    }
                  </div>
                </div>
                <span class="material-icons chevron">chevron_right</span>
              </div>
            }
          </div>
        </div>
      }

      <div class="main-content">
        <section class="map-section">
          <div class="map-canvas">
            <div #mapContainer class="map-element"></div>
            @if (isLoading()) {
              <div class="map-overlay-loader">
                <div class="loader-ring"></div>
              </div>
            }
          </div>
        </section>

        <section class="station-viewer">
          @if (activeStation()) {
            <header class="station-meta">
              <div class="meta-left">
                <h1>{{ activeStation()?.name }}</h1>
                <div class="station-status">
                  <span class="dot active"></span>
                  <span>STAȚIE VERIFICATĂ • BRAȘOV SMART CITY</span>
                </div>
              </div>
              <button class="navigate-btn" (click)="takeMeThere(activeStation())">
                <span class="material-icons">near_me</span>
                <span>Duce-mă acolo</span>
              </button>
            </header>

            <div class="available-lines">
              <div class="list-label">Linii în stație</div>
              <div class="line-scroller">
                @for (line of activeStation()!.lineDetails || []; track line.name) {
                  <button class="line-pill-btn" [style.background]="line.color" [style.color]="line.textColor" (click)="openTimetable(line)">
                    {{ line.name }}
                  </button>
                }
              </div>
            </div>

            <div class="arrivals-list">
              <div class="list-label">Sosiri Următoare</div>
              @for (arr of activeStation()?.arrivals?.slice(0, displayLimit()) || []; track arr.line + arr.eta) {
                <div class="arrival-card" (click)="openTimetable(arr)">
                  <div class="line-identity" [style.background]="arr.color" [style.color]="arr.textColor">
                    {{ arr.shortLine }}
                  </div>
                  <div class="arrival-info">
                    <span class="dest">{{ arr.target }}</span>
                    <div class="status-wrap">
                      <span class="live-pulse"></span>
                      <span class="status-text">LIVE • Programat la {{ arr.scheduledTime }}</span>
                    </div>
                  </div>
                  <div class="eta-wrap">
                    <span class="eta-num">{{ arr.eta }}</span>
                    <span class="eta-unit">min</span>
                  </div>
                </div>
              }

              @if (activeStation()?.arrivals?.length > displayLimit()) {
                <button class="view-more-btn" (click)="showMore()">
                  <span>Vezi mai multe</span>
                  <span class="material-icons">expand_more</span>
                </button>
              }

              @if (!isFetchingLines() && activeStation()?.arrivals?.length === 0) {
                <div class="empty-arrivals">
                  <span class="material-icons">event_busy</span>
                  <p>Nu sunt sosiri programate în următoarea oră.</p>
                </div>
              }
            </div>
          } @else if (!isLoading()) {
            <div class="hero-empty">
              <span class="material-icons">explore</span>
              <h2>Transport Public Brașov</h2>
              <p>Caută o stație sau folosește locația pentru a vedea sosirile în timp real.</p>
              <button class="hero-locate" (click)="findNearbyStation()">
                <span class="material-icons">my_location</span>
                Vezi stații apropiate
              </button>
            </div>
          }
        </section>
      </div>

      <!-- Timetable Modal -->
      @if (viewingTimetable()) {
        <div class="modal-backdrop" (click)="closeTimetable()">
          <div class="modal-sheet" (click)="$event.stopPropagation()">
            <header class="sheet-header" [style.background]="viewingTimetable()!.color" [style.color]="viewingTimetable()!.textColor">
              <div class="sheet-info">
                <span class="sheet-line">{{ viewingTimetable()!.name }}</span>
                <span class="sheet-dest">către {{ viewingTimetable()!.target }}</span>
              </div>
              <button class="sheet-close" (click)="closeTimetable()">
                <span class="material-icons">close</span>
              </button>
            </header>
            
            <div class="sheet-content">
              <div class="day-tabs">
                @for (service of getServiceKeys(viewingTimetable()!.timetable); track service) {
                  <button [class.on]="selectedService() === service" (click)="selectedService.set(service)">
                    {{ service === 'Mo-Fr' ? 'Luni-Vineri' : (service === 'Sa-Su' ? 'Sâmbătă-Duminică' : service) }}
                  </button>
                }
              </div>

              <div class="times-flex">
                @for (time of viewingTimetable()!.timetable[selectedService()]; track time) {
                  <div class="time-item" [class.highlight]="isNextTime(time)">
                    {{ time }}
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .transport-container { background: #fcfcfc; min-height: 100vh; font-family: 'Outfit', sans-serif; color: #1a1a1a; }
    .top-nav { position: sticky; top: 0; z-index: 1000; background: rgba(255,255,255,0.8); backdrop-filter: blur(20px); padding: 1rem 1.5rem; display: flex; flex-direction: column; gap: 1rem; border-bottom: 1px solid rgba(0,0,0,0.05); }
    .back-pill { border: none; background: #fff; padding: 0.6rem 1.2rem; border-radius: 100px; display: flex; align-items: center; gap: 0.5rem; font-weight: 700; color: #444; width: fit-content; box-shadow: 0 4px 12px rgba(0,0,0,0.05); cursor: pointer; transition: all 0.2s; }
    .back-pill:active { transform: scale(0.95); }
    .search-pill { background: #f2f3f5; border-radius: 16px; padding: 0.6rem 1.2rem; display: flex; align-items: center; gap: 0.8rem; border: 2px solid transparent; transition: all 0.3s; }
    .search-pill:focus-within { background: #fff; border-color: #ff4500; box-shadow: 0 10px 20px rgba(255,69,0,0.1); }
    .search-ico { color: #999; font-size: 1.2rem; }
    .search-pill input { border: none; background: transparent; flex: 1; outline: none; font-size: 1rem; font-weight: 600; color: #1a1a1a; }
    .locate-btn { border: none; background: #fff; width: 34px; height: 34px; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #ff4500; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
    .search-overlay { position: fixed; inset: 0; top: 120px; background: rgba(255,255,255,0.95); backdrop-filter: blur(10px); z-index: 900; overflow-y: auto; padding: 1.5rem; }
    .results-container { display: flex; flex-direction: column; gap: 1rem; max-width: 600px; margin: 0 auto; }
    .result-card { background: #fff; border-radius: 20px; padding: 1.2rem; display: flex; align-items: center; gap: 1rem; border: 1px solid #f0f0f0; box-shadow: 0 4px 15px rgba(0,0,0,0.03); cursor: pointer; transition: all 0.2s; }
    .result-card:active { transform: scale(0.98); background: #fafafa; }
    .res-icon { width: 44px; height: 44px; background: #fff5f2; border-radius: 14px; display: flex; align-items: center; justify-content: center; color: #ff4500; }
    .res-body { flex: 1; display: flex; flex-direction: column; gap: 0.2rem; }
    .res-name-row { display: flex; align-items: center; gap: 0.6rem; }
    .res-name { font-weight: 800; font-size: 1.05rem; }
    .hub-chip { font-size: 0.6rem; font-weight: 900; background: #ff4500; color: #fff; padding: 2px 6px; border-radius: 4px; }
    .res-lines { display: flex; flex-wrap: wrap; gap: 4px; }
    .mini-line { font-size: 0.6rem; color: #fff; padding: 1px 5px; border-radius: 3px; font-weight: 900; min-width: 20px; text-align: center; }
    .chevron { color: #ccc; font-size: 1.2rem; }

    .main-content { max-width: 800px; margin: 0 auto; padding-bottom: 4rem; }
    .map-section { padding: 1.5rem; }
    .map-canvas { height: 280px; background: #eee; border-radius: 28px; overflow: hidden; position: relative; box-shadow: 0 10px 30px rgba(0,0,0,0.08); }
    .map-element { height: 100%; width: 100%; }
    .map-overlay-loader { position: absolute; inset: 0; background: rgba(255,255,255,0.7); display: flex; align-items: center; justify-content: center; z-index: 10; }
    .loader-ring { width: 30px; height: 30px; border: 3px solid #f0f0f0; border-top-color: #ff4500; border-radius: 50%; animation: spin 0.8s linear infinite; }

    .station-viewer { padding: 0 1.5rem; }
    .station-meta { margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; }
    h1 { font-size: 2rem; font-weight: 900; letter-spacing: -0.03em; margin-bottom: 0.5rem; line-height: 1; flex: 1; }
    .navigate-btn { background: #1a1a1a; color: #fff; border: none; padding: 0.8rem 1.2rem; border-radius: 16px; font-weight: 800; font-size: 0.85rem; display: flex; align-items: center; gap: 0.6rem; cursor: pointer; transition: all 0.2s; white-space: nowrap; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .navigate-btn:active { transform: scale(0.95); background: #333; }
    .station-status { display: flex; align-items: center; gap: 0.5rem; font-size: 0.7rem; font-weight: 800; color: #999; text-transform: uppercase; letter-spacing: 0.05em; }
    .dot { width: 8px; height: 8px; border-radius: 50%; background: #ccc; }
    .dot.active { background: #2ecc71; box-shadow: 0 0 8px rgba(46,204,113,0.5); }

    .list-label { font-size: 0.8rem; font-weight: 800; color: #bbb; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 1.2rem; }
    .arrivals-list { margin-bottom: 2.5rem; }
    .arrival-card { background: #fff; border-radius: 24px; padding: 1rem; display: flex; align-items: center; gap: 1rem; margin-bottom: 0.8rem; border: 1px solid #f2f2f2; box-shadow: 0 4px 12px rgba(0,0,0,0.02); transition: transform 0.2s; }
    .arrival-card:active { transform: scale(0.98); }
    .line-identity { width: 50px; height: 50px; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 1.2rem; flex-shrink: 0; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .arrival-info { flex: 1; display: flex; flex-direction: column; gap: 0.2rem; }
    .dest { font-weight: 800; font-size: 1.1rem; color: #1a1a1a; line-height: 1.2; }
    .status-wrap { display: flex; align-items: center; gap: 0.5rem; }
    .live-pulse { width: 6px; height: 6px; background: #2ecc71; border-radius: 50%; animation: pulse-live 1.5s infinite; }
    .status-text { font-size: 0.7rem; font-weight: 700; color: #999; }
    .eta-wrap { text-align: right; display: flex; flex-direction: column; line-height: 1; }
    .eta-num { font-size: 1.6rem; font-weight: 900; color: #ff4500; }
    .eta-unit { font-size: 0.7rem; font-weight: 800; color: #ff4500; text-transform: uppercase; }
    .line-scroller { display: flex; gap: 0.6rem; overflow-x: auto; padding-bottom: 1rem; scrollbar-width: none; }
    .line-pill-btn { border: none; padding: 0.6rem 1.2rem; border-radius: 14px; font-weight: 800; font-size: 0.9rem; white-space: nowrap; box-shadow: 0 4px 10px rgba(0,0,0,0.1); cursor: pointer; }
    .view-more-btn { width: 100%; background: transparent; border: 1px solid #eee; padding: 1rem; border-radius: 18px; display: flex; align-items: center; justify-content: center; gap: 0.8rem; color: #888; font-weight: 700; margin-top: 1rem; cursor: pointer; }
    .hero-empty { text-align: center; padding: 4rem 2rem; }
    .hero-locate { background: #ff4500; color: #fff; border: none; padding: 1rem 1.5rem; border-radius: 18px; font-weight: 800; display: flex; align-items: center; gap: 0.8rem; margin: 0 auto; box-shadow: 0 8px 20px rgba(255,69,0,0.3); cursor: pointer; }
    .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); z-index: 2000; display: flex; align-items: flex-end; }
    .modal-sheet { background: #fff; width: 100%; border-radius: 32px 32px 0 0; max-height: 85vh; overflow-y: auto; animation: slide-up 0.3s cubic-bezier(0.2, 0.8, 0.2, 1); }
    .sheet-header { padding: 2rem; display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; z-index: 10; }
    .sheet-line { font-size: 2.2rem; font-weight: 900; line-height: 1; }
    .sheet-dest { display: block; font-size: 1rem; font-weight: 700; opacity: 0.9; margin-top: 0.4rem; }
    .sheet-close { background: rgba(255,255,255,0.2); border: none; width: 44px; height: 44px; border-radius: 50%; color: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; }
    .sheet-content { padding: 2rem; }
    .day-tabs { display: flex; background: #f0f0f0; padding: 4px; border-radius: 14px; margin-bottom: 2rem; }
    .day-tabs button { flex: 1; border: none; background: transparent; padding: 0.8rem; border-radius: 10px; font-weight: 700; color: #888; cursor: pointer; }
    .day-tabs button.on { background: #fff; color: #1a1a1a; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
    .times-flex { display: flex; flex-wrap: wrap; gap: 0.8rem; }
    .time-item { background: #f8f8f8; padding: 0.8rem 1.2rem; border-radius: 14px; font-weight: 700; font-size: 1.1rem; color: #444; border: 1px solid #eee; }
    .time-item.highlight { background: #ff4500; color: #fff; border-color: #ff4500; box-shadow: 0 6px 15px rgba(255,69,0,0.3); transform: scale(1.1); }
    @keyframes slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } }
    @keyframes pulse-live { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(2); opacity: 0; } 100% { transform: scale(1); opacity: 0; } }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class BusSearchComponent implements OnInit, OnDestroy {
  @ViewChild('mapContainer') mapContainer!: ElementRef;
  public Object = Object;
  private http = inject(HttpClient);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  
  private map: any;
  private markers: any[] = [];
  private initTimeout: any;
  
  isLoading = signal<boolean>(false);
  isFetchingLines = signal<boolean>(false);
  searchTerm = signal<string>('');
  
  public allStations: any[] = [];
  activeStation = signal<any | null>(null);
  searchResults = signal<any[]>([]);
  public smartStops = signal<any[]>([]);

  viewingTimetable = signal<any | null>(null);
  selectedService = signal<string>('Mo-Fr');

  constructor() {
    afterNextRender(() => {
      this.initTimeout = setTimeout(() => {
        if (this.initMap()) {
          this.loadTransitDatabase();
          setTimeout(() => this.findNearbyStation(true), 500);
        }
      }, 100);
    });
  }

  ngOnInit() {}
  ngOnDestroy() {
    if (this.initTimeout) clearTimeout(this.initTimeout);
  }

  private initMap(): boolean {
    if (this.map) return true;
    if (!this.mapContainer) return false;

    this.map = new google.maps.Map(this.mapContainer.nativeElement, {
      center: { lat: 45.6483, lng: 25.5891 },
      zoom: 14,
      disableDefaultUI: true,
      styles: this.getMapStyles()
    });
    return true;
  }

  private loadTransitDatabase() {
    const timestamp = new Date().getTime();
    this.http.get<any[]>(`/gtfs_transit_data.json?v=${timestamp}`)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.smartStops.set(data);
          this.fetchPopularHubs();
        },
        error: (err) => console.error('Failed to load GTFS transit database', err)
      });
  }

  private normalizeText(value: string): string {
    if (!value) return '';
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/ă|â/g, 'a')
      .replace(/î/g, 'i')
      .replace(/ș/g, 's')
      .replace(/ț/g, 't')
      .trim();
  }

  private fetchPopularHubs() {
    const data = this.smartStops();
    if (!data || data.length === 0) return;
    const uniqueNames = new Set<string>();
    const hubs: any[] = [];
    data.forEach(stop => {
      if (!uniqueNames.has(stop.name) && hubs.length < 12) {
        uniqueNames.add(stop.name);
        hubs.push({
          ...stop,
          id: 'hub-' + stop.id,
          lineCount: Object.keys(stop.lines || {}).length,
          address: 'Brașov, România'
        });
      }
    });
    this.allStations = hubs.sort((a, b) => b.lineCount - a.lineCount);
    if (!this.activeStation()) this.selectStation(this.allStations[0]);
  }

  onSearch(query: string) {
    this.searchTerm.set(query);
    if (!query || query.length < 1) { this.searchResults.set([]); return; }
    const data = this.smartStops();
    const normalizedQuery = this.normalizeText(query);
    const resultsMap = new Map<string, any>();
    data.forEach(stop => {
      const normalizedName = this.normalizeText(stop.name);
      const normalizedDisplay = this.normalizeText(stop.displayName || '');
      const lineNumbers = Object.keys(stop.lines || []);
      const isHub = !!(stop.parent && stop.parent.startsWith('relation/'));
      let score = 0;
      if (normalizedName === normalizedQuery) score += 200;
      else if (normalizedDisplay === normalizedQuery) score += 180;
      else if (normalizedName.startsWith(normalizedQuery)) score += 100;
      else if (normalizedDisplay.startsWith(normalizedQuery)) score += 80;
      else if (normalizedName.includes(' ' + normalizedQuery)) score += 60;
      else if (normalizedDisplay.includes(normalizedQuery)) score += 40;
      else if (normalizedName.includes(normalizedQuery)) score += 20;
      if (isHub) score += 50;
      if (lineNumbers.some(l => l.toLowerCase() === normalizedQuery)) score += 70;
      else if (lineNumbers.some(l => l.toLowerCase().startsWith(normalizedQuery))) score += 30;
      if (score > 0) {
        const groupKey = (stop.parent && stop.parent.startsWith('relation/')) ? stop.parent : stop.id;
        if (!resultsMap.has(groupKey)) {
          resultsMap.set(groupKey, { ...stop, score, isHub: !!(stop.parent && stop.parent.startsWith('relation/')), allPlatforms: [stop] });
        } else {
          const existing = resultsMap.get(groupKey);
          existing.score = Math.max(existing.score, score);
          existing.allPlatforms.push(stop);
          Object.assign(existing.lines, stop.lines);
        }
      }
    });
    this.searchResults.set(Array.from(resultsMap.values()).sort((a, b) => b.score - a.score).slice(0, 15));
  }

  selectStation(station: any) {
    this.searchResults.set([]);
    this.searchTerm.set('');
    this.isLoading.set(true);
    this.activeStation.set(null);
    const uniqueLines = new Map();
    Object.keys(station.lines).forEach(lKey => {
      const line = station.lines[lKey];
      const shortName = line.name || lKey.split('_')[0];
      if (!uniqueLines.has(shortName)) uniqueLines.set(shortName, { name: shortName, ...line });
    });
    const lineDetails = Array.from(uniqueLines.values());
    const fullStation = { 
      ...station, 
      arrivals: [], 
      lineDetails, 
      multipleMarkers: !!station.isHub, 
      name: station.isHub ? station.name : (station.displayName || station.name) 
    };
    this.activeStation.set(fullStation);
    this.updateMap(station.isHub ? station.allPlatforms : [station], station);
    this.fetchRealtimeArrivals(station.lines);
  }

  selectPlatform(plat: any) {
    this.isLoading.set(true);
    const uniqueLines = new Map();
    Object.keys(plat.lines).forEach(lKey => {
      const line = plat.lines[lKey];
      const shortName = line.name || lKey.split('_')[0];
      if (!uniqueLines.has(shortName)) uniqueLines.set(shortName, { name: shortName, ...line });
    });
    this.activeStation.update(s => ({ ...s, name: plat.name, lineDetails: Array.from(uniqueLines.values()), multipleMarkers: true }));
    this.fetchRealtimeArrivals(plat.lines);
  }

  getUniqueLineNames(lines: any): string[] {
    if (!lines) return [];
    const names = new Set<string>();
    Object.keys(lines).forEach(k => names.add(lines[k].name || k.split('_')[0]));
    return Array.from(names);
  }

  getFirstKey(lines: any, name: string): string {
    return Object.keys(lines).find(k => (lines[k].name || k.split('_')[0]) === name) || '';
  }

  openTimetable(line: any) {
    const currentServiceIds = this.getCurrentServiceIds();
    const defaultService = currentServiceIds.find(sid => line.timetable[sid]) || Object.keys(line.timetable)[0];
    this.selectedService.set(defaultService);
    this.viewingTimetable.set(line);
  }

  closeTimetable() { this.viewingTimetable.set(null); }
  getServiceKeys(timetable: any) { return Object.keys(timetable || {}); }

  isNextTime(time: string) {
    const now = new Date();
    const [h, m] = time.split(':').map(Number);
    const nowVal = now.getHours() * 60 + now.getMinutes();
    const line = this.viewingTimetable();
    if (!line) return false;
    const schedule = line.timetable[this.selectedService()];
    if (!schedule) return false;
    const nextMatch = schedule.find((t: string) => {
      const [th, tm] = t.split(':').map(Number);
      return (th * 60 + tm) >= nowVal;
    });
    return time === nextMatch;
  }

  private updateMap(platforms: any[], hub: any) {
    if (!this.map) return;
    this.markers.forEach(m => m.setMap(null));
    this.markers = [];
    if (!platforms || platforms.length === 0) return;

    const bounds = new google.maps.LatLngBounds();
    platforms.forEach((plat) => {
      const pos = { lat: plat.lat, lng: plat.lon };
      bounds.extend(pos);
      const marker = new google.maps.Marker({
        position: pos,
        map: this.map,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 7,
          fillColor: '#ff4500',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2
        }
      });
      marker.addListener('click', () => this.selectPlatform(plat));
      this.markers.push(marker);
    });

    if (platforms.length === 1) {
      this.map.setCenter({ lat: platforms[0].lat, lng: platforms[0].lon });
      this.map.setZoom(17);
    } else {
      this.map.fitBounds(bounds);
    }
  }

  private getCurrentServiceIds(): string[] {
    const day = new Date().getDay();
    if (day === 0) return ['Sa-Su', 'Su'];
    if (day === 6) return ['Sa-Su', 'Sa'];
    if (day === 5) return ['Mo-Fr', 'green_fridays', 'TE:Mo-Fr'];
    return ['Mo-Fr', 'TE:Mo-Fr'];
  }

  private fetchRealtimeArrivals(stationLines: any) {
    if (!stationLines) { this.isLoading.set(false); this.isFetchingLines.set(false); return; }
    this.isFetchingLines.set(true);
    const arrivals: any[] = [];
    const now = new Date();
    const curH = now.getHours();
    const curM = now.getMinutes();
    const currentServiceIds = this.getCurrentServiceIds();

    Object.keys(stationLines).forEach(lineKey => {
       const lineData = stationLines[lineKey];
       let bestEta = Infinity;
       let scheduledTime = '';
       currentServiceIds.forEach(serviceId => {
         const scheduleArray = lineData.timetable[serviceId];
         if (!scheduleArray) return;
         for (const timeStr of scheduleArray) {
             const [hStr, mStr] = timeStr.split(':');
             let hour = parseInt(hStr, 10);
             const min = parseInt(mStr, 10);
             if (hour >= 24) hour -= 24;
             let diff = (hour * 60 + min) - (curH * 60 + curM);
             if (diff < 0) diff += 1440;
             if (diff < bestEta) { bestEta = diff; scheduledTime = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`; }
         }
       });
       if (bestEta !== Infinity) {
          arrivals.push({
             line: lineKey, shortLine: lineData.name || lineKey.split('_')[0],
             target: lineData.target, eta: bestEta.toString(), scheduledTime,
             color: lineData.color, textColor: lineData.textColor, timetable: lineData.timetable
          });
       }
    });
    this.finalizeArrivals(arrivals);
  }

  private finalizeArrivals(arrivals: any[]) {
    this.activeStation.update(s => {
      if (!s) return s;
      const lineGroups = new Map<string, any[]>();
      arrivals.forEach(arr => {
        if (!lineGroups.has(arr.shortLine)) lineGroups.set(arr.shortLine, []);
        lineGroups.get(arr.shortLine)!.push(arr);
      });
      const stationName = this.normalizeText(this.activeStation()?.name || '');
      let processedArrivals = Array.from(lineGroups.values()).map(group => {
        group.sort((a,b) => parseInt(a.eta) - parseInt(b.eta));
        const earliest = group[0];
        const outbound = group.find(a => this.normalizeText(a.target) !== stationName);
        return (outbound && this.normalizeText(earliest.target) === stationName) ? { ...earliest, target: outbound.target } : earliest;
      });
      processedArrivals.sort((a,b) => parseInt(a.eta) - parseInt(b.eta));
      return { ...s, arrivals: processedArrivals.slice(0, 100) };
    });
    this.isFetchingLines.set(false);
    this.isLoading.set(false);
  }

  displayLimit = signal(15);
  showMore() { this.displayLimit.update(v => v + 15); }

  findNearbyStation(auto: boolean = false) {
    if (!navigator.geolocation) return;
    if (!auto) this.isLoading.set(true);
    navigator.geolocation.getCurrentPosition((pos) => {
      const userLat = pos.coords.latitude;
      const userLon = pos.coords.longitude;
      let closest: any = null;
      let minDist = Infinity;
      this.smartStops().forEach(stop => {
        const dist = this.calculateDistance(userLat, userLon, stop.lat, stop.lon);
        if (dist < minDist) { minDist = dist; closest = stop; }
      });
      if (closest) this.selectStation(closest);
      else if (!auto) this.isLoading.set(false);
    }, () => { if (!auto) this.isLoading.set(false); }, { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 });
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private getMapStyles() {
    return [
      { "featureType": "all", "elementType": "labels.text.fill", "stylers": [{ "color": "#7c93a3" }, { "lightness": "-10" }] },
      { "featureType": "administrative.country", "elementType": "geometry", "stylers": [{ "visibility": "on" }] },
      { "featureType": "landscape", "elementType": "geometry", "stylers": [{ "color": "#f5f5f5" }, { "lightness": 20 }] },
      { "featureType": "poi", "elementType": "geometry", "stylers": [{ "color": "#f5f5f5" }, { "lightness": 21 }] },
      { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#dedede" }, { "lightness": 21 }] },
      { "featureType": "road.highway", "elementType": "geometry.fill", "stylers": [{ "color": "#ffffff" }, { "lightness": 17 }] },
      { "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [{ "color": "#ffffff" }, { "lightness": 29 }, { "weight": 0.2 }] },
      { "featureType": "road.arterial", "elementType": "geometry", "stylers": [{ "color": "#ffffff" }, { "lightness": 18 }] },
      { "featureType": "road.local", "elementType": "geometry", "stylers": [{ "color": "#ffffff" }, { "lightness": 16 }] },
      { "featureType": "transit", "elementType": "geometry", "stylers": [{ "color": "#f2f2f2" }, { "lightness": 19 }] },
      { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#e9e9e9" }, { "lightness": 17 }] }
    ];
  }

  takeMeThere(station: any) {
    if (!station) return;
    this.router.navigate(['/transport/bus/program'], { 
      queryParams: { 
        destLat: station.lat, 
        destLon: station.lon, 
        destName: station.isHub ? station.name : (station.displayName || station.name)
      } 
    });
  }

  goBack() { this.router.navigate(['/transport/bus']); }
}
