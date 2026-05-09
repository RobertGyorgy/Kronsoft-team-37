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
    <main class="weekend-shell">
      <header class="top-nav">
        <button class="unified-back-btn" (click)="goBack()">
          <span class="material-icons">arrow_back</span>
          <span>Înapoi</span>
        </button>
      </header>

      @if (currentView() === 'menu') {
        <section class="page-header">
          <p class="eyebrow-accent">RECOMANDĂRI SMART CITY</p>
          <h1 class="main-question">Ce descoperim azi în Brașov?</h1>
        </section>

        <div class="category-grid">
          @for (cat of categories; track cat.id) {
            <div 
              class="cat-card" 
              [style.backgroundImage]="'url(images/' + cat.image + ')'"
              (click)="selectCategory(cat)">
              <div class="card-overlay">
                <span class="cat-name">{{ cat.name }}</span>
              </div>
            </div>
          }
        </div>
      } @else {
        <section class="page-header compact">
          <p class="eyebrow">AGENDA WEEKEND</p>
          <h1 class="category-title">{{ selectedCategory()?.name }}</h1>
        </section>

        <div class="recommendations-list">
          @for (rec of filteredRecs(); track rec.id) {
            <div class="rec-card-premium" (click)="openUrl(rec.url)">
              <div class="rec-image-container">
                <img [src]="rec.image" [alt]="rec.title" class="event-photo">
                <div class="image-shade"></div>
                <span class="location-pill">
                  <span class="material-icons">place</span> {{ rec.location }}
                </span>
              </div>
              <div class="rec-info">
                <div class="info-top">
                  <h3>{{ rec.title }}</h3>
                  <span class="date-tag">{{ rec.date }}</span>
                </div>
                <p>{{ rec.description }}</p>
                <div class="rec-footer">
                  <button class="btn-detalii-premium">
                    CITEȘTE MAI MULT
                    <span class="material-icons">open_in_new</span>
                  </button>
                </div>
              </div>
            </div>
          }

          @if (filteredRecs().length === 0) {
            <div class="empty-state">
              <span class="material-icons">upcoming</span>
              <h3>Pregătim noi evenimente</h3>
              <p>Momentan nu am găsit evenimente active pentru această categorie. Revino curând!</p>
            </div>
          }
        </div>
      }
    </main>
  `,
  styles: [`
    .weekend-shell {
      height: 100vh;
      width: 100%;
      overflow-x: hidden;
      background: #f8f9fa;
      font-family: 'Outfit', sans-serif;
      display: flex;
      flex-direction: column;
      color: #1a1a1a;
      position: relative;
    }

    .top-nav { padding: calc(var(--safe-top) + 1.2rem) 1.5rem 1rem; z-index: 20; }
    .back-pill {
      background: #fff;
      border: 1px solid rgba(0,0,0,0.05);
      padding: 0.6rem 1.2rem;
      border-radius: 999px;
      display: flex; align-items: center; gap: 0.5rem;
      color: #333; font-weight: 800; cursor: pointer;
      box-shadow: 0 4px 15px rgba(0,0,0,0.03);
      transition: all 0.2s ease;
    }
    .back-pill:active { transform: scale(0.96); background: #f0f0f0; }

    .page-header { padding: 0.5rem 1.5rem 1.25rem; text-align: left; }
    .page-header.compact { padding: 0 1.5rem 1rem; }
    
    .eyebrow-accent { font-size: 0.75rem; font-weight: 900; color: #2bcbba; text-transform: uppercase; letter-spacing: 0.2em; margin-bottom: 0.4rem; }
    .eyebrow { font-size: 0.75rem; font-weight: 900; color: #888; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 0.4rem; }
    .main-question { font-size: 2.4rem; font-weight: 900; color: #1a1a1a; line-height: 1; margin: 0; letter-spacing: -0.05em; }
    .category-title { font-size: 2.2rem; font-weight: 950; color: #1a1a1a; margin: 0; line-height: 1; letter-spacing: -0.04em; }

    .category-grid {
      flex: 1;
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      grid-template-rows: repeat(3, 1fr);
      gap: 1rem;
      padding: 0 1.5rem 2rem;
      overflow-y: auto;
    }

    .cat-card {
      position: relative;
      border-radius: 28px;
      background-size: cover;
      background-position: center;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    }
    .cat-card:active { transform: scale(0.94); }

    .card-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(to top, rgba(0,0,0,0.85), transparent 70%);
      display: flex;
      align-items: flex-end;
      padding: 1.5rem;
    }

    .cat-name {
      color: #fff;
      font-size: 1.1rem;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .recommendations-list {
      flex: 1; display: flex; flex-direction: column; gap: 2rem;
      padding: 0 1.5rem 2.5rem; overflow-y: auto;
    }

    .rec-card-premium {
      background: #fff; border-radius: 32px; overflow: hidden;
      box-shadow: 0 15px 40px rgba(0,0,0,0.06); border: 1px solid rgba(0,0,0,0.03);
      display: flex; flex-direction: column; cursor: pointer;
      transition: transform 0.3s ease;
    }
    .rec-card-premium:active { transform: scale(0.98); }

    .rec-image-container {
      position: relative; height: 220px; width: 100%; overflow: hidden;
    }
    .event-photo {
      width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease;
    }
    .image-shade {
      position: absolute; inset: 0;
      background: linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.4));
    }
    .location-pill {
      position: absolute; bottom: 1.25rem; left: 1.25rem;
      background: rgba(255,255,255,0.95); backdrop-filter: blur(15px);
      padding: 0.5rem 1rem; border-radius: 50px; font-size: 0.8rem;
      font-weight: 800; color: #1a1a1a; display: flex; align-items: center; gap: 0.4rem;
      box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    }

    .rec-info { padding: 1.5rem; }
    .info-top { display: flex; flex-direction: column; gap: 0.4rem; margin-bottom: 1rem; }
    .rec-info h3 { font-size: 1.35rem; font-weight: 900; margin: 0; color: #1a1a1a; line-height: 1.2; letter-spacing: -0.02em; }
    .date-tag { font-size: 0.9rem; font-weight: 800; color: #2bcbba; }
    
    .rec-info p { 
      font-size: 0.95rem; color: #555; line-height: 1.6; margin: 0 0 1.5rem;
      display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; 
    }

    .rec-footer { display: flex; justify-content: flex-start; }
    .btn-detalii-premium {
      background: #1a1a1a; color: #fff; border: none; padding: 0.8rem 1.5rem;
      border-radius: 50px; font-size: 0.8rem; font-weight: 950; 
      display: flex; align-items: center; gap: 0.6rem; letter-spacing: 0.05em;
    }

    .empty-state { padding: 5rem 2rem; text-align: center; color: #aaa; }
    .empty-state .material-icons { font-size: 5rem; margin-bottom: 1.5rem; color: #eee; }
    .empty-state h3 { font-weight: 900; color: #444; margin-bottom: 0.75rem; font-size: 1.4rem; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WeekendComponent {
  currentView = signal<'menu' | 'list'>('menu');
  selectedCategory = signal<Category | null>(null);

  categories: Category[] = [
    { id: 'gastronomie', name: 'Gastronomie', image: 'gastronomie.png' },
    { id: 'natura', name: 'Natură', image: 'natura.png' },
    { id: 'plimbare', name: 'Plimbare în oraș', image: 'plimbare.png' },
    { id: 'cultura', name: 'Cultură', image: 'cultura.png' },
    { id: 'experiente', name: 'Experiențe', image: 'experiente.png' },
    { id: 'evenimente', name: 'Evenimente', image: 'evenimente.png' }
  ];

  allRecommendations: Recommendation[] = [
    // --- GASTRONOMIE ---
    {
      id: 0,
      title: "Passport to Eataly @ ARTIS Secret Garden",
      description: "O experiență gastronomică autentică italiană în inima Brașovului. Savurează aromele Italiei într-un cadru de poveste.",
      category: "gastronomie",
      date: "Weekend-ul acesta",
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
      location: "Piața Sf. Ioan Brașov",
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

    // --- PLIMBARE ÎN ORAȘ ---
    {
      id: 21,
      title: "Braşov@Acasă: Istoria la Pas",
      description: "O expoziție inedită care te invită să descoperi poveștile ascunse ale clădirilor și oamenilor din Brașov.",
      category: "plimbare",
      date: "Zilnic",
      location: "Muzeul Casa Mureşenilor",
      image: "https://zilesinopti.ro/wp-content/uploads/2026/04/Brasov@Acasa.jpg",
      url: "https://zilesinopti.ro/evenimente/brasovacasa-muzeul-casa-muresenilor/"
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
    {
      id: 32,
      title: "Iriși Albi @ Muzeul de Artă",
      description: "O expoziție rară dedicată simbolismului florii de iris în arta plastică românească contemporană.",
      category: "cultura",
      date: "Tot Weekend-ul",
      location: "Muzeul de Artă Brașov",
      image: "https://zilesinopti.ro/wp-content/uploads/2026/05/Irisi-albi.jpg",
      url: "https://zilesinopti.ro/evenimente/irisi-albi-muzeul-de-arta-brasov/"
    },

    // --- EXPERIENȚE (NOI) ---
    {
      id: 40,
      title: "Zbor cu Parapanta @ Bunloc",
      description: "Trăiește libertatea absolută! Decolează de pe Vârful Bunloc (1200m) și bucură-te de o panoramă incredibilă deasupra Brașovului.",
      category: "experiente",
      date: "În funcție de meteo",
      location: "Bunloc, Săcele",
      image: "https://zilesinopti.ro/wp-content/uploads/2026/04/In-cautarea-Naturii.jpg", // Placeholder real looking
      url: "https://parapantabrasov.ro"
    },
    {
      id: 41,
      title: "Aventura cu Balonul la Răsărit",
      description: "O experiență magică și liniștită. Plutește deasupra cetăților medievale din Transilvania într-un zbor de neuitat la răsăritul soarelui.",
      category: "experiente",
      date: "Zilnic (Meteo dependent)",
      location: "Zona Brașov - Transilvania",
      image: "https://zilesinopti.ro/wp-content/uploads/2026/04/1-Artis-Poza-01-Principala-event.webp", // Placeholder
      url: "https://extasy.ro/experienta/zbor-cu-balonul-cu-aer-cald-in-zona-brasovului"
    },
    {
      id: 42,
      title: "Tur VIP cu Elicopterul Airbus",
      description: "Descoperă Brașovul și Castelul Bran de la înălțime într-un zbor privat de lux. O experiență exclusivistă cu un elicopter Airbus modern.",
      category: "experiente",
      date: "La cerere",
      location: "Heliport Brașov",
      image: "https://zilesinopti.ro/wp-content/uploads/2026/04/1-header-2.webp", // Placeholder
      url: "https://experimenteaza.ro/zbor-cu-elicopterul"
    },

    // --- EVENIMENTE ---
    {
      id: 50,
      title: "om la lună: Concert Live",
      description: "Una dintre cele mai iubite trupe de indie-rock din România revine la Brașov pentru un concert plin de trăire în clubul Rockstadt.",
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
