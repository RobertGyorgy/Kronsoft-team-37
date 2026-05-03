import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-bus-program',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <main class="bus-shell">
      <header class="top-nav">
        <button class="back-pill" routerLink="/transport/bus">
          <span class="material-icons">arrow_back</span>
          Meniu
        </button>
      </header>

      <section class="page-header">
        <p class="eyebrow">Planificator Călătorie</p>
        <h1>Unde mergem?</h1>
      </section>

      <!-- Map Planner UI -->
      <div class="map-planner-container">
        <div class="planner-pill">
          <div class="input-stack">
            <div class="location-input">
              <span class="dot origin"></span>
              <input type="text" placeholder="Locația ta" />
            </div>
            <div class="divider"></div>
            <div class="location-input">
              <span class="dot dest"></span>
              <input type="text" placeholder="Introdu destinația" />
            </div>
          </div>
          <button class="plan-btn">
            <span class="material-icons">directions</span>
          </button>
        </div>
      </div>

      <div class="scroll-content">
        <!-- Quick Action: Buy Ticket -->
        <div class="main-action-container">
          <a href="https://24pay.ro" target="_blank" class="buy-ticket-btn">
            <span class="material-icons">confirmation_number</span>
            Cumpără bilet (24pay)
          </a>
        </div>

        <div class="maps-placeholder">
          <div class="placeholder-content">
            <span class="material-icons">map</span>
            <p>Harta se va încărca aici în curând...</p>
          </div>
        </div>
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
      }

      .top-nav { padding: 1.5rem; }
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
      }

      .page-header { padding: 0 1.5rem 1rem; }
      .eyebrow { font-size: 1.1rem; color: #888; margin: 0; font-weight: 500; }
      h1 { font-size: 2.75rem; font-weight: 800; margin: 0; color: #ff4500; letter-spacing: -0.04em; }

      .map-planner-container {
        padding: 0 1.5rem;
        margin-bottom: 1.5rem;
      }

      .planner-pill {
        background: #fff;
        border: 1px solid #eee;
        border-radius: 32px;
        padding: 1.5rem;
        display: flex;
        align-items: center;
        gap: 1rem;
        box-shadow: 0 12px 30px rgba(0,0,0,0.06);
      }

      .input-stack {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .location-input {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
      }
      .dot.origin { background: #bbb; }
      .dot.dest { background: #ff4500; box-shadow: 0 0 10px rgba(255, 69, 0, 0.4); }

      .divider {
        height: 1px;
        background: #f0f0f0;
        margin-left: 1.75rem;
      }

      input {
        border: none;
        outline: none;
        font-size: 1.1rem;
        font-family: inherit;
        color: #333;
        width: 100%;
      }

      .plan-btn {
        width: 4rem;
        height: 4rem;
        background: #ff4500;
        border: none;
        border-radius: 24px;
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 8px 16px rgba(255, 69, 0, 0.2);
      }

      .scroll-content { flex: 1; padding: 0 1.5rem 2rem; display: flex; flex-direction: column; gap: 1.5rem; }

      .main-action-container { width: 100%; }

      .buy-ticket-btn {
        width: 100%;
        background: #ff4500;
        color: #fff;
        text-decoration: none;
        padding: 1.1rem;
        border-radius: 999px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.75rem;
        font-weight: 800;
        font-size: 1rem;
        box-shadow: 0 8px 20px rgba(255, 69, 0, 0.15);
      }
      
      .maps-placeholder {
        flex: 1;
        background: #f8f9fa;
        border-radius: 32px;
        border: 2px dashed #eee;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #bbb;
        min-height: 200px;
      }

      .placeholder-content {
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
      }

      .placeholder-content .material-icons { font-size: 3rem; }
      .placeholder-content p { margin: 0; font-weight: 500; }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BusProgramComponent {}
