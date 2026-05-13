import { ChangeDetectionStrategy, Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { GeminiService } from '../../../../core/services/gemini.service';
import { gsap } from 'gsap';

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
  imports: [CommonModule],
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

        <!-- Smart AI Advisor Entry -->
        <div class="ai-advisor-card" (click)="startQuiz()">
          <div class="ai-glow"></div>
          <div class="ai-content">
            <span class="material-icons ai-icon">auto_awesome</span>
            <div class="ai-text">
              <span class="ai-title">Sfatul Inteligent</span>
              <span class="ai-sub">Lasă AI-ul să-ți găsească planul perfect</span>
            </div>
            <span class="material-icons ai-arrow">chevron_right</span>
          </div>
        </div>

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
      } 
      
      @else if (currentView() === 'quiz') {
        <section class="quiz-container">
          <div class="quiz-nav">
            <div class="quiz-progress-track">
              <div class="quiz-progress-bar" [style.width.%]="(quizStep() / 4) * 100"></div>
            </div>
            <span class="quiz-step-label">PASUL {{ quizStep() }} / 4</span>
          </div>

          <div class="question-wrapper">
            <div class="question-box">
              @if (quizStep() === 1) {
                <h2 class="q-title">Care este <span class="text-gradient">vibe-ul</span> tău azi?</h2>
                <div class="options-v2">
                  <button class="opt-card" (click)="answerQuiz('vibe', 'Relaxare')">
                    <span class="opt-emoji">🌿</span>
                    <span class="opt-label">Relaxare totală</span>
                  </button>
                  <button class="opt-card" (click)="answerQuiz('vibe', 'Aventură / Activ')">
                    <span class="opt-emoji">⚡</span>
                    <span class="opt-label">Aventură & Acțiune</span>
                  </button>
                  <button class="opt-card" (click)="answerQuiz('vibe', 'Cultural / Istoric')">
                    <span class="opt-emoji">🏛️</span>
                    <span class="opt-label">Cultură & Istorie</span>
                  </button>
                  <button class="opt-card" (click)="answerQuiz('vibe', 'Gastronomic')">
                    <span class="opt-emoji">🍕</span>
                    <span class="opt-label">Gastronomie</span>
                  </button>
                </div>
              }
              @else if (quizStep() === 2) {
                <h2 class="q-title">Cu cine vrei să <span class="text-gradient">ieși</span>?</h2>
                <div class="options-v2">
                  <button class="opt-card" (click)="answerQuiz('company', 'Singur')">
                    <span class="opt-emoji">👤</span>
                    <span class="opt-label">Solo Explorer</span>
                  </button>
                  <button class="opt-card" (click)="answerQuiz('company', 'În cuplu')">
                    <span class="opt-emoji">❤️</span>
                    <span class="opt-label">În Cuplu</span>
                  </button>
                  <button class="opt-card" (click)="answerQuiz('company', 'Cu familia / Copiii')">
                    <span class="opt-emoji">👨‍👩‍👧‍👦</span>
                    <span class="opt-label">Cu Familia</span>
                  </button>
                  <button class="opt-card" (click)="answerQuiz('company', 'Grup de prieteni')">
                    <span class="opt-emoji">🙌</span>
                    <span class="opt-label">Cu Prietenii</span>
                  </button>
                </div>
              }
              @else if (quizStep() === 3) {
                <h2 class="q-title">Care este <span class="text-gradient">bugetul</span> tău?</h2>
                <div class="options-v2 stack">
                  <button class="opt-card wide" (click)="answerQuiz('budget', 'Accesibil / Gratis')">
                    <span class="opt-emoji">🏷️</span>
                    <span class="opt-label">Accesibil / Gratis</span>
                  </button>
                  <button class="opt-card wide" (click)="answerQuiz('budget', 'Mediu')">
                    <span class="opt-emoji">💵</span>
                    <span class="opt-label">Buget Mediu</span>
                  </button>
                  <button class="opt-card wide" (click)="answerQuiz('budget', 'Premium / Fără limită')">
                    <span class="opt-emoji">💎</span>
                    <span class="opt-label">Premium / No Limit</span>
                  </button>
                </div>
              }
              @else if (quizStep() === 4) {
                <h2 class="q-title">Cât <span class="text-gradient">timp</span> ai?</h2>
                <div class="options-v2">
                  <button class="opt-card" (click)="answerQuiz('duration', '1-2 ore')">
                    <span class="opt-emoji">⏱️</span>
                    <span class="opt-label">1 - 2 Ore</span>
                  </button>
                  <button class="opt-card" (click)="answerQuiz('duration', 'Jumătate de zi')">
                    <span class="opt-emoji">⛅</span>
                    <span class="opt-label">Jumătate de zi</span>
                  </button>
                  <button class="opt-card" (click)="answerQuiz('duration', 'Zi completă')">
                    <span class="opt-emoji">🌙</span>
                    <span class="opt-label">O zi întreagă</span>
                  </button>
                  <button class="opt-card" (click)="answerQuiz('duration', 'Tot weekend-ul')">
                    <span class="opt-emoji">📅</span>
                    <span class="opt-label">Tot weekend-ul</span>
                  </button>
                </div>
              }
            </div>
          </div>
        </section>
      }

      @else if (currentView() === 'loading') {
        <section class="loading-ai">
          <div class="ai-orbit">
            <div class="core"></div>
            <div class="ring"></div>
            <div class="ring delay"></div>
          </div>
          <h3>Gemini analizează...</h3>
          <p>Pregătim experiența ideală bazată pe răspunsurile tale.</p>
        </section>
      }

      @else if (currentView() === 'ai-result') {
        <section class="ai-result-container">
          <div class="result-header">
            <span class="ai-badge">RECOMANDAREA AI {{ aiResult()?.emoji }}</span>
          </div>
          
          <div class="result-card">
            <h1 class="result-title">{{ aiResult()?.title }}</h1>
            <div class="result-loc">
              <span class="material-icons">place</span>
              {{ aiResult()?.location }}
            </div>
            
            <div class="result-reason">
              <span class="material-icons">info</span>
              <p>{{ aiResult()?.reason }}</p>
            </div>

            @if (aiResult()?.image) {
              <div class="result-image-box">
                <img [src]="aiResult()?.image" [alt]="aiResult()?.title">
              </div>
            }

            <p class="result-desc">{{ aiResult()?.details }}</p>

            <button class="btn-action-primary" (click)="goBack()">
              AM ÎNȚELES
            </button>
            <button class="btn-restart" (click)="startQuiz()">
              REFA CHESTIONARUL
            </button>
          </div>
        </section>
      }

      @else {
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

    .top-nav { padding: calc(var(--safe-top) + 1.2rem) 1.5rem 1rem; z-index: 100; position: relative; }
    
    .unified-back-btn {
      display: flex; align-items: center; gap: 0.5rem;
      background: rgba(255,255,255,0.8); backdrop-filter: blur(10px);
      border: 1px solid rgba(0,0,0,0.05); padding: 0.6rem 1.2rem;
      border-radius: 50px; cursor: pointer; color: #1a1a1a;
      font-weight: 800; font-size: 0.85rem;
      box-shadow: 0 4px 15px rgba(0,0,0,0.05);
      transition: all 0.2s;
    }
    .unified-back-btn:active { transform: scale(0.95); background: #1a1a1a; color: #fff; }

    .page-header { padding: 0.5rem 1.5rem 1.25rem; text-align: left; }
    .page-header.compact { padding: 0 1.5rem 1rem; }
    
    .eyebrow-accent { font-size: 0.75rem; font-weight: 900; color: #a55eea; text-transform: uppercase; letter-spacing: 0.2em; margin-bottom: 0.4rem; }
    .eyebrow { font-size: 0.75rem; font-weight: 900; color: #888; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 0.4rem; }
    .main-question { font-size: 2.4rem; font-weight: 900; color: #1a1a1a; line-height: 1; margin: 0; letter-spacing: -0.05em; }
    .category-title { font-size: 2.2rem; font-weight: 950; color: #1a1a1a; margin: 0; line-height: 1; letter-spacing: -0.04em; }

    /* AI Advisor Card */
    .ai-advisor-card {
      margin: 0 1.5rem 1.5rem;
      background: #1a1a1a;
      border-radius: 28px;
      padding: 1.5rem;
      position: relative;
      overflow: hidden;
      cursor: pointer;
      box-shadow: 0 15px 35px rgba(165, 94, 234, 0.2);
    }
    .ai-glow {
      position: absolute; top: -50%; left: -50%; width: 200%; height: 200%;
      background: radial-gradient(circle, rgba(165, 94, 234, 0.4) 0%, transparent 70%);
      animation: rotate 10s linear infinite;
    }
    .ai-content { position: relative; z-index: 2; display: flex; align-items: center; gap: 1rem; color: #fff; }
    .ai-icon { font-size: 2rem; color: #a55eea; }
    .ai-text { flex: 1; display: flex; flex-direction: column; }
    .ai-title { font-weight: 900; font-size: 1.1rem; }
    .ai-sub { font-size: 0.8rem; color: #aaa; }
    .ai-arrow { color: #555; }

    @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

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

    .cat-name { color: #fff; font-size: 1.1rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em; }
    .text-gradient { background: linear-gradient(135deg, #a55eea 0%, #d1d8e0 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }

    /* Quiz Redesign */
    .quiz-container { padding: 0 1.5rem 3rem; flex: 1; display: flex; flex-direction: column; }
    .quiz-nav { margin-bottom: 2.5rem; display: flex; flex-direction: column; gap: 0.75rem; }
    .quiz-progress-track { height: 4px; background: rgba(0,0,0,0.05); border-radius: 10px; overflow: hidden; }
    .quiz-progress-bar { height: 100%; background: #a55eea; transition: width 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
    .quiz-step-label { font-size: 0.75rem; font-weight: 900; color: #888; letter-spacing: 0.1em; }
    
    .question-wrapper { flex: 1; display: flex; align-items: flex-start; }
    .q-title { font-size: 2.8rem; font-weight: 950; line-height: 1; margin: 0 0 2.5rem; letter-spacing: -0.05em; color: #1a1a1a; }
    
    .options-v2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; width: 100%; }
    .options-v2.stack { grid-template-columns: 1fr; }
    
    .opt-card {
      background: #fff; border: 1px solid rgba(0,0,0,0.03); padding: 1.75rem 1rem;
      border-radius: 28px; display: flex; flex-direction: column; align-items: center;
      gap: 1rem; cursor: pointer; transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      box-shadow: 0 10px 25px rgba(0,0,0,0.04);
    }
    .opt-card.wide { flex-direction: row; padding: 1.25rem 1.5rem; justify-content: flex-start; }
    
    .opt-emoji { font-size: 2.2rem; }
    .opt-label { font-size: 0.95rem; font-weight: 900; color: #1a1a1a; text-transform: uppercase; letter-spacing: 0.02em; text-align: center; }
    .opt-card.wide .opt-label { text-align: left; }
    
    .opt-card:active { transform: scale(0.92); background: #1a1a1a; border-color: #1a1a1a; }
    .opt-card:active .opt-label { color: #fff; }

    /* Loading AI */
    .loading-ai { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 2rem; }
    .ai-orbit { position: relative; width: 100px; height: 100px; margin-bottom: 2rem; }
    .core { position: absolute; inset: 25%; background: #a55eea; border-radius: 50%; box-shadow: 0 0 30px #a55eea; animation: pulse 2s infinite; }
    .ring { position: absolute; inset: 0; border: 2px solid #a55eea; border-radius: 50%; border-top-color: transparent; animation: rotate 1.5s linear infinite; }
    .ring.delay { animation-duration: 2.5s; animation-direction: reverse; border-bottom-color: transparent; border-top-color: #a55eea; }
    @keyframes pulse { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.2); opacity: 0.7; } 100% { transform: scale(1); opacity: 1; } }

    /* AI Result */
    .ai-result-container { padding: 0 1.5rem 3rem; }
    .result-header { margin-bottom: 1rem; }
    .ai-badge { background: #a55eea; color: #fff; padding: 0.5rem 1rem; border-radius: 50px; font-weight: 900; font-size: 0.75rem; letter-spacing: 0.1em; }
    .result-card { background: #fff; border-radius: 36px; padding: 2.5rem; box-shadow: 0 20px 50px rgba(0,0,0,0.1); border: 1px solid rgba(165,94,234,0.1); }
    .result-title { font-size: 2.8rem; font-weight: 950; line-height: 0.95; margin-bottom: 1rem; letter-spacing: -0.05em; }
    .result-loc { font-size: 1.1rem; font-weight: 800; color: #a55eea; display: flex; align-items: center; gap: 0.5rem; margin-bottom: 2rem; }
    .result-reason { background: #fdfbff; border: 1px solid #f0f0ff; padding: 1.25rem; border-radius: 20px; margin-bottom: 2rem; display: flex; gap: 1rem; align-items: flex-start; }
    .result-reason .material-icons { color: #a55eea; }
    .result-reason p { font-size: 0.9rem; font-weight: 700; color: #444; margin: 0; line-height: 1.4; }
    .result-image-box { width: 100%; height: 200px; border-radius: 20px; overflow: hidden; margin-bottom: 2rem; }
    .result-image-box img { width: 100%; height: 100%; object-fit: cover; }
    .result-desc { font-size: 1.1rem; color: #666; line-height: 1.6; margin-bottom: 2.5rem; }
    .btn-action-primary { width: 100%; padding: 1.25rem; background: #1a1a1a; color: #fff; border: none; border-radius: 24px; font-weight: 900; font-size: 1rem; margin-bottom: 1rem; cursor: pointer; }
    .btn-restart { width: 100%; background: none; border: none; color: #888; font-weight: 800; font-size: 0.85rem; cursor: pointer; }

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

    .rec-image-container { position: relative; height: 220px; width: 100%; overflow: hidden; }
    .event-photo { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease; }
    .image-shade { position: absolute; inset: 0; background: linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.4)); }
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
    .date-tag { font-size: 0.9rem; font-weight: 800; color: #a55eea; }
    
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
  private http = inject(HttpClient);
  private geminiService = inject(GeminiService);
  
  currentView = signal<'menu' | 'list' | 'quiz' | 'loading' | 'ai-result'>('menu');
  selectedCategory = signal<Category | null>(null);
  
  quizStep = signal(1);
  quizAnswers = signal<any>({});
  aiResult = signal<any>(null);

  categories: Category[] = [
    { id: 'gastronomie', name: 'Gastronomie', image: 'gastronomy_v2.png' },
    { id: 'natura', name: 'Natură', image: 'nature_v2.png' },
    { id: 'plimbare', name: 'Plimbare în oraș', image: 'events_v2.png' },
    { id: 'cultura', name: 'Cultură', image: 'culture_v2.png' },
    { id: 'experiente', name: 'Experiențe', image: 'nature_v2.png' },
    { id: 'evenimente', name: 'Evenimente', image: 'events_v2.png' }
  ];

  allRecommendations: Recommendation[] = [
    // ... allRecommendations content remains the same ...
    // I will use a placeholder here to keep the edit concise, but the tool requires the exact content.
    // Wait, the tool requires EXACT match. I'll include the whole array.
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
    {
      id: 40,
      title: "Zbor cu Parapanta @ Bunloc",
      description: "Trăiește libertatea absolută! Decolează de pe Vârful Bunloc (1200m) și bucură-te de o panoramă incredibilă deasupra Brașovului.",
      category: "experiente",
      date: "În funcție de meteo",
      location: "Bunloc, Săcele",
      image: "https://zilesinopti.ro/wp-content/uploads/2026/04/In-cautarea-Naturii.jpg",
      url: "https://parapantabrasov.ro"
    },
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

  startQuiz() {
    this.quizStep.set(1);
    this.quizAnswers.set({});
    this.currentView.set('quiz');
    this.animateQuiz();
  }

  answerQuiz(key: string, value: string) {
    const current = this.quizAnswers();
    current[key] = value;
    this.quizAnswers.set(current);

    if (this.quizStep() < 4) {
      this.quizStep.set(this.quizStep() + 1);
      this.animateQuiz();
    } else {
      this.generateAiRecommendation();
    }
  }

  async generateAiRecommendation() {
    this.currentView.set('loading');
    
    try {
      const config = await firstValueFrom(this.http.get<any>('/config.json'));
      const apiKey = config.GROQ_API_KEY;
      
      const result = await this.geminiService.getRecommendation(this.quizAnswers(), apiKey);
      this.aiResult.set(result);
      this.currentView.set('ai-result');
    } catch (error: any) {
      console.error('AI Flow Error:', error);
      const status = error.status || 'N/A';
      const errorMsg = error.error?.error?.message || error.message || 'Eroare necunoscută';
      alert(`Eroare AI (Status ${status}): ${errorMsg}`);
      this.currentView.set('menu');
    }
  }

  private animateQuiz() {
    gsap.from('.question-box', {
      x: 30,
      opacity: 0,
      duration: 0.5,
      ease: 'power2.out'
    });
  }

  selectCategory(cat: Category) {
    this.selectedCategory.set(cat);
    this.currentView.set('list');
  }

  goBack() {
    const view = this.currentView();
    if (view === 'list' || view === 'quiz' || view === 'ai-result' || view === 'loading') {
      this.currentView.set('menu');
    } else {
      window.history.back();
    }
  }

  openUrl(url: string) {
    window.open(url, '_blank');
  }
}
