import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-parking',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <main class="parking-shell">
      <!-- 1. Header Fix (White & Clean) -->
      <header class="top-nav-white">
        <h1 class="header-title">Zona metropolitana Brasov</h1>
        <button class="back-arrow" routerLink="/dashboard">
          <span class="material-icons">arrow_back</span>
        </button>
      </header>

      <div class="main-scroll-area">
        <!-- 2. Map Section (Ultra Compact) -->
        <section class="hero-map-section">
          <div class="custom-map-container">
            <img src="/images/neighborhood-map.png" alt="Hartă Zonare" class="neighborhood-img">
            <div class="official-pin" style="top: 50%; left: 50%;">
              <div class="pin-pulse"></div>
              <div class="pin-dot"></div>
            </div>
          </div>
        </section>

        <!-- 3. Zona Info Card (MUST FIT IN VIEWPORT) -->
        <section class="info-card-section">
          <div class="zona-card">
            <h2 class="zona-title">Te afli in zona 0 - Centru Vechi</h2>
            <div class="sms-instruction">
              <p>Pentru plata te rugam trimite prin SMS numarul 1234 urmat de numarul de inmatriculare si numarul de ore</p>
            </div>
            <div class="card-actions">
              <button class="black-btn">Tarifare</button>
              <button class="black-btn">Spre SMS</button>
            </div>
          </div>
        </section>

        <!-- 4. ORIGINAL CONTENT FLOW (Scrollable) -->
        <div class="original-content-flow">
          <!-- Active Sessions (The Blue Card) -->
          <section class="section">
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
              <button class="extend-btn">Prelungește timpul</button>
            </div>
          </section>

          <!-- Zone Selection -->
          <section class="section">
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
      </div>
    </main>
  `,
  styles: [
    `
      .parking-shell {
        min-height: 100dvh;
        background: #f8f9fa;
        font-family: 'Outfit', sans-serif;
        display: flex;
        flex-direction: column;
        color: #1a1a1a;
      }

      .top-nav-white {
        background: #fff;
        padding: 0.75rem 1.5rem;
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;
        border-bottom: 1px solid #f0f0f0;
        z-index: 10;
      }

      .header-title {
        font-size: 1.2rem;
        font-weight: 800;
        margin: 0;
      }

      .back-arrow {
        position: absolute;
        right: 1.5rem;
        background: none;
        border: none;
        color: #1a1a1a;
        cursor: pointer;
      }

      .main-scroll-area {
        flex: 1;
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
      }

      .hero-map-section {
        padding: 0.5rem 1rem;
      }

      .custom-map-container {
        position: relative;
        overflow: hidden;
        border-radius: 16px;
        height: 180px; /* Adjust height slightly to fit the full map proportionally */
        background: #f8f9fa; /* Match page background */
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .neighborhood-img {
        width: 100%;
        height: 100%;
        object-fit: contain; /* DO NOT CROP - Fit whole image */
      }

      .info-card-section {
        padding: 0 1rem 0.5rem;
      }

      .zona-card {
        background: #fff;
        border-radius: 24px;
        padding: 1.25rem;
        box-shadow: 0 8px 24px rgba(0,0,0,0.05);
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .zona-title {
        font-size: 1.4rem;
        font-weight: 800;
        margin: 0;
        letter-spacing: -0.02em;
      }

      .sms-instruction {
        background: #ffe0b2;
        padding: 0.85rem;
        border-radius: 16px;
      }

      .sms-instruction p {
        margin: 0;
        font-size: 0.95rem;
        font-weight: 600;
        line-height: 1.3;
        color: #5d4037;
      }

      .card-actions {
        display: flex;
        gap: 0.75rem;
      }

      .black-btn {
        flex: 1;
        background: #1a1a1a;
        color: #fff;
        border: none;
        padding: 0.85rem;
        border-radius: 999px;
        font-weight: 700;
        font-size: 0.95rem;
        cursor: pointer;
      }

      /* Original Content Styling */
      .original-content-flow {
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 2rem;
        background: #fff;
        border-top: 1px solid #eee;
        border-radius: 32px 32px 0 0;
        margin-top: 0.5rem;
      }

      .section {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      h3 {
        font-size: 1.2rem;
        font-weight: 800;
        margin: 0;
      }

      .parking-card {
        background: #4285f4;
        border-radius: 28px;
        padding: 1.5rem;
        color: #fff;
        box-shadow: 0 12px 24px rgba(66, 133, 244, 0.2);
      }

      .card-header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem; }
      .status-dot { width: 8px; height: 8px; background: #4ade80; border-radius: 50%; box-shadow: 0 0 10px #4ade80; }
      .status-text { font-size: 0.85rem; font-weight: 600; }
      .plate-number { font-size: 1.8rem; font-weight: 900; margin: 0; }
      .location-text { font-size: 0.9rem; opacity: 0.9; }

      .timer-display {
        display: flex;
        flex-direction: column;
        align-items: center;
        background: rgba(255, 255, 255, 0.15);
        padding: 1rem;
        border-radius: 20px;
        margin: 1rem 0;
      }
      .time-left { font-size: 2.2rem; font-weight: 800; font-variant-numeric: tabular-nums; }
      .time-label { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.1em; }

      .extend-btn {
        width: 100%;
        background: #fff;
        color: #4285f4;
        border: none;
        padding: 1rem;
        border-radius: 999px;
        font-weight: 800;
        font-size: 1rem;
        cursor: pointer;
      }

      .zone-grid {
        display: flex;
        gap: 0.75rem;
        overflow-x: auto;
        padding-bottom: 0.5rem;
        scrollbar-width: none;
      }
      .zone-grid::-webkit-scrollbar { display: none; }

      .zone-pill {
        white-space: nowrap;
        padding: 0.7rem 1.4rem;
        background: #f8f9fa;
        border: 1px solid #eee;
        border-radius: 999px;
        font-weight: 700;
        font-size: 0.9rem;
        color: #666;
      }
      .zone-pill.active {
        background: #4285f4;
        color: #fff;
        border-color: #4285f4;
      }

      .history-item {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
        background: #f8f9fa;
        border: 1px solid #eee;
        border-radius: 20px;
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
      }
      .history-date .day { font-weight: 800; font-size: 1.1rem; line-height: 1; }
      .history-date .month { font-size: 0.65rem; font-weight: 700; color: #888; }
      .history-info { flex: 1; display: flex; flex-direction: column; }
      .history-info .plate { font-weight: 700; }
      .history-info .loc { font-size: 0.8rem; color: #888; }
      .amount { font-weight: 700; color: #ff4757; }
      .show-all { background: none; border: none; color: #4285f4; font-weight: 700; font-size: 0.9rem; }

      /* Pin Animation */
      .official-pin { position: absolute; width: 32px; height: 32px; transform: translate(-50%, -50%); z-index: 10; display: flex; align-items: center; justify-content: center; }
      .pin-dot { width: 14px; height: 14px; background: #2E7D32; border: 3px solid #fff; border-radius: 50%; box-shadow: 0 4px 10px rgba(0,0,0,0.2); z-index: 2; }
      .pin-pulse { position: absolute; width: 100%; height: 100%; background: #2E7D32; border-radius: 50%; opacity: 0.3; animation: pulse 2.5s infinite ease-out; }

      @keyframes pulse {
        0% { transform: scale(1); opacity: 0.3; }
        100% { transform: scale(2.5); opacity: 0; }
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ParkingComponent {}
