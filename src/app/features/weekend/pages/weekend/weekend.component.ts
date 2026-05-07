import { ChangeDetectionStrategy, Component, signal, computed, afterNextRender } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface Recommendation {
  id: number;
  title: string;
  description: string;
  category: 'Evenimente' | 'Natură' | 'Food' | 'Cultură';
  date: string;
  location: string;
  image: string;
  featured?: boolean;
  time?: string;
  url: string;
}

@Component({
  selector: 'app-weekend',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <main class="weekend-shell">
      <header class="top-nav">
        <button class="back-pill" routerLink="/dashboard">
          <span class="material-icons">arrow_back</span>
          <span class="back-text">Dashboard</span>
        </button>
      </header>

      <section class="page-header">
        <p class="eyebrow">Planuri pentru tine</p>
        <h1>Weekend în Brașov</h1>
        <div class="category-scroll">
          @for (cat of categories; track cat) {
            <button 
              class="pill" 
              [class.active]="selectedCategory() === cat"
              (click)="setCategory(cat)">
              {{ cat }}
            </button>
          }
        </div>
      </section>

      <div class="scroll-content">
        @if (isLoading()) {
          <div class="loading-state">
            <div class="spinner"></div>
            <p>Se încarcă evenimentele...</p>
          </div>
        } @else if (error()) {
          <div class="error-state">
            <span class="material-icons">cloud_off</span>
            <p>{{ error() }}</p>
            <button class="pill" (click)="fetchEvents()">Reîncearcă</button>
          </div>
        } @else {
          <!-- Featured Recommendation -->
          @if (featuredRec(); as rec) {
            <section class="featured-card" (click)="openUrl(rec.url)">
              <div class="card-image" [style.backgroundImage]="'url(' + rec.image + ')'">
                <div class="card-overlay">
                  <span class="badge">RECOMANDAT</span>
                  <div class="card-info">
                    <h2>{{ rec.title }}</h2>
                    <div class="meta">
                      <span><span class="material-icons">calendar_today</span> {{ rec.date }}</span>
                      <span><span class="material-icons">place</span> {{ rec.location }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          }

          <!-- Grid Recommendations -->
          <section class="grid-section">
            @for (rec of filteredRecs(); track rec.id) {
              @if (!rec.featured || selectedCategory() !== 'Toate') {
                <div class="rec-card" (click)="openUrl(rec.url)">
                  <div class="rec-thumb" [style.backgroundImage]="'url(' + rec.image + ')'">
                    <span class="cat-tag">{{ rec.category }}</span>
                  </div>
                  <div class="rec-body">
                    <h3>{{ rec.title }}</h3>
                    <p>{{ rec.description }}</p>
                    <div class="rec-footer">
                      <span class="time">{{ rec.time || rec.date }}</span>
                      <button class="btn-sm">Detalii</button>
                    </div>
                  </div>
                </div>
              }
            }
          </section>

          @if (filteredRecs().length === 0) {
            <div class="empty-state">
              <span class="material-icons">search_off</span>
              <p>Nu am găsit recomandări în această categorie pentru acest weekend.</p>
            </div>
          }
        }
      </div>
    </main>
  `,
  styles: [`
    .weekend-shell {
      min-height: 100dvh;
      background: #fcfcfc;
      font-family: 'Outfit', sans-serif;
      display: flex;
      flex-direction: column;
      color: #1a1a1a;
      padding-bottom: 3rem;
    }

    .top-nav { padding: 1.5rem 1.5rem 0.5rem; }
    .back-pill {
      background: #fff;
      border: 1px solid #eee;
      padding: 0.6rem 1.2rem;
      border-radius: 999px;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #333;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 4px 10px rgba(0,0,0,0.03);
      text-decoration: none;
    }

    .page-header { padding: 1rem 1.5rem 1.5rem; }
    .eyebrow { font-size: 1rem; color: #888; margin: 0; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; }
    h1 { font-size: 2.5rem; font-weight: 800; margin: 0.25rem 0 1.5rem; color: #1a1a1a; letter-spacing: -0.04em; }

    .category-scroll { display: flex; gap: 0.75rem; overflow-x: auto; padding: 0.5rem 0; scrollbar-width: none; }
    .category-scroll::-webkit-scrollbar { display: none; }
    .pill {
      white-space: nowrap;
      padding: 0.75rem 1.5rem;
      background: #fff;
      border: 1px solid #eee;
      border-radius: 999px;
      font-weight: 700;
      font-size: 0.9rem;
      color: #666;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .pill.active { background: #1a1a1a; color: #fff; border-color: #1a1a1a; box-shadow: 0 10px 20px rgba(0,0,0,0.1); }

    .scroll-content { padding: 0 1.5rem; display: flex; flex-direction: column; gap: 2rem; }

    .featured-card {
      height: 350px;
      border-radius: 32px;
      overflow: hidden;
      box-shadow: 0 25px 50px rgba(0,0,0,0.15);
      position: relative;
      cursor: pointer;
      transition: transform 0.3s ease;
    }
    .featured-card:active { transform: scale(0.98); }
    .card-image {
      width: 100%;
      height: 100%;
      background-size: cover;
      background-position: center;
      display: flex;
      align-items: flex-end;
    }
    .card-overlay {
      width: 100%;
      padding: 2rem;
      background: linear-gradient(transparent, rgba(0,0,0,0.8));
      color: #fff;
    }
    .badge {
      background: #ff4500;
      padding: 0.4rem 1rem;
      border-radius: 8px;
      font-size: 0.7rem;
      font-weight: 900;
      letter-spacing: 0.05em;
      margin-bottom: 1rem;
      display: inline-block;
    }
    .card-info h2 { font-size: 1.75rem; font-weight: 800; margin: 0 0 0.75rem; line-height: 1.2; }
    .meta { display: flex; gap: 1.5rem; font-size: 0.85rem; font-weight: 600; opacity: 0.9; }
    .meta .material-icons { font-size: 1rem; vertical-align: middle; margin-right: 0.25rem; }

    .grid-section { display: grid; grid-template-columns: 1fr; gap: 1.5rem; }
    .rec-card {
      background: #fff;
      border-radius: 28px;
      overflow: hidden;
      border: 1px solid #f0f0f0;
      box-shadow: 0 10px 30px rgba(0,0,0,0.03);
      display: flex;
      flex-direction: column;
      cursor: pointer;
      transition: transform 0.2s ease;
    }
    .rec-card:active { transform: scale(0.97); }
    .rec-thumb { height: 180px; background-size: cover; background-position: center; position: relative; }
    .cat-tag {
      position: absolute;
      top: 1rem;
      left: 1rem;
      background: rgba(255,255,255,0.9);
      backdrop-filter: blur(8px);
      padding: 0.4rem 1rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 800;
      color: #1a1a1a;
    }
    .rec-body { padding: 1.25rem; }
    .rec-body h3 { font-size: 1.25rem; font-weight: 800; margin: 0 0 0.5rem; }
    .rec-body p { font-size: 0.9rem; color: #666; line-height: 1.5; margin: 0 0 1.25rem; }
    .rec-footer { display: flex; justify-content: space-between; align-items: center; }
    .time { font-size: 0.85rem; font-weight: 700; color: #aaa; }
    .btn-sm {
      background: #f5f6f8;
      border: none;
      padding: 0.6rem 1.2rem;
      border-radius: 999px;
      font-weight: 800;
      font-size: 0.8rem;
      cursor: pointer;
    }
    .loading-state { padding: 5rem 2rem; text-align: center; color: #888; }
    .spinner { 
      width: 40px; height: 40px; border: 4px solid #eee; border-top-color: #1a1a1a; 
      border-radius: 50%; margin: 0 auto 1rem; animation: spin 1s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .error-state { padding: 4rem 2rem; text-align: center; color: #ff4500; }
    .error-state .material-icons { font-size: 3.5rem; margin-bottom: 1rem; opacity: 0.5; }
    .error-state p { font-weight: 600; margin-bottom: 1.5rem; }
    .empty-state { padding: 4rem 2rem; text-align: center; color: #aaa; }
    .empty-state .material-icons { font-size: 3rem; margin-bottom: 1rem; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WeekendComponent {
  categories = ['Toate', 'Evenimente', 'Natură', 'Food', 'Cultură'];
  selectedCategory = signal<string>('Toate');
  recommendations = signal<Recommendation[]>([]);
  isLoading = signal<boolean>(true);
  error = signal<string | null>(null);

  constructor() {
    afterNextRender(() => {
      this.fetchEvents();
    });
  }

  async fetchEvents() {
    try {
      this.isLoading.set(true);
      // Using a relative path which is safer for both local and Vercel deployments
      const response = await fetch('events.json');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      this.recommendations.set(data);
      this.error.set(null);
    } catch (err: any) {
      console.error('Failed to load events:', err);
      this.error.set('Nu am putut încărca evenimentele. Te rugăm să verifici conexiunea la internet.');
    } finally {
      this.isLoading.set(false);
    }
  }

  featuredRec = computed(() => {
    if (this.selectedCategory() !== 'Toate') return null;
    return this.recommendations().find(r => r.featured);
  });

  filteredRecs = computed(() => {
    const category = this.selectedCategory();
    const recs = this.recommendations();
    if (category === 'Toate') return recs;
    return recs.filter(r => r.category === category);
  });

  setCategory(category: string) {
    this.selectedCategory.set(category);
  }

  openUrl(url: string) {
    window.open(url, '_blank');
  }
}
