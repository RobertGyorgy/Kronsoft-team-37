import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-parking',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <main class="parking-shell">
      <!-- 1. Header Fix (White & Clean) -->
      <header class="top-nav-white">
        <button class="back-pill" routerLink="/dashboard">
          <span class="material-icons">arrow_back</span>
          <span class="back-text">Înapoi</span>
        </button>
        <h1 class="header-title">Zona metropolitana Brasov</h1>
      </header>

      <div class="main-scroll-area">
        <!-- 2. Map Section (Compact) -->
        <section class="hero-map-section">
          <div class="custom-map-container">
            <img src="/images/neighborhood-map.png" alt="Hartă Zonare" class="neighborhood-img">
          </div>
        </section>

        <!-- 3. Zona Info Card -->
        <section class="info-card-section">
          <div class="zona-card">
            <h2 class="zona-title">Zona 0 - Centru Vechi</h2>
            <p class="sms-note">Pentru plata te rugam trimite prin SMS numarul 1234 urmat de numarul de inmatriculare si numarul de ore</p>
            <div class="card-actions">
              <button class="black-btn" (click)="toggleTariffs()">Tarife</button>
              <button class="black-btn" (click)="sendNativeSms()">SMS</button>
            </div>
          </div>
        </section>

        <!-- Tariffs Modal Overlay -->
        <!-- ... (previous modal code) ... -->


        <!-- Tariffs Modal Overlay -->
        <div class="modal-overlay" *ngIf="showTariffs" (click)="toggleTariffs()">
          <div class="tariffs-modal" (click)="$event.stopPropagation()">
            <div class="modal-handle"></div>
            <div class="modal-header">
              <h2>Tarife parcare</h2>
              <button class="close-modal" (click)="toggleTariffs()">
                <span class="material-icons">close</span>
              </button>
            </div>
            
            <div class="tariffs-list">
              <div class="tariff-card zona-0">
                <span class="tariff-zone">Zona 0</span>
                <div class="tariff-details">
                  <p>1h - 3.00 lei</p>
                  <p>2h - 6.00 lei</p>
                </div>
              </div>

              <div class="tariff-card zona-1">
                <span class="tariff-zone">Zona 1</span>
                <div class="tariff-details">
                  <p>1h - 2.00 lei</p>
                  <p>2h - 4.00 lei</p>
                </div>
              </div>

              <div class="tariff-card zona-2">
                <span class="tariff-zone">Zona 2</span>
                <div class="tariff-details">
                  <p>1h - 1.50 lei</p>
                  <p>2h - 3.00 lei</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- 4. Active Session (Full Version) -->
        <section class="section-full-height">
          <div class="parking-card active-session">
            <div class="card-body">
              <!-- Input State -->
              <div class="plate-input-container" *ngIf="!isPlateSaved">
                <label class="input-label">Introdu numărul de înmatriculare</label>
                <div class="input-row">
                  <input 
                    type="text" 
                    [(ngModel)]="tempPlate" 
                    placeholder="ex: BV 01 ABC"
                    class="plate-input-field"
                  >
                  <button class="save-plate-btn" (click)="savePlate()">Salvează</button>
                </div>
              </div>

              <!-- Display State -->
              <div class="plate-display-container" *ngIf="isPlateSaved" (click)="editPlate()">
                <p class="car-plate">{{ carPlate }}</p>
              </div>
            </div>
            <div class="timer-display">
              <span class="time-left">{{ timeLeft }}</span>
              <span class="time-label">timp rămas</span>
            </div>
            <div class="extend-container">
              <button class="extend-btn" (click)="toggleQuickAdd()">Prelungește timpul</button>
              
              <!-- Quick Add Menu -->
              <div class="quick-add-menu" *ngIf="showQuickAdd">
                <div class="quick-option" (click)="extendTime(30); $event.stopPropagation()">+30 min</div>
                <div class="quick-option" (click)="extendTime(60); $event.stopPropagation()">+1h</div>
                <div class="quick-option" (click)="extendTime(120); $event.stopPropagation()">+2h</div>
              </div>
            </div>
          </div>
        </section>

        <!-- 5. ORIGINAL CONTENT FLOW (Scrollable) -->
        <div class="original-content-flow">
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
        padding: 0.75rem 1rem;
        display: flex;
        align-items: center;
        position: relative;
        border-bottom: 1px solid #f0f0f0;
        z-index: 10;
        min-height: 60px;
      }

      .header-title {
        font-size: 1.1rem;
        font-weight: 800;
        margin: 0;
        flex: 1;
        text-align: center;
        padding: 0 4rem; /* Padding to prevent overlap with the back button */
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .back-pill {
        position: absolute;
        left: 1rem;
        display: flex;
        align-items: center;
        gap: 0.4rem;
        background: #fff;
        border: 1px solid #e0e0e0;
        padding: 0.4rem 0.8rem;
        border-radius: 999px;
        color: #1a1a1a;
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        transition: all 0.2s ease;
      }

      .back-pill:active {
        transform: scale(0.95);
        background: #f5f5f5;
      }

      .back-text {
        font-weight: 700;
        font-size: 0.9rem;
      }

      .main-scroll-area {
        flex: 1;
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
      }



      .hero-map-section {
        padding: 0.5rem 1rem 0;
        height: 30vh; /* Reduced from 38vh to fit all 3 blocks */
        min-height: 200px;
      }

      .custom-map-container {
        border-radius: 20px;
        overflow: hidden;
        height: 100%;
        background: #f8f9fa;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 15px rgba(0,0,0,0.05);
      }

      .neighborhood-img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }

      .info-card-section {
        padding: 0.5rem 1rem;
      }

      .zona-card {
        background: linear-gradient(135deg, #4285f4 0%, #2b6edb 100%);
        border-radius: 20px;
        padding: 1rem;
        box-shadow: 0 10px 25px rgba(66, 133, 244, 0.2);
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        color: #fff;
      }

      .zona-title {
        font-size: 1.2rem;
        font-weight: 800;
        margin: 0;
        color: #fff;
      }

      .sms-note {
        font-size: 0.8rem;
        line-height: 1.2;
        margin: 0;
        opacity: 0.9;
        font-weight: 600;
      }

      .card-actions {
        display: flex;
        gap: 0.6rem;
        margin-top: 0.15rem;
      }

      .black-btn {
        flex: 1;
        background: #fff;
        color: #4285f4;
        border: none;
        padding: 0.75rem;
        border-radius: 14px;
        font-weight: 800;
        font-size: 0.9rem;
        cursor: pointer;
        box-shadow: 0 4px 10px rgba(0,0,0,0.1);
      }

      .section-full-height {
        padding: 0.25rem 1rem 0.75rem;
      }

      /* Active Session Premium Card (Refined) */
      .parking-card.active-session {
        background: #4285f4;
        border-radius: 20px;
        padding: 1rem;
        color: #fff;
        box-shadow: 0 8px 25px rgba(66, 133, 244, 0.2);
      }

      .card-header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; }
      .status-dot-pulse { width: 8px; height: 8px; background: #4ade80; border-radius: 50%; box-shadow: 0 0 10px #4ade80; animation: blink 2s infinite; }
      @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      .status-label { font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }

      .car-plate { font-size: 1.7rem; font-weight: 900; margin: 0; letter-spacing: -0.02em; }
      .location-text { font-size: 0.9rem; opacity: 0.9; margin: 0.15rem 0 0.75rem; }

      .timer-display {
        background: rgba(255, 255, 255, 0.15);
        border-radius: 16px;
        padding: 1rem;
        text-align: center;
        margin-bottom: 0.75rem;
      }

      .time-left { font-size: 2.2rem; font-weight: 800; display: block; line-height: 1; }
      .time-label { font-size: 0.7rem; text-transform: uppercase; font-weight: 700; opacity: 0.8; letter-spacing: 0.1em; margin-top: 0.2rem; display: block; }

      .extend-container { position: relative; }
      .extend-btn {
        width: 100%;
        background: #fff;
        color: #4285f4;
        border: none;
        padding: 0.85rem;
        border-radius: 14px;
        font-weight: 800;
        font-size: 0.95rem;
        cursor: pointer;
      }

      /* Plate Input Styles */
      .plate-input-container {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        margin-bottom: 0.75rem;
      }

      .input-label {
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        opacity: 0.9;
        letter-spacing: 0.05em;
      }

      .input-row {
        display: flex;
        gap: 0.5rem;
      }

      .plate-input-field {
        flex: 1;
        background: rgba(255, 255, 255, 0.2);
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-radius: 12px;
        padding: 0.75rem;
        color: #fff;
        font-weight: 800;
        font-size: 1rem;
        outline: none;
      }

      .plate-input-field::placeholder {
        color: rgba(255, 255, 255, 0.6);
      }

      .save-plate-btn {
        background: #fff;
        color: #4285f4;
        border: none;
        padding: 0 1rem;
        border-radius: 12px;
        font-weight: 800;
        font-size: 0.85rem;
        cursor: pointer;
      }

      .plate-display-container {
        cursor: pointer;
        margin-bottom: 0.5rem;
      }
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


      /* Tariffs Modal Styles */
      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        z-index: 1000;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
      }

      .tariffs-modal {
        background: #fff;
        border-radius: 32px 32px 0 0;
        padding: 1.5rem;
        max-height: 80vh;
        overflow-y: auto;
        animation: slideUp 0.3s ease-out;
      }

      @keyframes slideUp {
        from { transform: translateY(100%); }
        to { transform: translateY(0); }
      }

      .modal-handle {
        width: 40px;
        height: 4px;
        background: #eee;
        border-radius: 2px;
        margin: 0 auto 1.5rem;
      }

      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
      }

      .modal-header h2 {
        font-size: 1.5rem;
        font-weight: 800;
        margin: 0;
      }

      .close-modal {
        background: #f5f5f5;
        border: none;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      }

      .tariffs-list {
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
      }

      .tariff-card {
        padding: 1.5rem;
        border-radius: 24px;
        color: #fff;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .tariff-zone {
        font-size: 1.2rem;
        font-weight: 900;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .tariff-details p {
        margin: 0;
        font-weight: 700;
        font-size: 1.1rem;
        opacity: 0.95;
      }

      .zona-0 { background: #ff4757; box-shadow: 0 8px 20px rgba(255, 71, 87, 0.2); }
      .zona-1 { background: #ffa502; box-shadow: 0 8px 20px rgba(255, 165, 2, 0.2); }
      .zona-2 { background: #2ed573; box-shadow: 0 8px 20px rgba(46, 213, 115, 0.2); }


      .sms-icon { color: #8e8e93; cursor: pointer; }
      /* Quick Add Menu Styles */
      .extend-container { position: relative; width: 100%; }
      
      .quick-add-menu {
        position: absolute;
        bottom: 120%;
        left: 0;
        width: 100%;
        background: #fff;
        border-radius: 20px;
        padding: 0.5rem;
        box-shadow: 0 -10px 25px rgba(0,0,0,0.15);
        display: flex;
        justify-content: space-around;
        gap: 0.5rem;
        animation: popUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        z-index: 10;
      }

      @keyframes popUp {
        from { opacity: 0; transform: translateY(10px) scale(0.95); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }

      .quick-option {
        flex: 1;
        padding: 0.75rem;
        background: #f0f7ff;
        color: #4285f4;
        border-radius: 12px;
        font-weight: 800;
        text-align: center;
        font-size: 0.9rem;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .quick-option:active {
        background: #4285f4;
        color: #fff;
        transform: scale(0.95);
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ParkingComponent {
  showTariffs = false;
  showSms = false;
  showQuickAdd = false;
  timeLeft = '01:45:12';
  
  // Dynamic Car Plate State
  carPlate = '';
  isPlateSaved = false;
  tempPlate = '';

  savePlate() {
    if (this.tempPlate.trim()) {
      this.carPlate = this.tempPlate.toUpperCase();
      this.isPlateSaved = true;
    }
  }

  editPlate() {
    this.isPlateSaved = false;
    this.tempPlate = this.carPlate;
  }

  sendNativeSms() {
    const recipient = '7442';
    const body = '1234 BV01ABC 1';
    
    // 1. Try to copy to clipboard immediately
    try {
      const el = document.createElement('textarea');
      el.value = body;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      console.log('Copied via execCommand');
    } catch (e) {
      // Fallback to navigator.clipboard if execCommand fails
      navigator.clipboard.writeText(body).catch(err => console.error('Clipboard failed', err));
    }

    // 2. Immediate redirect
    const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const separator = isIos ? '&' : '?';
    const smsUrl = `sms:${recipient}${separator}body=${encodeURIComponent(body)}`;
    
    window.location.href = smsUrl;
  }

  toggleTariffs() {
    this.showTariffs = !this.showTariffs;
    if (this.showTariffs) { this.showSms = false; this.showQuickAdd = false; }
  }

  toggleSms() {
    // We keep this for compatibility or internal simulation if needed, 
    // but the main button now calls sendNativeSms()
    this.showSms = !this.showSms;
    if (this.showSms) { this.showTariffs = false; this.showQuickAdd = false; }
  }

  toggleQuickAdd() {
    this.showQuickAdd = !this.showQuickAdd;
  }

  extendTime(minutes: number) {
    // Simulate payment and time update
    console.log(`Extending by ${minutes} minutes...`);
    
    // Simple mock update (just for visual feedback)
    const [h, m, s] = this.timeLeft.split(':').map(Number);
    let totalMin = h * 60 + m + minutes;
    const newH = Math.floor(totalMin / 60);
    const newM = totalMin % 60;
    
    this.timeLeft = `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    this.showQuickAdd = false;
    
    alert(`Plată confirmată! Timpul a fost prelungit cu ${minutes} minute.`);
  }
}
