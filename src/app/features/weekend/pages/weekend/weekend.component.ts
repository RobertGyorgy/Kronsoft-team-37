import { ChangeDetectionStrategy, Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface Category {
  id: string;
  name: string;
  color: string;
  textColor: string;
  icon: string;
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
          <h1 class="main-question">Ce fel de activități cauți?</h1>
        </section>

        <div class="category-menu">
          @for (cat of categories; track cat.id) {
            <button 
              class="cat-button" 
              [style.background]="cat.color"
              [style.color]="cat.textColor"
              (click)="selectCategory(cat)">
              <span class="cat-name">{{ cat.name }}</span>
            </button>
          }
        </div>
      } @else {
        <section class="page-header compact">
          <p class="eyebrow">Recomandări</p>
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
                  <button class="btn-detalii">VEZI DETALII</button>
                </div>
              </div>
            </div>
          }

          @if (filteredRecs().length === 0) {
            <div class="empty-state">
              <span class="material-icons">upcoming</span>
              <h3>Coming Soon</h3>
              <p>Pregătim noi experiențe memorabile în Brașov. Revino curând!</p>
            </div>
          }
        </div>
      }

      <!-- Bottom Nav (Wireframe look but functional for dashboard) -->
      <nav class="bottom-nav-wireframe">
        <div class="nav-item" routerLink="/dashboard">
          <span class="material-icons">home</span>
          <span>Home</span>
        </div>
        <div class="nav-item">
          <span class="material-icons">school</span>
          <span>Guides</span>
        </div>
        <div class="nav-item">
          <span class="material-icons">menu_book</span>
          <span>Courses</span>
        </div>
        <div class="nav-item">
          <span class="material-icons">groups</span>
          <span>People</span>
        </div>
      </nav>
    </main>
  `,
  styles: [`
    .weekend-shell {
      height: 100vh;
      background: #fdfdfd;
      font-family: 'Outfit', sans-serif;
      display: flex;
      flex-direction: column;
      color: #1a1a1a;
      overflow: hidden;
      position: relative;
    }

    .top-nav { padding: 1rem 1.25rem 0.5rem; z-index: 20; }
    .back-pill {
      background: #fff;
      border: 1px solid #eee;
      padding: 0.5rem 1rem;
      border-radius: 999px;
      display: flex; align-items: center; gap: 0.5rem;
      color: #333; font-weight: 700; cursor: pointer;
      box-shadow: 0 4px 10px rgba(0,0,0,0.03);
    }

    .page-header { padding: 1.5rem 2rem 1rem; text-align: center; }
    .page-header.compact { text-align: left; padding: 0.5rem 1.5rem 1rem; }
    
    .eyebrow { font-size: 0.8rem; font-weight: 800; color: #ff8a65; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.2rem; }
    .main-question { font-size: 1.8rem; font-weight: 900; color: #ff8a65; line-height: 1.2; margin: 0; }
    .category-title { font-size: 1.8rem; font-weight: 900; color: #1a1a1a; margin: 0; line-height: 1.1; }

    .category-menu {
      flex: 1; display: flex; flex-direction: column; gap: 1rem; padding: 0 1.5rem;
      overflow-y: auto; padding-bottom: 7rem;
    }

    .cat-button {
      width: 100%; min-height: 65px; border: none; border-radius: 20px;
      font-size: 1.2rem; font-weight: 800; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 6px 15px rgba(0,0,0,0.06);
    }
    .cat-button:active { transform: scale(0.97); filter: brightness(0.95); }

    .recommendations-list {
      flex: 1; display: flex; flex-direction: column; gap: 1.5rem;
      padding: 0 1.25rem 7rem; overflow-y: auto;
    }

    .rec-card-premium {
      background: #fff; border-radius: 24px; overflow: hidden;
      box-shadow: 0 10px 30px rgba(0,0,0,0.05); border: 1px solid #f0f0f0;
      display: flex; flex-direction: column; cursor: pointer;
    }

    .rec-image {
      height: 160px; background-size: cover; background-position: center;
      display: flex; align-items: flex-end; padding: 1rem;
    }
    .image-overlay { width: 100%; }
    .location-pill {
      background: rgba(255,255,255,0.9); backdrop-filter: blur(10px);
      padding: 0.35rem 0.75rem; border-radius: 50px; font-size: 0.75rem;
      font-weight: 800; color: #333; display: flex; align-items: center; gap: 0.3rem; width: fit-content;
    }

    .rec-info { padding: 1rem; }
    .rec-info h3 { font-size: 1.1rem; font-weight: 800; margin: 0 0 0.4rem; color: #1a1a1a; line-height: 1.2; }
    .rec-info p { font-size: 0.85rem; color: #666; line-height: 1.4; margin-bottom: 1rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

    .rec-meta { display: flex; justify-content: space-between; align-items: center; }
    .date-tag { font-size: 0.8rem; font-weight: 700; color: #ff8a65; }
    .btn-detalii {
      background: #1a1a1a; color: #fff; border: none; padding: 0.5rem 1rem;
      border-radius: 50px; font-size: 0.7rem; font-weight: 900;
    }

    .empty-state {
      padding: 4rem 2rem; text-align: center; color: #aaa;
    }
    .empty-state .material-icons { font-size: 4rem; margin-bottom: 1rem; opacity: 0.3; }
    .empty-state h3 { font-weight: 900; color: #333; margin-bottom: 0.5rem; }

    .bottom-nav-wireframe {
      position: absolute; bottom: 1.2rem; left: 1.2rem; right: 1.2rem; height: 65px;
      background: #ff8a65; border-radius: 20px; display: flex;
      align-items: center; justify-content: space-around; color: #fff;
      box-shadow: 0 10px 30px rgba(255,138,101,0.3); z-index: 30;
    }
    .nav-item { display: flex; flex-direction: column; align-items: center; gap: 0.1rem; cursor: pointer; }
    .nav-item span:not(.material-icons) { font-size: 0.6rem; font-weight: 800; text-transform: uppercase; }
    .nav-item .material-icons { font-size: 1.3rem; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WeekendComponent {
  currentView = signal<'menu' | 'list'>('menu');
  selectedCategory = signal<Category | null>(null);

  categories: Category[] = [
    { id: 'gastronomie', name: 'Gastronomie', color: '#ff8a65', textColor: '#fff', icon: 'restaurant' },
    { id: 'natura', name: 'Natura', color: '#ffd54f', textColor: '#333', icon: 'forest' },
    { id: 'plimbare', name: 'Plimbare in oras', color: '#ff8a65', textColor: '#fff', icon: 'directions_walk' },
    { id: 'cultura', name: 'Cultura(muzee+program teatru)', color: '#ffd54f', textColor: '#333', icon: 'museum' },
    { id: 'experiente', name: 'Experiente', color: '#ff8a65', textColor: '#fff', icon: 'auto_awesome' }
  ];

  allRecommendations: Recommendation[] = [
    {
      id: 0,
      title: "Passport to Eataly @ ARTIS Secret Garden",
      description: "O experiență gastronomică autentică italiană în inima Brașovului.",
      category: "gastronomie",
      date: "Weekend acesta",
      location: "ARTIS Secret Garden",
      image: "https://zilesinopti.ro/wp-content/uploads/2026/04/1-Artis-Poza-01-Principala-event.webp",
      url: "https://zilesinopti.ro/evenimente/passport-to-eataly-artis-secret-garden/"
    },
    {
      id: 1,
      title: "Brașov Heroes – cursa cu obstacole",
      description: "Cursa comunității la Lacul Noua. Sport, natură și caritate.",
      category: "natura",
      date: "Sâmbătă, 10:00",
      location: "Lacul Noua",
      image: "https://zilesinopti.ro/wp-content/uploads/2026/04/1-header-2.webp",
      url: "https://zilesinopti.ro/evenimente/brasov-heroes-cursa-lacul-noua/"
    },
    {
      id: 2,
      title: "Tur pietonal: Brașovul Medieval",
      description: "Descoperă legendele orașului vechi într-o plimbare ghidată.",
      category: "plimbare",
      date: "Zilnic, 11:00",
      location: "Piața Sfatului",
      image: "https://zilesinopti.ro/wp-content/uploads/2026/04/Brasov@Acasa.jpg",
      url: "https://zilesinopti.ro/evenimente/brasovacasa-muzeul-casa-muresenilor/"
    },
    {
      id: 3,
      title: "Iriși albi @ Muzeul de Artă",
      description: "Expoziție de pictură contemporană și artă modernă.",
      category: "cultura",
      date: "Tot weekend-ul",
      location: "Muzeul de Artă Brașov",
      image: "https://zilesinopti.ro/wp-content/uploads/2026/05/Irisi-albi.jpg",
      url: "https://zilesinopti.ro/evenimente/irisi-albi-muzeul-de-arta-brasov/"
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
      // In a real app we'd use Router.navigate(['/dashboard'])
      window.history.back();
    }
  }

  openUrl(url: string) {
    window.open(url, '_blank');
  }
}
