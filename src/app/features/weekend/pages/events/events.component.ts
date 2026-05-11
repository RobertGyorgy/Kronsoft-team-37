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
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <main class="events-shell">
      <header class="page-header-pill">
        <button class="unified-back-btn" (click)="goBack()">
          <span class="material-icons">arrow_back</span> Înapoi
        </button>
        <h1 class="page-title-pill">Evenimente</h1>
      </header>

      <div class="scroll-content">
        @if (currentView() === 'menu') {
          <section class="intro-section">
            <p class="eyebrow-accent">RECOMANDĂRI SMART CITY</p>
            <h2 class="main-headline">Ce descoperim azi în oraș?</h2>
          </section>

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
          <section class="intro-section compact">
            <p class="eyebrow">AGENDA BRAȘOV</p>
            <h2 class="category-title-modern">{{ selectedCategory()?.name }}</h2>
          </section>

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
          </div>
        }
      </div>
    </main>
  `,
  styles: [`
    .events-shell { height: 100vh; width: 100%; overflow: hidden; background: #fff; font-family: 'Outfit', sans-serif; display: flex; flex-direction: column; color: #1a1a1a; }
    .scroll-content { flex: 1; overflow-y: auto; padding-bottom: 3rem; }
    .page-header-pill { display: flex; align-items: center; padding: calc(var(--safe-top) + 1.2rem) 1.5rem 1rem; position: relative; }
    .unified-back-btn { background: none; border: none; color: #333; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 0.3rem; }
    .page-title-pill { font-size: 1.1rem; font-weight: 900; position: absolute; left: 50%; transform: translateX(-50%); margin: 0; }
    .intro-section { padding: 1.5rem 1.5rem 2rem; }
    .intro-section.compact { padding: 0 1.5rem 1.5rem; }
    .eyebrow-accent { font-size: 0.8rem; font-weight: 900; color: #4285f4; letter-spacing: 0.15em; margin-bottom: 0.5rem; }
    .main-headline { font-size: 2.6rem; font-weight: 900; line-height: 1.1; margin: 0; letter-spacing: -0.04em; }
    .category-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.2rem; padding: 0 1.5rem 2rem; }
    .cat-card-modern { height: 220px; border-radius: 32px; background-size: cover; background-position: center; position: relative; overflow: hidden; cursor: pointer; transition: all 0.4s ease; box-shadow: 0 12px 25px rgba(0,0,0,0.1); }
    .card-blur-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.7), transparent 60%); display: flex; align-items: flex-end; padding: 1.5rem; }
    .cat-name-modern { color: #fff; font-size: 1.2rem; font-weight: 900; display: block; }
    .events-list { display: flex; flex-direction: column; gap: 2.5rem; padding: 0 1.5rem 3rem; }
    .event-card-luxury { background: #fff; border-radius: 40px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.08); cursor: pointer; }
    .event-image-wrap { position: relative; height: 260px; }
    .event-img { width: 100%; height: 100%; object-fit: cover; }
    .event-location-badge { position: absolute; top: 1.5rem; right: 1.5rem; background: rgba(255,255,255,0.9); backdrop-filter: blur(10px); padding: 0.6rem 1.2rem; border-radius: 50px; font-size: 0.75rem; font-weight: 900; display: flex; align-items: center; gap: 0.4rem; }
    .event-details-lux { padding: 1.75rem; }
    .event-date-lux { color: #4285f4; font-size: 0.85rem; font-weight: 900; text-transform: uppercase; margin-bottom: 0.5rem; display: block; }
    .event-title-lux { font-size: 1.6rem; font-weight: 950; margin: 0 0 1rem; line-height: 1.1; }
    .btn-primary-lux { width: 100%; background: #4285f4; color: #fff; border: none; padding: 1.1rem; border-radius: 50px; font-size: 0.9rem; font-weight: 900; display: flex; align-items: center; justify-content: center; gap: 0.75rem; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventsComponent {
  currentView = signal<'menu' | 'list'>('menu');
  selectedCategory = signal<Category | null>(null);

  categories: Category[] = [
    { id: 'gastronomie', name: 'Gastronomie', image: 'gastronomy_v2.png' },
    { id: 'cultura', name: 'Cultură', image: 'culture_v2.png' },
    { id: 'evenimente', name: 'Evenimente', image: 'events_v2.png' }
  ];

  allRecommendations: Recommendation[] = [
    { id: 0, title: "Passport to Eataly @ ARTIS", description: "O experiență gastronomică autentică italiană.", category: "gastronomie", date: "Sâmbătă & Duminică", location: "ARTIS Secret Garden", image: "https://zilesinopti.ro/wp-content/uploads/2026/04/1-Artis-Poza-01-Principala-event.webp", url: "https://zilesinopti.ro" },
    { id: 31, title: "O Noapte Furtunoasă - Teatru", description: "Comedia clasică a lui Caragiale.", category: "cultura", date: "Sâmbătă, 19:00", location: "Teatrul Sică Alexandrescu", image: "https://zilesinopti.ro/wp-content/uploads/2025/12/600998908_1511397760990564_6280389940685789430_n.jpg", url: "https://zilesinopti.ro" },
    { id: 50, title: "om la lună: Concert Live", description: "Indie-rock de excepție în Rockstadt.", category: "evenimente", date: "Sâmbătă, 21:00", location: "Rockstadt Brașov", image: "https://zilesinopti.ro/wp-content/uploads/2024/09/om-la-luna.jpg", url: "https://zilesinopti.ro" }
  ];

  filteredRecs = computed(() => this.allRecommendations.filter(r => r.category === this.selectedCategory()?.id));
  selectCategory(cat: Category) { this.selectedCategory.set(cat); this.currentView.set('list'); }
  goBack() { if (this.currentView() === 'list') this.currentView.set('menu'); else window.history.back(); }
  openUrl(url: string) { window.open(url, '_blank'); }
}
