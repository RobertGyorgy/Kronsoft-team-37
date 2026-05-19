import { ChangeDetectionStrategy, Component, signal, OnInit, OnDestroy, afterNextRender, ElementRef, ViewChild, inject, computed, effect, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { TransitService } from '../../services/transit.service';
import { gsap } from 'gsap';
import maplibregl from 'maplibre-gl';

declare const google: any;

@Component({
  selector: 'app-bus-program',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <main class="bus-shell" 
          [class.nav-active]="isNavigating()" 
          [class.current-route-active]="currentRoute()"
          [class.minimized-state]="isMinimized() && currentRoute()">
      
      <!-- Premium Unified Header -->
      @if (isNavigating()) {
        <header class="nav-header" #navHeader>
          <div class="nav-instruction">
            <div class="instruction-icon-box">
              <span class="material-icons">{{ getStepIcon(activeStep()) }}</span>
            </div>
            <div class="instruction-body">
              <span class="instruction-text" [innerHTML]="activeStep()?.instructions"></span>
              @if (activeStep()?.distance) {
                <span class="instruction-sub">{{ activeStep().distance.text }} rămași</span>
              }
            </div>
          </div>
          <button class="stop-btn" (click)="stopNavigation()">
            <span class="material-icons">close</span>
          </button>
        </header>
      } @else {
        <header class="top-nav-modern" #topNav>
          <div class="nav-card">
            <div class="nav-controls">
              <button class="minimal-back-btn" routerLink="/transport/bus">
                <span class="material-icons">arrow_back</span>
              </button>
              
              <div class="search-fields">
                <div class="search-field">
                  <span class="marker origin"></span>
                  <input #originInput type="text" (input)="onSearchInput($event, 'origin')" [value]="userLocationName()" placeholder="Locația ta">
                </div>
                <div class="divider"></div>
                <div class="search-field">
                  <span class="marker dest"></span>
                  <input #destInput type="text" (input)="onSearchInput($event, 'destination')" [value]="destination()?.name || ''" placeholder="Unde mergem?">
                </div>
              </div>

              <div class="mode-toggle">
                <button [class.active]="travelMode() === 'TRANSIT'" (click)="setTravelMode('TRANSIT')" title="Transport public">
                  <span class="material-icons">directions_bus</span>
                </button>
                <button [class.active]="travelMode() === 'WALKING'" (click)="setTravelMode('WALKING')" title="Mers pe jos">
                  <span class="material-icons">directions_walk</span>
                </button>
              </div>
            </div>

          </div>

          @if (predictions().length > 0) {
            <div class="predictions-overlay">
              @for (p of predictions(); track p.id) {
                <button class="prediction-item" (click)="selectPrediction(p)">
                  <span class="material-icons">{{ p.isStation ? 'directions_bus' : 'location_on' }}</span>
                  <div class="p-text">
                    <span class="main">{{ p.mainText }}</span>
                    <span class="sub">{{ p.secondaryText }}</span>
                  </div>
                </button>
              }
            </div>
          }
        </header>
      }

      <section class="map-view" [class.full]="isNavigating()">
        <div #mapContainer class="map-core"></div>
        @if (isLoading()) {
          <div class="loading-shimmer">
            <div class="spinner"></div>
          </div>
        }
      </section>

      @if (currentRoute() && !isNavigating()) {
        <section class="route-panel" #details 
                 [class.expanded]="!isMinimized()"
                 (scroll)="onViewerScroll($event)"
                 (touchstart)="onTouchStart($event)"
                 (touchmove)="onTouchMove($event)">
          
          <div class="panel-header">
            <div class="drag-bar-box" (click)="isMinimized.set(!isMinimized())">
              <div class="drag-bar"></div>
            </div>
            <div class="summary-bar">
              <div class="route-info">
                <span class="duration">{{ routeDuration() }}</span>
                <span class="arrival-estimate">Sosești la {{ arrivalEstimate() }}</span>
              </div>
              <button class="go-button" (click)="startNavigation()">
                <span class="material-icons">navigation</span>
                PORNEȘTE
              </button>
            </div>
          </div>

          <div class="journey-timeline">
            @for (step of allSteps(); track $index) {
              <div class="timeline-step" [class.transit]="step.travel_mode === 'TRANSIT'">
                <div class="timeline-indicator">
                  <div class="time-col">
                    <span class="time start">{{ timelineSteps()[$index]?.start }}</span>
                    <span class="time-separator"></span>
                    <span class="time end">{{ timelineSteps()[$index]?.end }}</span>
                  </div>
                  <div class="node-col" [style.color]="step.transit?.line?.color">
                    <div class="dot-container">
                      <div class="step-dot">
                        <span class="material-icons">{{ getStepIcon(step) }}</span>
                      </div>
                    </div>
                    <div class="connector" [class.dashed]="step.travel_mode === 'WALKING'"></div>
                  </div>
                </div>

                <div class="step-details">
                  <div class="step-card">
                    <div class="step-header">
                      @if (step.transit?.line) {
                        <div class="line-badge" [style.background]="step.transit.line.color">
                          {{ step.transit.line.short_name }}
                        </div>
                      }
                      <span class="title" [innerHTML]="getStepTitle(step, false)"></span>
                    </div>
                    <div class="meta">{{ step.duration?.text }} ({{ step.distance?.text }})</div>
                    
                    @if (step.transit) {
                      <div class="departure-info">
                        <span class="material-icons">schedule</span>
                        <span>Plecare la <strong>{{ timelineSteps()[$index]?.start }}</strong> din <strong>{{ step.transit.departure_stop.name }}</strong></span>
                      </div>
                      
                      <div class="realtime-updates">
                        @for (arr of getStepArrivals(step); track arr.time) {
                          <div class="arrival-row">
                            <span class="material-icons">access_time</span>
                            <span class="arrival-time">{{ arr.time }}</span>
                            <span class="arrival-wait">Programat (în {{ arr.wait }} min)</span>
                          </div>
                        }
                      </div>
                    }
                  </div>
                </div>
              </div>
            }

            <!-- Final Destination -->
            <div class="timeline-step final">
              <div class="timeline-indicator">
                <div class="time-col">
                  <span class="time start">{{ getFinalArrivalTime() }}</span>
                </div>
                <div class="node-col dest">
                  <div class="dot-container">
                    <div class="step-dot target">
                      <span class="material-icons">location_on</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="step-details">
                <div class="step-card dark">
                  <span class="title">{{ destination()?.name || 'Destinație' }}</span>
                  <span class="meta">Punct final călătorie</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      }
    </main>
  `,
  styles: [`
    .bus-shell { height: 100dvh; width: 100%; overflow: hidden; background: #fff; font-family: 'Outfit', sans-serif; color: #1a1a1a; display: flex; flex-direction: column; position: relative; padding-bottom: var(--safe-bottom); }
    .top-nav-modern { position: absolute; top: 0; left: 0; right: 0; padding: calc(var(--safe-top) + 1rem) 1rem; z-index: 1000; transition: transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1); }
    .nav-active .top-nav-modern { transform: translateY(-120%); }
    .nav-card { background: #fff; border-radius: 20px; box-shadow: 0 8px 32px rgba(0,0,0,0.1); border: 1px solid rgba(0,0,0,0.05); padding: 0.75rem; width: 100%; }
    .nav-controls { display: flex; align-items: stretch; gap: 0.5rem; }
    .minimal-back-btn { background: transparent; border: none; width: 40px; display: flex; align-items: center; justify-content: center; color: #1a1a1a; cursor: pointer; border-right: 1px solid #f1f3f4; margin-right: 0.25rem; }
    .search-fields { flex: 1; display: flex; flex-direction: column; }
    .search-field { display: flex; align-items: center; gap: 0.75rem; padding: 0.4rem 0.5rem; }
    .search-field input { border: none; background: transparent; flex: 1; outline: none; font-size: 0.95rem; font-weight: 600; color: #202124; width: 100%; }
    .divider { height: 1px; background: #f1f3f4; margin: 0 0.5rem; }
    .marker { width: 8px; height: 8px; border-radius: 50%; }
    .marker.origin { border: 2px solid #4285f4; }
    .marker.dest { background: #ea4335; }
    .mode-toggle { display: flex; flex-direction: column; background: #f1f3f4; border-radius: 999px; padding: 2px; gap: 2px; align-self: stretch; justify-content: center; }
    .mode-toggle button { border: none; background: transparent; padding: 0; width: 36px; height: 36px; border-radius: 999px; color: #5f6368; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; }
    .mode-toggle button.active { background: #fff; color: #1a73e8; box-shadow: 0 1px 4px rgba(0,0,0,0.1); }
    
    .predictions-overlay { background: #fff; border-radius: 16px; margin-top: 0.5rem; box-shadow: 0 12px 40px rgba(0,0,0,0.15); overflow: hidden; }
    .prediction-item { width: 100%; display: flex; align-items: center; gap: 1rem; padding: 1rem 1.25rem; border: none; background: transparent; text-align: left; border-bottom: 1px solid #f1f3f4; }
    .prediction-item .material-icons { color: #70757a; }
    .p-text { display: flex; flex-direction: column; }
    .p-text .main { font-weight: 600; font-size: 0.95rem; }
    .p-text .sub { font-size: 0.8rem; color: #70757a; }
    
    .nav-header { position: absolute; top: 0; left: 0; right: 0; background: #188038; color: #fff; padding: calc(var(--safe-top) + 1rem) 1rem 1rem; z-index: 1001; display: flex; align-items: center; gap: 1rem; border-radius: 0 0 24px 24px; box-shadow: 0 8px 24px rgba(0,0,0,0.2); }
    .nav-instruction { display: flex; align-items: center; gap: 1rem; flex: 1; }
    .instruction-icon-box { background: rgba(255,255,255,0.2); padding: 0.5rem; border-radius: 12px; }
    .instruction-body { display: flex; flex-direction: column; }
    .instruction-text { font-size: 1.1rem; font-weight: 700; line-height: 1.3; }
    .instruction-sub { font-size: 0.9rem; opacity: 0.9; font-weight: 500; }
    .stop-btn { background: rgba(255,255,255,0.2); border: none; width: 40px; height: 40px; border-radius: 50%; color: #fff; display: flex; align-items: center; justify-content: center; }
    
    .map-view { height: 100vh; width: 100%; flex-shrink: 0; transition: height 0.6s cubic-bezier(0.4, 0, 0.2, 1); position: relative; z-index: 1; }
    .current-route-active .map-view { height: 35vh; }
    .minimized-state .map-view { height: calc(100vh - 120px); }
    .nav-active .map-view { height: 100dvh !important; } /* Force full screen map layout on active turn-by-turn navigation state */
    .map-core { width: 100%; height: 100%; }
    .loading-shimmer { position: absolute; inset: 0; background: rgba(255,255,255,0.5); display: flex; align-items: center; justify-content: center; z-index: 10; }
    .spinner { width: 32px; height: 32px; border: 3px solid #f1f3f4; border-top-color: #1a73e8; border-radius: 50%; animation: spin 0.8s linear infinite; }
    
    .route-panel { position: absolute; top: 0; left: 0; right: 0; height: 100dvh; background: #fff; display: flex; flex-direction: column; overflow-y: auto; border-radius: 32px 32px 0 0; z-index: 10; box-shadow: 0 -20px 48px rgba(0,0,0,0.15); transform: translateY(100%); padding-bottom: calc(var(--safe-bottom) + 5rem); -webkit-overflow-scrolling: touch; }
    .panel-header { position: sticky; top: 0; z-index: 20; background: #fff; padding-bottom: 0.5rem; border-bottom: 1px solid #f1f3f4; }
    .drag-bar-box { padding: 0.75rem 0 0.5rem; display: flex; justify-content: center; cursor: pointer; }
    .drag-bar { width: 36px; height: 4px; background: #dadce0; border-radius: 2px; }
    .summary-bar { display: flex; align-items: center; justify-content: space-between; padding: 0.5rem 1.25rem 1rem; }
    .route-info { display: flex; flex-direction: column; }
    .duration { font-size: 1.5rem; font-weight: 700; color: #188038; }
    .arrival-estimate { font-size: 0.9rem; color: #70757a; font-weight: 500; }
    .go-button { background: #1a73e8; color: #fff; border: none; padding: 0.75rem 1.5rem; border-radius: 999px; font-weight: 700; font-size: 0.95rem; display: flex; align-items: center; gap: 0.5rem; box-shadow: 0 2px 8px rgba(26, 115, 232, 0.3); }
    
    .journey-timeline { padding: 1.5rem; display: flex; flex-direction: column; }
    .timeline-step { display: flex; gap: 1.25rem; }
    .timeline-indicator { display: flex; gap: 1rem; width: 95px; flex-shrink: 0; }
    .time-col { width: 60px; display: flex; flex-direction: column; align-items: flex-end; gap: 2px; padding-top: 4px; }
    .time { font-size: 0.7rem; font-weight: 600; color: #70757a; }
    .time.start { color: #1a1a1a; font-size: 0.85rem; font-weight: 800; }
    .time-separator { width: 8px; height: 1px; background: #dadce0; margin: 2px 0; align-self: flex-end; margin-right: 4px; }
    .node-col { display: flex; flex-direction: column; align-items: center; position: relative; width: 32px; }
    .dot-container { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; z-index: 2; }
    .step-dot { width: 26px; height: 26px; border-radius: 50%; background: #fff; border: 2px solid #dadce0; display: flex; align-items: center; justify-content: center; color: #5f6368; z-index: 5; position: relative; box-shadow: 0 2px 6px rgba(0,0,0,0.05); }
    .step-dot .material-icons { font-size: 1.1rem; }
    .step-dot.target { background: #ea4335; border-color: #ea4335; color: #fff; }
    .timeline-step.transit .step-dot { border-color: currentColor; color: currentColor; }
    .connector { position: absolute; top: 15px; bottom: -15px; width: 4px; background: #dadce0; border-radius: 2px; z-index: 1; }
    .timeline-step.transit .connector { background: currentColor; }
    .connector.dashed { background: transparent; border-left: 4px dashed #dadce0; width: 0; }
    .timeline-step.final .connector { display: none; }
    .step-details { flex: 1; padding-bottom: 2.5rem; }
    .step-card { display: flex; flex-direction: column; gap: 0.25rem; }
    .step-header { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
    .line-badge { color: #fff; padding: 2px 8px; border-radius: 999px; font-weight: 700; font-size: 0.75rem; }
    .title { font-size: 1.05rem; font-weight: 600; color: #202124; line-height: 1.2; }
    .meta { font-size: 0.85rem; color: #70757a; font-weight: 400; }
    .step-card.dark .title { font-size: 1.2rem; font-weight: 700; }
    .departure-info { margin-top: 0.75rem; padding: 0.8rem 1rem; background: rgba(66, 133, 244, 0.08); border-left: 4px solid #4285f4; border-radius: 4px 12px 12px 4px; display: flex; align-items: center; gap: 0.75rem; font-size: 0.9rem; color: #1a73e8; box-shadow: 0 2px 8px rgba(66, 133, 244, 0.05); }
    .departure-info .material-icons { font-size: 1.2rem; }
    .departure-info strong { color: #174ea6; font-weight: 800; }
    .realtime-updates { margin-top: 0.75rem; display: flex; flex-direction: column; gap: 0.5rem; }
    .arrival-row { display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; color: #70757a; background: #f8f9fa; padding: 8px 12px; border-radius: 999px; border: 1px solid #f1f3f4; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BusProgramComponent implements OnInit, OnDestroy {
  @ViewChild('mapContainer') mapContainer!: ElementRef;
  @ViewChild('topNav') topNav!: ElementRef;
  @ViewChild('destInput') destInput!: ElementRef;
  @ViewChild('originInput') originInput!: ElementRef;
  @ViewChild('details') routePanel!: ElementRef;

  private map: any;
  private userMarker: maplibregl.Marker | null = null;
  private autocompleteService: any;
  private placesService: any;
  private transitService = inject(TransitService);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);
  private zone = inject(NgZone);

  isLoading = signal(false);
  activeBusColor = signal('#4285F4');
  currentRoute = signal<any>(null);
  destination = signal<any>(null);
  userCoords = signal<any>(null);
  userLocationName = signal('Locația ta');
  travelMode = signal<'TRANSIT' | 'WALKING' | 'CAR'>('TRANSIT');
  isNavigating = signal(false);
  isMinimized = signal(true);
  predictions = signal<any[]>([]);
  activeSearchType = signal<'origin' | 'destination' | null>(null);
  stepArrivalsMap = signal<Map<string, any[]>>(new Map());
  activeStep = signal<any>(null);
  activeStepIndex = signal<number>(0);

  private watchId: number | null = null;
  private touchStartY = 0;

  allSteps = computed(() => {
    const data = this.currentRoute();
    if (!data || !data.features) return [];

    try {
      return data.features.map((f: any) => ({
        travel_mode: f.properties?.mode === 'WALK' ? 'WALKING' : 'TRANSIT',
        instructions: f.properties?.instructions || 'Mergi',
        duration: { text: `${f.properties?.duration || 0} min`, value: (f.properties?.duration || 0) * 60 },
        distance: { text: `${((f.properties?.distance || 0) / 1000).toFixed(1)} km`, value: f.properties?.distance || 0 },
        transit: f.properties?.mode !== 'WALK' ? { 
          line: { short_name: f.properties?.instructions?.split(' ')[1] || '?', color: f.properties?.color || '#333' },
          departure_stop: { 
            name: f.properties?.instructions?.split('din ')[1] || 'Stație',
            time: f.properties?.startTime ? new Date(f.properties.startTime).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' }) : null,
            timeMs: f.properties?.startTime || null
          }
        } : null
      }));
    } catch (e) {
      console.error('Error parsing route steps:', e);
      return [];
    }
  });

  timelineSteps = computed(() => {
    const steps = this.allSteps();
    const now = new Date();
    let currentMs = now.getTime();
    
    return steps.map((step: any) => {
      if (step.transit?.departure_stop?.timeMs) {
        currentMs = step.transit.departure_stop.timeMs;
      }
      
      const startTime = new Date(currentMs);
      const durationMs = (step.duration?.value || 0) * 1000;
      const endTime = new Date(startTime.getTime() + durationMs);
      const res = { start: this.formatTime(startTime), end: this.formatTime(endTime) };
      currentMs = endTime.getTime();
      return res;
    });
  });

  routeDuration = computed(() => {
    const steps = this.allSteps();
    if (steps.length === 0) return '-- min';

    const now = new Date();
    const firstStartMs = now.getTime();
    let lastEndMs = firstStartMs;
    
    let tempMs = firstStartMs;
    steps.forEach((step: any, idx: number) => {
      if (step.transit?.departure_stop?.timeMs) {
        tempMs = step.transit.departure_stop.timeMs;
      }
      const durationMs = (step.duration?.value || 0) * 1000;
      tempMs += durationMs;
      if (idx === steps.length - 1) {
        lastEndMs = tempMs;
      }
    });

    const sumDurationsMinutes = steps.reduce((sum: number, step: any) => sum + (step.duration?.value || 0) / 60, 0);
    let totalMinutes = Math.round((lastEndMs - firstStartMs) / 60000);
    if (totalMinutes < sumDurationsMinutes) {
      totalMinutes = Math.round(sumDurationsMinutes);
    }
    return `${totalMinutes} min`;
  });

  arrivalEstimate = computed(() => {
    const timeline = this.timelineSteps();
    return timeline.length > 0 ? timeline[timeline.length - 1].end : '--:--';
  });

  constructor() {
    if (typeof window !== 'undefined') {
      const justEntered = sessionStorage.getItem('just_entered_transport_program');
      if (!justEntered) {
        sessionStorage.setItem('just_entered_transport_program', 'true');
        window.location.reload();
        return;
      }
    }

    afterNextRender(() => {
      this.initMap();
      this.getUserLocation();
      this.checkIncomingDestination();
    });

    effect(() => {
      const hasRoute = this.currentRoute();
      const minimized = this.isMinimized();
      const navigating = this.isNavigating();
      if (!hasRoute || navigating) return;

      setTimeout(() => {
        const el = this.routePanel?.nativeElement;
        if (!el) return;
        const vh = window.innerHeight;
        const targetY = minimized ? (vh - 140) : 180;
        gsap.to(el, { y: targetY, duration: 0.6, ease: 'power3.out' });
      }, 50);
    });

    effect(() => {
      const state = {
        currentRoute: this.currentRoute(),
        destination: this.destination(),
        travelMode: this.travelMode(),
        isNavigating: this.isNavigating(),
        activeStepIndex: this.activeStepIndex(),
      };
      if (state.currentRoute || state.isNavigating) {
        localStorage.setItem('active_pwa_trip', JSON.stringify(state));
      } else {
        localStorage.removeItem('active_pwa_trip');
      }
    });
  }

  ngOnInit() {
    this.restorePersistedTrip();
  }

  ngOnDestroy() {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('just_entered_transport_program');
    }
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
    }
  }

  private initMap() {
    this.map = new maplibregl.Map({
      container: this.mapContainer.nativeElement,
      style: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
      center: [25.5891, 45.6483],
      zoom: 13,
      maxBounds: [25.0, 45.4, 26.5, 46.0],
      pitch: 0,
      bearing: 0,
      pitchWithRotate: false,
      dragRotate: false
    });

    this.map.on('load', () => {
      this.map.addSource('current-route', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
      this.map.addLayer({
        id: 'route-line-walk',
        type: 'line',
        source: 'current-route',
        filter: ['==', ['get', 'mode'], 'WALK'],
        paint: {
          'line-color': ['get', 'color'],
          'line-width': 5,
          'line-dasharray': [0.1, 1.8]
        },
        layout: { 'line-cap': 'round', 'line-join': 'round' }
      });

      this.map.addLayer({
        id: 'route-line-transit',
        type: 'line',
        source: 'current-route',
        filter: ['!=', ['get', 'mode'], 'WALK'],
        paint: {
          'line-color': ['get', 'color'],
          'line-width': 7
        },
        layout: { 'line-cap': 'round', 'line-join': 'round' }
      });

      // Redraw restored route if present
      if (this.currentRoute()) {
        this.drawCurrentRoute();
      }
    });

    this.initGoogleServices();
  }

  private initGoogleServices() {
    if (typeof google !== 'undefined' && google.maps) {
      if (!this.autocompleteService && google.maps.places) {
        this.autocompleteService = new google.maps.places.AutocompleteService();
      }
      if (!this.placesService && google.maps.places) {
        this.placesService = new google.maps.places.PlacesService(document.createElement('div'));
      }
    }
  }

  async calculateRoute() {
    if (!this.userCoords() || !this.destination()) return;
    this.isLoading.set(true);
    this.executeOTPRoute();
  }

  private async executeOTPRoute() {
    try {
      const origin = this.userCoords();
      const dest = this.destination().geometry.location;
      const mode = this.travelMode() === 'TRANSIT' ? 'WALK,TRANSIT' : (this.travelMode() === 'WALKING' ? 'WALK' : 'CAR');

      const res = await fetch('/api/v1/routing/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromLat: origin.lat, fromLon: origin.lng,
          toLat: typeof dest.lat === 'function' ? dest.lat() : dest.lat,
          toLon: typeof dest.lng === 'function' ? dest.lng() : dest.lng,
          mode
        })
      });
      if (!res.ok) {
        console.error('Routing plan failed', res.status, await res.text());
        this.isLoading.set(false);
        return;
      }
      const data = await res.json();
      if (!data?.features?.length) {
        console.error('Routing plan returned no route features');
        this.isLoading.set(false);
        return;
      }
      this.currentRoute.set(data);
      this.isLoading.set(false);
      this.drawCurrentRoute();
    } catch (e) { console.error('Java OTP failed', e); this.isLoading.set(false); }
  }

  drawCurrentRoute() {
    if (!this.map) return;
    const data = this.currentRoute();
    if (!data) return;

    (this.map.getSource('current-route') as any).setData(data);
    this.fitBounds(data);
  }

  private fitBounds(geoJson: any) {
    if (!geoJson || !geoJson.features || geoJson.features.length === 0) return;
    const bounds = new maplibregl.LngLatBounds();
    geoJson.features.forEach((f: any) => {
      if (f.geometry?.coordinates) {
        f.geometry.coordinates.forEach((c: any) => bounds.extend(c));
      }
    });
    if (!bounds.isEmpty()) {
      this.map.fitBounds(bounds, { padding: 100 });
    }
  }

  getUserLocation() {
    navigator.geolocation.getCurrentPosition(p => {
      const pos = { lat: p.coords.latitude, lng: p.coords.longitude };
      this.userCoords.set(pos);
      this.map.setCenter([pos.lng, pos.lat]);

      if (this.userMarker) {
        this.userMarker.setLngLat([pos.lng, pos.lat]);
      } else {
        const el = document.createElement('div');
        el.className = 'user-location-dot';
        el.style.width = '16px';
        el.style.height = '16px';
        el.style.background = '#4285F4';
        el.style.border = '3px solid white';
        el.style.borderRadius = '50%';
        el.style.boxShadow = '0 0 10px rgba(66, 133, 244, 0.6)';
        
        this.userMarker = new maplibregl.Marker({ element: el })
          .setLngLat([pos.lng, pos.lat])
          .addTo(this.map);
      }

      if (typeof google !== 'undefined' && google.maps) {
        new google.maps.Geocoder().geocode({ location: pos }, (res: any) => {
          if (res?.[0]) this.userLocationName.set(res[0].formatted_address.split(',')[0]);
        });
      }

      if (this.destination() && !this.currentRoute()) {
        this.calculateRoute();
      }
    }, err => {
      console.warn('Geolocation denied or timed out. Falling back to default center [Brasov Center] for routing tests.');
      const fallbackPos = { lat: 45.6483, lng: 25.5891 };
      this.userCoords.set(fallbackPos);
      this.map.setCenter([fallbackPos.lng, fallbackPos.lat]);
      
      if (this.destination() && !this.currentRoute()) {
        this.calculateRoute();
      }
    });
  }

  onSearchInput(event: any, type: 'origin' | 'destination') {
    const query = event.target.value;
    this.activeSearchType.set(type);
    if (query.length < 2) { this.predictions.set([]); return; }

    this.initGoogleServices();
    if (!this.autocompleteService) {
      console.warn('Google Maps AutocompleteService is not yet loaded.');
      return;
    }

    this.autocompleteService.getPlacePredictions({ input: query, componentRestrictions: { country: 'ro' } }, (res: any) => {
      this.predictions.set((res || []).map((r: any) => ({
        id: r.place_id, mainText: r.structured_formatting.main_text, secondaryText: r.structured_formatting.secondary_text
      })));
    });
  }

  selectPrediction(p: any) {
    this.initGoogleServices();
    if (!this.placesService) {
      console.warn('Google Maps PlacesService is not yet loaded.');
      return;
    }

    this.placesService.getDetails({ placeId: p.id }, (place: any) => {
      if (this.activeSearchType() === 'origin') {
        this.userCoords.set({ lat: place.geometry.location.lat(), lng: place.geometry.location.lng() });
        this.userLocationName.set(place.name);
      } else {
        this.destination.set(place);
      }
      this.predictions.set([]);
      this.calculateRoute();
    });
  }

  setTravelMode(mode: any) { this.travelMode.set(mode); this.calculateRoute(); }
  toggleNav() { this.isMinimized.set(!this.isMinimized()); }
  
  startNavigation() {
    this.isNavigating.set(true);
    
    // Set initial active step
    const steps = this.allSteps();
    if (steps.length > 0) {
      this.activeStepIndex.set(0);
      this.activeStep.set(steps[0]);
    }

    this.resumeNavigationTracking();
  }

  stopNavigation() {
    this.isNavigating.set(false);
    this.activeStep.set(null);
    this.activeStepIndex.set(0);
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    localStorage.removeItem('active_pwa_trip');
    setTimeout(() => { if (this.map) this.map.resize(); }, 150);
  }

  private resumeNavigationTracking() {
    if (this.watchId !== null) return;
    
    setTimeout(() => { if (this.map) this.map.resize(); }, 150);

    if (navigator.geolocation) {
      this.watchId = navigator.geolocation.watchPosition(
        (position) => {
          const pos = { lat: position.coords.latitude, lng: position.coords.longitude };
          this.userCoords.set(pos);
          if (this.userMarker) {
            this.userMarker.setLngLat([pos.lng, pos.lat]);
          } else if (this.map) {
            const el = document.createElement('div');
            el.className = 'user-location-dot';
            el.style.width = '16px';
            el.style.height = '16px';
            el.style.background = '#4285F4';
            el.style.border = '3px solid white';
            el.style.borderRadius = '50%';
            el.style.boxShadow = '0 0 10px rgba(66, 133, 244, 0.6)';
            
            this.userMarker = new maplibregl.Marker({ element: el })
              .setLngLat([pos.lng, pos.lat])
              .addTo(this.map);
          }
          
          this.checkNavigationArrival(pos);
        },
        (err) => console.error('Error tracking position:', err),
        { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
      );
    }
  }

  private getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth's radius in meters
    const phi1 = lat1 * Math.PI / 180;
    const phi2 = lat2 * Math.PI / 180;
    const deltaPhi = (lat2 - lat1) * Math.PI / 180;
    const deltaLambda = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
              Math.cos(phi1) * Math.cos(phi2) *
              Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  private checkNavigationArrival(pos: { lat: number, lng: number }) {
    const idx = this.activeStepIndex();
    const steps = this.allSteps();
    const routeData = this.currentRoute();
    if (!routeData || !routeData.features || idx >= steps.length) return;

    const feature = routeData.features[idx];
    if (!feature || !feature.geometry || !feature.geometry.coordinates) return;

    const coords = feature.geometry.coordinates;
    if (coords.length === 0) return;

    const lastCoord = coords[coords.length - 1]; // [lon, lat]
    const dist = this.getDistanceMeters(pos.lat, pos.lng, lastCoord[1], lastCoord[0]);

    // Also check distance to next step's start coordinate if available for maximum geofencing accuracy
    let distToNext = Infinity;
    const nextFeature = routeData.features[idx + 1];
    if (nextFeature && nextFeature.geometry?.coordinates?.length > 0) {
      const firstCoord = nextFeature.geometry.coordinates[0];
      distToNext = this.getDistanceMeters(pos.lat, pos.lng, firstCoord[1], firstCoord[0]);
    }

    if (dist < 25 || distToNext < 25) {
      const nextIndex = idx + 1;
      if (nextIndex < steps.length) {
        this.activeStepIndex.set(nextIndex);
        this.activeStep.set(steps[nextIndex]);
        this.cdr.detectChanges();
        
        if (this.map) {
          this.map.panTo([pos.lng, pos.lat], { duration: 1000 });
        }
      } else {
        this.stopNavigation();
        alert('Ați sosit la destinație!');
      }
    } else {
      // Dynamic remaining distance update
      const remainingKm = (dist / 1000).toFixed(2);
      const currentActiveStep = { ...this.activeStep() };
      if (currentActiveStep.distance) {
        currentActiveStep.distance = {
          text: `${remainingKm} km`,
          value: dist
        };
        this.activeStep.set(currentActiveStep);
      }
    }
  }

  private restorePersistedTrip() {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem('active_pwa_trip');
    if (saved) {
      try {
        const state = JSON.parse(saved);
        this.destination.set(state.destination);
        this.travelMode.set(state.travelMode || 'TRANSIT');
        this.currentRoute.set(state.currentRoute);
        this.activeStepIndex.set(state.activeStepIndex || 0);
        
        if (state.isNavigating) {
          this.isNavigating.set(true);
          const steps = this.allSteps();
          if (steps.length > 0) {
            const idx = state.activeStepIndex || 0;
            this.activeStep.set(steps[idx]);
          }
          this.resumeNavigationTracking();
        }
      } catch (e) {
        console.error('Failed to restore trip state:', e);
        localStorage.removeItem('active_pwa_trip');
      }
    }
  }

  getStepIcon(step: any) { return step?.travel_mode === 'TRANSIT' ? 'directions_bus' : 'directions_walk'; }
  getStepStartTime(idx: number) { return this.timelineSteps()[idx]?.start || '--:--'; }
  getStepTitle(step: any, isLast: boolean) { return isLast ? 'Destinație' : (step.travel_mode === 'TRANSIT' ? step.instructions : 'Mergi pe jos'); }
  getStepArrivals(step: any): any[] { return []; }
  getFinalArrivalTime() { return this.arrivalEstimate(); }
  formatTime(d: Date) { return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`; }
  onViewerScroll(e: any) {}
  onTouchStart(e: any) { this.touchStartY = e.touches[0].clientY; }
  onTouchMove(e: any) { if (e.touches[0].clientY - this.touchStartY > 50) this.isMinimized.set(true); }

  private checkIncomingDestination() {
    this.route.queryParams.subscribe(params => {
      if (params['destLat'] && params['destLon']) {
        const dest = {
          geometry: { location: { lat: parseFloat(params['destLat']), lng: parseFloat(params['destLon']) } },
          name: params['destName'] || 'Destinație selectată'
        };
        this.destination.set(dest);
        setTimeout(() => { if (this.userCoords()) this.calculateRoute(); }, 500);
      }
    });
  }
}
