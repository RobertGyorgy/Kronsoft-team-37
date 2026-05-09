import { ChangeDetectionStrategy, Component, signal, OnInit, afterNextRender, ElementRef, ViewChild, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { TransitService } from '../../services/transit.service';
import { trigger, transition, style, animate } from '@angular/animations';

declare const google: any;

@Component({
  selector: 'app-bus-program',
  standalone: true,
  imports: [CommonModule, RouterLink],
  animations: [
    trigger('slideUp', [
      transition(':enter', [
        style({ transform: 'translateY(100%)' }),
        animate('400ms cubic-bezier(0.4, 0, 0.2, 1)', style({ transform: 'translateY(0)' }))
      ])
    ]),
    trigger('slideDown', [
      transition(':enter', [
        style({ transform: 'translateY(-100%)' }),
        animate('400ms cubic-bezier(0.4, 0, 0.2, 1)', style({ transform: 'translateY(0)' }))
      ])
    ]),
    trigger('popIn', [
      transition(':enter', [
        style({ transform: 'scale(0.8)', opacity: 0 }),
        animate('300ms cubic-bezier(0.175, 0.885, 0.32, 1.275)', style({ transform: 'scale(1)', opacity: 1 }))
      ])
    ])
  ],
  template: `
    <main class="bus-shell" [class.nav-active]="isNavigating()">
      <!-- Unified Header (Search + Navigation) -->
      @if (isNavigating()) {
        <header class="nav-header" [@slideDown]>
          <div class="nav-instruction">
            <span class="material-icons">{{ getStepIcon(activeStep()) }}</span>
            <div class="instruction-body">
              <span class="instruction-text" [innerHTML]="activeStep()?.instructions"></span>
              @if (activeStep()?.distance) {
                <span class="instruction-sub">{{ activeStep().distance.text }} rămași</span>
              }
            </div>
          </div>
          <button class="stop-btn" (click)="stopNavigation()">Închide</button>
        </header>
      } @else {
        <header class="top-search-bar" [@slideDown]>
          <div class="search-compact">
            <button class="icon-btn" routerLink="/transport/bus">
              <span class="material-icons">arrow_back</span>
            </button>
            <div class="search-inputs">
              <div class="input-row">
                <span class="dot origin"></span>
                <input #originInput type="text" 
                  (input)="onSearchInput($event, 'origin')"
                  placeholder="Locația ta" 
                  [value]="userLocationName()">
              </div>
              <div class="divider"></div>
              <div class="input-row">
                <span class="dot dest"></span>
                <input #destInput type="text" 
                  (input)="onSearchInput($event, 'destination')"
                  placeholder="Unde mergem?">
              </div>
            </div>
            
            <div class="mode-toggle">
              <button class="mode-btn" [class.active]="travelMode() === 'TRANSIT'" (click)="setTravelMode('TRANSIT')">
                <span class="material-icons">directions_bus</span>
              </button>
              <button class="mode-btn" [class.active]="travelMode() === 'WALKING'" (click)="setTravelMode('WALKING')">
                <span class="material-icons">directions_walk</span>
              </button>
            </div>
          </div>

          @if (predictions().length > 0) {
            <div class="predictions-overlay">
              @for (p of predictions(); track p.place_id) {
                <button class="prediction-item" (click)="selectPrediction(p)">
                  <span class="material-icons p-icon">place</span>
                  <div class="p-details">
                    <span class="p-main">{{ p.structured_formatting.main_text }}</span>
                    <span class="p-sub">{{ p.structured_formatting.secondary_text }}</span>
                  </div>
                </button>
              }
            </div>
          }
        </header>
      }

      <!-- Map Container -->
      <section class="map-section" [class.full]="isNavigating()">
        <div #mapContainer class="map-canvas"></div>
        
        @if (isLoading()) {
          <div class="map-overlay-loader">
            <div class="loader-ring"></div>
          </div>
        }
      </section>

      <!-- Timeline View -->
      @if (currentRoute() && !isNavigating()) {
        <section class="timeline-container" [@slideUp]>
          <div class="route-header-main">
            <div class="summary-info">
              <span class="main-duration">{{ routeDuration() }}</span>
              <span class="sub-info">Sosire la {{ getFinalArrivalTime() }}</span>
            </div>
            
            <div class="action-row">
              <button class="start-btn-primary" (click)="startNavigation()">
                <span class="material-icons">navigation</span>
                PORNIRE
              </button>
              @if (hasTransit()) {
                <button class="ticket-btn-secondary" (click)="open24Pay()">
                  <span class="material-icons">confirmation_number</span>
                </button>
              }
            </div>
          </div>

          <div class="timeline-scroll">
            @for (step of currentRoute().legs[0].steps; track $index) {
              <div class="timeline-item" [class.transit]="step.travel_mode === 'TRANSIT'">
                <div class="time-col">
                  <span class="step-time">{{ getStepStartTime($index) }}</span>
                </div>
                
                <div class="indicator-col">
                  <div class="indicator-line" [class.dotted]="step.travel_mode === 'WALKING'" [style.background-color]="step.transit?.line?.color || '#DADCE0'"></div>
                  <div class="node" [style.border-color]="step.transit?.line?.color || '#1A73E8'">
                    <span class="material-icons">{{ getStepIcon(step, false) }}</span>
                  </div>
                </div>

                <div class="content-col">
                  <div class="step-card">
                    <div class="step-header">
                      @if (step.transit) {
                        <span class="line-badge" [style.background]="step.transit.line.color">{{ step.transit.line.short_name }}</span>
                      }
                      <span class="step-title">{{ getStepTitle(step, false) }}</span>
                    </div>
                    
                    <div class="step-meta">
                      {{ step.duration.text }} • {{ step.distance.text }}
                    </div>

                    @if (step.transit) {
                      <div class="arrival-preview" [@popIn]>
                        @for (arr of getStepArrivals(step); track arr.time) {
                          <div class="arr-row">
                            <span class="material-icons">schedule</span>
                            <span>{{ arr.time }}</span>
                            <span class="arr-wait">Peste {{ arr.wait }} min</span>
                          </div>
                        }
                      </div>
                    }
                  </div>
                </div>
              </div>
            }

            <!-- Final Destination Node -->
            <div class="timeline-item final-arrival">
              <div class="time-col">
                <span class="step-time end">{{ getFinalArrivalTime() }}</span>
              </div>
              <div class="indicator-col">
                <div class="node dest-node">
                  <span class="material-icons">location_on</span>
                </div>
              </div>
              <div class="content-col">
                <div class="step-header">
                  <span class="step-title dest-title">{{ destination()?.name || 'Destinație' }}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      }
    </main>
  `,
  styles: [`
    .bus-shell { height: 100vh; background: #fff; font-family: 'Outfit', sans-serif; display: flex; flex-direction: column; overflow: hidden; position: relative; }
    
    /* Sticky Top Search */
    .top-search-bar { position: absolute; top: 1.5rem; left: 1.5rem; right: 1.5rem; z-index: 1000; }
    .search-compact { background: #fff; border-radius: 20px; box-shadow: 0 12px 32px rgba(0,0,0,0.18); display: flex; align-items: center; padding: 0.6rem 1rem; gap: 0.6rem; border: 1px solid rgba(0,0,0,0.05); }
    .icon-btn { background: #f8f9fa; border: none; color: #5f6368; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .search-inputs { flex: 1; display: flex; flex-direction: column; gap: 0.4rem; }
    .input-row { display: flex; align-items: center; gap: 1rem; }
    .dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
    .dot.origin { border: 2px solid #4285f4; }
    .dot.dest { background: #ea4335; }
    .divider { height: 1px; background: #f1f3f4; margin-left: 2rem; }
    input { border: none; outline: none; font-size: 1.05rem; font-weight: 700; color: #202124; padding: 0.2rem 0; width: 100%; background: transparent; }

    .mode-toggle { display: flex; flex-direction: column; gap: 0.5rem; padding-left: 1rem; border-left: 1px solid #f1f3f4; }
    .mode-btn { background: #f8f9fa; border: none; width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #5f6368; transition: all 0.2s; }
    .mode-btn.active { background: #e8f0fe; color: #1a73e8; }
    .mode-btn .material-icons { font-size: 1.4rem; }

    .predictions-overlay { background: #fff; border-radius: 20px; margin-top: 0.8rem; box-shadow: 0 15px 40px rgba(0,0,0,0.2); overflow: hidden; }
    .prediction-item { width: 100%; display: flex; align-items: center; gap: 1.2rem; padding: 1.2rem 1.5rem; border: none; background: transparent; text-align: left; border-bottom: 1px solid #f1f3f4; }
    .p-icon { color: #70757a; font-size: 1.2rem; }
    .p-details { display: flex; flex-direction: column; }
    .p-main { font-weight: 700; color: #202124; font-size: 0.95rem; }
    .p-sub { font-size: 0.8rem; color: #70757a; }

    /* Navigation Mode */
    .nav-header { position: absolute; top: 0; left: 0; right: 0; background: #1a73e8; color: #fff; padding: 1.2rem 1.5rem; z-index: 1001; display: flex; align-items: center; gap: 1rem; box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
    .nav-instruction { display: flex; align-items: center; gap: 1rem; flex: 1; }
    .nav-instruction .material-icons { font-size: 2.2rem; }
    .instruction-body { display: flex; flex-direction: column; }
    .instruction-text { font-size: 1.1rem; font-weight: 800; line-height: 1.2; }
    .instruction-sub { font-size: 0.85rem; opacity: 0.8; }
    .stop-btn { background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.4); color: #fff; padding: 0.5rem 1rem; border-radius: 8px; font-weight: 700; }

    .map-section { height: 45vh; flex-shrink: 0; transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); position: relative; margin: 1rem; border-radius: 28px; overflow: hidden; box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
    .map-section.full { height: 100vh; margin: 0; border-radius: 0; }
    .map-canvas { width: 100%; height: 100%; }

    .timeline-container { flex: 1; background: #fff; border-top-radius: 24px; box-shadow: 0 -8px 24px rgba(0,0,0,0.1); z-index: 10; display: flex; flex-direction: column; overflow: hidden; }
    .route-header-main { padding: 1.2rem 1.5rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f3f4; background: #fff; }
    .main-duration { display: block; font-size: 1.5rem; font-weight: 800; color: #1e8e3e; }
    .sub-info { font-size: 0.95rem; color: #70757a; font-weight: 600; }
    
    .action-row { display: flex; gap: 0.8rem; }
    .start-btn-primary { background: #1a73e8; color: #fff; border: none; padding: 0.8rem 1.8rem; border-radius: 100px; font-weight: 800; display: flex; align-items: center; gap: 0.6rem; box-shadow: 0 4px 12px rgba(26,115,232,0.3); }
    .ticket-btn-secondary { background: #f8f9fa; color: #1a73e8; border: 1px solid #e8eaed; width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }

    .timeline-scroll { flex: 1; overflow-y: auto; padding: 2rem 1.5rem; }
    .timeline-item { display: flex; min-height: 100px; }
    .time-col { width: 60px; display: flex; flex-direction: column; padding-bottom: 1.5rem; }
    .step-time { font-size: 0.95rem; font-weight: 800; color: #202124; }
    .step-time.end { margin-top: auto; padding-top: 1rem; color: #ea4335; }

    .indicator-col { width: 45px; display: flex; flex-direction: column; align-items: center; position: relative; }
    .indicator-line { width: 6px; position: absolute; top: 12px; bottom: -20px; z-index: 1; background: #dadce0; border-radius: 3px; }
    .indicator-line.dotted { background: transparent !important; border-left: 6px dotted #dadce0; width: 0; border-radius: 0; }
    
    .node { width: 16px; height: 16px; background: #fff; border: 4px solid #1a73e8; border-radius: 50%; z-index: 2; position: relative; display: flex; align-items: center; justify-content: center; }
    .node.dest-node { border-color: #ea4335 !important; background: #ea4335; color: #fff; width: 32px; height: 32px; box-shadow: 0 4px 10px rgba(234,67,53,0.3); }
    .node.dest-node .material-icons { display: block; font-size: 1.4rem; }
    
    .timeline-item.transit .node { width: 28px; height: 28px; border-radius: 8px; display: flex; align-items: center; justify-content: center; background: #fff; border-width: 2px; }
    .timeline-item.transit .node .material-icons { font-size: 1.1rem; }

    .content-col { flex: 1; padding-left: 1.2rem; padding-bottom: 2.5rem; }
    .timeline-item.final-arrival { min-height: 50px; }
    .timeline-item.final-arrival .content-col { padding-bottom: 1rem; }
    .step-header { display: flex; align-items: center; gap: 0.8rem; margin-bottom: 0.3rem; }
    .line-badge { min-width: 32px; height: 20px; color: #fff; font-weight: 900; font-size: 0.8rem; display: flex; align-items: center; justify-content: center; border-radius: 4px; padding: 0 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .step-title { font-size: 1.1rem; font-weight: 800; color: #202124; line-height: 1.3; }
    .step-title.dest-title { color: #ea4335; font-size: 1.2rem; }
    .step-meta { font-size: 0.9rem; color: #70757a; font-weight: 600; margin-top: 0.1rem; }

    .arrival-preview { margin-top: 0.8rem; background: #f8faff; padding: 0.8rem; border-radius: 12px; border: 1px solid #e8f0fe; }
    .arr-row { display: flex; align-items: center; gap: 0.6rem; font-size: 0.9rem; font-weight: 800; color: #1a73e8; margin-bottom: 0.2rem; }

    .map-overlay-loader { position: absolute; inset: 0; background: rgba(255,255,255,0.6); display: flex; align-items: center; justify-content: center; z-index: 50; }
    .loader-ring { width: 30px; height: 30px; border: 3px solid #f0f0f0; border-top-color: #1a73e8; border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BusProgramComponent implements OnInit {
  @ViewChild('mapContainer') mapContainer!: ElementRef;
  @ViewChild('destInput') destInput!: ElementRef;
  @ViewChild('originInput') originInput!: ElementRef;

  private map: any;
  private userMarker: any;
  private directionsService: any;
  private directionsRenderer: any;
  private autocompleteService: any;
  private placesService: any;
  private transitService = inject(TransitService);
  private route = inject(ActivatedRoute);

  isLoading = signal(false);
  isNavigating = signal(false);
  activeStep = signal<any>(null);
  userLocationName = signal('Locația ta');
  userCoords = signal<any>(null);
  destination = signal<any>(null);
  currentRoute = signal<any>(null);
  travelMode = signal<any>(google.maps.TravelMode.TRANSIT);
  routeDuration = signal<string>('');
  predictions = signal<any[]>([]);
  activeSearchType = signal<'origin' | 'destination' | null>(null);

  private watchId: number | null = null;

  hasTransit = computed(() => {
    const route = this.currentRoute();
    if (!route) return false;
    return route.legs[0].steps.some((s: any) => s.travel_mode === 'TRANSIT');
  });

  constructor() {
    afterNextRender(() => {
      this.initMap();
      this.getUserLocation();
      this.transitService.loadData();
      this.checkIncomingDestination();
    });
  }

  ngOnInit() {}

  private checkIncomingDestination() {
    this.route.queryParams.subscribe(params => {
      if (params['destLat'] && params['destLon']) {
        const dest = {
          geometry: {
            location: new google.maps.LatLng(parseFloat(params['destLat']), parseFloat(params['destLon']))
          },
          name: params['destName'] || 'Destinație selectată'
        };
        
        this.destination.set(dest);
        setTimeout(() => {
          if (this.destInput) this.destInput.nativeElement.value = dest.name;
        }, 0);
        
        // Wait for user location before calculating
        const checkLoc = setInterval(() => {
          if (this.userCoords()) {
            this.calculateRoute();
            clearInterval(checkLoc);
          }
        }, 500);
      }
    });
  }

  startNavigation() {
    if (!this.currentRoute()) return;
    this.isNavigating.set(true);
    this.activeStep.set(this.currentRoute().legs[0].steps[0]);
    
    if (this.userCoords()) {
      this.map.setCenter(this.userCoords());
      this.map.setZoom(18);
    }

    if (navigator.geolocation) {
      this.watchId = navigator.geolocation.watchPosition((pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        this.userCoords.set(coords);
        this.updateUserMarker(coords);
        this.updateActiveStep(coords);
      }, (err) => console.error(err), { enableHighAccuracy: true });
    }
  }

  stopNavigation() {
    this.isNavigating.set(false);
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
    }
    this.map.setZoom(13);
  }

  private updateActiveStep(coords: any) {
    const route = this.currentRoute();
    if (!route) return;
    
    const steps = route.legs[0].steps;
    let minIdx = 0;
    let minDist = Infinity;

    steps.forEach((step: any, idx: number) => {
      const dist = google.maps.geometry.spherical.computeDistanceBetween(
        new google.maps.LatLng(coords.lat, coords.lng),
        step.start_location
      );
      if (dist < minDist) {
        minDist = dist;
        minIdx = idx;
      }
    });

    this.activeStep.set(steps[minIdx]);
  }

  getStepStartTime(idx: number): string {
    const now = new Date();
    let totalSeconds = 0;
    const steps = this.currentRoute().legs[0].steps;
    for (let i = 0; i < idx; i++) {
      totalSeconds += steps[i].duration.value;
      if (steps[i].travel_mode === 'TRANSIT') {
        const arrivals = this.getStepArrivals(steps[i]);
        if (arrivals.length > 0) totalSeconds += arrivals[0].wait * 60;
      }
    }
    const time = new Date(now.getTime() + totalSeconds * 1000);
    return `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;
  }

  getStepEndTime(idx: number): string {
    const now = new Date();
    let totalSeconds = 0;
    const steps = this.currentRoute().legs[0].steps;
    for (let i = 0; i <= idx; i++) {
      totalSeconds += steps[i].duration.value;
      if (steps[i].travel_mode === 'TRANSIT') {
        const arrivals = this.getStepArrivals(steps[i]);
        if (arrivals.length > 0) totalSeconds += arrivals[0].wait * 60;
      }
    }
    const time = new Date(now.getTime() + totalSeconds * 1000);
    return `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;
  }

  getFinalArrivalTime(): string {
    if (!this.currentRoute()) return '';
    return this.getStepEndTime(this.currentRoute().legs[0].steps.length - 1);
  }

  getStepTitle(step: any, isLast: boolean = false): string {
    if (isLast) return this.destination()?.name || 'Destinație';
    if (step.travel_mode === 'TRANSIT') {
      return step.transit.departure_stop.name;
    }
    const instr = step.instructions.toLowerCase();
    if (instr.includes('destinație') || instr.includes('ajuns')) {
      return this.destination()?.name || 'Destinație';
    }
    return 'Mergi pe jos';
  }

  getStepIcon(step: any, isLast: boolean = false): string {
    if (isLast) return 'location_on';
    if (!step) return 'my_location';
    if (step.travel_mode === 'TRANSIT') return 'directions_bus';
    const instr = step.instructions.toLowerCase();
    if (instr.includes('destinație') || instr.includes('ajuns')) return 'location_on';
    return 'directions_walk';
  }

  getPredictionIcon(p: any): string {
    const types = p.types || [];
    if (types.includes('transit_station')) return 'directions_bus';
    return 'place';
  }

  getStepArrivals(step: any) {
    if (!step.transit || !this.transitService.isLoaded()) return [];
    
    let offset = 0;
    const steps = this.currentRoute().legs[0].steps;
    for (const s of steps) {
      if (s === step) break;
      offset += s.duration.value;
    }

    return this.transitService.getArrivalsForStep(
      step.transit.departure_stop.name,
      step.transit.line.short_name,
      { lat: step.transit.departure_stop.location.lat(), lng: step.transit.departure_stop.location.lng() },
      offset
    );
  }

  private initMap() {
    this.map = new google.maps.Map(this.mapContainer.nativeElement, {
      center: { lat: 45.6483, lng: 25.5891 },
      zoom: 13,
      disableDefaultUI: true,
      styles: this.getMapStyles()
    });

    this.directionsService = new google.maps.DirectionsService();
    this.directionsRenderer = new google.maps.DirectionsRenderer({
      map: this.map,
      suppressMarkers: true,
      polylineOptions: { strokeColor: '#1A73E8', strokeWeight: 6, strokeOpacity: 0.8 }
    });

    this.autocompleteService = new google.maps.places.AutocompleteService();
    this.placesService = new google.maps.places.PlacesService(this.map);
  }

  onSearchInput(event: any, type: 'origin' | 'destination') {
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
      if (this.activeSearchType() === 'origin') {
        this.userCoords.set(place.geometry.location);
        this.userLocationName.set(place.name);
        this.originInput.nativeElement.value = place.name;
      } else {
        this.destination.set(place);
        this.destInput.nativeElement.value = place.name;
      }
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
    this.directionsService.route({
      origin: this.userCoords(),
      destination: this.destination().geometry.location,
      travelMode: this.travelMode(),
      provideRouteAlternatives: true
    }, (response: any, status: string) => {
      this.isLoading.set(false);
      if (status === 'OK') {
        this.directionsRenderer.setDirections(response);
        const route = response.routes[0];
        this.currentRoute.set(route);
        this.routeDuration.set(route.legs[0].duration.text);
        
        // Add destination marker manually
        new google.maps.Marker({
          position: this.destination().geometry.location,
          map: this.map,
          icon: {
            url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
          }
        });
      }
    });
  }

  open24Pay() { window.location.href = 'https://www.24pay.ro/'; }

  private getMapStyles() {
    return [
      { "featureType": "all", "elementType": "labels.text.fill", "stylers": [{ "color": "#70757a" }] },
      { "featureType": "landscape", "elementType": "geometry", "stylers": [{ "color": "#f8f9fa" }] },
      { "featureType": "road.highway", "elementType": "geometry.fill", "stylers": [{ "color": "#ffffff" }] },
      { "featureType": "transit", "elementType": "geometry", "stylers": [{ "color": "#e8eaed" }] },
      { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#c9d9f8" }] }
    ];
  }
}
