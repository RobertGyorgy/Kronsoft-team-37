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
      <header class="top-nav-white">
        <h1 class="header-title">Zona metropolitana Brasov</h1>
        <button class="back-arrow" routerLink="/dashboard">
          <span class="material-icons">arrow_back</span>
        </button>
      </header>

      <div class="main-scroll-area">
        <!-- Map Section (Top) -->
        <section class="hero-map-section">
          <div class="custom-map-container no-shadow">
            <img src="/images/neighborhood-map.png" alt="Hartă Zonare" class="neighborhood-img">
            
            <!-- Minimalist Official Pin -->
            <div class="official-pin" style="top: 50%; left: 50%;">
              <div class="pin-pulse"></div>
              <div class="pin-dot"></div>
            </div>
          </div>
        </section>

        <!-- Zona Info Card -->
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

        <!-- Rest of the content (Scrollable below) -->
        <div class="additional-content">
          <section class="section zone-picker">
            <div class="section-header">
              <h3>Selectează Altă Zonă</h3>
            </div>
            <div class="zone-grid">
              <div class="zone-pill active">Zona A</div>
              <div class="zone-pill">Zona B</div>
              <div class="zone-pill">Zona C</div>
              <div class="zone-pill">Rezidențial</div>
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
        background: #f8f9fa;
        font-family: 'Outfit', sans-serif;
        display: flex;
        flex-direction: column;
        color: #1a1a1a;
      }

      .top-nav-white {
        background: #fff;
        padding: 1.25rem 1.5rem;
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;
        box-shadow: 0 2px 10px rgba(0,0,0,0.02);
        z-index: 100;
      }

      .header-title {
        font-size: 1.4rem;
        font-weight: 800;
        margin: 0;
        color: #1a1a1a;
      }

      .back-arrow {
        position: absolute;
        right: 1.5rem;
        background: none;
        border: none;
        cursor: pointer;
        color: #1a1a1a;
      }

      .main-scroll-area {
        flex: 1;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
      }

      .hero-map-section {
        padding: 1rem;
      }

      .custom-map-container {
        position: relative;
        overflow: hidden;
        border-radius: 16px;
        background: #e9ecef;
        line-height: 0;
      }

      .neighborhood-img {
        width: 100%;
        height: auto;
        display: block;
      }

      /* Info Card Section */
      .info-card-section {
        padding: 0 1rem 1.5rem;
      }

      .zona-card {
        background: #fff;
        border-radius: 32px;
        padding: 2rem 1.5rem;
        box-shadow: 0 10px 30px rgba(0,0,0,0.05);
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .zona-title {
        font-size: 1.6rem;
        font-weight: 800;
        margin: 0;
        text-align: left;
        line-height: 1.2;
      }

      .sms-instruction {
        background: #ffe0b2;
        padding: 1.25rem;
        border-radius: 24px;
      }

      .sms-instruction p {
        margin: 0;
        font-size: 1.05rem;
        font-weight: 600;
        line-height: 1.4;
        color: #1a1a1a;
      }

      .card-actions {
        display: flex;
        gap: 1rem;
      }

      .black-btn {
        flex: 1;
        background: #1a1a1a;
        color: #fff;
        border: none;
        padding: 1.25rem;
        border-radius: 999px;
        font-weight: 700;
        font-size: 1.1rem;
        cursor: pointer;
        transition: transform 0.2s ease;
      }

      .black-btn:active {
        transform: scale(0.96);
      }

      /* Pin Styles */
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
        0% { transform: scale(1); opacity: 0.3; }
        100% { transform: scale(2.5); opacity: 0; }
      }

      .additional-content {
        padding-bottom: 3rem;
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

      .zone-picker {
        padding: 0 1.5rem;
        margin-bottom: 1.5rem;
      }

      .zone-grid {
        display: flex;
        gap: 0.75rem;
        overflow-x: auto;
        padding: 0.5rem 0;
        scrollbar-width: none;
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
      }

      .zone-pill.active {
        background: #4285f4;
        color: #fff;
        border-color: #4285f4;
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
