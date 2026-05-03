import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-bus-menu',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <main class="bus-shell">
      <!-- Top Nav -->
      <header class="top-nav">
        <button class="back-pill" routerLink="/dashboard">
          <span class="material-icons">arrow_back</span>
          Înapoi
        </button>
      </header>

      <section class="welcome-hero">
        <div class="greeting-block">
          <p class="greeting-time">Transport Public</p>
          <h1 class="greeting-name">Brașov</h1>
        </div>
        <div class="bus-illustration">
          <span class="material-icons bus-icon">directions_bus</span>
        </div>
      </section>

      <!-- Menu Grid -->
      <div class="menu-grid">
        <a routerLink="/transport/bus/program" class="menu-item orange">
          <div class="menu-content">
            <span class="material-icons">directions</span>
            <div class="text-stack">
              <span class="label">Unde mergem?</span>
              <span class="sub">Planifică-ți călătoria</span>
            </div>
          </div>
          <span class="material-icons arrow">chevron_right</span>
        </a>

        <a routerLink="/transport/bus/search" class="menu-item blue">
          <div class="menu-content">
            <span class="material-icons">place</span>
            <div class="text-stack">
              <span class="label">Caută Stații</span>
              <span class="sub">Găsește stații și linii RATBV</span>
            </div>
          </div>
          <span class="material-icons arrow">chevron_right</span>
        </a>

      </div>

      <div class="scroll-content">
        <section class="info-section">
          <div class="info-banner">
            <span class="material-icons">info</span>
            <div class="info-text">
              <h3>Vineri e gratis</h3>
              <p>În fiecare zi de vineri, transportul public în Brașov este gratuit pentru toți cetățenii.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  `,
  styles: [
    `
      .bus-shell {
        min-height: 100dvh;
        background: #fcfcfc;
        font-family: 'Surgena', sans-serif;
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
        text-decoration: none;
        box-shadow: 0 4px 10px rgba(0,0,0,0.03);
      }

      .welcome-hero { padding: 1rem 1.5rem 2rem; position: relative; overflow: hidden; }
      .greeting-time { font-size: 1.5rem; font-weight: 500; color: #1a1a1a; margin: 0; }
      .greeting-name { font-size: 2.25rem; font-weight: 800; color: #ff4500; margin: 0; letter-spacing: -0.02em; }

      .bus-illustration { position: absolute; top: 0; right: -10px; opacity: 0.1; }
      .bus-icon { font-size: 120px !important; color: #ff4500; transform: rotate(-10deg); }

      .menu-grid {
        padding: 0 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 0.85rem;
      }

      .menu-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.5rem;
        border-radius: 28px;
        text-decoration: none;
        color: #fff;
        transition: transform 0.2s ease;
      }

      .menu-item:active { transform: scale(0.97); }

      .menu-content {
        display: flex;
        align-items: center;
        gap: 1.25rem;
      }

      .menu-content .material-icons { font-size: 2rem; opacity: 0.9; }
      .text-stack { display: flex; flex-direction: column; }
      .label { font-size: 1.15rem; font-weight: 800; }
      .sub { font-size: 0.85rem; opacity: 0.8; font-weight: 500; }

      .orange { background: #ff4500; }
      .blue { background: #4285f4; }
      .green { background: #2ed573; }

      .scroll-content { padding: 2rem 1.5rem; }
      .info-banner {
        background: #f8f9fa;
        padding: 1.5rem;
        border-radius: 28px;
        display: flex;
        gap: 1.25rem;
        align-items: flex-start;
      }

      .info-banner .material-icons { color: #ff4500; font-size: 1.75rem; }
      h3 { font-size: 1.2rem; font-weight: 800; margin: 0 0 0.25rem; }
      .info-text p { margin: 0; color: #666; font-size: 0.95rem; line-height: 1.4; }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BusMenuComponent {}
