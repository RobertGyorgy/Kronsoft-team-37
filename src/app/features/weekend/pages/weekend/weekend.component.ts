import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface Recommendation {
  id: number;
  name: string;
  category: 'Restaurant' | 'Natură' | 'Cafenea' | 'Obiectiv';
  description: string;
  distance: string;
  rating: number;
  image: string;
}

@Component({
  selector: 'app-weekend',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <main class="weekend-shell">
      <header class="top-nav-teal">
        <button class="back-btn-teal" (click)="goBack()">
          <span class="material-icons">arrow_back</span> Înapoi
        </button>
        <h1 class="page-title">Recomandări Brașov</h1>
      </header>

      <div class="grid-container">
        @for (item of items; track item.id) {
          <div class="rec-grid-card">
            <div class="card-image-wrap">
              <img [src]="item.image" [alt]="item.name" class="card-img">
              <span class="cat-badge" [ngClass]="item.category.toLowerCase()">
                {{ item.category }}
              </span>
              <div class="rating-badge">
                <span class="material-icons star-icon">star</span>
                <span>{{ item.rating }}</span>
              </div>
            </div>
            
            <div class="card-info">
              <h3 class="item-name">{{ item.name }}</h3>
              <p class="item-desc">{{ item.description }}</p>
              <div class="card-footer">
                <span class="distance-text">
                  <span class="material-icons">near_me</span> {{ item.distance }}
                </span>
                <button class="details-link">DETALII</button>
              </div>
            </div>
          </div>
        }
      </div>
    </main>
  `,
  styles: [`
    .weekend-shell { height: 100vh; width: 100%; overflow: hidden; background: #f4fafb; font-family: 'Outfit', sans-serif; display: flex; flex-direction: column; }
    
    .top-nav-teal { padding: calc(var(--safe-top) + 1.2rem) 1.5rem 1.25rem; background: #2bcbba; display: flex; align-items: center; justify-content: space-between; color: #fff; box-shadow: 0 4px 20px rgba(43, 203, 186, 0.2); }
    .back-btn-teal { background: rgba(255,255,255,0.2); border: none; color: #fff; padding: 0.5rem 1rem; border-radius: 50px; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 0.3rem; }
    .page-title { font-size: 1.2rem; font-weight: 900; margin: 0; }

    .grid-container { 
      flex: 1; 
      overflow-y: auto; 
      padding: 1.25rem; 
      display: grid; 
      grid-template-columns: repeat(2, 1fr); 
      gap: 1.25rem;
      padding-bottom: 3rem;
    }

    .rec-grid-card {
      background: #fff;
      border-radius: 28px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      box-shadow: 0 10px 25px rgba(0,0,0,0.05);
      transition: transform 0.2s;
    }
    .rec-grid-card:active { transform: scale(0.96); }

    .card-image-wrap { position: relative; height: 140px; }
    .card-img { width: 100%; height: 100%; object-fit: cover; }
    
    .cat-badge {
      position: absolute; top: 0.75rem; left: 0.75rem;
      font-size: 0.6rem; font-weight: 900; text-transform: uppercase;
      padding: 0.35rem 0.6rem; border-radius: 50px; color: #fff;
      letter-spacing: 0.05em;
    }
    .cat-badge.restaurant { background: #ff4757; }
    .cat-badge.natură { background: #2ed573; }
    .cat-badge.cafenea { background: #ffa502; }
    .cat-badge.obiectiv { background: #4285f4; }

    .rating-badge {
      position: absolute; bottom: 0.75rem; right: 0.75rem;
      background: rgba(0,0,0,0.6); backdrop-filter: blur(5px);
      color: #fff; padding: 0.25rem 0.6rem; border-radius: 50px;
      display: flex; align-items: center; gap: 0.2rem; font-size: 0.75rem; font-weight: 800;
    }
    .star-icon { font-size: 0.9rem; color: #f1c40f; }

    .card-info { padding: 1rem; flex: 1; display: flex; flex-direction: column; }
    .item-name { font-size: 1rem; font-weight: 900; margin: 0 0 0.4rem; color: #1a1a1a; line-height: 1.2; }
    .item-desc { font-size: 0.8rem; color: #666; line-height: 1.4; margin: 0 0 1rem; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; flex: 1; }

    .card-footer { display: flex; align-items: center; justify-content: space-between; }
    .distance-text { font-size: 0.7rem; font-weight: 800; color: #2bcbba; display: flex; align-items: center; gap: 0.2rem; }
    .distance-text .material-icons { font-size: 0.9rem; }
    
    .details-link { background: none; border: none; color: #2bcbba; font-size: 0.7rem; font-weight: 950; cursor: pointer; padding: 0; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WeekendComponent {
  items: Recommendation[] = [
    { id: 1, name: "Traseu Tâmpa", category: "Natură", description: "Drumul serpentinelor către vârful Tâmpa. Panoramă superbă deasupra Brașovului.", distance: "1.2 km", rating: 4.9, image: "assets/images/trail_tampa.png" },
    { id: 2, name: "Biserica Neagră", category: "Obiectiv", description: "Cel mai mare edificiu sacru în stil gotic din sud-estul Europei. Un simbol al orașului.", distance: "0.4 km", rating: 4.8, image: "assets/images/culture_v2.png" },
    { id: 3, name: "Restaurant Sergiana", category: "Restaurant", description: "Bucătărie tradițională transilvăneană într-o atmosferă autentică de cramă.", distance: "0.6 km", rating: 4.7, image: "assets/images/gastronomy_v2.png" },
    { id: 4, name: "Cafenea Tipografia", category: "Cafenea", description: "Concept store și cafenea cu cafea de specialitate și atmosferă artistică.", distance: "0.5 km", rating: 4.9, image: "assets/images/experiente.png" },
    { id: 5, name: "Pietrele lui Solomon", category: "Natură", description: "Zonă naturală deosebită la marginea orașului, ideală pentru relaxare și picnic.", distance: "3.5 km", rating: 4.6, image: "assets/images/trail_solomon.png" },
    { id: 6, name: "Poiana Brașov", category: "Natură", description: "Cea mai renumită stațiune montană, situată la poalele Masivului Postăvarul.", distance: "12 km", rating: 4.9, image: "assets/images/trail_poiana.png" }
  ];

  goBack() { window.history.back(); }
}
