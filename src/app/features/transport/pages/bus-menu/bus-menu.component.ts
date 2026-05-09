import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-bus-menu',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <main class="bus-shell">
      <header class="top-nav">
        <button class="back-pill" routerLink="/dashboard">
          <span class="material-icons">arrow_back</span>
          Înapoi
        </button>
      </header>

      <section class="welcome-hero">
        <div class="greeting-block">
          <p class="greeting-time">Mobilitate Urbană</p>
          <h1 class="greeting-name">Brașov Transit</h1>
        </div>
        <div class="hero-accent"></div>
      </section>

      <div class="menu-grid">
        <a routerLink="/transport/bus/search" class="menu-card primary">
          <div class="card-inner">
            <div class="icon-wrap">
              <span class="material-icons">explore</span>
            </div>
            <div class="text-wrap">
              <span class="card-title">Stații & Sosiri</span>
              <span class="card-sub">Găsește cea mai apropiată stație</span>
            </div>
          </div>
          <span class="material-icons arrow">arrow_forward</span>
        </a>

        <a routerLink="/transport/bus/program" class="menu-card secondary">
          <div class="card-inner">
            <div class="icon-wrap">
              <span class="material-icons">route</span>
            </div>
            <div class="text-wrap">
              <span class="card-title">Linii & Orare</span>
              <span class="card-sub">Vezi traseele RATBV complete</span>
            </div>
          </div>
          <span class="material-icons arrow">arrow_forward</span>
        </a>
      </div>

      <footer class="bus-footer">
        <div class="green-friday">
          <div class="gf-icon">
            <span class="material-icons">eco</span>
          </div>
          <div class="gf-text">
            <h3>Vinerea Verde</h3>
            <p>Transport gratuit în fiecare vineri în Brașov.</p>
          </div>
        </div>
      </footer>
    </main>
  `,
  styles: [`
    .bus-shell {
      min-height: 100vh;
      background: #fcfcfc;
      font-family: 'Outfit', sans-serif;
      color: #1a1a1a;
      display: flex;
      flex-direction: column;
    }

    .top-nav { padding: 1.5rem; }
    .back-pill {
      background: #fff;
      border: none;
      padding: 0.6rem 1.2rem;
      border-radius: 100px;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #444;
      font-weight: 700;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
      cursor: pointer;
      font-family: inherit;
    }

    .welcome-hero { 
      padding: 1rem 2rem 3rem; 
      position: relative;
    }
    .greeting-time { font-size: 1rem; font-weight: 700; color: #999; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.5rem; }
    .greeting-name { font-size: 2.5rem; font-weight: 900; color: #1a1a1a; margin: 0; letter-spacing: -0.04em; line-height: 1; }
    
    .hero-accent {
      position: absolute;
      right: -20px;
      top: 0;
      width: 150px;
      height: 150px;
      background: radial-gradient(circle, rgba(255,69,0,0.1) 0%, rgba(255,69,0,0) 70%);
      pointer-events: none;
    }

    .menu-grid {
      padding: 0 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .menu-card {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.8rem;
      border-radius: 32px;
      text-decoration: none;
      transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
      border: 1px solid rgba(0,0,0,0.03);
    }

    .menu-card:active { transform: scale(0.96); }

    .menu-card.primary { background: #fff; box-shadow: 0 10px 30px rgba(0,0,0,0.04); }
    .menu-card.secondary { background: #fff; box-shadow: 0 10px 30px rgba(0,0,0,0.04); }

    .card-inner { display: flex; align-items: center; gap: 1.5rem; }
    .icon-wrap {
      width: 54px;
      height: 54px;
      background: #f8f9fa;
      border-radius: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ff4500;
    }
    .icon-wrap .material-icons { font-size: 1.8rem; }
    
    .text-wrap { display: flex; flex-direction: column; gap: 0.2rem; }
    .card-title { font-size: 1.25rem; font-weight: 800; color: #1a1a1a; }
    .card-sub { font-size: 0.9rem; color: #888; font-weight: 500; }
    
    .arrow { color: #ccc; transition: transform 0.3s; }
    .menu-card:hover .arrow { transform: translateX(5px); color: #ff4500; }

    .bus-footer { margin-top: auto; padding: 2rem 1.5rem 3rem; }
    .green-friday {
      background: #ebfaf0;
      padding: 1.5rem;
      border-radius: 28px;
      display: flex;
      gap: 1.2rem;
      align-items: center;
    }
    .gf-icon {
      width: 48px;
      height: 48px;
      background: #fff;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #2ecc71;
      box-shadow: 0 4px 10px rgba(46,204,113,0.1);
    }
    .gf-text h3 { font-size: 1.1rem; font-weight: 800; margin: 0; color: #1a1a1a; }
    .gf-text p { font-size: 0.9rem; color: #5a5a5a; margin: 0.2rem 0 0; font-weight: 500; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BusMenuComponent {}
