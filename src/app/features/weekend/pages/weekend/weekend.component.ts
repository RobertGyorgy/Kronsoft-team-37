import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface Trail {
  id: number;
  name: string;
  description: string;
  difficulty: 'Ușor' | 'Mediu' | 'Dificil';
  duration: string;
  distance: string;
  image: string;
}

@Component({
  selector: 'app-weekend',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <main class="trails-shell">
      <header class="page-header-pill">
        <button class="unified-back-btn" (click)="goBack()">
          <span class="material-icons">arrow_back</span> Înapoi
        </button>
        <h1 class="page-title-pill">Recomandări</h1>
      </header>

      <div class="scroll-content">
        <section class="intro-section">
          <p class="eyebrow-accent">NATURĂ & TRASSEE</p>
          <h2 class="main-headline">Unde ne plimbăm în weekend?</h2>
          <p class="sub-headline">Descoperă cele mai frumoase trasee din jurul Brașovului, accesibile tot timpul anului.</p>
        </section>

        <div class="trails-list">
          @for (trail of trails; track trail.id) {
            <div class="trail-card-premium">
              <div class="trail-image-wrap">
                <img [src]="'assets/images/' + trail.image" [alt]="trail.name" class="trail-img">
                <div class="trail-overlay"></div>
                <div class="difficulty-tag" [ngClass]="trail.difficulty.toLowerCase()">
                  {{ trail.difficulty }}
                </div>
              </div>
              <div class="trail-details">
                <div class="trail-meta">
                  <span><span class="material-icons">timer</span> {{ trail.duration }}</span>
                  <span><span class="material-icons">trending_up</span> {{ trail.distance }}</span>
                </div>
                <h3 class="trail-title">{{ trail.name }}</h3>
                <p class="trail-desc">{{ trail.description }}</p>
                <button class="btn-trail-action">
                  VEZI TRASEUL PE HARTĂ
                  <span class="material-icons">map</span>
                </button>
              </div>
            </div>
          }
        </div>
      </div>
    </main>
  `,
  styles: [`
    .trails-shell { height: 100vh; width: 100%; overflow: hidden; background: #fdfdfd; font-family: 'Outfit', sans-serif; display: flex; flex-direction: column; }
    .scroll-content { flex: 1; overflow-y: auto; padding-bottom: 3rem; }
    .page-header-pill { display: flex; align-items: center; padding: calc(var(--safe-top) + 1.2rem) 1.5rem 1rem; position: relative; }
    .unified-back-btn { background: none; border: none; color: #333; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 0.3rem; }
    .page-title-pill { font-size: 1.1rem; font-weight: 900; position: absolute; left: 50%; transform: translateX(-50%); margin: 0; }
    
    .intro-section { padding: 1.5rem; }
    .eyebrow-accent { font-size: 0.8rem; font-weight: 900; color: #2ed573; letter-spacing: 0.15em; margin-bottom: 0.5rem; }
    .main-headline { font-size: 2.6rem; font-weight: 900; line-height: 1.1; margin: 0 0 0.75rem; letter-spacing: -0.04em; }
    .sub-headline { color: #666; line-height: 1.5; font-size: 1.05rem; }

    .trails-list { padding: 0 1.5rem 2rem; display: flex; flex-direction: column; gap: 2rem; }
    .trail-card-premium { background: #fff; border-radius: 40px; overflow: hidden; box-shadow: 0 15px 35px rgba(0,0,0,0.06); border: 1px solid #f0f0f0; }
    .trail-image-wrap { position: relative; height: 240px; }
    .trail-img { width: 100%; height: 100%; object-fit: cover; }
    .trail-overlay { position: absolute; inset: 0; background: linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.3)); }
    
    .difficulty-tag { position: absolute; top: 1.25rem; left: 1.25rem; padding: 0.5rem 1rem; border-radius: 50px; font-size: 0.75rem; font-weight: 900; color: #fff; }
    .difficulty-tag.ușor { background: #2ed573; }
    .difficulty-tag.mediu { background: #ffa502; }
    .difficulty-tag.dificil { background: #ff4757; }

    .trail-details { padding: 1.5rem; }
    .trail-meta { display: flex; gap: 1.5rem; margin-bottom: 1rem; color: #888; font-size: 0.85rem; font-weight: 700; }
    .trail-meta span { display: flex; align-items: center; gap: 0.4rem; }
    .trail-meta .material-icons { font-size: 1.1rem; color: #2ed573; }
    
    .trail-title { font-size: 1.5rem; font-weight: 900; margin: 0 0 0.75rem; color: #1a1a1a; letter-spacing: -0.02em; }
    .trail-desc { font-size: 0.95rem; color: #555; line-height: 1.6; margin-bottom: 1.5rem; }
    
    .btn-trail-action { width: 100%; background: #f0f7f4; color: #2ed573; border: none; padding: 1rem; border-radius: 50px; font-size: 0.85rem; font-weight: 900; display: flex; align-items: center; justify-content: center; gap: 0.6rem; cursor: pointer; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WeekendComponent {
  trails: Trail[] = [
    {
      id: 1,
      name: "Tâmpa - Drumul Serpentinelor",
      description: "Cel mai popular traseu din Brașov. O plimbare relaxantă prin pădure care culminează cu o panoramă de vis asupra centrului istoric.",
      difficulty: "Ușor",
      duration: "1h 15m",
      distance: "400m dif. niv.",
      image: "trail_tampa.png"
    },
    {
      id: 2,
      name: "Pietrele lui Solomon",
      description: "O zonă legendară ideală pentru plimbări ușoare, picnic și relaxare lângă râu. Pereții de calcar sunt spectaculoși.",
      difficulty: "Ușor",
      duration: "45m",
      distance: "Traseu Plat",
      image: "trail_solomon.png"
    },
    {
      id: 3,
      name: "Drumul Vechi spre Poiana Brașov",
      description: "Un traseu istoric lat și bine întreținut, perfect pentru o plimbare mai lungă sau mountain biking prin pădurea de pini.",
      difficulty: "Mediu",
      duration: "2h 30m",
      distance: "8km (dus-întors)",
      image: "trail_poiana.png"
    }
  ];

  goBack() { window.history.back(); }
}
