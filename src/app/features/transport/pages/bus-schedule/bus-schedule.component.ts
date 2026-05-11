import { ChangeDetectionStrategy, Component, signal, inject, afterNextRender } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TransitService } from '../../services/transit.service';

@Component({
  selector: 'app-bus-schedule',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <main class="bus-shell">
      <header class="top-nav">
        <button class="back-pill" routerLink="/transport/bus">
          <span class="material-icons">arrow_back</span>
          Înapoi
        </button>
      </header>

      <section class="page-header">
        <p class="eyebrow">Monitorizare Live</p>
        <h1>Sosiri Rapide</h1>
      </section>

      <div class="search-area">
        <div class="search-box">
          <span class="material-icons">search</span>
          <input type="text" placeholder="Caută linie sau stație..." />
        </div>
      </div>

      <div class="scroll-content">
        <section class="sosiri-section">
          <div class="list-label">
            @if (nearestStation()) {
              Linii în {{ nearestStation()?.name }}
            } @else {
              Căutăm cea mai apropiată stație...
            }
          </div>
          
          @for (arr of liveArrivals(); track arr.line + arr.eta) {
            <div class="route-card">
              <div class="route-id" [style.background]="arr.color">{{ arr.shortLine }}</div>
              <div class="route-info">
                <span class="dest">{{ arr.target }}</span>
                <span class="desc">Programat la {{ arr.scheduledTime }}</span>
              </div>
              <div class="eta" [class.warning]="+arr.eta < 5">
                <span class="val">{{ arr.eta }}</span>
                <span class="unit">min</span>
              </div>
            </div>
          }

          @if (isFetching() && liveArrivals().length === 0) {
            <div class="loading-state">
              <div class="spinner"></div>
              <p>Se încarcă datele live...</p>
            </div>
          }

          @if (!isFetching() && liveArrivals().length === 0 && nearestStation()) {
            <div class="empty-state">
              <span class="material-icons">event_busy</span>
              <p>Nicio sosire găsită pentru această stație.</p>
            </div>
          }
        </section>

        <div class="ticket-prompt">
          <a href="https://24pay.ro" target="_blank" class="prompt-card">
            <span class="material-icons">qr_code_2</span>
            <div class="prompt-text">
              <span class="title">Plată rapidă</span>
              <span class="sub">Bilete și abonamente prin 24pay</span>
            </div>
            <span class="material-icons arrow">chevron_right</span>
          </a>
        </div>
      </div>
    </main>
  `,
  styles: [`
    .bus-shell { min-height: 100vh; background: #fcfcfc; font-family: 'Outfit', sans-serif; color: #1a1a1a; display: flex; flex-direction: column; }
    .top-nav { padding: 1.5rem; }
    .back-pill { background: #fff; border: none; padding: 0.6rem 1.2rem; border-radius: 100px; display: flex; align-items: center; gap: 0.5rem; color: #444; font-weight: 700; box-shadow: 0 4px 12px rgba(0,0,0,0.05); cursor: pointer; font-family: inherit; }
    .page-header { padding: 0 1.5rem 1.5rem; }
    .eyebrow { font-size: 0.9rem; font-weight: 700; color: #999; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.4rem; }
    h1 { font-size: 2.2rem; font-weight: 900; margin: 0; letter-spacing: -0.04em; line-height: 1; }
    .search-area { padding: 0 1.5rem; margin-bottom: 2rem; }
    .search-box { background: #f1f2f4; border-radius: 20px; padding: 1rem 1.5rem; display: flex; align-items: center; gap: 1rem; }
    .search-box .material-icons { color: #999; }
    .search-box input { background: transparent; border: none; outline: none; font-family: inherit; font-size: 1rem; font-weight: 600; width: 100%; }
    .scroll-content { padding: 0 1.5rem 3rem; display: flex; flex-direction: column; gap: 2rem; }
    .list-label { font-size: 0.8rem; font-weight: 800; color: #bbb; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 1.5rem; }
    .route-card { background: #fff; border-radius: 28px; padding: 1.2rem; display: flex; align-items: center; gap: 1.2rem; margin-bottom: 1rem; box-shadow: 0 4px 15px rgba(0,0,0,0.02); border: 1px solid rgba(0,0,0,0.02); }
    .route-id { width: 52px; height: 52px; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 1.2rem; color: #fff; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .route-info { flex: 1; display: flex; flex-direction: column; gap: 0.1rem; }
    .dest { font-weight: 800; font-size: 1.1rem; }
    .desc { font-size: 0.8rem; color: #888; font-weight: 500; }
    .eta { text-align: right; display: flex; flex-direction: column; line-height: 1; }
    .eta .val { font-size: 1.5rem; font-weight: 900; color: #2ecc71; }
    .eta .unit { font-size: 0.7rem; font-weight: 800; color: #2ecc71; text-transform: uppercase; }
    .eta.warning .val, .eta.warning .unit { color: #ff9f43; }
    .ticket-prompt { margin-top: 1rem; }
    .prompt-card { background: #fff; border: 1px dashed #ddd; border-radius: 24px; padding: 1.2rem; display: flex; align-items: center; gap: 1.2rem; text-decoration: none; color: inherit; }
    .prompt-card .material-icons:first-child { font-size: 2rem; color: #ff4500; }
    .prompt-text { flex: 1; display: flex; flex-direction: column; }
    .prompt-text .title { font-weight: 800; font-size: 1rem; }
    .prompt-text .sub { font-size: 0.8rem; color: #888; font-weight: 500; }
    .prompt-card .arrow { color: #ccc; }

    .loading-state { display: flex; flex-direction: column; align-items: center; gap: 1rem; padding: 2rem; color: #999; }
    .spinner { width: 30px; height: 30px; border: 3px solid #eee; border-top-color: #1a1a1a; border-radius: 50%; animation: spin 0.8s linear infinite; }
    .empty-state { text-align: center; padding: 3rem 1rem; color: #bbb; }
    .empty-state .material-icons { font-size: 3rem; margin-bottom: 1rem; }

    @keyframes spin { to { transform: rotate(360deg); } }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BusScheduleComponent {
  private transitService = inject(TransitService);
  
  nearestStation = signal<any | null>(null);
  liveArrivals = signal<any[]>([]);
  isFetching = signal(false);

  constructor() {
    afterNextRender(() => {
      this.initNearbySearch();
    });
  }

  private async initNearbySearch() {
    if (!navigator.geolocation) return;
    
    this.isFetching.set(true);
    await this.transitService.loadData();
    
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const userLat = pos.coords.latitude;
      const userLon = pos.coords.longitude;
      
      const stations = this.transitService.smartStops();
      let closest: any = null;
      let minDist = Infinity;
      
      stations.forEach((s: any) => {
        const dist = this.calculateDistance(userLat, userLon, s.lat, s.lon);
        if (dist < minDist) {
          minDist = dist;
          closest = s;
        }
      });
      
      if (closest) {
        this.nearestStation.set(closest);
        await this.fetchArrivalsForStation(closest);
      } else {
        this.isFetching.set(false);
      }
    }, () => {
      this.isFetching.set(false);
    });
  }

  private async fetchArrivalsForStation(station: any) {
    const arrivals: any[] = [];
    const fetchPromises = Object.keys(station.lines).map(async (lineKey) => {
      const lineData = station.lines[lineKey];
      const shortLine = lineData.name || lineKey.split('_')[0];
      
      const loc = { lat: station.lat, lng: station.lon };
      try {
        const sched = await this.transitService.getArrivalsForStep(station.name, shortLine, loc, 0);
        if (sched && sched.length > 0) {
          sched.forEach((s: any) => {
            arrivals.push({
              shortLine,
              target: lineData.target,
              eta: s.wait.toString(),
              scheduledTime: s.time,
              color: lineData.color
            });
          });
        }
      } catch (e) {
        console.error('Schedule fetch failed', e);
      }
    });
    
    await Promise.all(fetchPromises);
    this.liveArrivals.set(arrivals.sort((a,b) => parseInt(a.eta) - parseInt(b.eta)));
    this.isFetching.set(false);
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
