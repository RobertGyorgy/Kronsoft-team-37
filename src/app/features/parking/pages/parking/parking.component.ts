import { ChangeDetectionStrategy, Component, OnInit, OnDestroy, ChangeDetectorRef, NgZone, afterNextRender } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { interval, Subscription } from 'rxjs';

declare const L: any;

@Component({
  selector: 'app-parking',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <main class="parking-shell">
      <div class="main-scroll-area">
        <!-- 1. HEADER -->
        <header class="page-header-pill">
          <button class="back-pill" [routerLink]="['/home']">
            <span class="material-icons">arrow_back</span> Înapoi
          </button>
          <h1 class="page-title-pill">Parcare Brașov</h1>
        </header>

        <!-- 2. HARTA -->
        <section class="map-section-pill">
          <div style="position: relative;"><div id="parking-map" class="map-container-pill"></div><button (click)="startGpsTracking()" style="position: absolute; bottom: 10px; right: 10px; z-index: 1000; background: #fff; border: none; width: 40px; height: 40px; border-radius: 50%; box-shadow: 0 4px 12px rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center; cursor: pointer;">??</button></div>
        </section>

        <!-- 3. INPUT NUMAR (FUNDAL ALB) -->
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
          
          <!-- Stepper Pill -->
          <div class="stepper-pill-container">
            <span class="stepper-text-label">SELECTEAZĂ DURATA</span>
            <div class="stepper-controls">
              <button class="btn-step" (click)="decrementHours()">−</button>
              <span class="step-val-text">{{ selectedHours }}h</span>
              <button class="btn-step" (click)="incrementHours()">+</button>
            </div>
          </div>

          <!-- Action Buttons Outline -->
          <div class="action-row-outline">
            <button class="btn-outline-white" (click)="toggleTariffs()">Tarife</button>
            <button class="btn-outline-white" (click)="sendNativeSms()">SMS</button>
          </div>

          <!-- Timer Integrated -->
          <div class="timer-section-integrated">
            <p class="timer-sub-label">TIMP RĂMAS</p>
            <h3 class="timer-digits-white-tiny">{{ timeLeft }}</h3>
          </div>

          <div style="position: relative;">
            <!-- Quick Extension Menu -->
            <div class="quick-extend-menu" *ngIf="showQuickAdd">
              <button class="quick-opt" (click)="extendTime(30)">+30m</button>
              <button class="quick-opt" (click)="extendTime(60)">+1h</button>
              <button class="quick-opt" (click)="extendTime(120)">+2h</button>
            </div>

            <!-- Extend Button Solid White -->
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

        <!-- 6. MODAL TARIFE (NEW BLUE DESIGN) -->
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
    .parking-shell { height: 100vh; background: #fff; font-family: 'Outfit', sans-serif; color: #1a1a1a; overflow: hidden; }
    .main-scroll-area { height: 100vh; overflow-y: auto; padding-bottom: 2rem; }
    
    .page-header-pill { display: flex; align-items: center; padding: 0.5rem; position: relative; }
    .back-pill { background: none; border: none; color: #333; font-weight: 800; font-size: 1rem; cursor: pointer; display: flex; align-items: center; gap: 0.3rem; }
    .page-title-pill { font-size: 1rem; font-weight: 900; color: #1a1a1a; position: absolute; left: 50%; transform: translateX(-50%); }

    .map-section-pill { padding: 0 1rem; margin-bottom: 0.5rem; }
    .map-container-pill { height: 28vh; border-radius: 20px; overflow: hidden; border: 1px solid #eee; }

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
    .original-content-flow { padding: 1.5rem; display: flex; flex-direction: column; gap: 2rem; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
    .section-header h3 { font-size: 1rem; font-weight: 800; margin: 0; }
    .history-item { display: flex; align-items: center; gap: 1rem; background: #fff; padding: 0.5rem; border-radius: 16px; border: 1px solid #f0f0f0; }
    .history-date { background: #f8f9fa; padding: 0.5rem; border-radius: 12px; display: flex; flex-direction: column; align-items: center; min-width: 50px; }
    .history-date .day { font-size: 1.1rem; font-weight: 800; }
    .history-date .month { font-size: 0.65rem; font-weight: 700; color: #666; }
    .history-info { flex: 1; }
    .history-info .plate { display: block; font-weight: 800; font-size: 1rem; }
    .history-info .loc { font-size: 0.95rem; color: #666; }
    .amount { font-weight: 800; color: #ff4d4d; }
    .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 2rem; }
    .modal-card { background: #fff; border-radius: 24px; padding: 1.5rem; width: 100%; max-width: 360px; box-shadow: 0 15px 40px rgba(0,0,0,0.2); color: #333; }
    .modal-card h3 { margin-top: 0; margin-bottom: 0.5rem; font-weight: 900; text-align: center; font-size: 1.2rem; }
    .tarif-row { display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid #f0f0f0; font-weight: 700; color: #333; font-size: 0.9rem; }
    .tariff-cards-container { display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1rem; } .tariff-pill-card { padding: 1rem; border-radius: 20px; display: flex; justify-content: space-between; align-items: center; color: #fff; box-shadow: 0 4px 12px rgba(0,0,0,0.1); } .z-label { font-weight: 900; font-size: 1.1rem; } .z-prices { text-align: right; display: flex; flex-direction: column; } .z-prices strong { font-size: 1rem; } .z-prices span { font-size: 0.75rem; opacity: 0.9; font-weight: 700; } .zona-0-bg { background: #ff4757; } .zona-1-bg { background: #ffa502; } .zona-2-bg { background: #2ed573; } .quick-extend-menu { position: absolute; bottom: 110%; left: 0; width: 100%; background: #fff; border-radius: 20px; padding: 0.5rem; box-shadow: 0 -5px 25px rgba(0,0,0,0.15); display: flex; gap: 0.5rem; z-index: 10; animation: popUp 0.3s cubic-bezier(0.4, 0, 0.2, 1); } .quick-opt { flex: 1; background: #f0f7ff; color: #4285f4; border: none; border-radius: 12px; padding: 0.6rem; font-weight: 900; font-size: 0.85rem; cursor: pointer; } @keyframes popUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } } .btn-close-modal-blue { width: 100%; background: #4285f4; color: #fff; border: none; border-radius: 50px; padding: 0.8rem; font-weight: 900; font-size: 1rem; margin-top: 1rem; cursor: pointer; }
    .zona-2 { background: #2ed573; }
    .quick-add-menu { position: absolute; bottom: 120%; left: 0; width: 100%; background: #fff; border-radius: 20px; padding: 0.5rem; box-shadow: 0 -10px 25px rgba(0,0,0,0.15); display: flex; justify-content: space-around; gap: 0.5rem; animation: popUp 0.3s cubic-bezier(0.4, 0, 0.2, 1); z-index: 10; }
    .quick-option { flex: 1; padding: 0.5rem; background: #f0f7ff; color: #4285f4; border-radius: 12px; font-weight: 800; text-align: center; font-size: 0.9rem; cursor: pointer; }
  `]
})
export class ParkingComponent implements OnInit, OnDestroy {
  showTariffs = false;
  showSms = false;
  showQuickAdd = false;
  public timeLeft = '00:00:00';
  public parkingExpiry: number | null = null;
  carPlate = '';
  isPlateSaved = false;
  tempPlate = '';
  selectedHours = 1;
  selectedZoneIndex = 0; // Default to Zona 0
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

  // --- GPS & Geofencing State ---
  isOutOfZone = false;
  
  // High-precision Points of Interest (Real parking spots in Brasov)
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
      this.initParkingMap();
      this.startGpsTracking();
      this.loadPersistedData();
      
      // Sync UI when returning from SMS app
      window.addEventListener('focus', () => {
        this.loadPersistedData();
        this.cdr.detectChanges();
      });
    });
  }

  private startGpsTracking() {
    if (!navigator.geolocation) return;

    // Immediate request to trigger permission prompt faster
    navigator.geolocation.getCurrentPosition(
      (pos) => this.zone.run(() => this.updateZoneByLocation(pos.coords.latitude, pos.coords.longitude)),
      (err) => console.warn('Initial GPS fail', err),
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );

    // Continuous tracking with highest accuracy
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

  private updateZoneByLocation(lat: number, lng: number) {
    this.currentLat = lat;
    this.currentLng = lng;

    // 1. Precise Check (POI snapping within 250m)
    let nearestPoi: any = null;
    let minDistance = Infinity;

    this.PARKING_POIS.forEach(poi => {
      const dist = this.getDistance(lat, lng, poi.lat, poi.lng);
      if (dist < minDistance) {
        minDistance = dist;
        nearestPoi = poi;
      }
    });

    if (nearestPoi && minDistance < 250) {
      this.selectedZoneIndex = nearestPoi.zone;
      this.detectedLocationName = nearestPoi.name;
      this.isOutOfZone = false;
    } else {
      // 2. Broad Check (Bounding Boxes)
      const detectedBoundIndex = this.ZONE_BOUNDS.findIndex(b => 
        lat >= b.minLat && lat <= b.maxLat && lng >= b.minLng && lng <= b.maxLng
      );

      if (detectedBoundIndex !== -1) {
        this.selectedZoneIndex = detectedBoundIndex;
        this.detectedLocationName = ''; // Generic zone name will be used from PARKING_ZONES
        this.isOutOfZone = false;
      } else {
        this.detectedLocationName = '';
        this.isOutOfZone = true;
      }
    }
    
    // Update map marker
    this.updateMarker(lat, lng, this.isOutOfZone ? '#ff4d4d' : '#4285f4');
    
    if (this.map) this.map.setView([lat, lng], 16);
    this.cdr.detectChanges();
  }

  currentLat: number = 0;
  currentLng: number = 0;

  private getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  private updateMarker(lat: number, lng: number, color: string) {
    if (!this.map) return;
    if (this.marker) this.map.removeLayer(this.marker);
    
    const icon = L.divIcon({ 
      html: `<div style="
        background: ${color}; 
        width: 30px; 
        height: 30px; 
        border-radius: 50%; 
        border: 4px solid white; 
        box-shadow: 0 4px 15px rgba(0,0,0,0.3); 
        display: flex; 
        align-items: center; 
        justify-content: center; 
        color: white; 
        font-weight: 900; 
        font-size: 16px;
      ">P</div>`, 
      className: '', iconSize: [30, 30], iconAnchor: [15, 15] 
    });
    
    this.marker = L.marker([lat, lng], { icon: icon }).addTo(this.map);
  }

  private isInside(point: number[], vs: number[][]): boolean {
    return false; // Deprecated in favor of POI detection
  }

  private initParkingMap() {
    if (this.map) return;
    const initialLat = 45.6423;
    const initialLng = 25.5888;
    
    this.map = L.map('parking-map', { zoomControl: false, attributionControl: false }).setView([initialLat, initialLng], 15);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', { maxZoom: 19 }).addTo(this.map);
    
    this.updateMarker(initialLat, initialLng, '#ff4d4d');
  }

  ngOnInit() {
    this.requestNotificationPermission();
    this.loadPersistedData();
  }

  private loadPersistedData() {
    const savedPlate = localStorage.getItem('parked_plate');
    if (savedPlate) {
      this.carPlate = savedPlate;
      this.tempPlate = savedPlate;
      this.isPlateSaved = true;
    }

    const savedHours = localStorage.getItem('parking_selected_hours');
    if (savedHours) this.selectedHours = parseInt(savedHours);

    const savedHistory = localStorage.getItem('parking_history');
    if (savedHistory) this.history = JSON.parse(savedHistory);

    const expiry = localStorage.getItem('parking_expiry');
    if (expiry) {
      const remainingSeconds = Math.floor((parseInt(expiry) - Date.now()) / 1000);
      if (remainingSeconds > 0) {
        this.resumeCountdown(remainingSeconds);
      } else {
        this.clearParkedData();
      }
    }

    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
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

        if (this.currentParkingSeconds === 300 && !notificationSent) {
          this.sendExpiryNotification('Timpul de parcare expiră în 5 minute!');
          notificationSent = true;
        }

        if (this.currentParkingSeconds === 0) {
          this.clearParkedData();
          if (this.timerSubscription) this.timerSubscription.unsubscribe();
        }
        this.cdr.detectChanges();
      }
    });
  }

  stopSession() {
    if (confirm('Ești sigur că vrei să oprești sesiunea de parcare?')) {
      if (this.timerSubscription) this.timerSubscription.unsubscribe();
      this.clearParkedData();
      this.cdr.detectChanges();
    }
  }

  ngOnDestroy() {
    if (this.timerSubscription) this.timerSubscription.unsubscribe();
  }

  private requestNotificationPermission() {
    if ('Notification' in window) {
      Notification.requestPermission();
    }
  }

  private sendExpiryNotification(message: string) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Smart City Brașov', {
        body: message,
        icon: 'favicon.ico'
      });
    }
  }

  savePlate() {
    if (this.tempPlate.trim()) {
      this.carPlate = this.tempPlate.toUpperCase();
      this.isPlateSaved = true;
      localStorage.setItem('parking_carPlate', this.carPlate);
    }
  }

  editPlate() {
    this.isPlateSaved = false;
    this.tempPlate = this.carPlate;
  }

  incrementHours() { 
    if (this.selectedHours < 24) this.selectedHours++; 
    localStorage.setItem('parking_selected_hours', this.selectedHours.toString());
  }
  decrementHours() { 
    if (this.selectedHours > 1) this.selectedHours--; 
    localStorage.setItem('parking_selected_hours', this.selectedHours.toString());
  }

  selectZoneManually(index: number) {
    this.selectedZoneIndex = index;
    this.detectedLocationName = ''; // Clear detected name on manual override
    this.cdr.detectChanges();
  }

  sendNativeSms() {
    // Auto-save plate if user typed but didn't click save
    if (!this.isPlateSaved && this.tempPlate.trim()) {
      this.savePlate();
    }

    if (!this.carPlate) {
      alert('Te rugăm să introduci numărul de înmatriculare!');
      return;
    }

    const recipient = '1234';
    const body = `${this.carPlate} ${this.selectedHours}`;
    
    // Save state before triggering SMS
    this.parkedCarLocationName = this.detectedLocationName || this.PARKING_ZONES[this.selectedZoneIndex].name;
    this.parkedCarZoneIndex = this.selectedZoneIndex;
    localStorage.setItem('parked_location_name', this.parkedCarLocationName);
    localStorage.setItem('parked_zone_index', this.parkedCarZoneIndex.toString());
    localStorage.setItem('parked_plate', this.carPlate);

    // Force start timer
    this.zone.run(() => {
      this.startCountdown(this.selectedHours);
      this.cdr.detectChanges();
    });

    this.addToHistory();

    const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const smsUrl = `sms:${recipient}${isIos ? '&' : '?'}body=${encodeURIComponent(body)}`;
    
    setTimeout(() => {
      window.location.href = smsUrl;
    }, 200);
  }

  private startCountdown(hours: number) {
    const seconds = hours * 3600;
    const expiryTimestamp = Date.now() + (seconds * 1000);
    localStorage.setItem('parking_expiry', expiryTimestamp.toString());
    this.resumeCountdown(seconds);
  }

  private formatTime(totalSeconds: number): string {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  isExpiryWarning(): boolean {
    if (this.timeLeft === '00:00:00') return false;
    const [h, m] = this.timeLeft.split(':').map(Number);
    return h === 0 && m < 5;
  }

  private addToHistory() {
    const now = new Date();
    const months = ['IAN', 'FEB', 'MAR', 'APR', 'MAI', 'IUN', 'IUL', 'AUG', 'SEP', 'OCT', 'NOI', 'DEC'];
    const zone = this.PARKING_ZONES[this.selectedZoneIndex];
    
    const newEntry = {
      day: String(now.getDate()).padStart(2, '0'),
      month: months[now.getMonth()],
      plate: this.carPlate,
      zone: zone.name,
      amount: (this.selectedHours * zone.tariff).toFixed(2) + '€'
    };

    this.history.unshift(newEntry);
    if (this.history.length > 10) this.history.pop();
    localStorage.setItem('parking_history', JSON.stringify(this.history));
  }

  toggleTariffs() { this.showTariffs = !this.showTariffs; }
  toggleQuickAdd() { this.showQuickAdd = !this.showQuickAdd; 
  } scrollToHistory() { const el = document.getElementById('history-section'); if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); } }

  extendTime(minutes: number) {
    const extraSeconds = minutes * 60;
    this.currentParkingSeconds += extraSeconds;
    
    // Save new expiry
    const now = Date.now();
    const expiryTimestamp = now + (this.currentParkingSeconds * 1000);
    localStorage.setItem('parking_expiry', expiryTimestamp.toString());

    // Trigger SMS
    const recipient = '1234';
    const body = `${this.carPlate} ${Math.ceil(minutes / 60)}`;
    const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const smsUrl = `sms:${recipient}${isIos ? '&' : '?'}body=${encodeURIComponent(body)}`;
    window.location.href = smsUrl;

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
}

