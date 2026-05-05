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

      <!-- Map Planner UI (Compact) -->
      <div class="map-planner-container">
        <div class="planner-pill">
          <div class="input-stack">
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

        <!-- High-Fidelity Map Mockup -->
        <div class="maps-container">
          <div class="map-overlay">
            <img src="map-mockup.png" alt="Brașov Map" class="map-image" />
            <div class="map-glass-overlay"></div>
            
            <!-- Simulated Nav Info Overlay -->
            <div class="nav-card">
              <div class="nav-icon">
                <span class="material-icons">turn_right</span>
              </div>
              <div class="nav-text">
                <span class="next-step">La 200m turnează la dreapta</span>
                <span class="street-name">Bulevardul 15 Noiembrie</span>
              </div>
              <div class="eta-block">
                <span class="time">12 min</span>
              </div>
            </div>
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

      .top-nav { padding: 1rem 1.5rem; }
      .back-pill {
        background: #fff;
        border: 1px solid #eee;
        padding: 0.5rem 1rem;
        border-radius: 999px;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: #333;
        font-weight: 700;
        text-decoration: none;
        font-size: 0.9rem;
      }

      .page-header { padding: 0 1.5rem 0.75rem; }
      .eyebrow { font-size: 0.9rem; color: #888; margin: 0; font-weight: 500; }
      h1 { font-size: 2.25rem; font-weight: 800; margin: 0; color: #ff4500; letter-spacing: -0.03em; }

      .map-planner-container {
        padding: 0 1.5rem;
        margin-bottom: 1rem;
      }

      .planner-pill {
        background: #fff;
        border: 1px solid #eee;
        border-radius: 24px; /* Slightly tighter radius */
        padding: 0.75rem 1rem; /* Much smaller padding */
        display: flex;
        align-items: center;
        gap: 0.75rem;
        box-shadow: 0 8px 20px rgba(0,0,0,0.04);
      }

      .input-stack {
        flex: 1;
      }

      .location-input {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
      }
      .dot.dest { background: #ff4500; box-shadow: 0 0 8px rgba(255, 69, 0, 0.4); }

      input {
        border: none;
        outline: none;
        font-size: 1rem;
        font-family: inherit;
        color: #333;
        width: 100%;
        background: transparent;
      }

      .plan-btn {
        width: 2.75rem; /* Smaller button */
        height: 2.75rem;
        background: #ff4500;
        border: none;
        border-radius: 16px;
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 4px 10px rgba(255, 69, 0, 0.2);
      }
      .plan-btn .material-icons { font-size: 1.25rem; }

      .scroll-content { flex: 1; padding: 0 1.5rem 2rem; display: flex; flex-direction: column; gap: 1.25rem; }

      .main-action-container { width: 100%; }

      .buy-ticket-btn {
        width: 100%;
        background: #ff4500;
        color: #fff;
        text-decoration: none;
        padding: 0.9rem;
        border-radius: 999px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        font-weight: 800;
        font-size: 0.95rem;
        box-shadow: 0 8px 20px rgba(255, 69, 0, 0.1);
      }
      
      /* Map Mockup Styles */
      .maps-container {
        flex: 1;
        position: relative;
        border-radius: 32px;
        overflow: hidden;
        box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        min-height: 350px;
        background: #eee;
      }

      .map-overlay {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
      }

      .map-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .map-glass-overlay {
        position: absolute;
        inset: 0;
        background: linear-gradient(to bottom, rgba(255,255,255,0) 60%, rgba(255,255,255,0.8));
        pointer-events: none;
      }

      /* Navigation Card Mockup */
      .nav-card {
        position: absolute;
        bottom: 1.5rem;
        left: 1.5rem;
        right: 1.5rem;
        background: rgba(255, 255, 255, 0.9);
        backdrop-filter: blur(15px);
        border-radius: 24px;
        padding: 1.25rem;
        display: flex;
        align-items: center;
        gap: 1rem;
        box-shadow: 0 10px 30px rgba(0,0,0,0.15);
        border: 1px solid rgba(255,255,255,0.5);
      }

      .nav-icon {
        width: 3rem;
        height: 3rem;
        background: #4285f4;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
      }

      .nav-text { flex: 1; display: flex; flex-direction: column; }
      .next-step { font-weight: 800; font-size: 0.95rem; color: #1a1a1a; }
      .street-name { font-size: 0.8rem; color: #666; font-weight: 500; }

      .eta-block {
        background: #ff4500;
        color: #fff;
        padding: 0.5rem 0.8rem;
        border-radius: 12px;
        font-weight: 800;
        font-size: 0.9rem;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BusProgramComponent {}
