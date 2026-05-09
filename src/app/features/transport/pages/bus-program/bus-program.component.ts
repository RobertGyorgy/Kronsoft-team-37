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
          Înapoi
        </button>
      </header>

      <section class="page-header">
        <p class="eyebrow">Planificator Urban</p>
        <h1>Unde mergem?</h1>
      </section>

      <div class="planner-section">
        <div class="planner-box">
          <div class="input-group">
            <span class="material-icons start-icon">my_location</span>
            <input type="text" placeholder="Locația ta actuală" value="Locația mea" disabled />
          </div>
          <div class="divider">
            <div class="line"></div>
            <span class="material-icons">swap_vert</span>
            <div class="line"></div>
          </div>
          <div class="input-group">
            <span class="material-icons end-icon">place</span>
            <input type="text" placeholder="Caută destinație..." />
          </div>
          <button class="action-btn">
            Planifică Traseul
            <span class="material-icons">directions</span>
          </button>
        </div>
      </div>

      <div class="scroll-content">
        <div class="ticket-cta">
          <a href="https://24pay.ro" target="_blank" class="ticket-btn">
            <div class="btn-info">
              <span class="material-icons">confirmation_number</span>
              <div class="text">
                <span class="main">Cumpără Bilet</span>
                <span class="sub">Direct prin 24pay</span>
              </div>
            </div>
            <span class="material-icons">open_in_new</span>
          </a>
        </div>

        <div class="map-preview">
          <div class="map-card">
            <div class="map-placeholder">
              <span class="material-icons">map</span>
              <p>Harta se încarcă...</p>
            </div>
            <div class="nav-overlay">
              <div class="nav-step">
                <div class="step-icon">
                  <span class="material-icons">turn_right</span>
                </div>
                <div class="step-details">
                  <span class="instruction">Peste 300m turnează la dreapta</span>
                  <span class="street">Bulevardul Eroilor</span>
                </div>
                <div class="eta">14 min</div>
              </div>
            </div>
          </div>
        </div>
      </div>
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

    .page-header { padding: 0 1.5rem 1.5rem; }
    .eyebrow { font-size: 0.9rem; font-weight: 700; color: #ff4500; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.4rem; }
    h1 { font-size: 2.2rem; font-weight: 900; margin: 0; letter-spacing: -0.04em; line-height: 1; }

    .planner-section { padding: 0 1.5rem; margin-bottom: 2rem; }
    .planner-box {
      background: #fff;
      border-radius: 32px;
      padding: 1.5rem;
      box-shadow: 0 10px 30px rgba(0,0,0,0.06);
      border: 1px solid rgba(0,0,0,0.02);
    }
    
    .input-group { display: flex; align-items: center; gap: 1rem; padding: 0.5rem 0; }
    .input-group input { 
      border: none; 
      outline: none; 
      font-family: inherit; 
      font-size: 1rem; 
      font-weight: 600; 
      width: 100%; 
      color: #1a1a1a;
    }
    .input-group input:disabled { background: transparent; color: #999; }
    
    .start-icon { color: #4285f4; }
    .end-icon { color: #ff4500; }
    
    .divider { display: flex; align-items: center; gap: 1rem; padding: 0.2rem 0; }
    .divider .line { flex: 1; height: 1px; background: #eee; }
    .divider .material-icons { font-size: 1.2rem; color: #ccc; }
    
    .action-btn {
      width: 100%;
      background: #1a1a1a;
      color: #fff;
      border: none;
      padding: 1.2rem;
      border-radius: 20px;
      font-weight: 800;
      font-size: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.8rem;
      margin-top: 1.5rem;
      cursor: pointer;
      transition: all 0.2s;
    }
    .action-btn:active { transform: scale(0.97); background: #333; }

    .scroll-content { padding: 0 1.5rem 3rem; display: flex; flex-direction: column; gap: 1.5rem; }
    
    .ticket-cta { width: 100%; }
    .ticket-btn {
      background: linear-gradient(135deg, #ff4500 0%, #ff6a00 100%);
      padding: 1.2rem 1.5rem;
      border-radius: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      text-decoration: none;
      color: #fff;
      box-shadow: 0 8px 25px rgba(255,69,0,0.2);
    }
    .btn-info { display: flex; align-items: center; gap: 1.2rem; }
    .btn-info .material-icons { font-size: 2rem; }
    .text { display: flex; flex-direction: column; }
    .text .main { font-weight: 900; font-size: 1.1rem; }
    .text .sub { font-size: 0.8rem; opacity: 0.8; font-weight: 500; }

    .map-preview { flex: 1; }
    .map-card {
      height: 300px;
      background: #f0f0f0;
      border-radius: 32px;
      position: relative;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0,0,0,0.05);
    }
    .map-placeholder {
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #bbb;
    }
    .map-placeholder .material-icons { font-size: 3rem; margin-bottom: 0.5rem; }
    .map-placeholder p { font-weight: 600; font-size: 0.9rem; }

    .nav-overlay {
      position: absolute;
      bottom: 1rem;
      left: 1rem;
      right: 1rem;
    }
    .nav-step {
      background: rgba(255,255,255,0.9);
      backdrop-filter: blur(10px);
      padding: 1rem;
      border-radius: 20px;
      display: flex;
      align-items: center;
      gap: 1rem;
      box-shadow: 0 8px 25px rgba(0,0,0,0.1);
      border: 1px solid rgba(255,255,255,0.5);
    }
    .step-icon {
      width: 42px;
      height: 42px;
      background: #4285f4;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
    }
    .step-details { flex: 1; display: flex; flex-direction: column; }
    .instruction { font-weight: 800; font-size: 0.9rem; color: #1a1a1a; }
    .street { font-size: 0.75rem; color: #666; font-weight: 500; }
    .eta {
      background: #ff4500;
      color: #fff;
      padding: 0.4rem 0.6rem;
      border-radius: 10px;
      font-weight: 800;
      font-size: 0.8rem;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BusProgramComponent {}
