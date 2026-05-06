import { ChangeDetectionStrategy, Component, signal, OnDestroy, PLATFORM_ID, inject, OnInit, afterNextRender } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

declare const L: any;

@Component({
  selector: 'app-bus-search',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="transport-container">
      <!-- Diagnostic Bar -->
      <div class="debug-bar" style="position: fixed; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.8); color: #0f0; font-family: monospace; font-size: 10px; padding: 4px 10px; z-index: 10000; display: flex; gap: 1rem;">
        <span>DB: {{ (transitData() | json) !== '{}' ? 'LOADED' : 'EMPTY' }}</span>
        <span>STATIONS: {{ allStations.length }}</span>
        <span>ACTIVE: {{ activeStation()?.name || 'NONE' }}</span>
        <span>BUSES: {{ activeStation()?.lines?.length || 0 }}</span>
        <span>FETCHING: {{ isFetchingLines() ? 'YES' : 'NO' }}</span>
      </div>

      <header class="header-card">
        <div class="search-box">
          <span class="material-icons search-icon">search</span>
          <input 
            type="text" 
            placeholder="Caută stație (ex: Livada Poștei)..." 
            (input)="onSearch($any($event.target).value)"
            [value]="searchTerm()"
          />
        </div>

        @if (searchResults().length > 0) {
          <div class="search-results">
            @for (station of searchResults(); track station.id) {
              <div class="result-item" (click)="selectStation(station)">
                <span class="material-icons hub-icon-color">directions_bus</span>
                <div class="result-info">
                  <div class="name-row">
                    <span class="name">{{ station.name }}</span>
                    <span class="hub-badge">REAL-TIME</span>
                  </div>
                  <div class="result-lines" style="display: flex; gap: 4px; margin: 2px 0; flex-wrap: wrap;">
                    @for (line of station.lines || []; track line) {
                      <span style="font-size: 0.65rem; background: #ff4500; color: #fff; padding: 2px 6px; border-radius: 4px; font-weight: 900;">{{ line }}</span>
                    }
                  </div>
                  <span class="result-street">{{ station.address }}</span>
                </div>
              </div>
            }
          </div>
        }
      </header>

      <div class="scroll-content">
        <section class="station-details">
          <div class="station-map-wrap">
            <div id="map" style="height: 100%; width: 100%; z-index: 1; border-radius: 32px;"></div>
            <div class="map-fade"></div>
            @if (isLoading()) {
              <div class="map-loader">
                <div class="spinner"></div>
              </div>
            }
          </div>

          <div class="details-content">
            @if (activeStation()) {
              <div class="station-header">
                <div class="header-info">
                  <div class="title-wrap">
                    <h2>{{ activeStation()?.name }}</h2>
                    <span class="status-pill">STAȚIE VERIFICATĂ</span>
                  </div>
                </div>
              </div>

              <div class="linii-section">
                <p class="section-label">Linii Disponibile</p>
                <div class="badge-grid">
                  @for (line of activeStation()!.lines || []; track line) {
                    <span class="line-badge">{{ line }}</span>
                  }
                </div>
              </div>

              <div class="sosiri-section">
                <p class="section-label">Sosiri Următoare</p>
                <div class="sosiri-list">
                  @for (item of activeStation()!.arrivals || []; track $index) {
                    <div class="sosire-item">
                      <div class="line-pill">{{ item.line }}</div>
                      <div class="target-wrap">
                        <span class="target">{{ item.target }}</span>
                        <span class="sub-target">Orar Oficial RATBV</span>
                      </div>
                      <div class="eta">
                        @if (+$any(item).eta < 15) {
                          <span class="live-dot pulse"></span>
                          {{ item.eta }} min
                        } @else {
                          <span class="time-label">{{ $any(item).scheduledTime }}</span>
                        }
                      </div>
                    </div>
                  }
                  @if (!activeStation()?.arrivals?.length && !isFetchingLines()) {
                    <div class="no-arrivals">
                      <p>Program de noapte activ.</p>
                    </div>
                  }
                </div>
              </div>

              <div class="ratbv-actions">
                <p class="section-label">Link-uri Utile RATBV</p>
                <div class="action-grid">
                  <button class="action-card" (click)="openRatbv()">
                    <span class="material-icons">event_note</span>
                    Trasee & Orare
                  </button>
                  <button class="action-card" (click)="openRatbv()">
                    <span class="material-icons">info</span>
                    Anunțuri
                  </button>
                </div>
              </div>
            } @else {
              <div class="empty-state">
                <span class="material-icons">directions_bus</span>
                <h3>Selectează o stație</h3>
                <p>Apasă pe un hub popular sau caută o stație pentru a vedea orarul în timp real.</p>
              </div>
            }
          </div>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .transport-container { background: #fff; min-height: 100vh; font-family: 'Outfit', sans-serif; padding-bottom: 80px; }
    .header-card { background: #fff; padding: 1.5rem; border-bottom: 1.5px solid #f8f8f8; position: sticky; top: 0; z-index: 100; }
    .search-box { background: #f5f6f8; border-radius: 20px; padding: 0.75rem 1.25rem; display: flex; align-items: center; gap: 1rem; border: 1.5px solid transparent; transition: all 0.3s; }
    .search-box:focus-within { background: #fff; border-color: #ff4500; box-shadow: 0 10px 25px rgba(255,69,0,0.1); }
    .search-icon { color: #aaa; }
    .search-box input { border: none; background: transparent; width: 100%; outline: none; font-size: 1.1rem; font-weight: 500; color: #1a1a1a; }
    .search-results { position: absolute; left: 1.5rem; right: 1.5rem; top: 100%; background: #fff; border-radius: 0 0 24px 24px; box-shadow: 0 20px 40px rgba(0,0,0,0.15); max-height: 400px; overflow-y: auto; z-index: 2000; border: 1.5px solid #f0f0f0; border-top: none; }
    .result-item { padding: 1.25rem 1.5rem; display: flex; gap: 1.25rem; align-items: center; border-bottom: 1px solid #f8f8f8; cursor: pointer; transition: background 0.2s; }
    .result-item:hover { background: #fffaf9; }
    .hub-icon-color { color: #ff4500; opacity: 0.8; }
    .name-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px; }
    .name { font-weight: 800; color: #1a1a1a; font-size: 1.1rem; }
    .hub-badge { font-size: 0.6rem; font-weight: 900; background: #fff5f2; color: #ff4500; padding: 2px 8px; border-radius: 6px; letter-spacing: 0.05em; }
    .result-street { font-size: 0.85rem; color: #999; font-weight: 500; }
    .station-map-wrap { height: 350px; position: relative; margin: 1.5rem; overflow: hidden; border-radius: 32px; box-shadow: 0 15px 35px rgba(0,0,0,0.1); }
    .map-fade { position: absolute; bottom: 0; left: 0; right: 0; height: 100px; background: linear-gradient(transparent, #fff); pointer-events: none; z-index: 2; }
    .map-loader { position: absolute; inset: 0; background: rgba(255,255,255,0.8); display: flex; align-items: center; justify-content: center; z-index: 10; border-radius: 32px; }
    .details-content { padding: 0 2rem 2rem; }
    .station-header { margin-bottom: 2.5rem; }
    .title-wrap { display: flex; align-items: center; gap: 1rem; margin-bottom: 4px; }
    h2 { font-size: 2.2rem; font-weight: 900; color: #1a1a1a; margin: 0; letter-spacing: -0.02em; line-height: 1.1; }
    .status-pill { background: #e8f5e9; color: #2e7d32; font-size: 0.65rem; font-weight: 900; padding: 4px 10px; border-radius: 8px; letter-spacing: 0.05em; }
    .linii-section { margin-bottom: 2.5rem; }
    .section-label { font-size: 0.85rem; font-weight: 800; color: #bbb; text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 1.5rem; }
    .badge-grid { display: flex; flex-wrap: wrap; gap: 0.75rem; }
    .line-badge { background: #ff4500; color: #fff; padding: 6px 16px; border-radius: 12px; font-weight: 900; font-size: 1rem; box-shadow: 0 6px 15px rgba(255,69,0,0.2); }
    .sosiri-section { margin-bottom: 3rem; }
    .sosire-item { display: flex; align-items: center; gap: 1.25rem; padding: 1.25rem 0; border-bottom: 1px solid #f8f8f8; }
    .line-pill { width: 3.5rem; height: 3.5rem; background: #fff5f2; border: 2px solid #ffe0d6; border-radius: 18px; display: flex; align-items: center; justify-content: center; font-weight: 900; color: #ff4500; font-size: 1.25rem; }
    .target-wrap { flex: 1; display: flex; flex-direction: column; }
    .target { font-weight: 800; color: #1a1a1a; font-size: 1.1rem; }
    .sub-target { font-size: 0.8rem; color: #aaa; font-weight: 600; }
    .eta { font-weight: 900; color: #ff4500; font-size: 1.15rem; display: flex; align-items: center; gap: 8px; }
    .time-label { font-size: 1.3rem; color: #1a1a1a; letter-spacing: -0.04em; font-weight: 900; }
    .live-dot { width: 8px; height: 8px; background: #ff4500; border-radius: 50%; }
    .pulse { animation: pulse-red 2s infinite; }
    @keyframes pulse-red {
      0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(255, 69, 0, 0.7); }
      70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(255, 69, 0, 0); }
      100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(255, 69, 0, 0); }
    }
    .action-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .action-card { background: #fff; border: 2px solid #f0f0f0; border-radius: 24px; padding: 1.5rem; display: flex; flex-direction: column; gap: 0.75rem; align-items: flex-start; cursor: pointer; transition: all 0.3s; width: 100%; }
    .action-card:hover { border-color: #ff4500; transform: translateY(-4px); }
    .action-card .material-icons { color: #ff4500; }
    .empty-state { text-align: center; padding: 4rem 2rem; color: #bbb; }
    .empty-state .material-icons { font-size: 4rem; margin-bottom: 1.5rem; }
    .empty-state h3 { font-size: 1.5rem; font-weight: 800; color: #1a1a1a; margin-bottom: 0.5rem; }
    .no-arrivals { padding: 2rem; text-align: center; color: #999; font-weight: 600; border: 2px dashed #eee; border-radius: 24px; }
    .spinner { width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #ff4500; border-radius: 50%; animation: spin 1s linear infinite; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BusSearchComponent implements OnInit, OnDestroy {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private router = inject(Router);
  
  private map: any;
  private marker: any;
  
  isLoading = signal<boolean>(false);
  isFetchingLines = signal<boolean>(false);
  searchTerm = signal<string>('');
  
  public allStations: any[] = [];
  activeStation = signal<any | null>(null);
  searchResults = signal<any[]>([]);
  public transitData = signal<any>({});

  constructor() {
    afterNextRender(() => {
      this.initLeafletMap();
      this.loadTransitDatabase();
    });
  }

  ngOnInit() {}
  ngOnDestroy() {}

  private initLeafletMap() {
    if (this.map) return;
    this.map = L.map('map', { zoomControl: false, attributionControl: false }).setView([45.6483, 25.5891], 14);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', { maxZoom: 19 }).addTo(this.map);
  }

  private loadTransitDatabase() {
    const timestamp = new Date().getTime();
    this.http.get<any>(`/transit_data.json?v=${timestamp}`).subscribe({
      next: (data) => {
        this.transitData.set(data);
        this.fetchPopularHubs();
      },
      error: (err) => console.error('Failed to load transit database', err)
    });
  }

  private fetchPopularHubs() {
    const data = this.transitData();
    if (!data || Object.keys(data).length === 0) return;
    const sortedHubs = Object.keys(data)
      .sort((a, b) => Object.keys(data[b]).length - Object.keys(data[a]).length)
      .slice(0, 12)
      .map(name => ({ id: 'local-' + name, name: name, address: 'Brașov, România', isHub: true, lines: Object.keys(data[name]) }));
    this.allStations = sortedHubs;
    if (!this.activeStation()) this.selectStation(sortedHubs[0]);
  }

  onSearch(query: string) {
    this.searchTerm.set(query);
    if (!query || query.length < 2) { this.searchResults.set([]); return; }
    const data = this.transitData();
    const results: any[] = [];
    Object.keys(data).forEach(name => {
      if (name.toLowerCase().includes(query.toLowerCase())) {
        const stationData = data[name];
        results.push({ 
          id: 'local-' + name, 
          name: name, 
          address: stationData.address || 'Brașov, România', 
          lines: Object.keys(stationData.lines || {}) 
        });
      }
    });
    this.searchResults.set(results.slice(0, 10));
  }

  selectStation(station: any) {
    this.searchResults.set([]);
    this.searchTerm.set('');
    this.isLoading.set(true);
    const cleanName = station.name.replace(/\(DUS\)|\(INTORS\)/gi, '').trim();
    console.log('📍 Selecting station:', station.name, 'Geocoding as:', cleanName);

    const searchUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cleanName + ', Brasov, Romania')}&limit=1`;
    this.http.get<any[]>(searchUrl).subscribe({
      next: (results) => {
        let lat = 45.6483, lng = 25.5891;
        if (results && results.length > 0) { lat = parseFloat(results[0].lat); lng = parseFloat(results[0].lon); }
        
        const fullStation = { 
          ...station, 
          coords: { lat, lng }, 
          arrivals: [],
          lines: station.lines || [] // Carry over lines from search/data
        };
        
        this.activeStation.set(fullStation);
        this.updateMap(lat, lng);
        this.fetchRealtimeArrivals(station.name);
      },
      error: () => { 
        this.activeStation.set({ ...station, arrivals: [] }); 
        this.isLoading.set(false); 
      }
    });
  }

  private updateMap(lat: number, lng: number) {
    if (!this.map) return;
    this.map.setView([lat, lng], 16);
    if (this.marker) this.map.removeLayer(this.marker);
    const busIcon = L.divIcon({ html: `<div style="background: #ff4500; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3);"></div>`, className: '', iconSize: [24, 24], iconAnchor: [12, 12] });
    this.marker = L.marker([lat, lng], { icon: busIcon }).addTo(this.map);
  }

  private fetchRealtimeArrivals(stationName: string) {
    const data = this.transitData();
    const stationObj = data[stationName];
    
    if (!stationObj || !stationObj.lines) { 
      console.warn('⚠️ No lines found for station in DB:', stationName);
      this.isLoading.set(false); 
      return; 
    }

    const stationLines = stationObj.lines;
    const lines = Object.keys(stationLines);
    console.log('📡 Fetching arrivals for:', stationName, 'Lines found:', lines);

    this.isFetchingLines.set(true);
    const arrivals: any[] = [];
    let completed = 0;
    
    lines.forEach(line => {
      const url = stationLines[line];
      if (!url || typeof url !== 'string') { completed++; return; }
      
      console.log(`🔗 Fetching Line ${line} from:`, url);
      // Switched to allorigins.win for better reliability on live site
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
      
      this.http.get(proxyUrl, { responseType: 'text' }).subscribe({
        next: (html) => {
          console.log(`✅ Received HTML for Line ${line} (${html.length} chars)`);
          const nextBus = this.parseTimetable(html, line);
          if (nextBus) {
            console.log(`⏰ Next bus for Line ${line} in ${nextBus.eta} min`);
            arrivals.push(nextBus);
          } else {
            console.warn(`❌ Could not parse timetable for Line ${line}`);
          }
          completed++;
          if (completed === lines.length) this.finalizeArrivals(arrivals);
        },
        error: (err) => { 
          console.error(`🛑 Error fetching Line ${line}:`, err);
          completed++; 
          if (completed === lines.length) this.finalizeArrivals(arrivals); 
        }
      });
    });
  }

  private parseTimetable(html: string, line: string): any {
    try {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const now = new Date();
      const isWeekend = now.getDay() === 0 || now.getDay() === 6;
      
      const tables = doc.querySelectorAll('#tabel2');
      if (tables.length === 0) return null;

      // Pick the correct table (usually 0 is weekday, 1 is weekend)
      let activeTable = tables[0];
      if (isWeekend && tables.length > 1) {
        // Double check title
        const title = tables[1].querySelector('#web_class_title')?.textContent || '';
        if (title.includes('SAMBATA') || title.includes('SÂMBĂTĂ') || title.includes('DUMINICA')) {
          activeTable = tables[1];
        }
      } else if (!isWeekend && tables.length > 1) {
        const title = tables[0].querySelector('#web_class_title')?.textContent || '';
        if (title.includes('LUNI')) activeTable = tables[0];
      }

      const hourDivs = activeTable.querySelectorAll('#web_class_hours');
      const minuteDivs = activeTable.querySelectorAll('#web_class_minutes');
      const curH = now.getHours();
      const curM = now.getMinutes();
      let bestEta = Infinity;

      hourDivs.forEach((hDiv, i) => {
        const hText = hDiv.textContent?.trim() || '';
        const hour = parseInt(hText.replace(/\D/g, ''));
        if (isNaN(hour)) return; // Skip "Ora" header
        
        const mDiv = minuteDivs[i];
        if (!mDiv) return;

        const mins = mDiv.querySelectorAll('#web_min');
        mins.forEach(m => {
          const mText = m.textContent?.trim() || '';
          const min = parseInt(mText.replace(/\D/g, ''));
          if (isNaN(min)) return;
          
          let diff = (hour * 60 + min) - (curH * 60 + curM);
          if (diff < 0) diff += 1440; // Next day
          
          if (diff < bestEta) bestEta = diff;
        });
      });

      if (bestEta === Infinity) return null;
      
      const t = new Date(now.getTime() + bestEta * 60000);
      return { 
        line, 
        target: this.getTargetForLine(line), 
        eta: bestEta.toString(), 
        scheduledTime: `${t.getHours().toString().padStart(2, '0')}:${t.getMinutes().toString().padStart(2, '0')}` 
      };
    } catch (err) { 
      console.error(`💥 Parser Error for Line ${line}:`, err);
      return null; 
    }
  }

  private finalizeArrivals(arrivals: any[]) {
    this.activeStation.update(s => {
      if (!s) return s;
      return { 
        ...s, 
        arrivals: arrivals.sort((a,b) => parseInt(a.eta) - parseInt(b.eta)).slice(0, 10) 
      };
    });
    this.isFetchingLines.set(false);
    this.isLoading.set(false);
  }

  private getTargetForLine(line: string): string {
    const targets: any = { 
      '1': 'Triaj', '2': 'Rulmentul', '4': 'Gara', '5': 'Stadionul Municipal',
      '6': 'Saturn', '17': 'Noua', '20': 'Poiana Brașov', '24': 'Stupini',
      '28': 'Fundăturii', '31': 'Valea Cetății', '34': 'Timiș-Triaj',
      '36': 'Independenței', '41': 'Lujerului', '50': 'Solomon', 'A1': 'Aeroport'
    };
    return targets[line] || 'Centru';
  }

  goBack() { this.router.navigate(['/transport/bus']); }
  openRatbv() { window.open('https://www.ratbv.ro/trasee-si-orare/', '_blank'); }
}
