import { ChangeDetectionStrategy, Component, OnInit, OnDestroy, ChangeDetectorRef, NgZone, afterNextRender, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { interval, Subscription } from 'rxjs';
import { gsap } from 'gsap';
import maplibregl from 'maplibre-gl';
import * as turf from '@turf/turf';
import { GeolocationService } from '../../../../core/services/geolocation.service';
import { TransitService } from '../../../transport/services/transit.service';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';


@Component({
  selector: 'app-parking',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <main class="parking-glass-shell">
      <div #mapContainer class="map-bg"></div>
      <div class="map-overlay-vignette"></div>

      <!-- TOP STATUS HUB -->
      <header class="top-status-hub">
        <div class="glass-status-card">
          <div class="status-top-row">
            <button class="minimal-back-circle" routerLink="/dashboard">
              <span class="material-icons">arrow_back</span>
            </button>
            <div class="timer-main-display">
              <span class="timer-sub">TIMP RĂMAS</span>
              <h1 class="timer-digits">{{ timeLeft }}</h1>
            </div>
            <button class="minimal-back-circle" (click)="showHistory = true">
              <span class="material-icons">history</span>
            </button>
          </div>
          
          <div class="status-bottom-row" [class.outside]="isOutsideZones">
            <div class="zone-pill" [class]="isOutsideZones ? 'z-none' : 'z-' + selectedZoneIndex" (click)="cycleZone()" style="cursor: pointer;">
              {{ isOutsideZones ? 'FĂRĂ ZONĂ' : ('ZONA ' + selectedZoneIndex) }}
            </div>
            <span class="street-label-minimal">{{ isOutsideZones ? 'Ești în afara zonelor de parcare' : (currentStreet || 'Localizare parcare...') }}</span>
          </div>
        </div>
      </header>

      <!-- SIDE RAIL -->
      <aside class="compact-side-rail">
        <button class="glass-round-btn" (click)="toggleTariffs()">
          <span class="material-icons">payments</span>
        </button>
        <button class="glass-round-btn" (click)="recenterMap()" [class.following]="followMode">
          <span class="material-icons">{{ followMode ? 'gps_fixed' : 'my_location' }}</span>
        </button>
      </aside>

      <!-- BOTTOM ACTION DOCK -->
      <section class="action-dock-container">
        @if (showProximityWarning) {
          <div class="proximity-warning-bar">
            <span class="material-icons">info</span>
            <span>Aproape de limita zonei. Verifică indicatorul stradal.</span>
          </div>
        }

        <div class="glass-action-card">
          <div class="dock-input-row">
            <div class="input-pill-modern">
              <span class="material-icons">directions_car</span>
              <input type="text" [(ngModel)]="tempPlate" (ngModelChange)="onPlateInputChange($event)" placeholder="Număr înmatriculare" class="plate-input-field">
              <button class="pill-check-btn" (click)="savePlate()" [class.active]="isPlateSaved">
                <span class="material-icons">{{ isPlateSaved ? 'check_circle' : 'save' }}</span>
              </button>
            </div>
          </div>

          @if (userSavedPlates.length > 0) {
            <div class="saved-plates-strip">
              @for (p of userSavedPlates; track p) {
                <button class="plate-tag" [class.active]="tempPlate === p" (click)="selectSavedPlate(p)">
                  {{ p }}
                </button>
              }
            </div>
          }

          <div class="dock-controls-row">
            @if (selectedZoneIndex === 2) {
              <div class="stepper-pill-glass zone-2-selector">
                <button class="duration-btn" [class.active]="selectedHours === 1" (click)="selectedHours = 1">1h</button>
                <button class="duration-btn" [class.active]="selectedHours === 12" (click)="selectedHours = 12">12h</button>
              </div>
            }
            <button class="pay-button-solid" (click)="sendNativeSms()">
              <span>PLĂTEȘTE</span>
              <span class="material-icons">send</span>
            </button>
          </div>
        </div>
      </section>

      <!-- OVERLAYS -->
      @if (showHistory) {
        <div class="overlay-blur" (click)="showHistory = false">
          <div class="glass-drawer-sheet" (click)="$event.stopPropagation()">
            <header class="sheet-top"><h2>Istoric Plăți</h2><button (click)="showHistory = false" class="close-round"><span class="material-icons">close</span></button></header>
            <div class="sheet-scrollable">
              @for (item of history; track $index) {
                <div class="glass-history-row">
                  <div class="h-date-box"><strong>{{ item.day }}</strong><small>{{ item.month }}</small></div>
                  <div class="h-main-info"><span class="h-plate-txt">{{ item.plate }}</span><span class="h-zone-txt">{{ item.zone }}</span></div>
                  <span class="h-amount-txt">{{ item.amount }}</span>
                </div>
              }
            </div>
          </div>
        </div>
      }

      @if (showTariffs) {
        <div class="overlay-blur" (click)="toggleTariffs()">
          <div class="glass-drawer-sheet" (click)="$event.stopPropagation()">
            <header class="sheet-top"><h2>Tarife Parcare</h2><button (click)="toggleTariffs()" class="close-round"><span class="material-icons">close</span></button></header>
            <div class="tariff-list-glass">
              @for (zone of PARKING_ZONES; track $index) {
                <div class="glass-t-item" [class]="'gt-zone-' + $index">
                  <div class="gt-name-group"><span class="gt-title">{{ zone.name.split(' - ')[0] }}</span><span class="gt-desc">{{ zone.name.split(' - ')[1] }}</span></div>
                  <div class="gt-price-group"><span class="gt-main-price">{{ zone.tariff.toFixed(2) }}€/h</span><span class="gt-sub-price">24h: {{ (zone.tariff * 5).toFixed(2) }}€</span></div>
                </div>
              }
            </div>
          </div>
        </div>
      }

      @if (showPaymentConfirmation) {
        <div class="overlay-blur">
          <div class="glass-drawer-sheet" (click)="$event.stopPropagation()">
            <div class="confirmation-hero">
              <span class="material-icons check-icon-giant">check_circle</span>
              <h2>Confirmă Plata</h2>
              <p>Ai trimis SMS-ul de parcare pentru numărul <strong>{{ carPlate }}</strong>?</p>
            </div>
            <div class="confirm-actions">
              <button class="pay-button-solid" (click)="confirmPayment()">
                <span>DA, AM TRIMIS</span>
                <span class="material-icons">task_alt</span>
              </button>
              <button class="minimal-text-btn" (click)="cancelPayment()">Nu încă</button>
            </div>
          </div>
        </div>
      }
    </main>
  `,
  styles: [`
    .parking-glass-shell { height: 100dvh; width: 100%; overflow: hidden; position: relative; font-family: 'Outfit', sans-serif; background: var(--bg-primary); }
    .map-bg { position: absolute; inset: 0; z-index: 1; }
    .map-overlay-vignette { position: absolute; inset: 0; background: radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0.15) 100%); z-index: 2; pointer-events: none; }
    .top-status-hub { position: absolute; top: calc(var(--safe-top) + 0.75rem); left: 1rem; right: 1rem; z-index: 100; }
    .glass-status-card { background: var(--glass-bg); backdrop-filter: blur(25px); border-radius: 32px; border: 1px solid var(--glass-border); padding: 1.25rem; box-shadow: 0 15px 45px rgba(0,0,0,0.12); display: flex; flex-direction: column; gap: 1rem; }
    .status-top-row { display: flex; align-items: center; justify-content: space-between; }
    .minimal-back-circle { width: 44px; height: 44px; border-radius: 50%; background: var(--bg-card); border: none; display: flex; align-items: center; justify-content: center; color: var(--text-primary); cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .timer-main-display { text-align: center; flex: 1; }
    .timer-sub { font-size: 0.65rem; font-weight: 900; color: #888; letter-spacing: 0.15em; display: block; margin-bottom: 0.2rem; }
    .timer-digits { font-size: 3.2rem; font-weight: 950; color: var(--text-primary); margin: 0; line-height: 0.9; letter-spacing: -0.05em; font-variant-numeric: tabular-nums; }
    .status-bottom-row { display: flex; align-items: center; gap: 0.75rem; background: rgba(0,0,0,0.03); padding: 0.5rem; border-radius: 16px; transition: all 0.3s; }
    .status-bottom-row.outside { background: rgba(116, 125, 140, 0.1); }
    .zone-pill { padding: 4px 12px; border-radius: 999px; font-weight: 950; font-size: 0.65rem; color: #fff; text-transform: uppercase; transition: all 0.3s; }
    .z-0 { background: #ea4335; }
    .z-1 { background: #fb8c00; }
    .z-2 { background: #34a853; }
    .z-none { background: #747d8c; }
    .street-label-minimal { font-size: 0.9rem; font-weight: 800; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .compact-side-rail { position: absolute; right: 1rem; top: 60%; transform: translateY(-50%); z-index: 10; display: flex; flex-direction: column; gap: 0.75rem; }
    .glass-round-btn { width: 52px; height: 52px; border-radius: 50%; background: var(--glass-bg); backdrop-filter: blur(20px); border: 1px solid var(--glass-border); display: flex; align-items: center; justify-content: center; color: var(--text-primary); cursor: pointer; box-shadow: 0 8px 25px rgba(0,0,0,0.08); }
    .action-dock-container { position: absolute; bottom: calc(var(--safe-bottom) + 1rem); left: 1rem; right: 1rem; z-index: 100; }
    .glass-action-card { background: var(--glass-bg); backdrop-filter: blur(30px); border-radius: 36px; border: 1px solid var(--glass-border); padding: 1.5rem; box-shadow: 0 20px 60px rgba(0,0,0,0.15); display: flex; flex-direction: column; gap: 1.25rem; position: relative; }
    .dock-input-row { width: 100%; }
    .proximity-warning-bar { background: rgba(251, 140, 0, 0.9); backdrop-filter: blur(10px); color: #fff; padding: 0.75rem 1.25rem; border-radius: 20px; margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.75rem; font-size: 0.8rem; font-weight: 800; box-shadow: 0 10px 30px rgba(251,140,0,0.2); animation: slideUp 0.4s ease-out; }
    @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    .input-pill-modern { background: rgba(0,0,0,0.04); border-radius: 999px; height: 56px; display: flex; align-items: center; padding: 0 0.5rem 0 1.25rem; gap: 0.75rem; border: 1px solid rgba(0,0,0,0.02); }
    .input-pill-modern .material-icons { color: #888; font-size: 1.2rem; }
    .plate-input-field { flex: 1; border: none; background: transparent; outline: none; font-weight: 800; font-size: 1.1rem; color: var(--text-primary); width: 100%; }
    .pill-check-btn { width: 44px; height: 44px; border-radius: 50%; background: #fff; border: none; color: #ccc; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.05); transition: all 0.3s; }
    .pill-check-btn.active { background: var(--text-primary); color: var(--bg-primary); }
    
    .saved-plates-strip { display: flex; gap: 0.5rem; overflow-x: auto; padding: 0.25rem 0 0.5rem; scrollbar-width: none; }
    .saved-plates-strip::-webkit-scrollbar { display: none; }
    .plate-tag { padding: 0.5rem 1rem; border-radius: 12px; background: var(--bg-secondary); border: 1px solid var(--border-color); color: var(--text-primary); font-weight: 900; font-size: 0.8rem; cursor: pointer; white-space: nowrap; transition: all 0.2s; }
    .plate-tag.active { background: var(--text-primary); color: var(--bg-primary); border-color: var(--text-primary); }
    
    .dock-controls-row { display: flex; gap: 0.75rem; }
    .stepper-pill-glass { flex: 1; height: 56px; background: rgba(0,0,0,0.04); border-radius: 28px; display: flex; align-items: center; justify-content: space-between; padding: 0 0.5rem; }
    .stepper-pill-glass.fixed-duration { justify-content: center; background: rgba(116, 125, 140, 0.1); }
    .stepper-pill-glass.zone-2-selector { padding: 4px; gap: 4px; }
    .duration-btn { flex: 1; height: 100%; border-radius: 24px; border: none; background: transparent; font-weight: 800; font-size: 1rem; color: #888; cursor: pointer; transition: all 0.2s; }
    .duration-btn.active { background: #fff; color: #34a853; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
    .hour-val { font-size: 1.1rem; font-weight: 950; color: #1a1a1a; text-align: center; }
    .pay-button-solid { flex: 1.4; height: 56px; background: var(--text-primary); border-radius: 999px; border: none; color: var(--bg-primary); font-weight: 950; font-size: 1rem; display: flex; align-items: center; justify-content: center; gap: 0.75rem; cursor: pointer; box-shadow: 0 10px 25px rgba(0,0,0,0.15); white-space: nowrap; }
    .overlay-blur { position: fixed; inset: 0; background: rgba(0,0,0,0.25); backdrop-filter: blur(15px); z-index: 2000; display: flex; align-items: flex-end; }
    .glass-drawer-sheet { width: 100%; background: var(--glass-bg); backdrop-filter: blur(30px); border-radius: 40px 40px 0 0; padding: 2.5rem 1.5rem; box-shadow: 0 -20px 60px rgba(0,0,0,0.1); }
    .sheet-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
    .sheet-top h2 { font-size: 1.8rem; font-weight: 950; margin: 0; letter-spacing: -0.04em; }
    .close-round { width: 44px; height: 44px; border-radius: 50%; background: #f5f5f5; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; }
    .sheet-scrollable { display: flex; flex-direction: column; gap: 0.75rem; max-height: 60vh; overflow-y: auto; }
    .glass-history-row { padding: 1.25rem; background: rgba(0,0,0,0.03); border-radius: 24px; display: flex; align-items: center; gap: 1rem; border: 1px solid rgba(0,0,0,0.02); }
    .h-date-box { background: #fff; padding: 0.5rem; border-radius: 12px; min-width: 46px; text-align: center; box-shadow: 0 4px 10px rgba(0,0,0,0.04); }
    .h-date-box strong { display: block; font-size: 1.1rem; font-weight: 950; line-height: 1; }
    .h-date-box small { font-size: 0.6rem; font-weight: 800; color: #4285f4; text-transform: uppercase; }
    .h-main-info { flex: 1; display: flex; flex-direction: column; }
    .h-plate-txt { font-weight: 800; font-size: 1.1rem; color: #1a1a1a; }
    .h-zone-txt { font-size: 0.75rem; font-weight: 600; color: #888; }
    .h-amount-txt { font-weight: 950; font-size: 1.2rem; color: #1a1a1a; }
    .tariff-list-glass { display: flex; flex-direction: column; gap: 1rem; }
    .glass-t-item { padding: 1.5rem; border-radius: 28px; display: flex; justify-content: space-between; align-items: center; color: #fff; }
    .gt-zone-0 { background: #ea4335; box-shadow: 0 10px 25px rgba(234,67,53,0.3); }
    .gt-zone-1 { background: #fb8c00; box-shadow: 0 10px 25px rgba(251,140,0,0.3); }
    .gt-zone-2 { background: #34a853; box-shadow: 0 10px 25px rgba(52,168,83,0.3); }
    .gt-name-group { display: flex; flex-direction: column; }
    .gt-title { font-size: 1.5rem; font-weight: 950; }
    .gt-desc { font-size: 0.8rem; font-weight: 800; opacity: 0.8; }
    .gt-price-group { text-align: right; }
    .gt-main-price { font-size: 1.6rem; font-weight: 950; display: block; line-height: 1; }
    .gt-sub-price { font-size: 0.8rem; font-weight: 800; opacity: 0.8; }
    .confirmation-hero { text-align: center; padding: 1rem 0 2rem; }
    .check-icon-giant { font-size: 4rem; color: #34a853; margin-bottom: 1rem; }
    .confirmation-hero h2 { font-size: 1.8rem; font-weight: 950; margin: 0 0 0.5rem; letter-spacing: -0.04em; }
    .confirmation-hero p { color: #666; font-weight: 600; line-height: 1.5; }
    .confirm-actions { display: flex; flex-direction: column; gap: 1rem; }
    .minimal-text-btn { background: none; border: none; color: #888; font-weight: 800; cursor: pointer; padding: 0.5rem; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ParkingComponent implements OnInit, OnDestroy {
  @ViewChild('mapContainer') mapContainer!: ElementRef;

  showTariffs = false;
  showQuickAdd = false;
  showHistory = false;
  isOutsideZones = false;
  public timeLeft = '00:00:00';
  carPlate = '';
  isPlateSaved = false;
  tempPlate = '';
  userSavedPlates: string[] = [];
  selectedHours = 1;
  selectedZoneIndex = 0;
  currentStreet = '';
  currentNeighborhood = '';
  showProximityWarning = false;
  showPaymentConfirmation = false;
  private userLat = 0;
  private userLng = 0;
  public followMode = true;
  private isUserPanning = false;
  private isAlive = true;
  
  history: any[] = [];
  private timerSubscription: Subscription | undefined;
  public currentParkingSeconds = 0;
  private map: any;
  private marker: any;
  private neighborhoodData: any[] = [];
  private lastGeocodeTime = 0;
  private lastGeocodeCoords = { lat: 0, lng: 0 };

  public PARKING_ZONES: any[] = [];

  private polygonObjects: any[] = [];

  constructor(
    private cdr: ChangeDetectorRef, 
    private zone: NgZone,
    private geoService: GeolocationService,
    private transitService: TransitService,
    private http: HttpClient
  ) {
    afterNextRender(async () => {
      try {
        await this.initMap();
        await this.loadParkingData();
        this.setupLocationSync();
        this.loadPersistedData();
        this.animateEntrance();
      } catch (err) {
        console.error('Parking initialization failed', err);
      }
    });
  }

  private animateEntrance() {
    gsap.from('.glass-status-card', { y: -100, opacity: 0, duration: 1, ease: 'power3.out' });
    gsap.from('.glass-action-card', { y: 150, opacity: 0, duration: 1, delay: 0.3, ease: 'power3.out' });
    gsap.from('.glass-round-btn', { x: 50, opacity: 0, stagger: 0.1, duration: 0.6, delay: 0.6, ease: 'power2.out' });
  }

  private async loadParkingData() {
    try {
      // Fetch Production Zones from Java Backend (8083) with fallback
      let zoneRes: any;
      try {
        zoneRes = await firstValueFrom(this.http.get<any>('/api/parking/zones?page=0&size=50'));
      } catch (err) {
        console.warn('Could not fetch zones from Java backend, using static fallback zones:', err);
        zoneRes = {
          content: [
            { zone: 'Zona 0 - Centru Vechi', tariffPerHour: 0.60, tariffPerDay: 3.00 },
            { zone: 'Zona 1 - Centrul Civic', tariffPerHour: 0.40, tariffPerDay: 2.00 },
            { zone: 'Zona 2 - Periferie', tariffPerHour: 0.30, tariffPerDay: 1.50 }
          ]
        };
      }
      
      // Fetch Neighborhoods directly from the static GeoJSON asset (served from public/)
      const neighborhoods = await firstValueFrom(this.http.get<any[]>('/brasov_neighborhoods.json'));

      let zonesList: any[] = [];
      if (zoneRes) {
        if (Array.isArray(zoneRes)) {
          zonesList = zoneRes;
        } else if (zoneRes.data && Array.isArray(zoneRes.data)) {
          zonesList = zoneRes.data;
        } else if (zoneRes.content && Array.isArray(zoneRes.content)) {
          zonesList = zoneRes.content;
        }
      }

      if (!zonesList || zonesList.length === 0) {
        zonesList = [
          { zone: 'Zona 0 - Centru Vechi', tariffPerHour: 0.60, tariffPerDay: 3.00 },
          { zone: 'Zona 1 - Centrul Civic', tariffPerHour: 0.40, tariffPerDay: 2.00 },
          { zone: 'Zona 2 - Periferie', tariffPerHour: 0.30, tariffPerDay: 1.50 }
        ];
      }

      this.PARKING_ZONES = zonesList.map((z: any, idx: number) => {
        let rawTariff = z.tariffPerHour !== undefined ? z.tariffPerHour : z.tariff;
        let rawTariffDay = z.tariffPerDay;
        
        let tariff = typeof rawTariff === 'number' ? rawTariff : parseFloat(String(rawTariff || '0'));
        let tariffPerDay = typeof rawTariffDay === 'number' ? rawTariffDay : parseFloat(String(rawTariffDay || '0'));

        return {
          id: idx,
          name: z.zone || `Zona ${idx}`,
          smsNumber: '1234',
          tariff: isNaN(tariff) ? 0.50 : tariff,
          tariffPerDay: isNaN(tariffPerDay) ? 2.50 : tariffPerDay
        };
      });

      this.neighborhoodData = neighborhoods;
      
      if (!this.map) return;

      const features = this.neighborhoodData.map((nb: any, index: number) => {
        const coords = nb.path.map((p: any) => [p.lng, p.lat]);
        // Close the polygon
        if (coords.length > 0) coords.push(coords[0]);

        return {
          type: 'Feature',
          geometry: { type: 'Polygon', coordinates: [coords] },
          properties: { 
            id: index,
            name: nb.name, 
            zone: nb.zone 
          }
        };
      });

      this.map.addSource('parking-zones', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: features }
      });

      const ZONE_COLORS: any = { 0: '#ea4335', 1: '#fb8c00', 2: '#34a853' };

      this.map.addLayer({
        id: 'zones-fill',
        type: 'fill',
        source: 'parking-zones',
        paint: {
          'fill-color': [
            'match', ['get', 'zone'],
            0, ZONE_COLORS[0],
            1, ZONE_COLORS[1],
            2, ZONE_COLORS[2],
            '#747d8c'
          ],
          'fill-opacity': 0.15
        }
      });

      this.map.addLayer({
        id: 'zones-outline',
        type: 'line',
        source: 'parking-zones',
        paint: {
          'line-color': [
            'match', ['get', 'zone'],
            0, ZONE_COLORS[0],
            1, ZONE_COLORS[1],
            2, ZONE_COLORS[2],
            '#747d8c'
          ],
          'line-width': 2,
          'line-opacity': 0.5
        }
      });

      this.cdr.detectChanges();
    } catch (e) {
      console.error('Failed to load HD neighborhoods', e);
    }
  }

  private updateZoneByLocation(lat: number, lng: number) {
    this.userLat = lat;
    this.userLng = lng;
    
    let foundNeighborhood = null;
    const pt = turf.point([lng, lat]);

    for (const nb of this.neighborhoodData) {
      const coords = nb.path.map((p: any) => [p.lng, p.lat]);
      if (coords.length > 0) coords.push(coords[0]);
      const poly = turf.polygon([coords]);
      
      if (turf.booleanPointInPolygon(pt, poly)) {
        foundNeighborhood = nb;
        break;
      }
    }

    this.zone.run(() => {
      if (foundNeighborhood) {
        this.isOutsideZones = false;
        this.selectedZoneIndex = foundNeighborhood.zone;
        this.currentNeighborhood = foundNeighborhood.name.toUpperCase();
        if (this.selectedZoneIndex !== 2) {
          this.selectedHours = 1;
        }
      } else {
        this.isOutsideZones = true;
        this.currentNeighborhood = '';
      }

      this.checkProximity(lat, lng);
      this.cdr.detectChanges();
    });

    this.updateMarker(lat, lng, this.selectedZoneIndex);
    
    if (this.map && this.followMode) {
      this.map.easeTo({ center: [lng, lat], duration: 1000 });
    }

    // OSM Reverse Geocoding for Street Name
    this.reverseGeocodeOSM(lat, lng);
  }

  private async reverseGeocodeOSM(lat: number, lng: number) {
    const now = Date.now();
    // Only geocode every 30 seconds OR if position moved more than ~50 meters
    const dist = Math.sqrt(Math.pow(lat - this.lastGeocodeCoords.lat, 2) + Math.pow(lng - this.lastGeocodeCoords.lng, 2));
    
    if (this.lastGeocodeTime !== 0 && now - this.lastGeocodeTime < 30000 && dist < 0.0005) return;
    
    this.lastGeocodeTime = now;
    this.lastGeocodeCoords = { lat, lng };

    try {
      // Using BigDataCloud's reverse geocode client-side API - it's CORS friendly and free for client-side use
      const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=ro`);
      
      if (!response.ok) return;

      const data = await response.json();
      if (data) {
        this.zone.run(() => {
          // Priority: Street -> Locality -> Full Address
          this.currentStreet = data.locality || data.city || data.principalSubdivision || '';
          this.cdr.detectChanges();
        });
      }
    } catch (e) {
      this.lastGeocodeTime = now + 60000; // Wait a minute on error
    }
  }

  private setupLocationSync() {
    this.geoService.startTracking();
    
    // Watch location changes reactively instead of using a frame loop
    const loc = this.geoService.currentLocation();
    if (loc) {
      this.updateZoneByLocation(loc.lat, loc.lng);
    }
    
    // Check every 2 seconds for location updates
    this.timerSubscription = interval(2000).subscribe(() => {
      if (!this.isAlive) return;
      const currentLoc = this.geoService.currentLocation();
      if (currentLoc && (currentLoc.lat !== this.userLat || currentLoc.lng !== this.userLng)) {
        this.updateZoneByLocation(currentLoc.lat, currentLoc.lng);
      }
    });
  }

  public recenterMap() {
    const loc = this.geoService.currentLocation();
    if (loc) {
      this.followMode = true;
      this.map.easeTo({ center: [loc.lng, loc.lat], zoom: 17, duration: 1000 });
    } else {
      this.geoService.getCurrentPosition().then(l => {
        if (l) this.map.easeTo({ center: [l.lng, l.lat], zoom: 17, duration: 1000 });
      });
    }
  }

  private updateMarker(lat: number, lng: number, zone: number) {
    if (!this.map) return;
    const pos: [number, number] = [lng, lat];
    const PIN_COLORS: any = { 0: '#ea4335', 1: '#fb8c00', 2: '#34a853' };
    
    if (this.marker) {
      this.marker.setLngLat(pos);
      const el = this.marker.getElement();
      el.style.background = this.isOutsideZones ? '#747d8c' : PIN_COLORS[zone];
    } else {
      const el = document.createElement('div');
      el.innerHTML = `P`;
      el.style.background = this.isOutsideZones ? '#747d8c' : PIN_COLORS[zone];
      el.style.color = 'white';
      el.style.fontWeight = '900';
      el.style.width = '36px';
      el.style.height = '36px';
      el.style.borderRadius = '50%';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.style.border = '3px solid white';
      el.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)';
      el.style.fontSize = '16px';
      el.style.transition = 'background 0.3s';

      this.marker = new maplibregl.Marker({ element: el })
        .setLngLat(pos)
        .addTo(this.map);
    }
  }

  public initMap(): Promise<void> {
    return new Promise((resolve) => {
      if (this.map || !this.mapContainer) {
        resolve();
        return;
      }
      
      this.map = new maplibregl.Map({
        container: this.mapContainer.nativeElement,
        style: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
        center: [25.5888, 45.6423],
        zoom: 14,
        attributionControl: false
      });

      this.map.on('load', () => {
        resolve();
      });

      this.map.on('dragstart', () => {
        this.zone.run(() => {
          this.followMode = false;
          this.cdr.detectChanges();
        });
      });

      this.map.on('error', (e: any) => {
        console.error('MapLibre error:', e);
        resolve(); // Resolve anyway to allow the rest of the app to try and load
      });
    });
  }

  ngOnInit() { this.loadPersistedData(); }
  ngOnDestroy() { 
    this.isAlive = false;
    if (this.timerSubscription) this.timerSubscription.unsubscribe(); 
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
    }
    const pending = localStorage.getItem('pending_parking_confirmation');
    if (pending === 'true') this.showPaymentConfirmation = true;

    // Load Global Saved Plates from Settings
    const globalPlates = localStorage.getItem('user_plates');
    if (globalPlates) {
      this.userSavedPlates = JSON.parse(globalPlates);
      // If no plate currently set in parking, use the first saved one
      if (!this.carPlate && this.userSavedPlates.length > 0) {
        this.selectSavedPlate(this.userSavedPlates[0]);
      }
    }
  }

  private resumeCountdown(seconds: number) {
    if (this.timerSubscription) this.timerSubscription.unsubscribe();
    this.currentParkingSeconds = seconds;
    this.timeLeft = this.formatTime(this.currentParkingSeconds);
    this.timerSubscription = interval(1000).subscribe(() => {
      if (this.currentParkingSeconds > 0) {
        this.currentParkingSeconds--;
        this.timeLeft = this.formatTime(this.currentParkingSeconds);
        this.cdr.detectChanges();
      } else { this.clearParkedData(); }
    });
  }

  private formatTime(totalSeconds: number): string {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  savePlate() { 
    if (this.tempPlate.trim()) { 
      this.carPlate = this.tempPlate.toUpperCase(); 
      this.isPlateSaved = true; 
      localStorage.setItem('parked_plate', this.carPlate); 
      
      // Also add to global plates if not exists
      if (!this.userSavedPlates.includes(this.carPlate)) {
        this.userSavedPlates.push(this.carPlate);
        localStorage.setItem('user_plates', JSON.stringify(this.userSavedPlates));
      }
    } 
  }

  onPlateInputChange(val: string) {
    this.tempPlate = val.toUpperCase();
    this.isPlateSaved = (this.tempPlate === this.carPlate);
  }

  selectSavedPlate(plate: string) {
    this.tempPlate = plate;
    this.carPlate = plate;
    this.isPlateSaved = true;
    localStorage.setItem('parked_plate', this.carPlate);
    this.cdr.detectChanges();
  }

  incrementHours() { if (this.selectedHours < 24) this.selectedHours++; }
  decrementHours() { if (this.selectedHours > 1) this.selectedHours--; }

  sendNativeSms() {
    if (!this.isPlateSaved && this.tempPlate.trim()) this.savePlate();
    if (!this.carPlate) { alert('Te rugăm să introduci numărul de înmatriculare!'); return; }
    const recipient = '1234';
    const body = `${this.carPlate} ${this.selectedHours}`;
    
    // Flag for confirmation when user returns
    localStorage.setItem('pending_parking_confirmation', 'true');
    localStorage.setItem('pending_parking_hours', this.selectedHours.toString());
    localStorage.setItem('pending_parking_zone', this.selectedZoneIndex.toString());
    
    const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent);
    window.location.href = `sms:${recipient}${isIos ? '&' : '?'}body=${encodeURIComponent(body)}`;

    // Auto-show confirmation after 5 seconds (when user likely returns from SMS app)
    setTimeout(() => {
      this.zone.run(() => {
        if (localStorage.getItem('pending_parking_confirmation') === 'true') {
          this.showPaymentConfirmation = true;
          this.cdr.detectChanges();
        }
      });
    }, 5000);
  }

  private startCountdown(hours: number) {
    const seconds = hours * 3600;
    localStorage.setItem('parking_expiry', (Date.now() + seconds * 1000).toString());
    this.resumeCountdown(seconds);
  }

  private addToHistory() {
    const now = new Date();
    const months = ['IAN', 'FEB', 'MAR', 'APR', 'MAI', 'IUN', 'IUL', 'AUG', 'SEP', 'OCT', 'NOI', 'DEC'];
    const zone = this.PARKING_ZONES[this.selectedZoneIndex];
    const newEntry = { day: String(now.getDate()).padStart(2, '0'), month: months[now.getMonth()], plate: this.carPlate, zone: zone.name, amount: (this.selectedHours * zone.tariff).toFixed(2) + '€' };
    this.history.unshift(newEntry);
    localStorage.setItem('parking_history', JSON.stringify(this.history));
  }

  toggleTariffs() { this.showTariffs = !this.showTariffs; }
  toggleQuickAdd() { this.showQuickAdd = !this.showQuickAdd; }
  scrollToHistory() { this.showHistory = true; }

  extendTime(minutes: number) {
    this.currentParkingSeconds += minutes * 60;
    localStorage.setItem('parking_expiry', (Date.now() + this.currentParkingSeconds * 1000).toString());
    const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent);
    window.location.href = `sms:1234${isIos ? '&' : '?'}body=${encodeURIComponent(this.carPlate + ' ' + Math.ceil(minutes / 60))}`;
    this.resumeCountdown(this.currentParkingSeconds);
  }

  clearParkedData() {
    this.currentParkingSeconds = 0;
    this.timeLeft = '00:00:00';
    localStorage.removeItem('parking_expiry');
  }

  private getMapStyles() {
    return [{ "featureType": "all", "elementType": "labels.text.fill", "stylers": [{ "color": "#7c93a3" }, { "lightness": "-10" }] }, { "featureType": "landscape", "elementType": "geometry", "stylers": [{ "color": "#f5f5f5" }] }, { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#e9e9e9" }] }];
  }

  public calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    return this.transitService.calculateDistance(lat1, lon1, lat2, lon2);
  }

  public cycleZone() {
    this.selectedZoneIndex = (this.selectedZoneIndex + 1) % 3;
    if (this.selectedZoneIndex !== 2) {
      this.selectedHours = 1;
    }
    this.cdr.detectChanges();
  }

  private checkProximity(lat: number, lng: number) {
    let minDistance = Infinity;
    const pt = turf.point([lng, lat]);

    for (const nb of this.neighborhoodData) {
      const coords = nb.path.map((p: any) => [p.lng, p.lat]);
      if (coords.length > 0) coords.push(coords[0]);
      const poly = turf.polygon([coords]);
      const dist = turf.pointToLineDistance(pt, turf.polygonToLine(poly) as any, { units: 'meters' });
      if (dist < minDistance) minDistance = dist;
    }

    this.showProximityWarning = minDistance < 100;
  }

  confirmPayment() {
    const hours = parseInt(localStorage.getItem('pending_parking_hours') || '1');
    const zoneIndex = parseInt(localStorage.getItem('pending_parking_zone') || '0');
    this.selectedHours = hours;
    this.selectedZoneIndex = zoneIndex;
    
    localStorage.removeItem('pending_parking_confirmation');
    localStorage.setItem('parked_location', JSON.stringify({ lat: this.userLat, lng: this.userLng }));
    
    this.startCountdown(hours);
    this.addToHistory();
    this.showPaymentConfirmation = false;
    this.cdr.detectChanges();
  }

  cancelPayment() {
    localStorage.removeItem('pending_parking_confirmation');
    this.showPaymentConfirmation = false;
    this.cdr.detectChanges();
  }
}
