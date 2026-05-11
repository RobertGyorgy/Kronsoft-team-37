import { ChangeDetectionStrategy, Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface Category {
  id: string;
  name: string;
  image: string;
}

interface Recommendation {
  id: number;
  title: string;
  description: string;
  category: string;
  date: string;
  location: string;
  image: string;
  url: string;
}

@Component({
  selector: 'app-weekend',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <main class="events-shell">
      <!-- 1. HEADER PILL -->
      <header class="page-header-pill">
        <button class="unified-back-btn" (click)="goBack()">
          <span class="material-icons">arrow_back</span> Înapoi
        </button>
        <h1 class="page-title-pill">Evenimente</h1>
      </header>

      <div class="scroll-content">
        @if (currentView() === 'menu') {
          <!-- 2. INTRO SECTION -->
          <section class="intro-section">
            <p class="eyebrow-accent">DESCOPERĂ BRAȘOVUL</p>
            <h2 class="main-headline">Ce descoperim azi în oraș?</h2>
          </section>

          <!-- 3. CATEGORY GRID -->
          <div class="category-grid">
            @for (cat of categories; track cat.id) {
              <div 
                class="cat-card-modern" 
                [style.backgroundImage]="'url(assets/images/' + cat.image + ')'"
                (click)="selectCategory(cat)">
                <div class="card-blur-overlay">
                  <div class="cat-info-wrap">
                    <span class="cat-name-modern">{{ cat.name }}</span>
                    <span class="cat-action">VEZI TOT <span class="material-icons">chevron_right</span></span>
                  </div>
                </div>
              </div>
            }
          </div>
        } @else {
          <!-- 4. LIST VIEW HEADER -->
          <section class="intro-section compact">
            <p class="eyebrow">AGENDA BRAȘOV</p>
            <h2 class="category-title-modern">{{ selectedCategory()?.name }}</h2>
          </section>

          <!-- 5. EVENTS LIST -->
          <div class="events-list">
            @for (rec of filteredRecs(); track rec.id) {
              <div class="event-card-luxury" (click)="openUrl(rec.url)">
                <div class="event-image-wrap">
                  <img [src]="rec.image" [alt]="rec.title" class="event-img">
                  <div class="event-overlay"></div>
                  <div class="event-location-badge">
                    <span class="material-icons">place</span> {{ rec.location }}
                  </div>
                </div>
                <div class="event-details-lux">
                  <span class="event-date-lux">{{ rec.date }}</span>
                  <h3 class="event-title-lux">{{ rec.title }}</h3>
                  <p class="event-desc-lux">{{ rec.description }}</p>
                  <div class="event-footer-lux">
                    <button class="btn-primary-lux">
                      DETALII EVENIMENT
                      <span class="material-icons">arrow_forward</span>
                    </button>
                  </div>
                </div>
              </div>
            }

            @if (filteredRecs().length === 0) {
              <div class="empty-state-lux">
                <div class="empty-icon-wrap">
                  <span class="material-icons">calendar_today</span>
                </div>
                <h3>Pregătim noi evenimente</h3>
                <p>Momentan nu am găsit evenimente active pentru această categorie. Revino curând!</p>
              </div>
            }
          </div>
        }
      </div>
    </main>
  `,
  styles: [`
    .events-shell {
      height: 100vh;
      width: 100%;
      overflow: hidden;
      background: #ffffff;
      font-family: 'Outfit', sans-serif;
      display: flex;
      flex-direction: column;
      color: #1a1a1a;
    }

    .scroll-content {
      flex: 1;
      overflow-y: auto;
      padding-bottom: 3rem;
      scroll-behavior: smooth;
    }

    /* 1. HEADER PILL STYLE */
    .page-header-pill {
      display: flex;
      align-items: center;
      padding: calc(var(--safe-top) + 1.2rem) 1.5rem 1rem;
      position: relative;
      background: #fff;
      z-index: 100;
    }
    .unified-back-btn {
      background: none;
      border: none;
      color: #333;
      font-weight: 800;
      font-size: 1rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.3rem;
    }
    .page-title-pill {
      font-size: 1.1rem;
      font-weight: 900;
      color: #1a1a1a;
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      margin: 0;
    }

    /* 2. INTRO SECTION */
    .intro-section { padding: 1.5rem 1.5rem 2rem; }
    .intro-section.compact { padding: 0 1.5rem 1.5rem; }
    .eyebrow-accent { font-size: 0.8rem; font-weight: 900; color: #4285f4; letter-spacing: 0.15em; margin-bottom: 0.5rem; }
    .eyebrow { font-size: 0.8rem; font-weight: 900; color: #888; letter-spacing: 0.1em; margin-bottom: 0.5rem; }
    .main-headline { font-size: 2.6rem; font-weight: 900; color: #1a1a1a; line-height: 1.1; margin: 0; letter-spacing: -0.04em; }
    .category-title-modern { font-size: 2.2rem; font-weight: 900; color: #1a1a1a; margin: 0; line-height: 1; letter-spacing: -0.03em; }

    /* 3. CATEGORY GRID - MODERN */
    .category-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.2rem;
      padding: 0 1.5rem 2rem;
    }

    .cat-card-modern {
      height: 220px;
      border-radius: 32px;
      background-size: cover;
      background-position: center;
      position: relative;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      box-shadow: 0 12px 25px rgba(0,0,0,0.1);
    }
    .cat-card-modern:active { transform: scale(0.95); }

    .card-blur-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(to top, rgba(0,0,0,0.7), transparent 60%);
      display: flex;
      align-items: flex-end;
      padding: 1.5rem;
    }

    .cat-info-wrap { width: 100%; }
    .cat-name-modern { color: #fff; font-size: 1.2rem; font-weight: 900; display: block; margin-bottom: 0.25rem; }
    .cat-action { color: rgba(255,255,255,0.7); font-size: 0.7rem; font-weight: 800; display: flex; align-items: center; gap: 0.2rem; }

    /* 4. EVENTS LIST - LUXURY */
    .events-list { display: flex; flex-direction: column; gap: 2.5rem; padding: 0 1.5rem 3rem; }

    .event-card-luxury {
      background: #fff;
      border-radius: 40px;
      overflow: hidden;
      box-shadow: 0 20px 40px rgba(0,0,0,0.08);
      cursor: pointer;
      transition: transform 0.3s ease;
    }
    .event-card-luxury:active { transform: scale(0.98); }

    .event-image-wrap { position: relative; height: 260px; overflow: hidden; }
    .event-img { width: 100%; height: 100%; object-fit: cover; }
    .event-overlay { position: absolute; inset: 0; background: linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.3)); }
    .event-location-badge {
      position: absolute; top: 1.5rem; right: 1.5rem;
      background: rgba(255,255,255,0.9); backdrop-filter: blur(10px);
      padding: 0.6rem 1.2rem; border-radius: 50px; font-size: 0.75rem;
      font-weight: 900; color: #1a1a1a; display: flex; align-items: center; gap: 0.4rem;
      box-shadow: 0 8px 15px rgba(0,0,0,0.1);
    }

    .event-details-lux { padding: 1.75rem; }
    .event-date-lux { color: #4285f4; font-size: 0.85rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 0.5rem; }
    .event-title-lux { font-size: 1.6rem; font-weight: 950; color: #1a1a1a; margin: 0 0 1rem; line-height: 1.1; letter-spacing: -0.02em; }
    .event-desc-lux { font-size: 1rem; color: #555; line-height: 1.6; margin: 0 0 1.5rem; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }

    .event-footer-lux { border-top: 1px solid #f0f0f0; padding-top: 1.5rem; }
    .btn-primary-lux {
      width: 100%;
      background: #4285f4;
      color: #fff;
      border: none;
      padding: 1.1rem;
      border-radius: 50px;
      font-size: 0.9rem;
      font-weight: 900;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      box-shadow: 0 8px 20px rgba(66,133,244,0.3);
    }

    .empty-state-lux { padding: 4rem 2rem; text-align: center; }
    .empty-icon-wrap { width: 80px; height: 80px; background: #f0f7ff; border-radius: 30px; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; }
    .empty-icon-wrap .material-icons { font-size: 2.5rem; color: #4285f4; }
    .empty-state-lux h3 { font-size: 1.5rem; font-weight: 900; margin-bottom: 0.75rem; }
    .empty-state-lux p { color: #888; line-height: 1.6; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WeekendComponent {
  currentView = signal<'menu' | 'list'>('menu');
  selectedCategory = signal<Category | null>(null);

  categories: Category[] = [
    { id: 'gastronomie', name: 'Gastronomie', image: 'gastronomy_v2.png' },
    { id: 'natura', name: 'Natură', image: 'nature_v2.png' },
    { id: 'cultura', name: 'Cultură', image: 'culture_v2.png' },
    { id: 'evenimente', name: 'Evenimente', image: 'events_v2.png' },
    { id: 'plimbare', name: 'Plimbare', image: 'plimbare.png' },
    { id: 'experiente', name: 'Experiențe', image: 'experiente.png' }
  ];

  allRecommendations: Recommendation[] = [
    // --- GASTRONOMIE ---
    {
      id: 0,
      title: "Passport to Eataly @ ARTIS Secret Garden",
      description: "O experiență gastronomică autentică italiană în inima Brașovului. Savurează aromele Italiei într-un cadru de poveste.",
      category: "gastronomie",
      date: "Sâmbătă & Duminică",
      location: "ARTIS Secret Garden",
      image: "https://zilesinopti.ro/wp-content/uploads/2026/04/1-Artis-Poza-01-Principala-event.webp",
      url: "https://zilesinopti.ro/evenimente/passport-to-eataly-artis-secret-garden/"
    },
    {
      id: 1,
      title: "Transylvanian Food Market @ Piața Sf. Ioan",
      description: "Descoperă cei mai buni producători locali din Transilvania. Brânzeturi, mezeluri artizanale și delicii tradiționale.",
      category: "gastronomie",
      date: "Duminică, 10:00 - 16:00",
      location: "Piața Sf. Ioan",
      image: "https://zilesinopti.ro/wp-content/uploads/2026/04/1-header-2.webp",
      url: "https://zilesinopti.ro/evenimente/transylvanian-food-market-piata-sf-ioan/"
    },

    // --- NATURĂ ---
    {
      id: 10,
      title: "Brașov Heroes – Cursa Comunității",
      description: "Cursa cu obstacole la Lacul Noua. Aleargă pentru o cauză nobilă și bucură-te de aerul curat de munte.",
      category: "natura",
      date: "Sâmbătă, 09:00",
      location: "Parcul Noua",
      image: "https://zilesinopti.ro/wp-content/uploads/2026/04/1-header-2.webp",
      url: "https://zilesinopti.ro/evenimente/brasov-heroes-cursa-lacul-noua/"
    },

    // --- CULTURĂ ---
    {
      id: 31,
      title: "O Noapte Furtunoasă - Teatru Sică",
      description: "Vino să revezi comedia clasică a lui Caragiale într-o viziune regizorală proaspătă și surprinzătoare.",
      category: "cultura",
      date: "Sâmbătă, 19:00",
      location: "Teatrul Sică Alexandrescu",
      image: "https://zilesinopti.ro/wp-content/uploads/2025/12/600998908_1511397760990564_6280389940685789430_n.jpg",
      url: "https://zilesinopti.ro/evenimente/o-noapte-furtunoasa-sica-alexandrescu/"
    },

    // --- EVENIMENTE ---
    {
      id: 50,
      title: "om la lună: Concert Live",
      description: "Una dintre cele mai iubite trupe de indie-rock din România revine la Brașov pentru un concert plin de trăire.",
      category: "evenimente",
      date: "Sâmbătă, 21:00",
      location: "Rockstadt Brașov",
      image: "https://zilesinopti.ro/wp-content/uploads/2024/09/om-la-luna.jpg",
      url: "https://zilesinopti.ro/evenimente/om-la-luna-rockstadt/"
    }
  ];

  filteredRecs = computed(() => {
    const catId = this.selectedCategory()?.id;
    return this.allRecommendations.filter(r => r.category === catId);
  });

  selectCategory(cat: Category) {
    this.selectedCategory.set(cat);
    this.currentView.set('list');
    // Scroll to top
    const scrollArea = document.querySelector('.scroll-content');
    if (scrollArea) scrollArea.scrollTop = 0;
  }

  goBack() {
    if (this.currentView() === 'list') {
      this.currentView.set('menu');
    } else {
      window.history.back();
    }
  }

  openUrl(url: string) {
    window.open(url, '_blank');
  }
}
