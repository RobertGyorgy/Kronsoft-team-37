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

  private async updateZoneByLocation(lat: number, lng: number) {
    this.currentLat = lat;
    this.currentLng = lng;

    const geocoder = new google.maps.Geocoder();
    const { results } = await geocoder.geocode({ location: { lat, lng } });

    if (results && results[0]) {
      const components = results[0].address_components;

      // Step 2 — Extrage cartierul din address_components (Extended fallback)
      let suburb =
        components.find((c: any) => c.types.includes('neighborhood'))?.long_name ||
        components.find((c: any) => c.types.includes('sublocality_level_2'))?.long_name ||
        components.find((c: any) => c.types.includes('sublocality_level_1'))?.long_name ||
        components.find((c: any) => c.types.includes('sublocality'))?.long_name ||
        null;

      // Fallback: iterate ALL results, not just results[0]
      if (!suburb || suburb === 'Brașov' || suburb === 'Brasov') {
        for (const result of results) {
          const comp = result.address_components;
          const found = comp.find((c: any) =>
            (c.types.includes('neighborhood') || c.types.includes('sublocality_level_1'))
            && c.long_name !== 'Brașov'
            && c.long_name !== 'Brasov'
          );
          if (found) { suburb = found.long_name; break; }
        }
      }

      // If still no neighborhood from Google, fallback to Nominatim
      if (!suburb || suburb === 'Brașov' || suburb === 'Brasov') {
        try {
          const nomRes = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
          const nomData = await nomRes.json();
          suburb = nomData.address.suburb || nomData.address.neighbourhood || nomData.address.quarter || 'Brașov';
        } catch (e) { console.warn('Nominatim fallback failed'); }
      }

      const street =
        components.find((c: any) => c.types.includes('route'))?.long_name || '';

      const ZONE_MAP: any = {
        'centrul vechi': 0, 'centrul istoric': 0, 'schei': 0, 'valea cetății': 0, 'poiana brașov': 0,
        'centrul nou': 1, 'astra': 1, 'florilor': 1, 'tractorul': 1, 'bartolomeu': 1, 'craiter': 1, 'scriitori': 1, 'prund': 1, 'victoriei': 1, 'gara': 1,
        'bartolomeu nord': 2, 'stupini': 2, 'triaj': 2, 'noua dârste': 2, 'noua': 2
      };
      
      const zone = ZONE_MAP[suburb?.toLowerCase().trim()] ?? 1;

      this.selectedZoneIndex = zone;
      this.detectedLocationName = `ZONA ${zone} – ${suburb || 'Brașov'}`;
      
      this.updateMarker(lat, lng, zone);
      
      if (this.map) {
        this.map.setCenter({ lat, lng });
        this.map.setZoom(17);
      }
      this.cdr.detectChanges();
      console.log(`DEBUG - Detectat: ${suburb}, Zona: ${zone}, Strada: ${street}`);
    }
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
