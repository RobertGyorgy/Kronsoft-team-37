import { ChangeDetectionStrategy, Component, OnInit, OnDestroy, ChangeDetectorRef, NgZone, afterNextRender, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { interval, Subscription } from 'rxjs';

declare const google: any;

@Component({
  selector: 'app-parking',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <main class="parking-shell">
      <div class="main-scroll-area">
        <!-- 1. HEADER -->
        <header class="page-header-pill">
          <button class="unified-back-btn" [routerLink]="['/dashboard']">
            <span class="material-icons">arrow_back</span> Înapoi
          </button>
          <h1 class="page-title-pill">Parcare Brașov</h1>
        </header>

        <!-- 2. HARTA -->
        <section class="map-section-pill">
          <div class="map-canvas-wrap">
            <div #mapContainer class="map-container-pill"></div>
          </div>
        </section>

        <!-- 3. INPUT NUMAR -->
        <section class="plate-input-section">
          <label class="plate-label">introdu numărul de înmatriculare</label>
          <div class="plate-row">
            <input type="text" [(ngModel)]="tempPlate" (ngModelChange)="tempPlate = $event.toUpperCase()" placeholder="BV 11 ABC" class="plate-input">
            <button class="btn-save-solid" (click)="savePlate()">SALVEAZĂ</button>
          </div>
        </section>

        <!-- 4. MARELE CARD ALBASTRU -->
        <section class="main-parking-card">
          <h2 class="zone-name-header">{{ detectedLocationName || PARKING_ZONES[selectedZoneIndex].name }}</h2>
          
          <div class="stepper-pill-container">
            <span class="stepper-text-label">SELECTEAZĂ DURATA</span>
            <div class="stepper-controls">
              <button class="btn-step" (click)="decrementHours()">−</button>
              <span class="step-val-text">{{ selectedHours }}h</span>
              <button class="btn-step" (click)="incrementHours()">+</button>
            </div>
          </div>

          <div class="action-row-outline">
            <button class="btn-outline-white" (click)="toggleTariffs()">Tarife</button>
            <button class="btn-outline-white" (click)="sendNativeSms()">SMS</button>
          </div>

          <div class="timer-section-integrated">
            <p class="timer-sub-label">TIMP RĂMAS</p>
            <h3 class="timer-digits-white-tiny">{{ timeLeft }}</h3>
          </div>

          <div style="position: relative;">
            <div class="quick-extend-menu" *ngIf="showQuickAdd">
              <button class="quick-opt" (click)="extendTime(30)">+30m</button>
              <button class="quick-opt" (click)="extendTime(60)">+1h</button>
              <button class="quick-opt" (click)="extendTime(120)">+2h</button>
            </div>

            <button class="btn-extend-solid-white" (click)="toggleQuickAdd()">
              PRELUNGEȘTE TIMPUL
            </button>
          </div>
        </section>

        <!-- 5. ISTORIC -->
        <section class="history-section-pill" id="history-section">
          <div class="section-header-pill">
            <h3>Istoric plăți</h3>
            <button class="vezi-tot-pill" (click)="scrollToHistory()">Vezi tot</button>
          </div>
          <div class="history-card" *ngFor="let item of history">
            <div class="hist-header">
              <span class="hist-date">{{ item.day }} {{ item.month }}</span>
              <span class="hist-amount">{{ item.amount }}</span>
            </div>
            <div class="hist-details">{{ item.plate }} • {{ item.zone }}</div>
          </div>
        </section>

        <!-- 6. MODAL TARIFE -->
        <div class="modal-overlay" *ngIf="showTariffs" (click)="toggleTariffs()">
          <div class="modal-card blue-theme-modal" (click)="$event.stopPropagation()">
            <h2 class="modal-title">Tarife Parcare</h2>
            <div class="tariff-cards-container">
              <div class="tariff-pill-card zona-0-bg">
                <span class="z-label">ZONA 0</span>
                <div class="z-prices"><strong>0.60€/h</strong><span>3.00€/24h</span></div>
              </div>
              <div class="tariff-pill-card zona-1-bg">
                <span class="z-label">ZONA 1</span>
                <div class="z-prices"><strong>0.40€/h</strong><span>2.00€/24h</span></div>
              </div>
              <div class="tariff-pill-card zona-2-bg">
                <span class="z-label">ZONA 2</span>
                <div class="z-prices"><strong>0.30€/h</strong><span>1.50€/24h</span></div>
              </div>
            </div>
            <button class="btn-extend-solid-white" (click)="toggleTariffs()" style="margin-top: 1rem;">ÎNCHIDE</button>
          </div>
        </div>
      </div>
    </main>
  `,
  styles: [`
    .parking-shell { height: 100vh; width: 100%; overflow-x: hidden; background: #fff; font-family: 'Outfit', sans-serif; color: #1a1a1a; position: relative; }
    .main-scroll-area { height: 100vh; width: 100%; overflow-x: hidden; overflow-y: auto; padding-bottom: 2rem; }
    .page-header-pill { display: flex; align-items: center; padding: calc(var(--safe-top) + 1.2rem) 1.5rem 1rem; position: relative; }
    .back-pill { background: none; border: none; color: #333; font-weight: 800; font-size: 1rem; cursor: pointer; display: flex; align-items: center; gap: 0.3rem; }
    .page-title-pill { font-size: 1rem; font-weight: 900; color: #1a1a1a; position: absolute; left: 50%; transform: translateX(-50%); }
    .map-section-pill { padding: 0 1rem; margin-bottom: 0.5rem; }
    .map-canvas-wrap { height: 28vh; border-radius: 20px; overflow: hidden; border: 1px solid #eee; position: relative; }
    .map-container-pill { height: 100%; width: 100%; }
    .plate-input-section { padding: 0 1.5rem; margin-bottom: 0.5rem; }
    .plate-label { font-size: 0.9rem; font-weight: 600; margin-bottom: 0.5rem; display: block; color: #333; }
    .plate-row { display: flex; gap: 0.75rem; align-items: center; }
    .plate-input { flex: 2; background: #f2f2f2; border: 1.5px solid #ddd; border-radius: 50px; padding: 0.5rem 1.25rem; font-weight: 700; font-size: 1rem; color: #333; outline: none; }
    .btn-save-solid { flex: 1.2; background: #4285f4; color: #fff; border: none; border-radius: 50px; padding: 0.5rem; font-weight: 900; font-size: 0.95rem; text-transform: uppercase; cursor: pointer; }
    .main-parking-card { background: #4285f4; border-radius: 30px; padding: 0.5rem; margin: 0 1rem 1rem; color: #fff; box-shadow: 0 10px 30px rgba(66,133,244,0.2); position: relative; }
    .zone-name-header { font-size: 1.25rem; font-weight: 900; text-align: center; margin-bottom: 0.5rem; color: #fff; }
    .stepper-pill-container { background: rgba(255,255,255,0.85); border-radius: 50px; padding: 0.35rem 0.5rem; display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem; color: #333; }
    .stepper-text-label { font-size: 0.95rem; font-weight: 700; padding-left: 0.75rem; color: #555; }
    .stepper-controls { display: flex; align-items: center; gap: 0.75rem; }
    .btn-step { background: #e0e0e0; color: #666; border: none; width: 30px; height: 30px; border-radius: 50%; font-size: 1.4rem; font-weight: 900; cursor: pointer; display: flex; align-items: center; justify-content: center; }
    .step-val-text { font-size: 1.1rem; font-weight: 900; min-width: 30px; text-align: center; color: #333; }
    .action-row-outline { display: flex; gap: 0.75rem; margin-bottom: 0.75rem; }
    .btn-outline-white { flex: 1; background: transparent; color: #fff; border: 2px solid #fff; border-radius: 50px; padding: 0.7rem; font-weight: 900; font-size: 1.1rem; cursor: pointer; }
    .timer-section-integrated { background: rgba(255, 255, 255, 0.2); border-radius: 24px; padding: 0.4rem; margin-bottom: 0.5rem; display: flex; flex-direction: column; align-items: center; justify-content: center; }
    .timer-digits-white-tiny { font-size: 2rem; font-weight: 900; color: #fff; line-height: 1; margin-bottom: 0; margin-top: -0.1rem; }
    .timer-sub-label { font-size: 0.75rem; font-weight: 800; color: #fff; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0; }
    .btn-extend-solid-white { width: 100%; background: #fff; color: #4285f4; border: none; border-radius: 50px; padding: 0.8rem; font-weight: 950; font-size: 1.1rem; text-transform: uppercase; cursor: pointer; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
    .history-section-pill { padding: 0.5rem 0.75rem 2rem; }
    .section-header-pill { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
    .section-header-pill h3 { font-size: 1rem; font-weight: 900; color: #333; margin: 0; }
    .vezi-tot-pill { background: none; border: 1.2px solid #4285f4; color: #4285f4; font-weight: 800; font-size: 0.7rem; padding: 0.2rem 0.6rem; border-radius: 50px; cursor: pointer; }
    .history-card { background: #fff; border-radius: 12px; padding: 0.5rem; border: 1px solid #f0f0f0; margin-bottom: 0.5rem; }
    .hist-header { display: flex; justify-content: space-between; margin-bottom: 0.2rem; }
    .hist-date { font-weight: 800; color: #4285f4; font-size: 0.75rem; }
    .hist-amount { font-weight: 900; color: #ff4d4d; font-size: 0.9rem; }
    .hist-details { font-size: 0.8rem; color: #666; font-weight: 600; }
    .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 2rem; }
    .modal-card { background: #fff; border-radius: 24px; padding: 1.5rem; width: 100%; max-width: 360px; box-shadow: 0 15px 40px rgba(0,0,0,0.2); color: #333; }
    .modal-title { margin-top: 0; margin-bottom: 1rem; font-weight: 900; text-align: center; font-size: 1.25rem; color: #333; }
    .tariff-cards-container { display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1rem; }
    .tariff-pill-card { padding: 1rem; border-radius: 20px; display: flex; justify-content: space-between; align-items: center; color: #fff; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .z-label { font-weight: 900; font-size: 1.1rem; }
    .z-prices { text-align: right; display: flex; flex-direction: column; }
    .z-prices strong { font-size: 1rem; }
    .z-prices span { font-size: 0.75rem; opacity: 0.9; font-weight: 700; }
    .zona-0-bg { background: #ff4757; }
    .zona-1-bg { background: #ffa502; }
    .zona-2-bg { background: #2ed573; }
    .quick-extend-menu { position: absolute; bottom: 110%; left: 0; width: 100%; background: #fff; border-radius: 20px; padding: 0.5rem; box-shadow: 0 -5px 25px rgba(0,0,0,0.15); display: flex; gap: 0.5rem; z-index: 10; animation: popUp 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
    .quick-opt { flex: 1; background: #f0f7ff; color: #4285f4; border: none; border-radius: 12px; padding: 0.6rem; font-weight: 900; font-size: 0.85rem; cursor: pointer; }
    @keyframes popUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ParkingComponent implements OnInit, OnDestroy {
  @ViewChild('mapContainer') mapContainer!: ElementRef;

  showTariffs = false;
  showQuickAdd = false;
  public timeLeft = '00:00:00';
  public parkingExpiry: number | null = null;
  carPlate = '';
  isPlateSaved = false;
  tempPlate = '';
  selectedHours = 1;
  selectedZoneIndex = 0;
  detectedLocationName = '';
  
  parkedCarLocationName = '';
  parkedCarZoneIndex = 0;

  history: any[] = [
    { day: '05', month: 'MAI', plate: 'BV 01 ABC', zone: 'Zona 0 - Centru', amount: '1.20' }
  ];

  private map: any;
  private marker: any;
  private timerSubscription: Subscription | undefined;
  public currentParkingSeconds = 0;
  isOutOfZone = false;
  
  private PARKING_POIS = [
    { name: 'Piața Sfatului / Mureșenilor', zone: 0, lat: 45.6423, lng: 25.5888 },
    { name: 'Primăria Brașov / Eroilor', zone: 0, lat: 45.6450, lng: 25.5930 },
    { name: 'Nicolae Bălcescu / Castelului', zone: 0, lat: 45.6400, lng: 25.5920 },
    { name: 'Parcare Spitalul Militar', zone: 0, lat: 45.6470, lng: 25.5900 },
    { name: 'Bulevardul Victoriei (Centru Civic)', zone: 1, lat: 45.6540, lng: 25.6060 },
    { name: 'Centrul Civic / AFI', zone: 1, lat: 45.6510, lng: 25.6080 },
    { name: 'Calea București / Astra', zone: 1, lat: 45.6400, lng: 25.6200 },
    { name: '13 Decembrie / Onix', zone: 1, lat: 45.6580, lng: 25.6010 },
    { name: 'Gara Brașov', zone: 1, lat: 45.6620, lng: 25.6130 },
    { name: 'Coresi Shopping Resort', zone: 1, lat: 45.6740, lng: 25.6180 },
    { name: 'Parcare Bartolomeu', zone: 1, lat: 45.6580, lng: 25.5720 },
    { name: 'Zona Industrială Vest', zone: 2, lat: 45.6800, lng: 25.5400 },
    { name: 'Triaj / Hărmanului', zone: 2, lat: 45.6720, lng: 25.6550 }
  ];

  private ZONE_BOUNDS = [
    { minLat: 45.625, maxLat: 45.652, minLng: 25.570, maxLng: 25.602 },
    { minLat: 45.620, maxLat: 45.685, minLng: 25.550, maxLng: 25.660 }
  ];

  public PARKING_ZONES = [
    { name: 'Zona 0 - Centru Vechi', smsNumber: '1234', tariff: 0.60 },
    { name: 'Zona 1 - Centrul Civic', smsNumber: '1234', tariff: 0.40 },
    { name: 'Zona 2 - Periferie', smsNumber: '1234', tariff: 0.30 }
  ];

  constructor(
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) {
    afterNextRender(() => {
      this.initMap();
      this.startGpsTracking();
      this.loadPersistedData();
      
      window.addEventListener('focus', () => {
        this.loadPersistedData();
        this.cdr.detectChanges();
      });
    });
  }

  public startGpsTracking() {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => this.zone.run(() => this.updateZoneByLocation(pos.coords.latitude, pos.coords.longitude)),
      (err) => console.warn('Initial GPS fail', err),
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );

    navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        this.zone.run(() => this.updateZoneByLocation(latitude, longitude));
      },
      (err) => {
        this.zone.run(() => {
          this.isOutOfZone = true;
          this.cdr.detectChanges();
        });
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }

  // PART 1 — Real boundary polygons for all 13 Brașov neighborhoods
  // Centers verified via latlong.net, mapcarta.com, geocords.com
  // Polygons built around verified centers with real neighborhood extents
  // Coordinates in GeoJSON order: [lng, lat]
  private zonePolygons: any[] = [];

  private loadZonePolygons(): any[] {
    const CACHE_KEY = 'bv_polygons_v5'; // Forțăm refresh cache
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed.length >= 13) return parsed;
    }

    const polygons = [
      // === ZONA 0 ===
      { zone: 0, label: 'Centrul Vechi', geojson: { type: 'Polygon', coordinates: [[
        [25.5840, 45.6450], [25.5860, 45.6465], [25.5890, 45.6475],
        [25.5920, 45.6470], [25.5940, 45.6455], [25.5945, 45.6430],
        [25.5935, 45.6405], [25.5915, 45.6385], [25.5890, 45.6375],
        [25.5860, 45.6380], [25.5845, 45.6400], [25.5838, 45.6425],
        [25.5840, 45.6450]
      ]]}},
      { zone: 0, label: 'Schei', geojson: { type: 'Polygon', coordinates: [[
        [25.5770, 45.6380], [25.5800, 45.6400], [25.5840, 45.6400],
        [25.5870, 45.6385], [25.5880, 45.6360], [25.5875, 45.6330],
        [25.5855, 45.6305], [25.5825, 45.6290], [25.5790, 45.6295],
        [25.5765, 45.6315], [25.5755, 45.6345], [25.5770, 45.6380]
      ]]}},
      // Valea Cetății (Extins pentru a acoperi zonele de munte/parcuri)
      { zone: 0, label: 'Valea Cetății', geojson: { type: 'Polygon', coordinates: [[
        [25.5850, 45.6380], [25.5950, 45.6400], [25.6050, 45.6380],
        [25.6100, 45.6320], [25.6080, 45.6250], [25.6020, 45.6200],
        [25.5920, 45.6200], [25.5850, 45.6250], [25.5820, 45.6320],
        [25.5850, 45.6380]
      ]]}},

      // === ZONA 1 ===
      { zone: 1, label: 'Centrul Nou', geojson: { type: 'Polygon', coordinates: [[
        [25.5870, 45.6530], [25.5910, 45.6545], [25.5950, 45.6545],
        [25.5990, 45.6530], [25.6010, 45.6505], [25.6005, 45.6475],
        [25.5980, 45.6450], [25.5945, 45.6440], [25.5910, 45.6445],
        [25.5880, 45.6460], [25.5860, 45.6485], [25.5865, 45.6510],
        [25.5870, 45.6530]
      ]]}},
      { zone: 1, label: 'Astra', geojson: { type: 'Polygon', coordinates: [[
        [25.6140, 45.6410], [25.6190, 45.6420], [25.6250, 45.6415],
        [25.6310, 45.6400], [25.6350, 45.6370], [25.6345, 45.6330],
        [25.6315, 45.6300], [25.6270, 45.6280], [25.6210, 45.6275],
        [25.6160, 45.6290], [25.6130, 45.6320], [25.6120, 45.6360],
        [25.6140, 45.6410]
      ]]}},
      { zone: 1, label: 'Florilor', geojson: { type: 'Polygon', coordinates: [[
        [25.6130, 45.6540], [25.6170, 45.6550], [25.6220, 45.6545],
        [25.6260, 45.6525], [25.6270, 45.6495], [25.6255, 45.6465],
        [25.6220, 45.6450], [25.6180, 45.6445], [25.6140, 45.6460],
        [25.6120, 45.6490], [25.6120, 45.6520], [25.6130, 45.6540]
      ]]}},
      { zone: 1, label: 'Tractorul', geojson: { type: 'Polygon', coordinates: [[
        [25.6020, 45.6730], [25.6060, 45.6745], [25.6110, 45.6745],
        [25.6160, 45.6730], [25.6190, 45.6700], [25.6195, 45.6670],
        [25.6175, 45.6645], [25.6140, 45.6630], [25.6090, 45.6630],
        [25.6040, 45.6645], [25.6015, 45.6670], [25.6010, 45.6700],
        [25.6020, 45.6730]
      ]]}},
      { zone: 1, label: 'Bartolomeu', geojson: { type: 'Polygon', coordinates: [[
        [25.5610, 45.6740], [25.5660, 45.6755], [25.5720, 45.6755],
        [25.5780, 45.6740], [25.5800, 45.6710], [25.5790, 45.6680],
        [25.5760, 45.6655], [25.5710, 45.6645], [25.5660, 45.6650],
        [25.5620, 45.6670], [25.5600, 45.6700], [25.5610, 45.6740]
      ]]}},
      { zone: 1, label: 'Craiter', geojson: { type: 'Polygon', coordinates: [[
        [25.6280, 45.6590], [25.6320, 45.6600], [25.6370, 45.6595],
        [25.6410, 45.6575], [25.6420, 45.6545], [25.6405, 45.6515],
        [25.6370, 45.6500], [25.6330, 45.6495], [25.6290, 45.6505],
        [25.6265, 45.6530], [25.6260, 45.6560], [25.6280, 45.6590]
      ]]}},
      { zone: 1, label: 'Scriitori', geojson: { type: 'Polygon', coordinates: [[
        [25.6140, 45.6580], [25.6175, 45.6590], [25.6220, 45.6585],
        [25.6260, 45.6570], [25.6270, 45.6545], [25.6260, 45.6520],
        [25.6230, 45.6505], [25.6190, 45.6500], [25.6150, 45.6510],
        [25.6130, 45.6535], [25.6125, 45.6560], [25.6140, 45.6580]
      ]]}},

      // === ZONA 2 ===
      { zone: 2, label: 'Stupini', geojson: { type: 'Polygon', coordinates: [[
        [25.5440, 45.7050], [25.5510, 45.7075], [25.5600, 45.7070],
        [25.5680, 45.7040], [25.5720, 45.7000], [25.5715, 45.6950],
        [25.5680, 45.6910], [25.5620, 45.6890], [25.5550, 45.6895],
        [25.5490, 45.6920], [25.5450, 45.6960], [25.5430, 45.7010],
        [25.5440, 45.7050]
      ]]}},
      { zone: 2, label: 'Noua-Dârste', geojson: { type: 'Polygon', coordinates: [[
        [25.6240, 45.6260], [25.6300, 45.6275], [25.6370, 45.6270],
        [25.6440, 45.6250], [25.6490, 45.6215], [25.6485, 45.6170],
        [25.6450, 45.6135], [25.6390, 45.6115], [25.6320, 45.6120],
        [25.6260, 45.6145], [25.6230, 45.6185], [25.6225, 45.6225],
        [25.6240, 45.6260]
      ]]}},
      { zone: 2, label: 'Triaj', geojson: { type: 'Polygon', coordinates: [[
        [25.6220, 45.6750], [25.6270, 45.6765], [25.6330, 45.6760],
        [25.6380, 45.6740], [25.6400, 45.6710], [25.6395, 45.6680],
        [25.6370, 45.6655], [25.6320, 45.6640], [25.6270, 45.6645],
        [25.6230, 45.6665], [25.6210, 45.6695], [25.6210, 45.6725],
        [25.6220, 45.6750]
      ]]}},
    ];

    localStorage.setItem(CACHE_KEY, JSON.stringify(polygons));
    console.log(`✅ Loaded ${polygons.length}/13 hardcoded OSM polygons for Brașov`);
    return polygons;
  }

  private getZoneForPoint(lat: number, lng: number, polygons: any[]): any {
    for (const poly of polygons) {
      const rings = poly.geojson.type === 'Polygon'
        ? [poly.geojson.coordinates[0]]
        : poly.geojson.coordinates.map((p: any) => p[0]);

      for (const ring of rings) {
        let inside = false;
        for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
          const [lngI, latI] = ring[i];
          const [lngJ, latJ] = ring[j];
          if (((latI > lat) !== (latJ > lat)) &&
              (lng < (lngJ - lngI) * (lat - latI) / (latJ - latI) + lngI)) {
            inside = !inside;
          }
        }
        if (inside) return { zone: poly.zone, label: poly.label };
      }
    }
    return null;
  }

  private getNearestZone(lat: number, lng: number, polygons: any[]): any {
    let minDistance = Infinity;
    let nearest = null;

    for (const poly of polygons) {
      const coords = poly.geojson.coordinates[0];
      let sumLat = 0, sumLng = 0;
      coords.forEach((c: any) => { sumLng += c[0]; sumLat += c[1]; });
      const centerLat = sumLat / coords.length;
      const centerLng = sumLng / coords.length;

      const dist = this.getDistance(lat, lng, centerLat, centerLng);
      if (dist < minDistance) {
        minDistance = dist;
        nearest = { zone: poly.zone, label: poly.label };
      }
    }
    return nearest;
  }

  // PART 3 — OSM Logic with Google Interface
  private async updateZoneByLocation(lat: number, lng: number) {
    this.currentLat = lat;
    this.currentLng = lng;

    let detectedSuburb = '';
    let zone = -1;

    try {
      // 1. Întreabă OpenStreetMap (Nominatim) - Logica OSM reală
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=ro`,
        { headers: { 'User-Agent': 'SmartCityBrasov/1.1 (student project; parking zone detection)' } }
      );
      const data = await response.json();
      
      // Extrage cartierul (suburb, neighbourhood sau town)
      detectedSuburb = data.address?.suburb || data.address?.neighbourhood || data.address?.quarter || '';
      const city = data.address?.city || data.address?.town || '';

      console.log(`DEBUG - OSM Reverse: ${detectedSuburb} in ${city}`);

      // Mapare oficială cartiere -> zone (extinsă pentru acoperire maximă)
      const ZONE_MAP: any = {
        'centrul vechi': 0, 'centrul istoric': 0, 'schei': 0, 'șchei': 0, 'valea cetății': 0, 'cetate': 0, 'poiana brașov': 0, 'poiana brasov': 0, 'drumul poienii': 0,
        'centrul nou': 1, 'centrul civic': 1, 'astra': 1, 'florilor': 1, 'tractorul': 1, 'bartolomeu': 1, 'craiter': 1, 'scriitori': 1, 'prund': 1, 'scriitorilor': 1, 'griviței': 1, 'grivița': 1, 'gara': 1, 'gării': 1,
        'stupini': 2, 'noua': 2, 'dârste': 2, 'triaj': 2, 'bartolomeu nord': 2, 'noua-dârste': 2
      };

      const key = detectedSuburb.toLowerCase().trim();
      if (ZONE_MAP[key] !== undefined) {
        zone = ZONE_MAP[key];
      } else if (city.toLowerCase().includes('brașov')) {
        // Dacă e în Brașov dar cartierul e necunoscut, încercăm poligoanele noastre ca fallback
        console.log('DEBUG - Suburb unknown by OSM map, falling back to local polygons...');
        const polyResult = this.getZoneForPoint(lat, lng, this.zonePolygons) || this.getNearestZone(lat, lng, this.zonePolygons);
        if (polyResult) {
          zone = polyResult.zone;
          detectedSuburb = polyResult.label;
        }
      }
    } catch (e) {
      console.error('OSM API Error, using local polygons fallback:', e);
      const polyResult = this.getZoneForPoint(lat, lng, this.zonePolygons) || this.getNearestZone(lat, lng, this.zonePolygons);
      if (polyResult) {
        zone = polyResult.zone;
        detectedSuburb = polyResult.label;
      }
    }

    if (zone !== -1) {
      this.selectedZoneIndex = zone;
      this.detectedLocationName = `ZONA ${zone} – ${detectedSuburb || 'Brașov'}`;
      this.updateMarker(lat, lng, zone);
    } else {
      this.detectedLocationName = 'ZONĂ NEIDENTIFICATĂ';
    }

    if (this.map) {
      this.map.setCenter({ lat, lng });
      this.map.setZoom(17);
    }
    this.cdr.detectChanges();
  }


  currentLat: number = 0;
  currentLng: number = 0;

  private getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  private async updateMarker(lat: number, lng: number, zone: number) {
    if (!this.map) return;
    if (this.marker) this.marker.map = null;
    
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker") as any;
    const PIN_COLORS: any = { 0: '#e74c3c', 1: '#f39c12', 2: '#27ae60' };
    
    this.marker = new AdvancedMarkerElement({
      map: this.map,
      position: { lat, lng },
      content: Object.assign(document.createElement('div'), {
        innerHTML: `Z${zone}`,
        style: `background:${PIN_COLORS[zone] || '#747d8c'};color:white;font-weight:700;
                padding:5px 10px;border-radius:20px;border:2px solid white;
                box-shadow:0 2px 8px rgba(0,0,0,0.3);font-size:13px`
      })
    });
  }

  private initMap() {
    if (this.map) return;
    if (!this.mapContainer) return false;

    this.map = new google.maps.Map(this.mapContainer.nativeElement, {
      center: { lat: 45.6423, lng: 25.5888 },
      zoom: 15,
      mapId: 'SMART_CITY_MAP_ID', // Necesar pentru Advanced Markers
      disableDefaultUI: true,
      gestureHandling: 'greedy',
      styles: this.getMapStyles()
    });
    
    this.updateMarker(45.6423, 25.5888, 0);
    return true;
  }

  ngOnInit() {
    this.requestNotificationPermission();
    this.loadPersistedData();
    this.zonePolygons = this.loadZonePolygons();
    console.log(`DEBUG - Loaded ${this.zonePolygons.length} polygons:`, this.zonePolygons.map(p => `Z${p.zone}: ${p.label}`));

    // Init map after view renders
    setTimeout(() => {
      this.initMap();
      
      // Start GPS tracking
      if (navigator.geolocation) {
        navigator.geolocation.watchPosition(
          (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            console.log(`DEBUG - GPS update: ${lat}, ${lng}`);
            this.updateZoneByLocation(lat, lng);
          },
          (err) => {
            console.error('GPS error:', err.message);
            this.detectedLocationName = 'GPS indisponibil';
            this.cdr.detectChanges();
          },
          { enableHighAccuracy: true, timeout: 10000 }
        );
      } else {
        this.detectedLocationName = 'GPS nesusținut';
        this.cdr.detectChanges();
      }
    }, 500);
  }

  private loadPersistedData() {
    const savedPlate = localStorage.getItem('parked_plate');
    if (savedPlate) { this.carPlate = savedPlate; this.tempPlate = savedPlate; this.isPlateSaved = true; }
    const savedHours = localStorage.getItem('parking_selected_hours');
    if (savedHours) this.selectedHours = parseInt(savedHours);
    const savedHistory = localStorage.getItem('parking_history');
    if (savedHistory) this.history = JSON.parse(savedHistory);
    const expiry = localStorage.getItem('parking_expiry');
    if (expiry) {
      const remainingSeconds = Math.floor((parseInt(expiry) - Date.now()) / 1000);
      if (remainingSeconds > 0) this.resumeCountdown(remainingSeconds);
      else this.clearParkedData();
    }
  }

  private resumeCountdown(seconds: number) {
    if (this.timerSubscription) this.timerSubscription.unsubscribe();
    this.currentParkingSeconds = seconds;
    this.timeLeft = this.formatTime(this.currentParkingSeconds);
    let notificationSent = false;
    this.timerSubscription = interval(1000).subscribe(() => {
      if (this.currentParkingSeconds > 0) {
        this.currentParkingSeconds--;
        this.timeLeft = this.formatTime(this.currentParkingSeconds);
        if (this.currentParkingSeconds === 300 && !notificationSent) { this.sendExpiryNotification('Timpul de parcare expiră în 5 minute!'); notificationSent = true; }
        if (this.currentParkingSeconds === 0) { this.clearParkedData(); if (this.timerSubscription) this.timerSubscription.unsubscribe(); }
        this.cdr.detectChanges();
      }
    });
  }

  ngOnDestroy() { if (this.timerSubscription) this.timerSubscription.unsubscribe(); }

  private requestNotificationPermission() { if ('Notification' in window) Notification.requestPermission(); }
  private sendExpiryNotification(message: string) { if ('Notification' in window && Notification.permission === 'granted') new Notification('Smart City Brașov', { body: message }); }

  savePlate() { if (this.tempPlate.trim()) { this.carPlate = this.tempPlate.toUpperCase(); this.isPlateSaved = true; localStorage.setItem('parked_plate', this.carPlate); } }
  incrementHours() { if (this.selectedHours < 24) this.selectedHours++; localStorage.setItem('parking_selected_hours', this.selectedHours.toString()); }
  decrementHours() { if (this.selectedHours > 1) this.selectedHours--; localStorage.setItem('parking_selected_hours', this.selectedHours.toString()); }

  sendNativeSms() {
    if (!this.isPlateSaved && this.tempPlate.trim()) this.savePlate();
    if (!this.carPlate) { alert('Te rugăm să introduci numărul de înmatriculare!'); return; }
    const recipient = '1234';
    const body = `${this.carPlate} ${this.selectedHours}`;
    this.parkedCarLocationName = this.detectedLocationName || this.PARKING_ZONES[this.selectedZoneIndex].name;
    this.parkedCarZoneIndex = this.selectedZoneIndex;
    localStorage.setItem('parked_location_name', this.parkedCarLocationName);
    localStorage.setItem('parked_zone_index', this.parkedCarZoneIndex.toString());
    localStorage.setItem('parked_plate', this.carPlate);
    this.startCountdown(this.selectedHours);
    this.addToHistory();
    const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent);
    window.location.href = `sms:${recipient}${isIos ? '&' : '?'}body=${encodeURIComponent(body)}`;
  }

  private startCountdown(hours: number) {
    const seconds = hours * 3600;
    localStorage.setItem('parking_expiry', (Date.now() + seconds * 1000).toString());
    this.resumeCountdown(seconds);
  }

  private formatTime(totalSeconds: number): string {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  private addToHistory() {
    const now = new Date();
    const months = ['IAN', 'FEB', 'MAR', 'APR', 'MAI', 'IUN', 'IUL', 'AUG', 'SEP', 'OCT', 'NOI', 'DEC'];
    const zone = this.PARKING_ZONES[this.selectedZoneIndex];
    const newEntry = { day: String(now.getDate()).padStart(2, '0'), month: months[now.getMonth()], plate: this.carPlate, zone: zone.name, amount: (this.selectedHours * zone.tariff).toFixed(2) + '€' };
    this.history.unshift(newEntry);
    if (this.history.length > 10) this.history.pop();
    localStorage.setItem('parking_history', JSON.stringify(this.history));
  }

  toggleTariffs() { this.showTariffs = !this.showTariffs; }
  toggleQuickAdd() { this.showQuickAdd = !this.showQuickAdd; }
  scrollToHistory() { const el = document.getElementById('history-section'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }

  extendTime(minutes: number) {
    const extraSeconds = minutes * 60;
    this.currentParkingSeconds += extraSeconds;
    localStorage.setItem('parking_expiry', (Date.now() + this.currentParkingSeconds * 1000).toString());
    const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent);
    window.location.href = `sms:1234${isIos ? '&' : '?'}body=${encodeURIComponent(this.carPlate + ' ' + Math.ceil(minutes / 60))}`;
    this.resumeCountdown(this.currentParkingSeconds);
    this.cdr.detectChanges();
  }

  clearParkedData() {
    this.currentParkingSeconds = 0;
    this.parkingExpiry = null;
    this.timeLeft = '00:00:00';
    localStorage.removeItem('parking_expiry');
    localStorage.removeItem('parked_zone_index');
    localStorage.removeItem('parked_location_name');
    localStorage.removeItem('parked_plate');
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
}
