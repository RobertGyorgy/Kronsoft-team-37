import { ChangeDetectionStrategy, Component, signal, inject, AfterViewInit, ElementRef, ViewChild, NgZone, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
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
  questions: { 
    id: string; 
    text: string; 
    options: { label: string; icon: string }[] 
  }[];
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
        <button class="unified-back-btn" (click)="goBack()">
          <span class="material-icons">arrow_back</span>
          <span>Înapoi</span>
        </button>
      </header>

      <!-- VIEW: Meniu Categorii -->
      @if (view() === 'menu') {
        <div class="hero-section">
          <h1 class="hero-title line-mask">
            @for (word of titleWords; track word) {
              <span class="word">
                @for (char of word.split(''); track char) {
                  <span class="char">{{ char }}</span>
                }
                <span class="char">&nbsp;</span>
              </span>
            }
          </h1>
        </div>
        <div class="content-zone animate-in">
          <div class="page-title-group">
            <p class="hero-subtitle line-mask">
              @for (word of subtitleWords; track word) {
                <span class="word">
                  @for (char of word.split(''); track char) {
                    <span class="char-sub">{{ char }}</span>
                  }
                  <span class="char-sub">&nbsp;</span>
                </span>
              }
            </p>
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
              <div class="progress-fill" 
                   [style.width.%]="(step() / (activeCategory()?.questions?.length || 1)) * 100" 
                   [style.background]="activeCategory()?.color"></div>
            </div>
            <span class="progress-label">PASUL {{ step() }} DIN {{ activeCategory()?.questions?.length }}</span>
          </div>

          <!-- Întrebare -->
          <div class="quiz-body" #quizBody>
            <h2 class="question-text" [style.background-image]="'linear-gradient(135deg, ' + activeCategory()?.color + ', #1a1a1a)'">
              @for (word of splitText(activeCategory()?.questions?.[step() - 1]?.text || ''); track $index) {
                <span class="quiz-word">
                  @for (char of word; track $index) {
                    <span class="quiz-char">{{ char }}</span>
                  }
                  &nbsp;
                </span>
              }
            </h2>

            <div class="answers-grid">
              @for (opt of activeCategory()?.questions?.[step() - 1]?.options; track $index) {
                <button class="answer-btn" [style.border-color]="activeCategory()?.color" (click)="answer(opt.label)">
                  <div class="answer-left">
                    <span class="material-icons opt-icon" [style.color]="activeCategory()?.color">{{ opt.icon }}</span>
                    <span class="answer-label">{{ opt.label }}</span>
                  </div>
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
            <p class="results-subtitle">3 locații selectate special pentru tine.</p>
          </div>

          <div class="results-list">
            @for (rec of recs(); track $index; let i = $index) {
              <div class="result-card">
                <div class="card-accent" [style.background]="activeCategory()?.color"></div>
                <div class="result-number" [style.background]="activeCategory()?.color">{{ i + 1 }}</div>
                <div class="result-body">
                  <div class="result-header-row">
                    <h3 class="result-name">{{ rec.name }}</h3>
                    <a [href]="'https://www.google.com/maps/search/?api=1&query=' + rec.name + ' Brasov'" 
                       target="_blank" class="location-link" [style.color]="activeCategory()?.color">
                      <span class="material-icons">near_me</span>
                      MAPS
                    </a>
                  </div>
                  <p class="result-desc">{{ rec.description }}</p>
                  <div class="result-tip" [style.background]="activeCategory()?.color + '12'">
                    <span class="material-icons tip-icon" [style.color]="activeCategory()?.color">lightbulb</span>
                    <span class="tip-text">{{ rec.tip }}</span>
                  </div>
                </div>
              </div>
            }
          </div>

          <div class="results-actions">
            <button class="action-btn-secondary" (click)="fetchResults()">
              <span class="material-icons">cached</span>
              REGENEREAZĂ RECOMANDĂRI
            </button>
            <button class="action-btn-primary" (click)="restart()">
              <span class="material-icons">refresh</span>
              ALTĂ CĂUTARE
            </button>
          </div>
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
    .hero-section { padding: 1rem 1.25rem 1rem; }
    .eyebrow-teal { font-size: 0.7rem; font-weight: 800; color: #00a8a8; letter-spacing: 0.15em; margin: 0 0 0.5rem; }
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
    .hero-title {
      font-size: 3.2rem;
      font-weight: 800;
      color: #1a1a1a;
      letter-spacing: -0.05em;
      line-height: 1;
      margin: 0;
    }
    .hero-subtitle {
      font-size: 1.1rem;
      font-weight: 500;
      color: #1a1a1a;
      line-height: 1.4;
      margin: 0;
    }
    .word { display: inline-block; white-space: nowrap; }
    .char { display: inline-block; opacity: 0; }
    .char-sub { display: inline-block; opacity: 0; }
    .line-mask { overflow: visible; display: block; }
    .card-title {
      font-size: 1rem;
      font-weight: 800;
      color: #fff;
      line-height: 1.1;
      z-index: 2;
      letter-spacing: -0.01em;
    }

    .loading-sub { color: #888; font-size: 0.95rem; margin: 0; }

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
      font-size: 2.8rem;
      font-weight: 800;
      letter-spacing: -0.05em;
      line-height: 1;
      margin-bottom: 2.5rem;
      /* Gradient style */
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      display: block;
    }

    .quiz-char { display: inline-block; }
    .quiz-word { 
      display: inline-block; 
      white-space: nowrap; 
      margin-right: 0.25em; /* Adăugăm spațiu garantat între cuvinte */
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
      transition: border-color 0.25s ease, background 0.25s ease, transform 0.1s ease;
      position: relative;
      z-index: 10;
      pointer-events: auto !important;
    }
    .answer-left { display: flex; align-items: center; gap: 1rem; }
    .opt-icon { font-size: 1.5rem; opacity: 0.9; }
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
    .results-zone { padding-top: 0; max-width: 600px; margin: 0 auto; }
    .results-header { margin-bottom: 2.5rem; padding: 0 0.5rem; }
    .results-badge {
      display: inline-block;
      padding: 0.6rem 1.2rem;
      border-radius: 14px;
      color: #fff;
      font-size: 0.75rem;
      font-weight: 900;
      letter-spacing: 0.1em;
      margin-bottom: 1.2rem;
      box-shadow: 0 8px 20px rgba(0,0,0,0.1);
      text-transform: uppercase;
    }
    .results-title {
      font-size: 3.2rem;
      font-weight: 800;
      color: #1a1a1a;
      letter-spacing: -0.05em;
      line-height: 1;
      margin: 0 0 0.6rem;
    }
    .results-subtitle { color: #888; font-size: 1.1rem; font-weight: 500; margin: 0; }

    .results-list {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .result-card {
      background: #ffffff;
      border-radius: 32px;
      padding: 2rem;
      display: flex;
      gap: 1.5rem;
      align-items: flex-start;
      box-shadow: 0 20px 40px rgba(0,0,0,0.03);
      border: 1px solid rgba(0,0,0,0.04);
      position: relative;
      overflow: hidden;
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .result-card:hover { 
      transform: translateY(-8px) scale(1.01); 
      box-shadow: 0 30px 60px rgba(0,0,0,0.08);
    }
    
    .card-accent {
      position: absolute;
      top: 0;
      left: 0;
      width: 8px;
      height: 100%;
      opacity: 0.8;
    }

    .result-number {
      width: 48px;
      height: 48px;
      border-radius: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 1.2rem;
      font-weight: 900;
      flex-shrink: 0;
      box-shadow: 0 10px 20px rgba(0,0,0,0.1);
    }
    .result-body { flex: 1; }
    .result-header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    .location-link {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.75rem;
      font-weight: 900;
      text-decoration: none;
      letter-spacing: 0.05em;
      padding: 0.7rem 1.2rem;
      background: #f8f9fa;
      border-radius: 100px;
      transition: all 0.3s ease;
      box-shadow: 0 4px 10px rgba(0,0,0,0.02);
    }
    .location-link:hover { 
      background: #1a1a1a; 
      color: #fff !important;
      transform: rotate(3deg);
    }
    .result-name {
      font-size: 1.6rem;
      font-weight: 800;
      color: #1a1a1a;
      margin: 0;
      letter-spacing: -0.03em;
    }
    .result-desc {
      font-size: 1.05rem;
      color: #555;
      line-height: 1.6;
      margin: 0 0 1.5rem;
      font-weight: 400;
    }
    .result-tip {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      padding: 1.2rem;
      border-radius: 22px;
      background: rgba(0,0,0,0.03); 
      border: 1px solid rgba(0,0,0,0.02);
    }
    .tip-icon { font-size: 1.4rem; flex-shrink: 0; }
    .tip-text { 
      font-size: 0.9rem; 
      font-weight: 600; 
      color: #333; 
      line-height: 1.5; 
    }

    .results-actions {
      margin-top: 2.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .action-btn-primary, .action-btn-secondary {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.8rem;
      width: 100%;
      padding: 1.4rem;
      border-radius: 100px;
      font-weight: 800;
      font-size: 1.1rem;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      border: none;
    }

    .action-btn-primary {
      background: #1a1a1a;
      color: #fff;
      box-shadow: 0 15px 35px rgba(0,0,0,0.15);
    }

    .action-btn-secondary {
      background: #f8f9fa;
      color: #1a1a1a;
      border: 1px solid #eee;
    }

    .action-btn-primary:hover, .action-btn-secondary:hover { transform: translateY(-4px); }
    .action-btn-primary:active, .action-btn-secondary:active { transform: scale(0.96); }
    .action-btn-primary:hover { box-shadow: 0 20px 45px rgba(0,0,0,0.2); background: #000; }

    @media (min-width: 600px) {
      .interaction-grid { grid-template-columns: repeat(3, 1fr); max-width: 800px; }
      .page-title { font-size: 5rem; }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WeekendComponent implements AfterViewInit {
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
  titleWords = 'Explorează Brașovul'.split(' ');
  subtitleWords = 'Alege o categorie și primești 3 recomandări potrivite pentru tine.'.split(' ');

  constructor() {
    effect(() => {
      if (this.view() === 'menu') {
        setTimeout(() => this.animateReveal(), 100);
      }
    });
  }

  ngAfterViewInit() {
    // Initial call will be handled by the effect or manually if needed
  }

  categories: Category[] = [
    {
      id: 'natura', name: 'Natură', icon: 'terrain',
      color: '#2ed573', shadow: '0 10px 20px rgba(46,213,115,0.15)',
      questions: [
        { 
          id: 'activitate', text: 'Ce nivel de activitate preferi?', 
          options: [
            { label: 'Contemplativ – foto, observare', icon: 'photo_camera' },
            { label: 'Relaxat – plimbări, natură', icon: 'nature_people' },
            { label: 'Activ – drumeții, ciclism', icon: 'directions_run' },
            { label: 'Aventuros – sport, adrenalină', icon: 'explore' }
          ] 
        },
        { 
          id: 'grup', text: 'Câți oameni sunteți?', 
          options: [
            { label: 'Singur', icon: 'person' },
            { label: 'Cuplu', icon: 'favorite' },
            { label: 'Grup', icon: 'groups' },
            { label: 'Familie cu copii', icon: 'family_restroom' }
          ] 
        },
        { 
          id: 'timp', text: 'Cât timp ai?', 
          options: [
            { label: '1-2 ore', icon: 'schedule' },
            { label: 'Jumătate de zi', icon: 'wb_sunny' },
            { label: 'O zi', icon: 'event_available' }
          ] 
        }
      ]
    },
    {
      id: 'arta', name: 'Artă și istorie', icon: 'museum',
      color: '#a55eea', shadow: '0 10px 20px rgba(165,94,234,0.15)',
      questions: [
        { 
          id: 'interes', text: 'Ce te interesează?', 
          options: [
            { label: 'Muzee', icon: 'account_balance' },
            { label: 'Clădiri istorice', icon: 'castle' },
            { label: 'Galerii de artă', icon: 'palette' }
          ] 
        },
        { 
          id: 'explorare', text: 'Cum preferi să explorezi?', 
          options: [
            { label: 'Cu ghid', icon: 'record_voice_over' },
            { label: 'Singur', icon: 'person' },
            { label: 'Cu audioghid', icon: 'headset' }
          ] 
        },
        { 
          id: 'buget', text: 'Care e bugetul?', 
          options: [
            { label: 'Gratuit', icon: 'volunteer_activism' },
            { label: 'Până la 30 lei', icon: 'payments' },
            { label: 'Peste 30 lei', icon: 'savings' }
          ] 
        }
      ]
    },
    {
      id: 'restaurante', name: 'Restaurante', icon: 'restaurant',
      color: '#ff4500', shadow: '0 10px 20px rgba(255,69,0,0.15)',
      questions: [
        { 
          id: 'mancare', text: 'Ce mâncare preferi?', 
          options: [
            { label: 'Românească', icon: 'restaurant' },
            { label: 'Internațională', icon: 'public' },
            { label: 'Vegană', icon: 'eco' },
            { label: 'Fast food', icon: 'fastfood' }
          ] 
        },
        { 
          id: 'atmosfera', text: 'Ce atmosferă cauți?', 
          options: [
            { label: 'Cozy', icon: 'weekend' },
            { label: 'Modern', icon: 'lightbulb' },
            { label: 'Rustic', icon: 'cottage' },
            { label: 'Terasă', icon: 'deck' }
          ] 
        },
        { 
          id: 'buget', text: 'Buget per persoană?', 
          options: [
            { label: 'Sub 40 lei', icon: 'currency_exchange' },
            { label: '40-80 lei', icon: 'local_atm' },
            { label: 'Peste 80 lei', icon: 'diamond' }
          ] 
        }
      ]
    },
    {
      id: 'cafenele', name: 'Cafenele', icon: 'local_cafe',
      color: '#bcaaa4', shadow: '0 10px 20px rgba(188,170,164,0.15)',
      questions: [
        { 
          id: 'atmosfera', text: 'Ce atmosferă cauți?', 
          options: [
            { label: 'Cozy', icon: 'coffee' },
            { label: 'Modern', icon: 'architecture' },
            { label: 'Liniștită', icon: 'self_improvement' },
            { label: 'Terasă', icon: 'deck' }
          ] 
        },
        { 
          id: 'buget', text: 'Buget per persoană?', 
          options: [
            { label: 'Sub 20 lei', icon: 'savings' },
            { label: '20-40 lei', icon: 'payments' },
            { label: 'Peste 40 lei', icon: 'credit_card' }
          ] 
        },
        { 
          id: 'companie', text: 'Cu cine ești?', 
          options: [
            { label: 'Singur', icon: 'person' },
            { label: 'Cuplu', icon: 'favorite' },
            { label: 'Prieteni', icon: 'groups' },
            { label: 'Familie cu copii', icon: 'family_restroom' }
          ] 
        }
      ]
    },
    {
      id: 'plimbari', name: 'Plimbări urbane', icon: 'directions_walk',
      color: '#2bcbba', shadow: '0 10px 20px rgba(43,203,186,0.15)',
      questions: [
        { 
          id: 'viziune', text: 'Ce vrei să vezi?', 
          options: [
            { label: 'Centrul istoric', icon: 'map' },
            { label: 'Cartiere locale', icon: 'location_city' },
            { label: 'Priveliști', icon: 'visibility' },
            { label: 'Street art', icon: 'brush' }
          ] 
        },
        { 
          id: 'mers', text: 'Cât de mult mergi pe jos?', 
          options: [
            { label: 'Puțin', icon: 'blind' },
            { label: 'Moderat', icon: 'directions_walk' },
            { label: 'Mult', icon: 'directions_run' }
          ] 
        },
        { 
          id: 'ora', text: 'La ce oră?', 
          options: [
            { label: 'Dimineață', icon: 'wb_twilight' },
            { label: 'Zi', icon: 'wb_sunny' },
            { label: 'Seară', icon: 'bedtime' }
          ] 
        }
      ]
    },
    {
      id: 'experiente', name: 'Experiențe inedite', icon: 'explore',
      color: '#ff6348', shadow: '0 10px 20px rgba(255,99,72,0.15)',
      questions: [
        { 
          id: 'tip', text: 'Ce tip de experiență?', 
          options: [
            { label: 'Aventură', icon: 'hiking' },
            { label: 'Relaxare', icon: 'spa' },
            { label: 'Culturală', icon: 'theater_comedy' },
            { label: 'Gastronomică', icon: 'dinner_dining' }
          ] 
        },
        { 
          id: 'buget', text: 'Care e bugetul?', 
          options: [
            { label: 'Gratuit', icon: 'money_off' },
            { label: 'Sub 100 lei', icon: 'attach_money' },
            { label: 'Peste 100 lei', icon: 'paid' }
          ] 
        },
        { 
          id: 'preferinta', text: 'Preferi ceva?', 
          options: [
            { label: 'Unic și necunoscut', icon: 'auto_awesome' },
            { label: 'Popular dar merită', icon: 'trending_up' },
            { label: 'Off the beaten path', icon: 'map' }
          ] 
        }
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

    if (this.step() < (cat.questions.length)) {
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
    
    // Resetăm rezultatele anterioare pentru a asigura re-randarea și feedback-ul vizual
    this.recs.set([]);
    
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
          
          setTimeout(() => {
            gsap.from('.result-card', {
              y: 40,
              opacity: 0,
              duration: 0.8,
              stagger: 0.15,
              ease: 'power3.out'
            });
          }, 50);
        }, 10);
      });
    } catch (err: any) {
      console.error('Eroare AI Finală:', err);
      const errorMsg = err?.error?.message || err?.message || 'Eroare necunoscută';
      
      this.zone.run(() => {
        alert(`Eroare AI Live: ${errorMsg}. Verifică dacă cheia API este validă și ai internet.`);
        this.view.set('menu');
      });
    }
  }

  splitText(text: string): string[][] {
    return text.split(' ').map(word => word.split(''));
  }

  private animateIn() {
    // Curățăm orice animație în curs pentru întrebare
    gsap.killTweensOf('.quiz-char');

    setTimeout(() => {
      // Animație text întrebare (char reveal) - PĂSTRATĂ
      gsap.fromTo('.quiz-char', 
        { y: 15, opacity: 0 },
        { 
          y: 0, 
          opacity: 1, 
          stagger: 0.01, 
          duration: 0.5, 
          ease: 'power2.out',
          clearProps: 'transform'
        }
      );

      // Butoanele apar acum static (fără animație GSAP), 
      // dar ne asigurăm că sunt vizibile și interactive imediat.
      gsap.set('.answer-btn', { opacity: 1, y: 0, scale: 1, pointerEvents: 'auto', clearProps: 'all' });
    }, 50);
  }

  private animateReveal() {
    const tl = gsap.timeline({ defaults: { ease: 'power2.out', duration: 0.8 } });
    
    gsap.set('.hero-title .char', { y: 30, opacity: 0 });
    gsap.set('.hero-subtitle .char-sub', { y: 20, opacity: 0 });

    tl.to('.hero-title .char', {
      y: 0,
      opacity: 1,
      stagger: 0.02
    })
    .to('.hero-subtitle .char-sub', {
      y: 0,
      opacity: 1,
      stagger: 0.005
    }, '-=0.4');
  }

  handleImageError(event: any) {
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
