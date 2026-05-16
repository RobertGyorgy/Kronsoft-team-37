import { ChangeDetectionStrategy, Component, signal, inject, AfterViewInit, ElementRef, ViewChild, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { GeminiService } from '../../../../core/services/gemini.service';
import { gsap } from 'gsap';

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  shadow: string;
  questions: { id: string; text: string; options: string[] }[];
}

interface Recommendation {
  name: string;
  description: string;
  tip: string;
  link?: string;
}

@Component({
  selector: 'app-weekend',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <main class="weekend-container">

      <!-- HEADER -->
      <header class="standard-header">
        <button class="unified-back-btn" routerLink="/dashboard">
          <span class="material-icons">arrow_back</span>
          <span>Înapoi</span>
        </button>
      </header>

      <!-- VIEW: Meniu Categorii -->
      @if (view() === 'menu') {
        <div class="content-zone animate-in">
          <div class="page-title-group">
            <h1 class="page-title">Explorează<br>Brașovul</h1>
            <p class="page-subtitle">Alege o direcție și primești 3 recomandări personalizate.</p>
          </div>

          <section class="interaction-grid">
            @for (cat of categories; track $index) {
              <div class="grid-card" [style.background]="cat.color" [style.box-shadow]="cat.shadow" (click)="pickCategory(cat)">
                <span class="material-icons card-bg-icon">{{ cat.icon }}</span>
                <span class="card-title">{{ cat.name }}</span>
              </div>
            }
          </section>
        </div>
      }

      <!-- VIEW: Chestionar -->
      @else if (view() === 'quiz') {
        <div class="content-zone quiz-zone">
          <!-- Progress -->
          <div class="quiz-progress">
            <div class="progress-track">
              <div class="progress-fill" [style.width.%]="(step() / 3) * 100" [style.background]="activeCategory()?.color"></div>
            </div>
            <span class="progress-label">PASUL {{ step() }} DIN 3</span>
          </div>

          <!-- Întrebare -->
          <div class="quiz-body" #quizBody>
            <h2 class="question-text">{{ activeCategory()?.questions?.[step() - 1]?.text }}</h2>

            <div class="answers-grid">
              @for (opt of activeCategory()?.questions?.[step() - 1]?.options; track $index) {
                <button class="answer-btn" [style.border-color]="activeCategory()?.color" (click)="answer(opt)">
                  <span class="answer-label">{{ opt }}</span>
                  <span class="material-icons answer-arrow" [style.color]="activeCategory()?.color">east</span>
                </button>
              }
            </div>
          </div>
        </div>
      }

      <!-- VIEW: Loading -->
      @else if (view() === 'loading') {
        <div class="content-zone loading-zone">
          <div class="loader-ring" [style.border-top-color]="activeCategory()?.color"></div>
          <h2 class="loading-title">Explorăm orașul...</h2>
          <p class="loading-sub">Căutăm cele mai bune locuri pentru tine.</p>
        </div>
      }

      <!-- VIEW: Rezultate -->
      @else if (view() === 'results') {
        <div class="content-zone results-zone">
          <div class="results-header">
            <span class="results-badge" [style.background]="activeCategory()?.color">RECOMANDAT PENTRU TINE</span>
            <h2 class="results-title">{{ activeCategory()?.name }}</h2>
            <p class="results-subtitle">3 locuri selectate pe baza preferințelor tale.</p>
          </div>

          <div class="results-list">
            @for (rec of recs(); track $index; let i = $index) {
              <div class="result-card">
                <div class="result-number" [style.background]="activeCategory()?.color">{{ i + 1 }}</div>
                <div class="result-body">
                  <div class="result-header-row">
                    <h3 class="result-name">{{ rec.name }}</h3>
                  </div>
                  <p class="result-desc">{{ rec.description }}</p>
                  <div class="result-tip">
                    <span class="material-icons tip-icon" [style.color]="activeCategory()?.color">lightbulb</span>
                    <span class="tip-text">{{ rec.tip }}</span>
                  </div>
                </div>
              </div>
            }
          </div>

          <button class="restart-btn" (click)="restart()">
            <span class="material-icons">refresh</span>
            CAUTĂ ALTCEVA
          </button>
        </div>
      }

    </main>
  `,
  styles: [`
    /* ────── Container ────── */
    .weekend-container {
      height: 100dvh;
      width: 100%;
      overflow-x: hidden;
      overflow-y: auto;
      background: #ffffff;
      font-family: 'Outfit', sans-serif;
      display: flex;
      flex-direction: column;
      -webkit-overflow-scrolling: touch;
    }

    .content-zone {
      flex: 1;
      padding: 0 1.25rem calc(var(--safe-bottom) + 2rem);
      display: flex;
      flex-direction: column;
    }

    /* ────── Titlu pagină ────── */
    .page-title-group { margin-bottom: 1.5rem; }
    .page-title {
      font-size: 2.4rem;
      font-weight: 800;
      color: #1a1a1a;
      letter-spacing: -0.05em;
      line-height: 1.1;
      margin: 0;
    }
    .page-subtitle {
      font-size: 0.9rem;
      font-weight: 500;
      color: #888;
      margin-top: 0.3rem;
    }
    .page-title-group {
      margin-bottom: 1.2rem;
    }

    /* ────── Grid identic cu Dashboard ────── */
    .interaction-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
      flex: 1;
    }
    .grid-card {
      position: relative;
      border-radius: 24px;
      padding: 1.2rem;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      align-items: flex-start;
      overflow: hidden;
      cursor: pointer;
      min-height: 105px;
      transition: transform 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
    }
    .grid-card:active { transform: scale(0.96); }
    .card-bg-icon {
      position: absolute;
      top: 10%;
      right: -5%;
      font-size: 5rem !important;
      opacity: 0.15;
      color: #fff;
      transform: rotate(-10deg);
      pointer-events: none;
    }
    .card-title {
      font-size: 1rem;
      font-weight: 800;
      color: #fff;
      line-height: 1.1;
      z-index: 2;
      letter-spacing: -0.01em;
    }

    /* ────── Quiz ────── */
    .quiz-zone { justify-content: flex-start; padding-top: 0.5rem; }
    .quiz-progress { margin-bottom: 2rem; }
    .progress-track {
      height: 4px;
      background: #f0f0f0;
      border-radius: 10px;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      border-radius: 10px;
      transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .progress-label {
      display: block;
      margin-top: 0.6rem;
      font-size: 0.7rem;
      font-weight: 800;
      color: #bbb;
      letter-spacing: 0.15em;
    }

    .quiz-body { flex: 1; display: flex; flex-direction: column; justify-content: center; }
    .question-text {
      font-size: 2.4rem;
      font-weight: 800;
      color: #1a1a1a;
      letter-spacing: -0.04em;
      line-height: 1.1;
      margin-bottom: 2.5rem;
    }

    .answers-grid {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .answer-btn {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.25rem 1.5rem;
      background: #fff;
      border: 2px solid #f0f0f0;
      border-radius: 20px;
      cursor: pointer;
      transition: all 0.25s ease;
    }
    .answer-btn:active {
      transform: scale(0.97);
    }
    .answer-btn:hover {
      border-color: currentColor;
      background: #fafafa;
    }
    .answer-label {
      font-size: 1.1rem;
      font-weight: 700;
      color: #1a1a1a;
    }
    .answer-arrow {
      font-size: 1.2rem;
      opacity: 0.3;
      transition: opacity 0.2s;
    }
    .answer-btn:hover .answer-arrow { opacity: 1; }

    /* ────── Loading ────── */
    .loading-zone {
      justify-content: center;
      align-items: center;
      gap: 1rem;
    }
    .loader-ring {
      width: 56px;
      height: 56px;
      border: 4px solid #f0f0f0;
      border-top-width: 4px;
      border-radius: 50%;
      animation: spin 0.9s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .loading-title {
      font-size: 1.6rem;
      font-weight: 800;
      color: #1a1a1a;
      margin: 0;
    }
    .loading-sub { color: #888; font-size: 0.95rem; margin: 0; }

    /* ────── Rezultate ────── */
    .results-zone { padding-top: 0; }
    .results-header { margin-bottom: 1.5rem; }
    .results-badge {
      display: inline-block;
      padding: 0.4rem 0.9rem;
      border-radius: 100px;
      color: #fff;
      font-size: 0.65rem;
      font-weight: 800;
      letter-spacing: 0.12em;
      margin-bottom: 0.75rem;
    }
    .results-title {
      font-size: 2.4rem;
      font-weight: 800;
      color: #1a1a1a;
      letter-spacing: -0.04em;
      line-height: 1;
      margin: 0 0 0.4rem;
    }
    .results-subtitle { color: #888; font-size: 0.95rem; margin: 0; }

    .results-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .result-card {
      background: #ffffff;
      border-radius: 24px;
      border: 1px solid #f0f0f0;
      padding: 1.5rem;
      display: flex;
      gap: 1.2rem;
      align-items: flex-start;
      box-shadow: 0 4px 20px rgba(0,0,0,0.02);
      position: relative;
    }
    .result-number {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 0.9rem;
      font-weight: 800;
      flex-shrink: 0;
    }
    .result-body { flex: 1; }
    .result-header-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 0.5rem;
      gap: 1rem;
    }
    .location-link {
      display: flex;
      align-items: center;
      gap: 0.3rem;
      font-size: 0.75rem;
      font-weight: 800;
      text-decoration: none;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 0.5rem 0.8rem;
      background: #f9f9f9;
      border-radius: 100px;
      transition: all 0.2s ease;
      white-space: nowrap;
    }
    .location-link:hover { background: #f0f0f0; transform: translateY(-1px); }
    .location-link .material-icons { font-size: 0.9rem; }
    .result-name {
      font-size: 1.2rem;
      font-weight: 800;
      color: #1a1a1a;
      margin: 0 0 0.3rem;
      letter-spacing: -0.02em;
    }
    .result-desc {
      font-size: 0.9rem;
      color: #666;
      line-height: 1.5;
      margin: 0 0 0.75rem;
    }
    .result-tip {
      display: flex;
      align-items: flex-start;
      gap: 0.4rem;
      padding: 0.6rem 0.8rem;
      background: #fff;
      border-radius: 14px;
      border: 1px solid #f0f0f0;
    }
    .tip-icon { font-size: 1rem; flex-shrink: 0; margin-top: 1px; }
    .tip-text { font-size: 0.8rem; font-weight: 600; color: #555; line-height: 1.4; }

    .restart-btn {
      margin-top: 1.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      width: 100%;
      padding: 1.1rem;
      border-radius: 100px;
      background: #f5f5f5;
      border: none;
      color: #1a1a1a;
      font-weight: 700;
      font-size: 0.95rem;
      cursor: pointer;
    }
    .restart-btn:active { background: #eee; transform: scale(0.97); }

    @media (min-width: 600px) {
      .interaction-grid { grid-template-columns: repeat(3, 1fr); max-width: 800px; }
      .page-title { font-size: 5rem; }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WeekendComponent {
  private http = inject(HttpClient);
  private geminiService = inject(GeminiService);
  private zone = inject(NgZone);
  @ViewChild('quizBody') quizBody!: ElementRef;

  view = signal<'menu' | 'quiz' | 'loading' | 'results'>('menu');
  step = signal(1);
  activeCategory = signal<Category | null>(null);
  answers = signal<Record<string, string>>({});
  recs = signal<Recommendation[]>([]);

  private lastRequest = 0;

  categories: Category[] = [
    {
      id: 'natura', name: 'Natură și Aer Liber', icon: 'terrain',
      color: '#2ed573', shadow: '0 10px 20px rgba(46,213,115,0.15)',
      questions: [
        { id: 'activitate', text: 'Ce nivel de activitate preferi?', options: ['Relaxat', 'Moderat', 'Intens'] },
        { id: 'grup', text: 'Câți oameni sunteți?', options: ['Singur', 'Cuplu', 'Grup', 'Familie'] },
        { id: 'timp', text: 'Cât timp ai?', options: ['1-2 ore', 'Jumătate de zi', 'O zi'] }
      ]
    },
    {
      id: 'arta', name: 'Artă și Istorie', icon: 'museum',
      color: '#a55eea', shadow: '0 10px 20px rgba(165,94,234,0.15)',
      questions: [
        { id: 'interes', text: 'Ce te interesează?', options: ['Muzee', 'Clădiri istorice', 'Galerii de artă'] },
        { id: 'explorare', text: 'Cum preferi să explorezi?', options: ['Cu ghid', 'Singur', 'Cu audioghid'] },
        { id: 'buget', text: 'Care e bugetul?', options: ['Gratuit', 'Până la 30 lei', 'Peste 30 lei'] }
      ]
    },
    {
      id: 'restaurante', name: 'Restaurante și Cafenele', icon: 'restaurant',
      color: '#ff4500', shadow: '0 10px 20px rgba(255,69,0,0.15)',
      questions: [
        { id: 'mancare', text: 'Ce mâncare preferi?', options: ['Românească', 'Internațională', 'Vegană', 'Fast food'] },
        { id: 'atmosfera', text: 'Ce atmosferă cauți?', options: ['Cozy', 'Modern', 'Rustic', 'Terasă'] },
        { id: 'buget', text: 'Buget per persoană?', options: ['Sub 40 lei', '40-80 lei', 'Peste 80 lei'] }
      ]
    },
    {
      id: 'evenimente', name: 'Evenimente în Oraș', icon: 'confirmation_number',
      color: '#4285f4', shadow: '0 10px 20px rgba(66,133,244,0.15)',
      questions: [
        { id: 'tip', text: 'Ce tip de eveniment?', options: ['Concert', 'Festival', 'Teatru', 'Sport'] },
        { id: 'cand', text: 'Când vrei să mergi?', options: ['Azi', 'Weekend', 'Oricând'] },
        { id: 'companie', text: 'Cu cine mergi?', options: ['Singur', 'Cuplu', 'Prieteni', 'Familie'] }
      ]
    },
    {
      id: 'plimbari', name: 'Plimbări Urbane', icon: 'directions_walk',
      color: '#2bcbba', shadow: '0 10px 20px rgba(43,203,186,0.15)',
      questions: [
        { id: 'viziune', text: 'Ce vrei să vezi?', options: ['Centrul istoric', 'Cartiere locale', 'Priveliști', 'Street art'] },
        { id: 'mers', text: 'Cât de mult mergi pe jos?', options: ['Puțin', 'Moderat', 'Mult'] },
        { id: 'ora', text: 'La ce oră?', options: ['Dimineață', 'Zi', 'Seară'] }
      ]
    },
    {
      id: 'experiente', name: 'Experiențe Inedite', icon: 'explore',
      color: '#ff6348', shadow: '0 10px 20px rgba(255,99,72,0.15)',
      questions: [
        { id: 'tip', text: 'Ce tip de experiență?', options: ['Aventură', 'Relaxare', 'Culturală', 'Gastronomică'] },
        { id: 'buget', text: 'Care e bugetul?', options: ['Gratuit', 'Sub 100 lei', 'Peste 100 lei'] },
        { id: 'preferinta', text: 'Preferi ceva?', options: ['Unic și necunoscut', 'Popular dar merită', 'Off the beaten path'] }
      ]
    }
  ];

  pickCategory(cat: Category) {
    this.zone.run(() => {
      this.activeCategory.set(cat);
      this.step.set(1);
      this.answers.set({});
      this.view.set('quiz');
      this.animateIn();
    });
  }

  answer(opt: string) {
    const cat = this.activeCategory();
    if (!cat) return;
    const q = cat.questions[this.step() - 1];
    this.answers.update(prev => ({ ...prev, [q.text]: opt }));

    if (this.step() < 3) {
      this.step.update(s => s + 1);
      this.animateIn();
    } else {
      this.fetchResults();
    }
  }

  async fetchResults() {
    const now = Date.now();
    const timeRemaining = 5000 - (now - this.lastRequest);
    if (timeRemaining > 0) {
      alert(`Te rugăm să aștepți încă ${Math.ceil(timeRemaining / 1000)} secunde înainte de o nouă căutare.`);
      return;
    }
    this.lastRequest = now;
    // Reducem decalajul la 20ms pentru viteză maximă
    setTimeout(() => {
      this.zone.run(() => {
        this.view.set('loading');
      });
    }, 20);

    try {
      const data = await this.geminiService.getRecommendation(
        this.activeCategory()?.name || '',
        this.answers()
      );

      this.zone.run(() => {
        setTimeout(() => {
          this.recs.set(data.recommendations || []);
          this.view.set('results');
        }, 10);
      });
    } catch (err: any) {
      console.error('Eroare AI:', err);
      // --- SIGURANȚA SUPREMĂ: FALLBACK STATIC ---
      const staticFallback: Recommendation[] = [
        {
          name: 'Piața Sfatului',
          description: 'Inima istorică a Brașovului, înconjurată de clădiri medievale și cafenele cochete.',
          tip: 'Urcă în Turnul Sfatului pentru o panoramă superbă.',
          link: 'https://www.google.com/maps/search/?api=1&query=Piata+Sfatului+Brasov'
        },
        {
          name: 'Biserica Neagră',
          description: 'Cel mai mare edificiu religios în stil gotic din sud-estul Europei.',
          tip: 'Vizitează interiorul pentru a vedea colecția unică de covoare orientale.',
          link: 'https://www.google.com/maps/search/?api=1&query=Biserica+Neagra+Brasov'
        },
        {
          name: 'Tâmpa și Telecabina',
          description: 'Muntele care străjuiește orașul, oferind cea mai bună priveliște deasupra Brașovului.',
          tip: 'Poți urca cu telecabina sau pe jos pe traseul marcat.',
          link: 'https://www.google.com/maps/search/?api=1&query=Tampa+Brasov'
        }
      ];

      this.zone.run(() => {
        setTimeout(() => {
          this.recs.set(staticFallback);
          this.view.set('results');
        }, 100);
      });
      // ------------------------------------------
    }
  }

  private animateIn() {
    setTimeout(() => {
      gsap.from('.quiz-body', { y: 25, opacity: 0, duration: 0.5, ease: 'power2.out' });
    }, 0);
  }

  handleImageError(event: any) {
    // Dacă imaginea de la AI e invalidă, punem o imagine superbă de rezervă cu Brașovul
    event.target.src = 'https://images.unsplash.com/photo-1590272213038-f9479ba0a55e?q=80&w=800';
  }

  restart() { this.view.set('menu'); }

  openLocation(url: string | undefined) {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }

  goBack() {
    const v = this.view();
    if (v === 'quiz') this.view.set('menu');
    else if (v === 'results') this.view.set('menu');
    else window.history.back();
  }
}
