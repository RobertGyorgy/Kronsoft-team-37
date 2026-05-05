import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-parking',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <main class="parking-shell">
      <!-- Top Nav -->
      <header class="top-nav">
        <button class="back-pill" routerLink="/dashboard">
          <span class="material-icons">arrow_back</span>
          Înapoi
        </button>
      </header>

      <section class="hero-section">
        <div class="greeting-block">
          <p class="section-label">Parcare</p>
          <h1 class="page-title">Plătește Parcarea</h1>
        </div>
        <div class="page-illustration">
          <span class="material-icons illustration-icon">local_parking</span>
        </div>
      </section>

      <!-- Custom Neighborhood Map Section -->
      <section class="section map-section">
        <div class="section-header">
          <h3>Zonare Parcare Brașov</h3>
          <span class="map-hint">Vizualizare Hartă</span>
        </div>
        <div class="custom-map-container">
          <img src="/images/neighborhood-map.png" alt="Hartă Zonare" class="neighborhood-img">
          
          <!-- Minimalist Official Pin (Refined) -->
          <div class="official-pin" style="top: 50%; left: 50%;">
            <div class="pin-pulse"></div>
            <div class="pin-dot"></div>
          </div>
        </div>
      </section>

      <!-- Active Sessions / Quick Action -->
      <div class="action-container">
        <div class="parking-card active-session">
          <div class="card-header">
            <span class="status-dot"></span>
            <span class="status-text">Sesiune Activă</span>
          </div>
          <div class="car-info">
            <h2 class="plate-number">BV 01 ABC</h2>
            <p class="location-text">Zona A - Centru Istoric</p>
          </div>
          <div class="timer-display">
            <span class="time-left">01:45:12</span>
            <span class="time-label">timp rămas</span>
          </div>
          <button class="extend-btn">
            Prelungește timpul
          </button>
        </div>
      </div>

      <!-- Zone Selection -->
      <section class="section zone-picker">
        <div class="section-header">
          <h3>Selectează Zona</h3>
        </div>
        <div class="zone-grid">
          <div class="zone-pill active">Zona A</div>
          <div class="zone-pill">Zona B</div>
          <div class="zone-pill">Zona C</div>
          <div class="zone-pill">Rezidențial</div>
        </div>
      </section>

      <!-- New Payment -->
      <div class="scroll-content">
        <section class="section">
          <div class="section-header">
            <h3>Plată Nouă</h3>
          </div>
          <div class="payment-options">
            <div class="option-card">
              <div class="option-icon blue">
                <span class="material-icons">directions_car</span>
              </div>
              <div class="option-info">
                <span class="option-title">Parcare pe oră</span>
                <span class="option-desc">3.00 RON / oră</span>
              </div>
              <span class="material-icons arrow">chevron_right</span>
            </div>
            
            <div class="option-card">
              <div class="option-icon purple">
                <span class="material-icons">calendar_today</span>
              </div>
              <div class="option-info">
                <span class="option-title">Abonament zi</span>
                <span class="option-desc">24.00 RON / zi</span>
              </div>
              <span class="material-icons arrow">chevron_right</span>
            </div>
          </div>
        </section>

        <!-- History -->
        <section class="section">
          <div class="section-header">
            <h3>Istoric Recent</h3>
            <button class="show-all">Vezi tot</button>
          </div>
          <div class="history-item">
            <div class="history-date">
              <span class="day">02</span>
              <span class="month">MAI</span>
            </div>
            <div class="history-info">
              <span class="plate">BV 01 ABC</span>
              <span class="loc">Livada Poștei</span>
            </div>
            <span class="amount">- 6.00 RON</span>
          </div>
        </section>
      </div>
    </main>
  `,
  styles: [
    `
      .parking-shell {
        min-height: 100dvh;
        background: #fcfcfc;
        font-family: 'Surgena', sans-serif;
        display: flex;
        flex-direction: column;
        color: #1a1a1a;
        padding-bottom: 3rem;
      }

      .top-nav {
        padding: 1.5rem 1.5rem 0.5rem;
        display: flex;
        align-items: center;
      }

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
        font-size: 0.95rem;
        cursor: pointer;
        box-shadow: 0 4px 10px rgba(0,0,0,0.03);
        text-decoration: none;
      }

      .hero-section {
        padding: 1rem 1.5rem 1.5rem;
        position: relative;
        overflow: hidden;
      }

      .section-label {
        font-size: 1.1rem;
        font-weight: 500;
        color: #666;
        margin: 0;
      }

      .page-title {
        font-size: 2.25rem;
        font-weight: 800;
        color: #4285f4; /* Blue color from dashboard */
        margin: 0;
        letter-spacing: -0.02em;
      }

      .page-illustration {
        position: absolute;
        top: 0;
        right: -10px;
        opacity: 0.1;
      }

      .illustration-icon {
        font-size: 120px !important;
        color: #4285f4;
        transform: rotate(-10deg);
      }

      .map-section {
        padding: 0 1.5rem;
        margin-bottom: 2rem;
      }

      .map-hint {
        font-size: 0.85rem;
        font-weight: 600;
        color: #2E7D32;
        background: #E8F5E9;
        padding: 0.25rem 0.75rem;
        border-radius: 999px;
      }

      .map-container {
        overflow: hidden;
        border-radius: 28px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.08);
        border: 1px solid #eee;
        background: #f0f0f0;
      }

      .map-container iframe {
        display: block;
      }

      .custom-map-container {
        position: relative;
        overflow: hidden;
        border-radius: 28px;
        box-shadow: 0 15px 35px rgba(0,0,0,0.1);
        border: 1px solid #eee;
        background: #e9ecef; /* Placeholder color */
        line-height: 0;
        min-height: 200px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .neighborhood-img {
        width: 100%;
        height: auto;
        display: block;
        opacity: 0.9;
        z-index: 1;
      }

      .official-pin {
        position: absolute;
        width: 44px;
        height: 44px;
        transform: translate(-50%, -50%);
        z-index: 10;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .pin-dot {
        width: 18px;
        height: 18px;
        background: #2E7D32;
        border: 4px solid #fff;
        border-radius: 50%;
        box-shadow: 0 6px 15px rgba(0,0,0,0.3);
        z-index: 2;
      }

      .pin-pulse {
        position: absolute;
        width: 100%;
        height: 100%;
        background: #2E7D32;
        border-radius: 50%;
        opacity: 0.3;
        animation: pulse 2.5s infinite ease-out;
      }

      @keyframes pulse {
        0% { transform: scale(1); opacity: 0.4; }
        100% { transform: scale(2.5); opacity: 0; }
      }

      .action-container {
        padding: 0 1.5rem;
        margin-bottom: 2rem;
      }

      .parking-card {
        background: #4285f4;
        border-radius: 32px;
        padding: 1.5rem;
        color: #fff;
        box-shadow: 0 15px 30px rgba(66, 133, 244, 0.25);
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .card-header {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .status-dot {
        width: 8px;
        height: 8px;
        background: #4ade80;
        border-radius: 50%;
        box-shadow: 0 0 10px #4ade80;
      }

      .status-text {
        font-size: 0.85rem;
        font-weight: 600;
        opacity: 0.9;
      }

      .plate-number {
        font-size: 1.75rem;
        font-weight: 900;
        margin: 0;
        letter-spacing: 0.05em;
      }

      .location-text {
        font-size: 0.95rem;
        opacity: 0.8;
        margin: 0.25rem 0 0;
      }

      .timer-display {
        display: flex;
        flex-direction: column;
        align-items: center;
        background: rgba(255, 255, 255, 0.1);
        padding: 1rem;
        border-radius: 20px;
        margin: 0.5rem 0;
      }

      .time-left {
        font-size: 2rem;
        font-weight: 800;
        font-variant-numeric: tabular-nums;
      }

      .time-label {
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        opacity: 0.7;
      }

      .extend-btn {
        background: #fff;
        color: #4285f4;
        border: none;
        padding: 1rem;
        border-radius: 999px;
        font-weight: 800;
        font-size: 1rem;
        cursor: pointer;
        transition: transform 0.2s ease;
      }

      .extend-btn:active {
        transform: scale(0.97);
      }

      .scroll-content {
        flex: 1;
        padding: 0 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 2.5rem;
      }

      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.25rem;
      }

      h3 {
        font-size: 1.25rem;
        font-weight: 800;
        margin: 0;
      }

      .show-all {
        background: none;
        border: none;
        color: #4285f4;
        font-weight: 700;
        font-size: 0.9rem;
        cursor: pointer;
      }

      /* Zone Picker */
      .zone-picker {
        padding: 0 1.5rem;
        margin-bottom: 1.5rem;
      }

      .zone-grid {
        display: flex;
        gap: 0.75rem;
        overflow-x: auto;
        padding: 0.5rem 0;
        scrollbar-width: none; /* Hide scrollbar for clean look */
      }

      .zone-grid::-webkit-scrollbar { display: none; }

      .zone-pill {
        white-space: nowrap;
        padding: 0.75rem 1.5rem;
        background: #fff;
        border: 1px solid #eee;
        border-radius: 999px;
        font-weight: 700;
        font-size: 0.9rem;
        color: #666;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .zone-pill.active {
        background: #4285f4;
        color: #fff;
        border-color: #4285f4;
        box-shadow: 0 4px 12px rgba(66, 133, 244, 0.2);
      }

      .payment-options {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .option-card {
        background: #fff;
        border: 1px solid #eee;
        border-radius: 24px;
        padding: 1rem;
        display: flex;
        align-items: center;
        gap: 1rem;
        cursor: pointer;
      }

      .option-icon {
        width: 3rem;
        height: 3rem;
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
      }

      .option-icon.blue { background: #4285f4; }
      .option-icon.purple { background: #a55eea; }

      .option-info { flex: 1; display: flex; flex-direction: column; }
      .option-title { font-weight: 700; font-size: 1rem; }
      .option-desc { font-size: 0.85rem; color: #888; }
      .arrow { color: #ccc; }

      .history-item {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
        background: #f8f9fa;
        border-radius: 24px;
      }

      .history-date {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: #fff;
        width: 3.5rem;
        height: 3.5rem;
        border-radius: 12px;
        border: 1px solid #eee;
      }

      .history-date .day { font-weight: 800; font-size: 1.1rem; line-height: 1; }
      .history-date .month { font-size: 0.65rem; font-weight: 700; color: #888; }

      .history-info { flex: 1; display: flex; flex-direction: column; }
      .history-info .plate { font-weight: 700; font-size: 1rem; }
      .history-info .loc { font-size: 0.85rem; color: #888; }
      .amount { font-weight: 700; color: #ff4757; }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ParkingComponent {}
