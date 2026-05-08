import { ChangeDetectionStrategy, Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface Category {
  id: string;
  name: string;
  image: string;
  textColor: string;
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
        <button class="back-pill" (click)="goBack()">
          <span class="material-icons">arrow_back</span>
          <span class="back-text">{{ currentView() === 'menu' ? 'Dashboard' : 'Categorii' }}</span>
        </button>
      </header>

      @if (currentView() === 'menu') {
        <section class="page-header">
          <p class="eyebrow-accent">RECOMANDĂRI REALE</p>
          <h1 class="main-question">Ce descoperim azi?</h1>
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
          <p class="eyebrow">Recomandări în Brașov</p>
          <h1 class="category-title">{{ selectedCategory()?.name }}</h1>
        </section>

        <div class="recommendations-list">
          @for (rec of filteredRecs(); track rec.id) {
            <div class="rec-card-premium" (click)="openUrl(rec.url)">
              <div class="rec-image" [style.backgroundImage]="'url(' + rec.image + ')'">
                <div class="image-overlay">
                  <span class="location-pill">
                    <span class="material-icons">place</span> {{ rec.location }}
                  </span>
                </div>
              </div>
              <div class="rec-info">
                <h3>{{ rec.title }}</h3>
                <p>{{ rec.description }}</p>
                <div class="rec-meta">
                  <span class="date-tag">{{ rec.date }}</span>
                  <button class="btn-detalii">DETALII</button>
                </div>
              </div>
            </div>
          }

          @if (filteredRecs().length === 0) {
            <div class="empty-state">
              <span class="material-icons">upcoming</span>
              <h3>În curând...</h3>
              <p>Pregătim noi experiențe memorabile în Brașov. Revino curând!</p>
            </div>
          }
        </div>
      }
    </main>
  `,
  styles: [`
    .weekend-shell {
      height: 100vh;
      background: #fff;
      font-family: 'Outfit', sans-serif;
      display: flex;
      flex-direction: column;
      color: #1a1a1a;
      overflow: hidden;
    }

    .top-nav { padding: 1rem 1.25rem 0.5rem; z-index: 20; }
    .back-pill {
      background: rgba(255,255,255,0.8);
      backdrop-filter: blur(10px);
      border: 1px solid #eee;
      padding: 0.5rem 1rem;
      border-radius: 999px;
      display: flex; align-items: center; gap: 0.5rem;
      color: #333; font-weight: 700; cursor: pointer;
    }

    .page-header { padding: 1.5rem 1.5rem 1rem; text-align: left; }
    .page-header.compact { padding: 0.5rem 1.5rem 1rem; }
    
    .eyebrow-accent { font-size: 0.8rem; font-weight: 800; color: #2bcbba; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 0.2rem; }
    .eyebrow { font-size: 0.8rem; font-weight: 800; color: #666; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.2rem; }
    .main-question { font-size: 2.2rem; font-weight: 900; color: #1a1a1a; line-height: 1.1; margin: 0; letter-spacing: -0.04em; }
    .category-title { font-size: 2rem; font-weight: 950; color: #1a1a1a; margin: 0; line-height: 1.1; letter-spacing: -0.03em; }

    .category-grid {
      flex: 1;
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      grid-template-rows: repeat(3, 1fr);
      gap: 1rem;
      padding: 0 1.25rem 2rem;
      overflow-y: auto;
    }

    .cat-card {
      position: relative;
      border-radius: 24px;
      background-size: cover;
      background-position: center;
      background-color: #f0f0f0;
      overflow: hidden;
      cursor: pointer;
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 8px 25px rgba(0,0,0,0.1);
    }

    .cat-card:active { transform: scale(0.95); }

    .card-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(to top, rgba(0,0,0,0.8), transparent 60%);
      display: flex;
      align-items: flex-end;
      padding: 1.25rem;
    }

    .cat-name {
      color: #fff;
      font-size: 1rem;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.02em;
      line-height: 1.1;
    }

    .recommendations-list {
      flex: 1; display: flex; flex-direction: column; gap: 1.5rem;
      padding: 0 1.25rem 2rem; overflow-y: auto;
    }

    .rec-card-premium {
      background: #fff; border-radius: 24px; overflow: hidden;
      box-shadow: 0 10px 30px rgba(0,0,0,0.05); border: 1px solid #f0f0f0;
      display: flex; flex-direction: column; cursor: pointer;
    }

    .rec-image {
      height: 180px; background-size: cover; background-position: center;
      display: flex; align-items: flex-end; padding: 1rem;
    }
    .image-overlay { width: 100%; }
    .location-pill {
      background: rgba(255,255,255,0.9); backdrop-filter: blur(10px);
      padding: 0.35rem 0.75rem; border-radius: 50px; font-size: 0.75rem;
      font-weight: 800; color: #333; display: flex; align-items: center; gap: 0.3rem; width: fit-content;
    }

    .rec-info { padding: 1.25rem; }
    .rec-info h3 { font-size: 1.1rem; font-weight: 900; margin: 0 0 0.5rem; color: #1a1a1a; line-height: 1.2; }
    .rec-info p { font-size: 0.85rem; color: #666; line-height: 1.5; margin-bottom: 1.25rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

    .rec-meta { display: flex; justify-content: space-between; align-items: center; }
    .date-tag { font-size: 0.85rem; font-weight: 800; color: #2bcbba; }
    .btn-detalii {
      background: #1a1a1a; color: #fff; border: none; padding: 0.6rem 1.2rem;
      border-radius: 50px; font-size: 0.75rem; font-weight: 950; text-transform: uppercase;
    }

    .empty-state { padding: 4rem 2rem; text-align: center; color: #aaa; }
    .empty-state .material-icons { font-size: 4rem; margin-bottom: 1rem; opacity: 0.3; }
    .empty-state h3 { font-weight: 900; color: #333; margin-bottom: 0.5rem; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WeekendComponent {
  currentView = signal<'menu' | 'list'>('menu');
  selectedCategory = signal<Category | null>(null);

  categories: Category[] = [
    { id: 'gastronomie', name: 'Gastronomie', image: 'gastronomie.png', textColor: '#fff' },
    { id: 'natura', name: 'Natură', image: 'natura.png', textColor: '#fff' },
    { id: 'plimbare', name: 'Plimbare în oraș', image: 'plimbare.png', textColor: '#fff' },
    { id: 'cultura', name: 'Cultură', image: 'cultura.png', textColor: '#fff' },
    { id: 'experiente', name: 'Experiențe', image: 'experiente.png', textColor: '#fff' },
    { id: 'evenimente', name: 'Evenimente', image: 'evenimente.png', textColor: '#fff' }
  ];

  allRecommendations: Recommendation[] = [
    // --- GASTRONOMIE ---
    {
      id: 0,
      title: "Passport to Eataly @ ARTIS Secret Garden",
      description: "O experiență gastronomică autentică italiană în inima Brașovului.",
      category: "gastronomie",
      date: "Sâmbătă & Duminică",
      location: "ARTIS Secret Garden",
      image: "https://zilesinopti.ro/wp-content/uploads/2026/04/1-Artis-Poza-01-Principala-event.webp",
      url: "https://zilesinopti.ro/evenimente/passport-to-eataly-artis-secret-garden/"
    },
    {
      id: 1,
      title: "Transylvanian Food Market @ Piața Sf. Ioan",
      description: "Produse locale autentice și specialități transilvănene proaspete.",
      category: "gastronomie",
      date: "Duminică, 10:00",
      location: "Piața Sf. Ioan Brașov",
      image: "https://zilesinopti.ro/wp-content/uploads/2026/04/1-header-2.webp",
      url: "https://zilesinopti.ro/evenimente/transylvanian-food-market-piata-sf-ioan/"
    },
    {
      id: 2,
      title: "DJ Night & Special Menu │ Friday",
      description: "O seară cu ritmuri de Lau Maftei și un meniu special creat pentru tine.",
      category: "gastronomie",
      date: "Vineri, 20:00",
      location: "Luther Brasserie & Lounge",
      image: "https://zilesinopti.ro/wp-content/uploads/2026/05/1-Artis-Poza-01-Principala-event.webp",
      url: "https://zilesinopti.ro/evenimente/dj-night-lau-maftei-luther-brasserie/"
    },

    // --- NATURĂ ---
    {
      id: 10,
      title: "Brașov Heroes – cursa cu obstacole",
      description: "Cursa comunității la Lacul Noua. Sport, adrenalină și caritate în natură.",
      category: "natura",
      date: "Sâmbătă, 09:00",
      location: "Lacul Noua",
      image: "https://zilesinopti.ro/wp-content/uploads/2026/04/1-header-2.webp",
      url: "https://zilesinopti.ro/evenimente/brasov-heroes-cursa-lacul-noua/"
    },
    {
      id: 11,
      title: "În căutarea naturii @ Muzeul de Artă",
      description: "O expoziție fascinantă care explorează legătura dintre artă și mediul înconjurător.",
      category: "natura",
      date: "Tot weekend-ul",
      location: "Muzeul de Artă Brașov",
      image: "https://zilesinopti.ro/wp-content/uploads/2026/04/In-cautarea-Naturii.jpg",
      url: "https://zilesinopti.ro/evenimente/in-cautarea-naturii-muzeul-arta-brasov/"
    },

    // --- PLIMBARE ÎN ORAȘ ---
    {
      id: 20,
      title: "Ziua Europei @ Piața Sfatului",
      description: "Sărbătorește diversitatea culturală în inima centrului istoric.",
      category: "plimbare",
      date: "Weekend acesta",
      location: "Piața Sfatului Brașov",
      image: "https://zilesinopti.ro/wp-content/uploads/2026/04/1-Ne-vedem-in-colt-la-Modarom.jpg",
      url: "https://zilesinopti.ro/evenimente/ziua-europei-piata-sfatului-brasov/"
    },
    {
      id: 21,
      title: "Braşov@Acasă @ Casa Mureşenilor",
      description: "O expoziție dedicată istoriei locale și spiritului brașovean de altădată.",
      category: "plimbare",
      date: "Zilnic, 10:00-18:00",
      location: "Muzeul Casa Mureşenilor",
      image: "https://zilesinopti.ro/wp-content/uploads/2026/04/Brasov@Acasa.jpg",
      url: "https://zilesinopti.ro/evenimente/brasovacasa-muzeul-casa-muresenilor/"
    },
    {
      id: 22,
      title: "Ne vedem în colț, la Modarom!",
      description: "Punct de întâlnire iconic și povești despre Brașovul de ieri și de azi.",
      category: "plimbare",
      date: "Sâmbătă, 11:00",
      location: "Biblioteca George Barițiu",
      image: "https://zilesinopti.ro/wp-content/uploads/2026/04/1-Ne-vedem-in-colt-la-Modarom.jpg",
      url: "https://zilesinopti.ro/evenimente/ne-vedem-in-colt-la-modarom-brasov/"
    },

    // --- CULTURĂ ---
    {
      id: 30,
      title: "Festivalul de Teatru “DE-A RÂSU PLÂNSU”",
      description: "Maraton de spectacole de comedie și dramă cu trupe naționale.",
      category: "cultura",
      date: "8-10 Mai 2026",
      location: "Școala Populară de Arte",
      image: "https://zilesinopti.ro/wp-content/uploads/2026/05/Irisi-albi.jpg",
      url: "https://zilesinopti.ro/evenimente/festivalul-de-teatru-de-a-rasu-plansu/"
    },
    {
      id: 31,
      title: "Festivalul Filmului European @ Reduta",
      description: "Cele mai bune producții cinematografice europene ale momentului.",
      category: "cultura",
      date: "Weekend acesta",
      location: "Centrul Cultural Reduta",
      image: "https://zilesinopti.ro/wp-content/uploads/2026/03/a-11.jpg",
      url: "https://zilesinopti.ro/evenimente/festivalul-filmului-european-reduta/"
    },
    {
      id: 32,
      title: "O noapte furtunoasă @ Teatrul Sică",
      description: "Capodopera lui I.L. Caragiale într-o montare modernă și plină de viață.",
      category: "cultura",
      date: "Sâmbătă, 19:00",
      location: "Teatrul Sică Alexandrescu",
      image: "https://zilesinopti.ro/wp-content/uploads/2025/12/600998908_1511397760990564_6280389940685789430_n.jpg",
      url: "https://zilesinopti.ro/evenimente/o-noapte-furtunoasa-sica-alexandrescu/"
    },
    {
      id: 33,
      title: "Rățușca cea urâtă @ Teatrul Arlechino",
      description: "Un spectacol magic pentru cei mici și bucurie pentru întreaga familie.",
      category: "cultura",
      date: "Duminică, 11:00",
      location: "Teatrul Arlechino Brașov",
      image: "https://zilesinopti.ro/wp-content/uploads/2026/05/Irisi-albi.jpg",
      url: "https://zilesinopti.ro/evenimente/ratusca-cea-urata-teatrul-arlechino/"
    },

    // --- EXPERIENȚE ---
    {
      id: 40,
      title: "Tango Meets Opera @ Cercul Militar",
      description: "O fuziune spectaculoasă între pasiunea tangoului și eleganța operei.",
      category: "experiente",
      date: "Sâmbătă, 20:00",
      location: "Cercul Militar Braşov",
      image: "images/experiente.png",
      url: "https://zilesinopti.ro/evenimente/tango-meets-opera-cercul-militar-brasov/"
    },
    {
      id: 41,
      title: "Conferință: Fii Stejar, Nu Broccoli",
      description: "Conferință de dezvoltare personală cu Andy Szekely pentru o viață împlinită.",
      category: "experiente",
      date: "Sâmbătă, 10:00",
      location: "K2 Alpin Resort Poiana",
      image: "images/experiente.png",
      url: "https://zilesinopti.ro/evenimente/conferinta-andy-szekely-k2-alpin-resort/"
    },
    {
      id: 42,
      title: "S.L.I.M Brașov – Talk & Listen #13",
      description: "Seară de dialog, muzică și idei creative în inima librăriei.",
      category: "experiente",
      date: "Vineri, 18:30",
      location: "Cărturești Brașov",
      image: "images/experiente.png",
      url: "https://zilesinopti.ro/evenimente/s-l-i-m-brasov-talk-listen-carturesti/"
    },

    // --- EVENIMENTE ---
    {
      id: 50,
      title: "om la lună @ Rockstadt",
      description: "Un concert plin de emoție și poezie rock în cel mai iubit club rock din oraș.",
      category: "evenimente",
      date: "Vineri, 21:00",
      location: "Rockstadt Brașov",
      image: "images/evenimente.png",
      url: "https://zilesinopti.ro/evenimente/om-la-luna-rockstadt/"
    },
    {
      id: 51,
      title: "Popcorn Music Party @ Kruhnen",
      description: "Cele mai mari hituri și o atmosferă incendiară în Kruhnen Musik Halle.",
      category: "evenimente",
      date: "Sâmbătă, 23:00",
      location: "Kruhnen Musik Halle",
      image: "images/evenimente.png",
      url: "https://zilesinopti.ro/evenimente/popcorn-music-party-kruhnen-musik-halle/"
    },
    {
      id: 52,
      title: "Goldmine Band & Andreea Ciuraru",
      description: "Seară de muzică live de calitate într-un decor autentic irlandez.",
      category: "evenimente",
      date: "Sâmbătă, 20:30",
      location: "O’Peter’s Irish Pub",
      image: "images/evenimente.png",
      url: "https://zilesinopti.ro/evenimente/goldmine-band-andreea-ciuraru-o-peter-s-irish-pub-brasov/"
    },
    {
      id: 53,
      title: "Dani Lupaș @ Amun Skybar",
      description: "Ritmuri moderne și o vedere panoramică spectaculoasă asupra orașului.",
      category: "evenimente",
      date: "Vineri, 22:00",
      location: "Amun Skybar Brașov",
      image: "images/evenimente.png",
      url: "https://zilesinopti.ro/evenimente/dani-lupas-amun-skybar/"
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
