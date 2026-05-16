import { ChangeDetectionStrategy, Component, signal, inject, computed, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { gsap } from 'gsap';

interface EventItem {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  image: string;
  category: string;
  price?: string;
  link: string;
}

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <main class="events-shell" #container>
      <!-- Standard Unified Header -->
      <header class="standard-header">
        <button class="unified-back-btn" (click)="goBack()">
          <span class="material-icons">arrow_back</span>
          <span>Dashboard</span>
        </button>
      </header>

      <div class="scroll-wrapper">
        <div class="events-content-container">
          <!-- Premium Hero Section -->
          <section class="events-hero">
            <p class="eyebrow-purple">AGENDA CULTURALĂ</p>
            <h1 class="premium-title">
              <span *ngFor="let word of splitByWord('Ce se întâmplă azi în Brașov?')" class="word">
                <span *ngFor="let char of word.split('')" class="char">{{ char }}</span>
                <span class="char">&nbsp;</span>
              </span>
            </h1>
          </section>

          <!-- Search Box (Unified Style) -->
          <div class="search-area">
            <div class="search-box">
              <span class="material-icons">search</span>
              <input type="text" placeholder="Caută eveniment, teatru, concert..." (input)="onSearch($event)">
            </div>
          </div>

          <!-- Events List (Staggered Stack) -->
          <div class="events-stack" #eventsStack>
            @for (event of events(); track event.id) {
              <div class="event-card-premium">
                <div class="image-box">
                  <img [src]="event.image" [alt]="event.title" class="event-img">
                  <div class="img-overlay"></div>
                  <span class="cat-chip">{{ event.category }}</span>
                  <div class="event-date-badge">
                    <span class="d-val">{{ event.date.split(' ')[0] }}</span>
                    <span class="d-mo">{{ event.date.split(' ')[1] }}</span>
                  </div>
                </div>
                
                <div class="details-box">
                  <div class="meta-row">
                    <span class="time-info"><span class="material-icons">schedule</span> {{ event.time }}</span>
                    <span class="price-info">{{ event.price || 'Acces Liber' }}</span>
                  </div>
                  <h3>{{ event.title }}</h3>
                  <div class="location-info">
                    <span class="material-icons">place</span>
                    <span>{{ event.location }}</span>
                  </div>
                  <p>{{ event.description }}</p>
                  
                  <div class="card-action">
                    <span class="view-tag">GHID VIZUAL</span>
                  </div>
                </div>
              </div>
            } @empty {
              <div class="empty-state">
                <span class="material-icons">event_busy</span>
                <h3>Momentan liniște</h3>
                <p>Nu am găsit evenimente pentru această căutare. Încearcă alți termeni!</p>
              </div>
            }
          </div>
        </div>
      </div>
    </main>
  `,
  styles: [`
    .events-shell {
      height: 100dvh;
      width: 100%;
      background: #ffffff;
      font-family: 'Outfit', sans-serif;
      display: flex;
      flex-direction: column;
      color: #1a1a1a;
      overflow: hidden;
    }

    .scroll-wrapper {
      flex: 1;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
      padding-bottom: calc(var(--safe-bottom) + 2rem);
    }

    .events-content-container {
      padding: 0 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .events-hero { margin-top: 0.5rem; }
    
    .eyebrow-purple {
      font-size: 0.75rem;
      font-weight: 950;
      color: #a55eea;
      text-transform: uppercase;
      letter-spacing: 0.2em;
      margin-bottom: 0.75rem;
    }

    .premium-title {
      font-size: 2.8rem;
      font-weight: 900;
      line-height: 1;
      margin: 0;
      letter-spacing: -0.05em;
      color: #1a1a1a;
    }

    .word { display: inline-block; white-space: nowrap; }
    .char { display: inline-block; opacity: 0; transform: translateY(30px); }

    /* Search Box (Match Bus/Parking Style) */
    .search-area { width: 100%; }
    .search-box {
      background: #f5f6f8;
      border-radius: 24px;
      padding: 1.1rem 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      border: 1px solid rgba(0,0,0,0.02);
    }
    .search-box .material-icons { color: #a55eea; font-size: 1.4rem; }
    .search-box input {
      background: transparent;
      border: none;
      outline: none;
      font-family: inherit;
      font-weight: 700;
      font-size: 1rem;
      width: 100%;
      color: #1a1a1a;
    }
    .search-box input::placeholder { color: #aaa; font-weight: 500; }

    .events-stack {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .event-card-premium {
      background: #fff;
      border-radius: 36px;
      overflow: hidden;
      box-shadow: 0 15px 45px rgba(0,0,0,0.06);
      border: 1px solid rgba(0,0,0,0.03);
      cursor: pointer;
      display: flex;
      flex-direction: column;
      opacity: 0;
      transform: translateY(40px);
      transition: transform 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
    }

    .event-card-premium:active { transform: scale(0.97); }

    .image-box {
      height: 240px;
      width: 100%;
      position: relative;
      overflow: hidden;
    }

    .event-img { width: 100%; height: 100%; object-fit: cover; }
    .img-overlay {
      position: absolute; inset: 0;
      background: linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.4));
    }

    .cat-chip {
      position: absolute;
      top: 1.25rem;
      left: 1.25rem;
      background: rgba(165, 94, 234, 0.9);
      backdrop-filter: blur(15px);
      color: #fff;
      padding: 0.5rem 1.1rem;
      border-radius: 50px;
      font-size: 0.75rem;
      font-weight: 900;
      letter-spacing: 0.05em;
    }

    .event-date-badge {
      position: absolute;
      top: 1.25rem;
      right: 1.25rem;
      background: #fff;
      padding: 0.6rem 0.8rem;
      border-radius: 18px;
      display: flex;
      flex-direction: column;
      align-items: center;
      line-height: 1;
      box-shadow: 0 8px 20px rgba(0,0,0,0.1);
    }

    .event-date-badge .d-val { font-size: 1.2rem; font-weight: 950; color: #1a1a1a; }
    .event-date-badge .d-mo { font-size: 0.65rem; font-weight: 800; color: #a55eea; text-transform: uppercase; margin-top: 0.2rem; }

    .details-box { padding: 1.75rem; }

    .meta-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
    }

    .time-info {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.85rem;
      font-weight: 800;
      color: #a55eea;
    }
    .time-info .material-icons { font-size: 1.1rem; }
    
    .price-info {
      font-size: 0.85rem;
      font-weight: 900;
      color: #1a1a1a;
      background: #f8f9fa;
      padding: 0.4rem 0.9rem;
      border-radius: 12px;
    }

    .details-box h3 {
      font-size: 1.6rem;
      font-weight: 950;
      margin: 0 0 0.75rem;
      line-height: 1.1;
      letter-spacing: -0.04em;
      color: #1a1a1a;
    }

    .location-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.95rem;
      font-weight: 700;
      color: #777;
      margin-bottom: 1.25rem;
    }
    .location-info .material-icons { color: #a55eea; font-size: 1.2rem; }

    .details-box p {
      font-size: 0.95rem;
      color: #555;
      line-height: 1.6;
      margin: 0 0 2rem;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .card-action {
      display: flex;
      justify-content: flex-start;
      border-top: 1px solid #f1f1f1;
      padding-top: 1.5rem;
    }

    .view-tag {
      font-size: 0.7rem;
      font-weight: 900;
      color: #a55eea;
      letter-spacing: 0.1em;
      background: #f8f1ff;
      padding: 0.4rem 1rem;
      border-radius: 50px;
    }

    .empty-state {
      padding: 6rem 2rem;
      text-align: center;
      color: #bbb;
    }
    .empty-state .material-icons { font-size: 5rem; margin-bottom: 1.5rem; color: #eee; }
    .empty-state h3 { font-size: 1.5rem; font-weight: 900; color: #444; margin-bottom: 0.5rem; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventsComponent implements AfterViewInit {
  private router = inject(Router);
  @ViewChild('container') container!: ElementRef;

  allEvents = signal<EventItem[]>([
    {
      id: 1,
      title: "Concert Subcarpați - Turneu 'Valea Voltului'",
      description: "Vino să simți vibrația autentică a folclorului underground într-un concert exploziv la Kruhnen Musik Halle. Un mix unic de hip-hop și folclor românesc.",
      date: "15 MAI",
      time: "20:00",
      location: "Kruhnen Musik Halle",
      image: "https://zilesinopti.ro/wp-content/uploads/2024/03/Subcarpati-Valea-Voltului.jpg",
      category: "CONCERT",
      price: "120 RON",
      link: "https://www.iabilet.ro/bilete-brasov-subcarpati-valea-voltului-95431/"
    },
    {
      id: 2,
      title: "Festivalul de Teatru Contemporan",
      description: "Ediția a XXXIV-a aduce pe scenă cele mai revoluționare piese ale momentului. Spectacole premiate și dezbateri culturale.",
      date: "18 MAI",
      time: "19:00",
      location: "Teatrul Sică Alexandrescu",
      image: "https://zilesinopti.ro/wp-content/uploads/2024/04/Festival-Teatru-Contemporan.jpg",
      category: "TEATRU",
      price: "de la 40 RON",
      link: "https://www.teatrulsicaalexandrescu.ro"
    },
    {
      id: 3,
      title: "Street Food Festival Brașov",
      description: "Arome din toată lumea, burgeri artizanali, tacos și delicii asiatice, toate într-o atmosferă relaxată cu DJ set-uri live.",
      date: "22 MAI",
      time: "11:00",
      location: "Parcul Nicolae Titulescu",
      image: "https://zilesinopti.ro/wp-content/uploads/2024/05/Street-Food-Brasov.jpg",
      category: "FESTIVAL",
      link: "https://streetfoodfestival.ro"
    },
    {
      id: 4,
      title: "Jazz in the Park - Tiny Concerts",
      description: "O serie de concerte acustice menite să aducă muzica mai aproape de oameni în spații neconvenționale din centrul istoric.",
      date: "29 MAI",
      time: "18:30",
      location: "Piața Sf. Ioan",
      image: "https://zilesinopti.ro/wp-content/uploads/2024/05/Jazz-Park-Brasov.jpg",
      category: "MUZICĂ",
      price: "Acces Liber",
      link: "https://jazzinthepark.ro"
    }
  ]);

  searchTerm = signal('');
  events = computed(() => {
    const term = this.searchTerm().toLowerCase();
    return this.allEvents().filter(e => 
      e.title.toLowerCase().includes(term) || 
      e.description.toLowerCase().includes(term) ||
      e.category.toLowerCase().includes(term)
    );
  });

  splitByWord(text: string): string[] {
    return text.split(' ');
  }

  ngAfterViewInit() {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 1 } });

    // 1. Title Reveal (Split text)
    tl.to('.premium-title .char', {
      y: 0,
      opacity: 1,
      stagger: 0.02,
    })
    
    // 2. Search Box Slide Up
    .from('.search-box', {
      y: 20,
      opacity: 0,
      duration: 0.8
    }, '-=0.6')

    // 3. Staggered Cards Entrance
    .to('.event-card-premium', {
      y: 0,
      opacity: 1,
      stagger: 0.15,
      duration: 1.2,
      ease: 'expo.out'
    }, '-=0.5');
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }

  onSearch(event: any) {
    this.searchTerm.set(event.target.value);
  }
}
