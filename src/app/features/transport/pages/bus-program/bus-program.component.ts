import { ChangeDetectionStrategy, Component, signal, OnInit, afterNextRender, ElementRef, ViewChild, inject, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { TransitService } from '../../services/transit.service';
import { gsap } from 'gsap';

declare const google: any;

@Component({
  selector: 'app-bus-program',
  standalone: true,
  imports: [CommonModule, RouterLink],
  animations: [],
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
              <button class="icon-btn" routerLink="/transport/bus">
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
                <button [class.active]="travelMode() === 'TRANSIT'" (click)="setTravelMode('TRANSIT')">
                  <span class="material-icons">directions_bus</span>
                </button>
                <button [class.active]="travelMode() === 'WALKING'" (click)="setTravelMode('WALKING')">
                  <span class="material-icons">directions_walk</span>
                </button>
              </div>
            </div>
          </div>

          @if (predictions().length > 0) {
            <div class="predictions-overlay">
              @for (p of predictions(); track p.place_id) {
                <button class="prediction-item" (click)="selectPrediction(p)">
                  <span class="material-icons">location_on</span>
                  <div class="p-text">
                    <span class="main">{{ p.structured_formatting.main_text }}</span>
                    <span class="sub">{{ p.structured_formatting.secondary_text }}</span>
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
                <span class="arrival-estimate">Sosești la {{ getFinalArrivalTime() }}</span>
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
                    <span class="time">{{ getStepStartTime($index) }}</span>
                  </div>
                  <div class="node-col" [style.color]="step.transit?.line?.color">
                    <div class="dot-container">
                      <div class="step-dot">
                        <span class="material-icons">{{ getStepIcon(step, false) }}</span>
                      </div>
                    </div>
                    <div class="connector" [class.dashed]="step.travel_mode === 'WALKING'"></div>
                  </div>
                </div>

                <div class="step-details">
                  <div class="step-card">
                    <div class="step-header">
                      @if (step.transit) {
                        <div class="line-badge" [style.background]="step.transit.line.color">
                          {{ step.transit.line.short_name }}
                        </div>
                      }
                      <span class="title">{{ getStepTitle(step, false) }}</span>
                    </div>
                    <div class="meta">{{ step.duration.text }} ({{ step.distance.text }})</div>
                    
                    @if (step.transit) {
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
                  <span class="time">{{ getFinalArrivalTime() }}</span>
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
    .bus-shell { height: 100vh; width: 100%; overflow: hidden; background: #fff; font-family: 'Outfit', sans-serif; display: flex; flex-direction: column; position: relative; color: #1a1a1a }
    .top-nav-modern { position: absolute; top: 0; left: 0; right: 0; padding: calc(var(--safe-top) + 1rem) 1rem; z-index: 1000; transition: transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1); }
    .nav-active .top-nav-modern { transform: translateY(-120%); }
    .nav-card { background: #fff; border-radius: 20px; box-shadow: 0 8px 32px rgba(0,0,0,0.1); border: 1px solid rgba(0,0,0,0.05); padding: 0.5rem; }
    .nav-controls { display: flex; align-items: center; gap: 0.5rem; }
    .icon-btn { background: #f8f9fa; border: none; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #5f6368; cursor: pointer; }
    .search-fields { flex: 1; display: flex; flex-direction: column; }
    .search-field { display: flex; align-items: center; gap: 0.75rem; padding: 0.4rem 0.5rem; }
    .search-field input { border: none; background: transparent; flex: 1; outline: none; font-size: 0.95rem; font-weight: 600; color: #202124; }
    .divider { height: 1px; background: #f1f3f4; margin: 0 0.5rem; }
    .marker { width: 8px; height: 8px; border-radius: 50%; }
    .marker.origin { border: 2px solid #4285f4; }
    .marker.dest { background: #ea4335; }
    .mode-toggle { display: flex; background: #f1f3f4; border-radius: 12px; padding: 3px; }
    .mode-toggle button { border: none; background: transparent; padding: 6px 12px; border-radius: 10px; color: #5f6368; display: flex; align-items: center; cursor: pointer; transition: all 0.2s; }
    .mode-toggle button.active { background: #fff; color: #1a73e8; box-shadow: 0 2px 6px rgba(0,0,0,0.1); }
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
    .map-core { width: 100%; height: 100%; }
    .loading-shimmer { position: absolute; inset: 0; background: rgba(255,255,255,0.5); display: flex; align-items: center; justify-content: center; z-index: 10; }
    .spinner { width: 32px; height: 32px; border: 3px solid #f1f3f4; border-top-color: #1a73e8; border-radius: 50%; animation: spin 0.8s linear infinite; }
    .route-panel { position: absolute; bottom: 0; left: 0; right: 0; height: 75vh; background: #fff; display: flex; flex-direction: column; overflow-y: auto; border-radius: 28px 28px 0 0; z-index: 10; box-shadow: 0 -8px 24px rgba(0,0,0,0.08); transform: translateY(100%); }
    .panel-header { position: sticky; top: 0; z-index: 20; background: #fff; padding-bottom: 0.5rem; border-bottom: 1px solid #f1f3f4; }
    .drag-bar-box { padding: 0.75rem 0 0.5rem; display: flex; justify-content: center; cursor: pointer; }
    .drag-bar { width: 36px; height: 4px; background: #dadce0; border-radius: 2px; }
    .summary-bar { display: flex; align-items: center; justify-content: space-between; padding: 0.5rem 1.25rem 1rem; }
    .route-info { display: flex; flex-direction: column; }
    .duration { font-size: 1.5rem; font-weight: 700; color: #188038; }
    .arrival-estimate { font-size: 0.9rem; color: #70757a; font-weight: 500; }
    .go-button { background: #1a73e8; color: #fff; border: none; padding: 0.75rem 1.5rem; border-radius: 24px; font-weight: 700; font-size: 0.95rem; display: flex; align-items: center; gap: 0.5rem; box-shadow: 0 2px 8px rgba(26, 115, 232, 0.3); }
    .journey-timeline { padding: 1.5rem; display: flex; flex-direction: column; }
    .timeline-step { display: flex; gap: 1.25rem; }
    .timeline-indicator { display: flex; gap: 1rem; width: 95px; flex-shrink: 0; }
    .time-col { width: 50px; display: flex; flex-direction: column; align-items: flex-end; }
    .time { font-size: 0.85rem; font-weight: 600; color: #3c4043; }
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
    .line-badge { color: #fff; padding: 2px 8px; border-radius: 6px; font-weight: 700; font-size: 0.75rem; }
    .title { font-size: 1.05rem; font-weight: 600; color: #202124; line-height: 1.2; }
    .meta { font-size: 0.85rem; color: #70757a; font-weight: 400; }
    .step-card.dark .title { font-size: 1.2rem; font-weight: 700; }
    .realtime-updates { margin-top: 0.75rem; display: flex; flex-direction: column; gap: 0.5rem; }
    .arrival-row { display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; color: #70757a; background: #f8f9fa; padding: 8px 12px; border-radius: 12px; border: 1px solid #f1f3f4; }
    .arrival-row .material-icons { font-size: 1.1rem; }
    .arrival-time { font-weight: 700; }
    .arrival-wait { font-weight: 500; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BusProgramComponent implements OnInit {
  @ViewChild('mapContainer') mapContainer!: ElementRef;
  @ViewChild('destInput') destInput!: ElementRef;
  @ViewChild('originInput') originInput!: ElementRef;
  @ViewChild('waypointInput') waypointInput!: ElementRef;
  @ViewChild('details') detailsContainer!: ElementRef;

  private map: any;
  private userMarker: any;
  private directionsService: any;
  private directionsRenderer: any;
  private traversedPolyline: any;
  private autocompleteService: any;
  private placesService: any;
  private transitService = inject(TransitService);
  private route = inject(ActivatedRoute);

  isLoading = signal(false);
  isNavigating = signal(false);
  showWaypoint = signal(false);
  activeStep = signal<any>(null);
  userLocationName = signal('Locația ta');
  userCoords = signal<any>(null);
  waypoint = signal<any>(null);
  destination = signal<any>(null);
  currentRoute = signal<any>(null);
  travelMode = signal<any>(google.maps.TravelMode.TRANSIT);
  routeDuration = signal<string>('');

  private watchId: number | null = null;
  private lastRerouteTime = 0;

  allSteps = computed(() => {
    const route = this.currentRoute();
    if (!route) return [];
    return route.legs.flatMap((leg: any) => leg.steps);
  });
  predictions = signal<any[]>([]);
  activeSearchType = signal<'origin' | 'destination' | 'waypoint' | null>(null);
  stepArrivalsMap = signal<Map<string, any[]>>(new Map());

  isMinimized = signal<boolean>(true);
  private touchStartY = 0;

  constructor() {
    afterNextRender(() => {
      this.initMap();
      this.getUserLocation();
      this.transitService.loadData();
      this.checkIncomingDestination();
    });

    effect(() => {
      const route = this.currentRoute();
      const minimized = this.isMinimized();
      
      setTimeout(() => {
        const el = this.detailsContainer?.nativeElement || document.querySelector('.route-panel');
        if (!route || !el) return;
        
        const panelHeight = el.offsetHeight;
        const targetY = minimized ? (panelHeight - 120) : 0;
        
        gsap.to(el, {
          y: targetY,
          duration: 0.7,
          ease: 'power3.out',
          overwrite: 'auto'
        });
      }, 60);
    });
  }

  ngOnInit() {}

  onTouchStart(event: TouchEvent) {
    this.touchStartY = event.touches[0].clientY;
  }

  onTouchMove(event: TouchEvent) {
    const touchY = event.touches[0].clientY;
    const deltaY = touchY - this.touchStartY;
    const el = this.detailsContainer?.nativeElement;
    
    if (el && el.scrollTop <= 0 && deltaY > 60 && !this.isMinimized()) {
      this.isMinimized.set(true);
    } else if (el && deltaY < -60 && this.isMinimized()) {
      this.isMinimized.set(false);
    }
  }

  onViewerScroll(event: Event) {
    const el = event.target as HTMLElement;
    if (el.scrollTop > 40 && this.isMinimized()) {
      this.isMinimized.set(false);
    }
  }

  onSearchInput(event: any, type: 'origin' | 'destination' | 'waypoint') {
    const query = event.target.value;
    this.activeSearchType.set(type);
    if (query.length < 3) { this.predictions.set([]); return; }
    this.autocompleteService.getPlacePredictions({
      input: query,
      locationBias: { radius: 10000, center: { lat: 45.6483, lng: 25.5891 } },
      componentRestrictions: { country: 'ro' }
    }, (results: any) => this.predictions.set(results || []));
  }

  selectPrediction(p: any) {
    this.placesService.getDetails({ placeId: p.place_id }, (place: any) => {
      const type = this.activeSearchType();
      if (type === 'origin') {
        this.userCoords.set(place.geometry.location);
        this.userLocationName.set(place.name);
        this.originInput.nativeElement.value = place.name;
      } else if (type === 'waypoint') {
        this.waypoint.set(place);
        this.waypointInput.nativeElement.value = place.name;
      } else {
        this.destination.set(place);
        this.destInput.nativeElement.value = place.name;
      }
      this.map.panTo(place.geometry.location);
      this.map.setZoom(16);
      this.predictions.set([]);
      this.calculateRoute();
    });
  }

  getUserLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const pos = { lat: position.coords.latitude, lng: position.coords.longitude };
        this.userCoords.set(pos);
        this.updateUserMarker(pos);
        this.map.setCenter(pos);
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ location: pos }, (results: any) => {
          if (results && results[0]) this.userLocationName.set(results[0].formatted_address.split(',')[0]);
        });
      });
    }
  }

  private updateUserMarker(coords: any) {
    if (!this.map) return;
    if (this.userMarker) {
      this.userMarker.setPosition(coords);
    } else {
      this.userMarker = new google.maps.Marker({
        position: coords,
        map: this.map,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#4285F4',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 2,
        },
        title: 'Locația ta',
        zIndex: 9999
      });
    }
  }

  setTravelMode(mode: string) {
    this.travelMode.set(mode);
    if (this.destination()) this.calculateRoute();
  }

  calculateRoute() {
    if (!this.userCoords() || !this.destination()) return;
    this.isLoading.set(true);

    const isTransit = this.travelMode() === google.maps.TravelMode.TRANSIT;
    const waypoints: any[] = [];
    if (this.showWaypoint() && this.waypoint()) {
      waypoints.push({ location: this.waypoint().geometry.location, stopover: true });
    }

    this.directionsService.route({
      origin: this.userCoords(),
      destination: this.destination().geometry.location,
      waypoints: waypoints,
      travelMode: this.travelMode(),
      transitOptions: isTransit ? { departureTime: new Date() } : undefined,
      provideRouteAlternatives: true
    }, (response: any, status: string) => {
      this.isLoading.set(false);
      if (status === 'OK') {
        const route = response.routes[0];
        this.directionsRenderer.setDirections(response);
        this.currentRoute.set(route);
        this.routeDuration.set(route.legs[0].duration.text);
        if (route.bounds) this.map.fitBounds(route.bounds, { bottom: 160, top: 80, left: 30, right: 30 });
        this.fetchLiveArrivalsForSteps();
      }
    });
  }

  startNavigation() {
    if (!this.currentRoute()) return;
    this.isNavigating.set(true);
    this.activeStep.set(this.currentRoute().legs[0].steps[0]);
    
    if (navigator.geolocation) {
      this.watchId = navigator.geolocation.watchPosition((pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        this.userCoords.set(coords);
        this.updateUserMarker(coords);
        this.updateActiveStep(coords);
        this.checkRerouting(coords);
        this.updateTraversedPath(coords);
      }, (err) => console.error(err), { enableHighAccuracy: true });
    }
  }

  stopNavigation() {
    this.isNavigating.set(false);
    if (this.watchId !== null) navigator.geolocation.clearWatch(this.watchId);
  }

  private updateActiveStep(coords: any) {
    const route = this.currentRoute();
    if (!route) return;
    const steps = route.legs[0].steps;
    let minIdx = 0;
    let minDist = Infinity;
    steps.forEach((step: any, idx: number) => {
      const dist = google.maps.geometry.spherical.computeDistanceBetween(new google.maps.LatLng(coords.lat, coords.lng), step.start_location);
      if (dist < minDist) { minDist = dist; minIdx = idx; }
    });
    this.activeStep.set(steps[minIdx]);
  }

  private checkRerouting(coords: any) {
    const route = this.currentRoute();
    if (!route) return;
    const path = google.maps.geometry.encoding.decodePath(route.overview_polyline);
    const dist = google.maps.geometry.spherical.computeDistanceBetween(new google.maps.LatLng(coords.lat, coords.lng), path[0]);
    // Simple logic: if too far from path, reroute (placeholder logic)
  }

  private updateTraversedPath(coords: any) {
    if (!this.traversedPolyline) return;
    const path = this.traversedPolyline.getPath();
    path.push(new google.maps.LatLng(coords.lat, coords.lng));
  }

  private checkIncomingDestination() {
    this.route.queryParams.subscribe(params => {
      if (params['destLat'] && params['destLon']) {
        const dest = {
          geometry: { location: new google.maps.LatLng(parseFloat(params['destLat']), parseFloat(params['destLon'])) },
          name: params['destName'] || 'Destinație selectată'
        };
        this.destination.set(dest);
        setTimeout(() => { if (this.userCoords()) this.calculateRoute(); }, 500);
      }
    });
  }

  getStepStartTime(idx: number): string {
    const steps = this.allSteps();
    const step = steps[idx];
    if (step.transit?.departure_time) {
      const planned = step.transit.departure_time.text;
      const stepData = this.stepArrivalsMap().get(step.instructions);
      if (stepData && stepData.length > 0) {
        const bestMatch = stepData.reduce((prev: any, curr: any) => {
          const prevDiff = Math.abs(this.timeToMinutes(prev.time) - this.timeToMinutes(planned));
          const currDiff = Math.abs(this.timeToMinutes(curr.time) - this.timeToMinutes(planned));
          return currDiff < prevDiff ? curr : prev;
        });
        return bestMatch.time || planned;
      }
      return planned;
    }
    return this.calculateTheoreticalStartTime(idx);
  }

  private timeToMinutes(timeStr: string): number {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(n => parseInt(n, 10));
    return h * 60 + m;
  }

  private calculateTheoreticalStartTime(idx: number): string {
    const now = new Date();
    let totalSeconds = 0;
    const steps = this.allSteps();
    for (let i = 0; i < idx; i++) totalSeconds += steps[i].duration.value;
    const time = new Date(now.getTime() + totalSeconds * 1000);
    return `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;
  }

  getStepEndTime(idx: number): string {
    const now = new Date();
    let totalSeconds = 0;
    const steps = this.allSteps();
    for (let i = 0; i <= idx; i++) totalSeconds += steps[i].duration.value;
    const time = new Date(now.getTime() + totalSeconds * 1000);
    return `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;
  }

  getFinalArrivalTime(): string {
    if (!this.allSteps().length) return '';
    return this.getStepEndTime(this.allSteps().length - 1);
  }

  getStepTitle(step: any, isLast: boolean = false): string {
    if (isLast) return this.destination()?.name || 'Destinație';
    if (step.travel_mode === 'TRANSIT') return step.transit.departure_stop.name;
    return 'Mergi pe jos';
  }

  getStepIcon(step: any, isLast: boolean = false): string {
    if (isLast) return 'location_on';
    if (!step) return 'my_location';
    if (step.travel_mode === 'TRANSIT') return 'directions_bus';
    return 'directions_walk';
  }

  getStepArrivals(step: any) {
    if (!step.transit) return [];
    const stepData = this.stepArrivalsMap().get(step.instructions);
    if (stepData && stepData.length > 0) return [stepData[0]];
    const planned = step.transit.departure_time?.text;
    const now = new Date();
    const currentMins = now.getHours() * 60 + now.getMinutes();
    let wait = this.timeToMinutes(planned) - currentMins;
    if (wait < 0) wait = 0;
    return [{ time: planned || '--:--', wait: wait }];
  }

  private async fetchLiveArrivalsForSteps() {
    const steps = this.allSteps();
    const transitSteps = steps.filter((s: any) => s.travel_mode === 'TRANSIT');
    if (!this.transitService.isLoaded()) await this.transitService.loadData();
    for (const step of transitSteps) {
      const loc = { lat: step.transit.departure_stop.location.lat(), lng: step.transit.departure_stop.location.lng() };
      const officialName = step.transit.departure_stop.name;
      const lineName = step.transit.line.short_name || step.transit.line.name || '';
      let offsetSeconds = 0;
      const stepIdx = steps.indexOf(step);
      for (let i = 0; i < stepIdx; i++) offsetSeconds += steps[i].duration.value;
      const arrivals = await this.transitService.getArrivalsForStep(officialName, lineName, loc, offsetSeconds);
      if (arrivals.length > 0) {
        this.stepArrivalsMap.update(map => {
          const newMap = new Map(map);
          newMap.set(step.instructions, arrivals);
          return newMap;
        });
      }
    }
  }

  private initMap() {
    this.map = new google.maps.Map(this.mapContainer.nativeElement, {
      center: { lat: 45.6483, lng: 25.5891 },
      zoom: 13,
      disableDefaultUI: true,
      gestureHandling: 'greedy'
    });
    this.directionsService = new google.maps.DirectionsService();
    this.directionsRenderer = new google.maps.DirectionsRenderer({
      map: this.map,
      suppressMarkers: true,
      preserveViewport: true,
      polylineOptions: { strokeColor: '#1a1a1a', strokeWeight: 8, strokeOpacity: 1, zIndex: 50 }
    });
    this.traversedPolyline = new google.maps.Polyline({ map: this.map, strokeColor: '#BDC1C6', strokeWeight: 6, strokeOpacity: 0.6, zIndex: 100 });
    this.autocompleteService = new google.maps.places.AutocompleteService();
    this.placesService = new google.maps.places.PlacesService(this.map);
  }
}
