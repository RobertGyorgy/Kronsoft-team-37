import { ChangeDetectionStrategy, Component, signal, OnDestroy, PLATFORM_ID, inject, OnInit, afterNextRender, ViewEncapsulation, DestroyRef, ElementRef, ViewChild, computed } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TransitService } from '../../services/transit.service';
import { gsap } from 'gsap';

declare const google: any;

@Component({
  selector: 'app-bus-search',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="transport-container" #container 
         [class.minimized-state]="isMinimized() && activeStation()"
         [class.active-station-state]="activeStation()">
      <header class="top-nav" [class.active-search]="searchTerm().length > 0">
        <div class="nav-row pill-header">
          <button class="minimal-back-btn" (click)="goBack()">
            <span class="material-icons">arrow_back_ios_new</span>
          </button>
          <div class="search-pill">
            <span class="material-icons search-ico">search</span>
            <input 
              type="text" 
              placeholder="Search station..." 
              (input)="onSearch($any($event.target).value)"
              [value]="searchTerm()"
            />
            <button class="minimal-locate" (click)="findNearbyStation()" title="Nearby">
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

        <section class="station-viewer" #viewer 
                 [class.minimized]="isMinimized()" 
                 (scroll)="onViewerScroll($event)"
                 (touchstart)="onTouchStart($event)"
                 (touchmove)="onTouchMove($event)">
          @if (activeStation()) {
            <div class="drag-handle-container" (click)="handleDragClick()">
              <div class="drag-handle"></div>
            </div>
            
            <header class="station-meta">
              <div class="meta-left">
                <h1 class="bold-header">
                  @for (word of splitByWord(activeStation()?.name || ''); track $index) {
                    <span class="word">
                      @for (char of word.split(''); track $index) {
                        <span class="char">{{ char }}</span>
                      }
                      <span class="char">&nbsp;</span>
                    </span>
                  }
                </h1>
                
                <div class="quick-actions">
                  <button class="primary-bold-btn" (click)="takeMeThere(activeStation())">
                    <span class="material-icons">near_me</span>
                    <span>Take me there</span>
                  </button>
                </div>
              </div>
            </header>

            <div class="section-block">
              <div class="block-label">Lines at this station</div>
              <div class="line-scroller">
                @for (line of activeStation()!.lineDetails || []; track line.name) {
                  <button class="line-pill-bold" [style.background]="line.color" [style.color]="line.textColor" (click)="openTimetable(line)">
                    {{ line.name }}
                  </button>
                }
              </div>
            </div>

            <div class="section-block">
              <div class="block-label">Upcoming Arrivals</div>
              <div class="arrivals-list">
                @for (arr of activeStation()?.arrivals?.slice(0, displayLimit()) || []; track arr.line + arr.eta) {
                  <div class="arrival-card-bold" (click)="openTimetable(arr)">
                    <div class="line-tag" [style.background]="arr.color" [style.color]="arr.textColor">
                      {{ arr.shortLine }}
                    </div>
                    <div class="arrival-main">
                      <span class="arrival-dest">{{ arr.target }}</span>
                      <span class="arrival-meta">Scheduled at {{ arr.scheduledTime }}</span>
                    </div>
                    <div class="arrival-eta">
                      <span class="eta-val">{{ arr.eta }}</span>
                      <span class="eta-min">MIN</span>
                    </div>
                  </div>
                }

                @if (activeStation()?.arrivals?.length > displayLimit()) {
                  <button class="minimal-more-btn" (click)="showMore()">
                    <span>Load more</span>
                    <span class="material-icons">expand_more</span>
                  </button>
                }

                @if (!isFetchingLines() && activeStation()?.arrivals?.length === 0) {
                  <div class="empty-state">
                    <span class="material-icons">event_busy</span>
                    <p>No upcoming arrivals found.</p>
                  </div>
                }
              </div>
            </div>
          } @else if (!isLoading()) {
            <div class="hero-welcome">
              <h1 class="bold-header">
                <span *ngFor="let word of splitByWord('Brașov Transit')" class="word">
                  <span *ngFor="let char of word.split('')" class="char">{{ char }}</span>
                  <span class="char">&nbsp;</span>
                </span>
              </h1>
              <p class="hero-subtext">Search for a station or find one nearby to see real-time schedules.</p>
              <button class="primary-bold-btn" (click)="findNearbyStation()">
                <span class="material-icons">my_location</span>
                <span>Find nearby stations</span>
              </button>
            </div>
          }
        </section>
      </div>

      <!-- Timetable Modal -->
      @if (viewingTimetable()) {
        <div class="modal-backdrop" (click)="closeTimetable()">
          <div class="modal-sheet-premium" (click)="$event.stopPropagation()">
            <header class="sheet-head" [style.background]="viewingTimetable()!.color" [style.color]="viewingTimetable()!.textColor">
              <div class="sheet-title-wrap">
                <span class="sheet-line-num">{{ viewingTimetable()!.name }}</span>
                <span class="sheet-destination">to {{ viewingTimetable()!.target }}</span>
              </div>
              <button class="sheet-exit" (click)="closeTimetable()">
                <span class="material-icons">close</span>
              </button>
            </header>
            
            <div class="sheet-body">
              <div class="day-pills">
                @for (service of getServiceKeys(viewingTimetable()!.timetable); track service) {
                  <button [class.active]="selectedService() === service" (click)="selectedService.set(service)">
                    {{ service === 'Mo-Fr' ? 'Weekdays' : (service === 'Sa-Su' ? 'Weekend' : service) }}
                  </button>
                }
              </div>

              <div class="timetable-grid">
                @for (time of viewingTimetable()!.timetable[selectedService()]; track time) {
                  <div class="time-slot" [class.is-next]="isNextTime(time)">
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
    .transport-container { min-height: 100vh; background: #fff; font-family: 'Outfit', sans-serif; display: flex; flex-direction: column; color: #1a1a1a; overflow-x: hidden; }
    
    .top-nav { position: absolute; top: 0; left: 0; right: 0; padding: calc(var(--safe-top) + 1rem) 1.25rem; z-index: 1000; transition: all 0.4s ease; }
    .nav-row.pill-header { display: flex; align-items: center; background: #fff; border-radius: 999px; box-shadow: 0 10px 40px rgba(0,0,0,0.12); border: 1px solid rgba(0,0,0,0.05); padding: 0.25rem 0.5rem 0.25rem 0.75rem; max-width: 600px; margin: 0 auto; }
    
    .minimal-back-btn { background: transparent; border: none; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #1a1a1a; cursor: pointer; transition: background 0.2s; }
    .minimal-back-btn:active { background: #f5f5f5; }
    .search-pill { flex: 1; display: flex; align-items: center; background: transparent; padding: 0 0.5rem; border-radius: 0; box-shadow: none; border: none; }
    .search-pill input { border: none; background: transparent; flex: 1; padding: 0.8rem 0; outline: none; font-size: 1rem; font-weight: 700; color: #1a1a1a; }
    .search-ico { color: #ccc; margin-right: 0.5rem; font-size: 1.2rem; }
    .minimal-locate { background: #f5f5f5; border: none; width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #1a1a1a; cursor: pointer; }

    .search-overlay { position: absolute; top: calc(var(--safe-top) + 5rem); left: 1.25rem; right: 1.25rem; background: #fff; border-radius: 28px; z-index: 1001; box-shadow: 0 20px 50px rgba(0,0,0,0.15); max-height: 60vh; overflow-y: auto; padding: 1rem; border: 1px solid rgba(0,0,0,0.05); }
    .result-card { display: flex; align-items: center; gap: 1rem; padding: 1.2rem; border-radius: 20px; transition: all 0.2s; cursor: pointer; }
    .result-card:active { background: #f9f9f9; transform: scale(0.98); }
    .res-icon { width: 48px; height: 48px; background: #f5f5f5; border-radius: 14px; display: flex; align-items: center; justify-content: center; color: #1a1a1a; }
    .res-body { flex: 1; display: flex; flex-direction: column; gap: 0.25rem; }
    .res-name { font-weight: 800; font-size: 1.1rem; color: #1a1a1a; }
    .hub-chip { font-size: 0.6rem; font-weight: 900; background: #1a1a1a; color: #fff; padding: 2px 6px; border-radius: 4px; margin-left: 0.5rem; vertical-align: middle; }
    .res-lines { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 0.4rem; }
    .mini-line { font-size: 0.7rem; font-weight: 900; color: #fff; padding: 2px 8px; border-radius: 6px; margin-right: 4px; }
    .main-content { flex: 1; display: flex; flex-direction: column; position: relative; overflow: hidden; }
    .map-section { height: 100vh; width: 100%; flex-shrink: 0; transition: height 0.7s cubic-bezier(0.2, 0.8, 0.2, 1); position: relative; z-index: 1; }
    .active-station-state .map-section { height: 45vh; }
    .minimized-state .map-section { height: 75vh; }
    .map-canvas { width: 100%; height: 100%; }
    .map-element { width: 100%; height: 100%; }
    
    .map-overlay-loader { position: absolute; inset: 0; background: rgba(255,255,255,0.4); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 5; }
    .loader-ring { width: 32px; height: 32px; border: 3px solid #eee; border-top-color: #1a1a1a; border-radius: 50%; animation: spin 0.8s linear infinite; }
    
    .station-viewer { position: absolute; bottom: 0; left: 0; right: 0; height: 70vh; background: #fff; border-radius: 44px 44px 0 0; z-index: 10; padding: 0 1.5rem 2rem; box-shadow: 0 -25px 60px rgba(0,0,0,0.12); transition: transform 0.7s cubic-bezier(0.2, 0.8, 0.2, 1); overflow-y: auto; scroll-behavior: smooth; transform: translateY(0); }
    .minimized-state .station-viewer { transform: translateY(calc(70vh - 250px)); overflow-y: hidden; }

    
    .drag-handle-container { padding: 1.25rem 0 1rem; display: flex; justify-content: center; cursor: pointer; position: sticky; top: 0; background: #fff; z-index: 10; margin: 0 -1.5rem; }
    .drag-handle { width: 44px; height: 5px; background: #f0f0f0; border-radius: 3px; transition: background 0.3s; }
    .drag-handle-container:active .drag-handle { background: #e0e0e0; }

    .station-meta { margin-bottom: 2rem; }
    .bold-header { font-size: 3rem; font-weight: 800; letter-spacing: -0.06em; line-height: 0.85; margin: 0 0 1rem; transition: font-size 0.3s; }
    .minimized .bold-header { font-size: 2.2rem; }
    .word { display: inline-block; white-space: nowrap; }
    .char { display: inline-block; }
    
    .primary-bold-btn { background: #1a1a1a; color: #fff; border: none; width: 100%; padding: 1.2rem; border-radius: 20px; font-weight: 800; font-size: 1.1rem; display: flex; align-items: center; justify-content: center; gap: 0.75rem; letter-spacing: 0.02em; cursor: pointer; }
    .primary-bold-btn:active { transform: scale(0.97); transition: transform 0.2s; }

    .section-block { margin-bottom: 2.5rem; }
    .block-label { font-size: 0.8rem; font-weight: 900; color: #bbb; text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 1.25rem; padding-left: 0.5rem; }
    
    .line-scroller { display: flex; gap: 0.75rem; overflow-x: auto; padding-bottom: 0.5rem; scrollbar-width: none; }
    .line-scroller::-webkit-scrollbar { display: none; }
    .line-pill-bold { flex-shrink: 0; padding: 0.8rem 1.5rem; border-radius: 14px; border: none; font-weight: 900; font-size: 1.1rem; cursor: pointer; box-shadow: 0 6px 15px rgba(0,0,0,0.1); }

    .arrivals-list { display: flex; flex-direction: column; gap: 1rem; }
    .arrival-card-bold { display: flex; align-items: center; gap: 1.25rem; background: #fafafa; padding: 1.25rem; border-radius: 24px; transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1); cursor: pointer; border: 1px solid rgba(0,0,0,0.03); }
    .arrival-card-bold.animated { transform: none !important; opacity: 1 !important; }
    .arrival-card-bold:active { transform: scale(0.96); background: #f0f0f0; }
    
    .line-tag { width: 54px; height: 54px; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 1.2rem; color: #fff; flex-shrink: 0; box-shadow: 0 8px 20px rgba(0,0,0,0.1); }
    .arrival-main { flex: 1; display: flex; flex-direction: column; gap: 0.2rem; }
    .arrival-dest { font-weight: 800; font-size: 1.1rem; color: #1a1a1a; letter-spacing: -0.02em; }
    .arrival-meta { font-size: 0.85rem; color: #999; font-weight: 600; }
    .arrival-eta { text-align: right; display: flex; flex-direction: column; align-items: flex-end; }
    .eta-val { font-size: 1.6rem; font-weight: 950; color: #1a1a1a; line-height: 1; letter-spacing: -0.05em; }
    .eta-min { font-size: 0.7rem; font-weight: 900; color: #bbb; letter-spacing: 0.1em; }

    .minimal-more-btn { width: 100%; background: #fff; border: 2px solid #f0f0f0; padding: 1rem; border-radius: 24px; font-weight: 800; color: #1a1a1a; margin-top: 1rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem; }
    
    .hero-welcome { text-align: center; padding: 3rem 1rem; display: flex; flex-direction: column; align-items: center; gap: 1.5rem; }
    .hero-subtext { color: #666; font-size: 1.1rem; line-height: 1.5; font-weight: 500; margin: 0; }

    .modal-sheet-premium { background: #fff; width: 100%; border-radius: 40px 40px 0 0; max-height: 85vh; overflow-y: auto; box-shadow: 0 -20px 60px rgba(0,0,0,0.1); }
    .sheet-head { padding: 2.5rem 2rem; display: flex; justify-content: space-between; align-items: center; }
    .sheet-line-num { font-size: 3rem; font-weight: 800; line-height: 1; letter-spacing: -0.04em; }
    .sheet-destination { display: block; font-size: 1.1rem; font-weight: 700; opacity: 0.9; margin-top: 0.5rem; }
    .sheet-exit { background: rgba(0,0,0,0.1); border: none; width: 44px; height: 44px; border-radius: 50%; color: inherit; display: flex; align-items: center; justify-content: center; cursor: pointer; }
    .sheet-body { padding: 2.5rem 2rem; }
    .day-pills { display: flex; background: #f5f5f5; padding: 6px; border-radius: 18px; margin-bottom: 2.5rem; }
    .day-pills button { flex: 1; border: none; background: transparent; padding: 0.9rem; border-radius: 14px; font-weight: 800; color: #999; cursor: pointer; }
    .day-pills button.active { background: #fff; color: #1a1a1a; box-shadow: 0 6px 15px rgba(0,0,0,0.05); }
    .timetable-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(75px, 1fr)); gap: 0.75rem; }
    .time-slot { background: #fafafa; padding: 1rem; border-radius: 16px; font-weight: 700; font-size: 1.1rem; text-align: center; border: 1px solid #f0f0f0; }
    .time-slot.is-next { background: #1a1a1a; color: #fff; border-color: #1a1a1a; transform: scale(1.05); }

    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

    @media (max-width: 480px) {
      .bold-header { font-size: 2.4rem; }
      .primary-bold-btn { width: 100%; }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BusSearchComponent implements OnInit, OnDestroy {
  @ViewChild('mapContainer') mapContainer!: ElementRef;
  @ViewChild('viewer') viewer!: ElementRef;
  
  private transitService = inject(TransitService);
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
  public smartStops = computed(() => this.transitService.smartStops());

  viewingTimetable = signal<any | null>(null);
  selectedService = signal<string>('Mo-Fr');

  isMinimized = signal<boolean>(false);

  private locationTimeout: any;

  constructor() {
    afterNextRender(() => {
      this.isLoading.set(true);
      
      // Start finding location early
      const earlyLoc = new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          () => resolve(null),
          { timeout: 2000 }
        );
      });

      earlyLoc.then((coords: any) => {
        this.initMap(coords);
        this.transitService.loadData().then(() => {
          this.fetchPopularHubs();
          
          this.locationTimeout = setTimeout(() => {
            if (!this.activeStation() && !this.searchTerm()) {
              if (this.allStations.length > 0) this.selectStation(this.allStations[0]);
              else this.isLoading.set(false);
            }
          }, 5000);

          this.findNearbyStation(true);
        });
      });
    });
  }

  ngOnInit() {}
  ngOnDestroy() {
    if (this.initTimeout) clearTimeout(this.initTimeout);
    if (this.locationTimeout) clearTimeout(this.locationTimeout);
  }

  splitByWord(text: string): string[] {
    return text ? text.split(' ') : [];
  }

  private entranceTl?: gsap.core.Timeline;

  private animateEntrance() {
    if (!this.viewer?.nativeElement) return;
    
    const container = this.viewer.nativeElement;
    const chars = container.querySelectorAll('.char');
    const cards = container.querySelectorAll('.arrival-card-bold');
    const linePills = container.querySelectorAll('.line-pill-bold');
    const labels = container.querySelectorAll('.block-label');
    const actionBtns = container.querySelectorAll('.primary-bold-btn');
    const dragHandle = container.querySelectorAll('.drag-handle-container');

    if (chars.length === 0 && cards.length === 0) return;

    // Kill any existing animation to prevent "refresh" glitches
    if (this.entranceTl) this.entranceTl.kill();
    gsap.killTweensOf([chars, cards, linePills, labels, actionBtns, dragHandle]);

    this.entranceTl = gsap.timeline({ defaults: { ease: 'power4.out', duration: 0.8 } });
    
    this.entranceTl.fromTo(chars, 
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.015 }
    )
    .fromTo([dragHandle, actionBtns, labels, linePills],
      { y: 15, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.04 },
      '-=0.65'
    )
    .fromTo(cards,
      { y: 25, opacity: 0 },
      { 
        y: 0, 
        opacity: 1, 
        stagger: 0.06,
        onComplete: () => {
          cards.forEach((el: any) => el.classList.add('animated'));
        }
      },
      '-=0.6'
    );
  }

  private touchStartY = 0;
  
  onTouchStart(event: TouchEvent) {
    this.touchStartY = event.touches[0].clientY;
  }

  onTouchMove(event: TouchEvent) {
    const touchY = event.touches[0].clientY;
    const deltaY = touchY - this.touchStartY;
    const el = this.viewer?.nativeElement;
    
    // Pull down at top to minimize
    if (el && el.scrollTop <= 0 && deltaY > 60 && !this.isMinimized()) {
      this.isMinimized.set(true);
    } 
    // Pull up anywhere or scroll up to expand
    else if (el && deltaY < -60 && this.isMinimized()) {
      this.isMinimized.set(false);
    }
  }

  onViewerScroll(event: Event) {
    const el = event.target as HTMLElement;
    // If user scrolls up (meaning moving content down) while minimized, expand
    if (el.scrollTop < -10 && this.isMinimized()) {
      this.isMinimized.set(false);
    }
    // If user scrolls down inside content, ensure expanded
    if (el.scrollTop > 20 && this.isMinimized()) {
      this.isMinimized.set(false);
    }
  }

  handleDragClick() {
    this.isMinimized.set(!this.isMinimized());
  }

  private initMap(initialCoords?: { lat: number, lng: number }): boolean {
    if (this.map) return true;
    if (!this.mapContainer) return false;

    const center = initialCoords || { lat: 45.6483, lng: 25.5891 };
    this.map = new google.maps.Map(this.mapContainer.nativeElement, {
      center: center,
      zoom: initialCoords ? 16 : 14,
      disableDefaultUI: true,
      gestureHandling: 'greedy',
      styles: this.getMapStyles()
    });
    return true;
  }

  private loadTransitDatabase() {
    this.transitService.loadData().then(() => {
      this.fetchPopularHubs();
      // Initial entrance for hero
      setTimeout(() => this.animateEntrance(), 200);
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
          fillColor: '#1a1a1a',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2
        }
      });
      marker.addListener('click', () => this.selectPlatform(plat));
      this.markers.push(marker);
    });

    if (platforms.length === 1) {
      const pos = { lat: platforms[0].lat, lng: platforms[0].lon };
      this.map.setCenter(pos);
      this.map.setZoom(18);
      // Use a smaller pan offset to keep marker visible above the station viewer
      setTimeout(() => this.map.panBy(0, 150), 100);
    } else {
      // Hub with multiple platforms - use more reasonable padding
      this.map.fitBounds(bounds, { bottom: 160, top: 80, left: 30, right: 30 });
    }
  }

  private getCurrentServiceIds(): string[] {
    const day = new Date().getDay();
    if (day === 0) return ['Sa-Su', 'Su'];
    if (day === 6) return ['Sa-Su', 'Sa'];
    if (day === 5) return ['Mo-Fr', 'green_fridays', 'TE:Mo-Fr'];
    return ['Mo-Fr', 'TE:Mo-Fr'];
  }

  private async fetchRealtimeArrivals(stationLines: any) {
    if (!stationLines) { this.isLoading.set(false); this.isFetchingLines.set(false); return; }
    this.isFetchingLines.set(true);
    
    const arrivals: any[] = [];
    const stationName = this.activeStation()?.name || '';
    
    // Create an array of promises for parallel fetching
    const fetchPromises = Object.keys(stationLines).map(async (lineKey) => {
      const lineData = stationLines[lineKey];
      const shortLine = lineData.name || lineKey.split('_')[0];
      
      // Fallback to static timetable calculation
      const now = new Date();
      const curH = now.getHours();
      const curM = now.getMinutes();
      const currentServiceIds = this.getCurrentServiceIds();
      
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
          if (diff < bestEta) { 
            bestEta = diff; 
            scheduledTime = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`; 
          }
        }
      });

      if (bestEta !== Infinity) {
        arrivals.push({
          line: lineKey, 
          shortLine: shortLine,
          target: lineData.target, 
          eta: bestEta.toString(), 
          scheduledTime,
          color: lineData.color, 
          textColor: lineData.textColor, 
          timetable: lineData.timetable,
          isLive: false
        });
      }
    });

    await Promise.all(fetchPromises);
    this.finalizeArrivals(arrivals);
  }

  private finalizeArrivals(arrivals: any[]) {
    this.activeStation.update(s => {
      if (!s) return s;
      const lineGroups = new Map<string, any[]>();
      arrivals.forEach((arr: any) => {
        if (!lineGroups.has(arr.shortLine)) lineGroups.set(arr.shortLine, []);
        lineGroups.get(arr.shortLine)!.push(arr);
      });
      const stationName = this.normalizeText(this.activeStation()?.name || '');
      let processedArrivals = Array.from(lineGroups.values()).map(group => {
        group.sort((a,b) => parseInt(a.eta) - parseInt(b.eta));
        const earliest = group[0];
        const outbound = group.find((a: any) => this.normalizeText(a.target) !== stationName);
        return (outbound && this.normalizeText(earliest.target) === stationName) ? { ...earliest, target: outbound.target } : earliest;
      });
      processedArrivals.sort((a,b) => parseInt(a.eta) - parseInt(b.eta));
      return { ...s, arrivals: processedArrivals.slice(0, 100) };
    });
    this.isFetchingLines.set(false);
    this.isLoading.set(false);

    // Call animation after arrivals are processed
    // Delay animation slightly more to avoid flicker during data bind
    setTimeout(() => this.animateEntrance(), 150);
  }


  displayLimit = signal(15);
  showMore() { this.displayLimit.update(v => v + 15); }

  findNearbyStation(auto: boolean = false) {
    if (!navigator.geolocation) return;
    if (!auto) this.isLoading.set(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (this.locationTimeout) clearTimeout(this.locationTimeout);
        const userLat = pos.coords.latitude;
        const userLon = pos.coords.longitude;
        let closest: any = null;
        let minDist = Infinity;
        
        this.smartStops().forEach((stop: any) => {
          const dist = this.calculateDistance(userLat, userLon, stop.lat, stop.lon);
          if (dist < minDist) {
            minDist = dist;
            closest = stop;
          }
        });

        if (closest) this.selectStation(closest);
        else if (!auto) this.isLoading.set(false);
      },
      () => {
        if (!auto) this.isLoading.set(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
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

