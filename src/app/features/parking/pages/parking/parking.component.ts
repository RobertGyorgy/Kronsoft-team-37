import { ChangeDetectionStrategy, Component, OnInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { interval, Subscription } from 'rxjs';

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
        <h1 class="header-title">Parcare Brasov</h1>
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
            <div class="sms-preview-badge">
              <span class="preview-label">Mesaj SMS:</span>
              <span class="preview-text">{{ carPlate || 'BV 01 ABC' }} {{ selectedHours }}</span>
              <span class="preview-to">la 1234</span>
            </div>
            
            <!-- Compact Stepper -->
            <div class="stepper-container">
              <span class="stepper-label">Selectează durata:</span>
              <div class="stepper-controls">
                <button class="step-btn" (click)="decrementHours()">-</button>
                <span class="step-value">{{ selectedHours }}h</span>
                <button class="step-btn" (click)="incrementHours()">+</button>
              </div>
            </div>

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
              <!-- Zona 0 -->
              <div class="tariff-card zona-0">
                <span class="tariff-zone">Zona 0</span>
                <div class="tariff-details">
                  <p>1h - 0.60 € + TVA</p>
                  <p>24h - 3.00 € + TVA</p>
                </div>
              </div>

              <!-- Zona 1 -->
              <div class="tariff-card zona-1">
                <span class="tariff-zone">Zona 1</span>
                <div class="tariff-details">
                  <p>1h - 0.40 € + TVA</p>
                  <p>24h - 2.00 € + TVA</p>
                </div>
              </div>

              <!-- Zona 2 -->
              <div class="tariff-card zona-2">
                <span class="tariff-zone">Zona 2</span>
                <div class="tariff-details">
                  <p>1h - 0.30 € + TVA</p>
                  <p>24h - 1.50 € + TVA</p>
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
                    (ngModelChange)="tempPlate = $event.toUpperCase()"
                    (keyup.enter)="savePlate()"
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
              <span class="time-left" [class.warning]="isExpiryWarning()">{{ timeLeft }}</span>
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
            
            <div class="history-list">
              <div class="history-item" *ngFor="let item of history">
                <div class="history-date">
                  <span class="day">{{ item.day }}</span>
                  <span class="month">{{ item.month }}</span>
                </div>
                <div class="history-info">
                  <span class="plate">{{ item.plate }}</span>
                  <span class="loc">{{ item.zone }}</span>
                </div>
                <span class="amount">- {{ item.amount }} €</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  `,
  styles: [`
    .parking-shell { min-height: 100vh; background: #fdfdfd; font-family: 'Outfit', sans-serif; color: #1a1a1a; }
    .top-nav-white { background: #fff; padding: 0.75rem 1rem; display: flex; align-items: center; position: relative; border-bottom: 1px solid #f0f0f0; z-index: 10; min-height: 60px; }
    .header-title { font-size: 1.1rem; font-weight: 800; margin: 0; flex: 1; text-align: center; padding: 0 4rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .back-pill { position: absolute; left: 1rem; display: flex; align-items: center; gap: 0.4rem; background: #fff; border: 1px solid #e0e0e0; padding: 0.4rem 0.8rem; border-radius: 999px; color: #1a1a1a; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
    .back-text { font-weight: 700; font-size: 0.9rem; }
    .main-scroll-area { height: calc(100vh - 60px); overflow-y: auto; -webkit-overflow-scrolling: touch; }
    .hero-map-section { padding: 0.5rem 1rem 0; height: 30vh; min-height: 200px; }
    .custom-map-container { border-radius: 20px; overflow: hidden; height: 100%; background: #f8f9fa; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
    .neighborhood-img { width: 100%; height: 100%; object-fit: contain; }
    .info-card-section { padding: 0.5rem 1rem; }
    .zona-card { background: linear-gradient(135deg, #4285f4 0%, #2b6edb 100%); border-radius: 20px; padding: 1rem; box-shadow: 0 10px 25px rgba(66,133,244,0.2); display: flex; flex-direction: column; gap: 0.5rem; color: #fff; }
    .zona-title { font-size: 1.2rem; font-weight: 800; margin: 0; }
    .sms-preview-badge {
      background: rgba(255, 255, 255, 0.15);
      padding: 0.5rem 0.75rem;
      border-radius: 10px;
      display: flex;
      align-items: center;
      gap: 0.4rem;
      margin: 0.2rem 0;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .preview-label { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; opacity: 0.8; }
    .preview-text { font-size: 0.9rem; font-weight: 900; letter-spacing: 0.02em; }
    .preview-to { font-size: 0.75rem; font-weight: 700; opacity: 0.9; }
    .stepper-container { display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.1); padding: 0.4rem 0.75rem; border-radius: 12px; }
    .stepper-label { font-size: 0.8rem; font-weight: 700; }
    .stepper-controls { display: flex; align-items: center; gap: 1rem; }
    .step-btn { background: rgba(255,255,255,0.2); border: none; color: #fff; width: 28px; height: 28px; border-radius: 8px; font-weight: 800; font-size: 1.2rem; display: flex; align-items: center; justify-content: center; cursor: pointer; }
    .step-value { font-size: 1.1rem; font-weight: 900; min-width: 35px; text-align: center; }
    .card-actions { display: flex; gap: 0.6rem; }
    .black-btn { flex: 1; background: #fff; color: #4285f4; border: none; padding: 0.75rem; border-radius: 14px; font-weight: 800; font-size: 0.9rem; box-shadow: 0 4px 10px rgba(0,0,0,0.1); cursor: pointer; }
    .section-full-height { padding: 0.25rem 1rem 0.75rem; }
    .parking-card.active-session { background: #4285f4; border-radius: 20px; padding: 1rem; color: #fff; box-shadow: 0 8px 25px rgba(66,133,244,0.2); }
    .car-plate { font-size: 1.7rem; font-weight: 900; margin: 0; letter-spacing: -0.02em; }
    .timer-display { background: rgba(255,255,255,0.15); border-radius: 16px; padding: 1rem; text-align: center; margin-bottom: 0.75rem; }
    .time-left { font-size: 2.2rem; font-weight: 800; display: block; line-height: 1; font-variant-numeric: tabular-nums; }
    .time-left.warning { color: #ff4d4d; animation: pulse 1s infinite; }
    @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.7; } 100% { opacity: 1; } }
    .time-label { font-size: 0.7rem; text-transform: uppercase; font-weight: 700; opacity: 0.8; letter-spacing: 0.1em; margin-top: 0.2rem; display: block; }
    .extend-container { position: relative; width: 100%; }
    .extend-btn { width: 100%; background: #fff; color: #4285f4; border: none; padding: 0.85rem; border-radius: 14px; font-weight: 800; font-size: 0.95rem; cursor: pointer; }
    .plate-input-container { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 0.75rem; }
    .input-label { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; opacity: 0.9; }
    .input-row { display: flex; gap: 0.5rem; }
    .plate-input-field { flex: 1; background: rgba(255,255,255,0.2); border: 2px solid rgba(255,255,255,0.3); border-radius: 12px; padding: 0.75rem; color: #fff; font-weight: 800; outline: none; }
    .save-plate-btn { background: #fff; color: #4285f4; border: none; padding: 0 1rem; border-radius: 12px; font-weight: 800; cursor: pointer; }
    .original-content-flow { padding: 1.5rem; display: flex; flex-direction: column; gap: 2rem; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .section-header h3 { font-size: 1.25rem; font-weight: 800; margin: 0; }
    .history-item { display: flex; align-items: center; gap: 1rem; background: #fff; padding: 1rem; border-radius: 16px; border: 1px solid #f0f0f0; }
    .history-date { background: #f8f9fa; padding: 0.5rem; border-radius: 12px; display: flex; flex-direction: column; align-items: center; min-width: 50px; }
    .history-date .day { font-size: 1.1rem; font-weight: 800; }
    .history-date .month { font-size: 0.65rem; font-weight: 700; color: #666; }
    .history-info { flex: 1; }
    .history-info .plate { display: block; font-weight: 800; font-size: 1rem; }
    .history-info .loc { font-size: 0.85rem; color: #666; }
    .amount { font-weight: 800; color: #ff4d4d; }
    .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; flex-direction: column; justify-content: flex-end; }
    .tariffs-modal { background: #fff; border-radius: 32px 32px 0 0; padding: 1.5rem; max-height: 80vh; overflow-y: auto; animation: slideUp 0.3s ease-out; }
    @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
    .modal-handle { width: 40px; height: 4px; background: #eee; border-radius: 2px; margin: 0 auto 1.5rem; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
    .modal-header h2 { font-size: 1.5rem; font-weight: 800; margin: 0; }
    .close-modal { background: #f5f5f7; border: none; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; }
    .tariffs-list { display: flex; flex-direction: column; gap: 1rem; }
    .tariff-card { padding: 1.5rem; border-radius: 24px; color: #fff; display: flex; justify-content: space-between; align-items: center; }
    .tariff-zone { font-size: 1.25rem; font-weight: 900; text-transform: uppercase; }
    .tariff-details p { margin: 0; font-weight: 700; font-size: 1.1rem; text-align: right; }
    .zona-0 { background: #ff4757; }
    .zona-1 { background: #ffa502; }
    .zona-2 { background: #2ed573; }
    .quick-add-menu { position: absolute; bottom: 120%; left: 0; width: 100%; background: #fff; border-radius: 20px; padding: 0.5rem; box-shadow: 0 -10px 25px rgba(0,0,0,0.15); display: flex; justify-content: space-around; gap: 0.5rem; animation: popUp 0.3s cubic-bezier(0.4, 0, 0.2, 1); z-index: 10; }
    .quick-option { flex: 1; padding: 0.75rem; background: #f0f7ff; color: #4285f4; border-radius: 12px; font-weight: 800; text-align: center; font-size: 0.9rem; cursor: pointer; }
  `]
})
export class ParkingComponent implements OnInit, OnDestroy {
  showTariffs = false;
  showSms = false;
  showQuickAdd = false;
  timeLeft = '00:00:00';
  
  carPlate = '';
  isPlateSaved = false;
  tempPlate = '';
  selectedHours = 1;
  
  history: any[] = [
    { day: '05', month: 'MAI', plate: 'BV 01 ABC', zone: 'Zona 0 - Centru', amount: '1.20' }
  ];

  private timerSubscription: Subscription | undefined;
  private currentParkingSeconds = 0;

  constructor(
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) {}

  ngOnInit() {
    this.requestNotificationPermission();
  }

  ngOnDestroy() {
    if (this.timerSubscription) this.timerSubscription.unsubscribe();
  }

  private requestNotificationPermission() {
    if ('Notification' in window) {
      Notification.requestPermission();
    }
  }

  private sendExpiryNotification(message: string) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Smart City Brașov', {
        body: message,
        icon: 'favicon.ico'
      });
    }
  }

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

  incrementHours() { if (this.selectedHours < 24) this.selectedHours++; }
  decrementHours() { if (this.selectedHours > 1) this.selectedHours--; }

  sendNativeSms() {
    const recipient = '1234';
    const body = (this.carPlate || 'BV 01 ABC') + ' ' + this.selectedHours;
    
    // 0. Immediate confirmation notification for testing
    this.sendExpiryNotification('Sistem de monitorizare activat. Vei primi alerte la 54 min și la 5 min.');

    // 1. Start the countdown based on selected hours
    this.startCountdown(this.selectedHours);

    // 2. Add to history
    this.addToHistory();

    // 3. Redirect to SMS (with a tiny delay to ensure timer starts)
    const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const separator = isIos ? '&' : '?';
    const smsUrl = `sms:${recipient}${separator}body=${encodeURIComponent(body)}`;
    
    setTimeout(() => {
      window.location.href = smsUrl;
    }, 150);
  }

  private startCountdown(hours: number) {
    if (this.timerSubscription) this.timerSubscription.unsubscribe();
    
    this.currentParkingSeconds = hours * 3600;
    this.timeLeft = this.formatTime(this.currentParkingSeconds);

    this.timerSubscription = interval(1000).subscribe(() => {
      if (this.currentParkingSeconds <= 0) {
        this.currentParkingSeconds = 0;
        this.timeLeft = '00:00:00';
        if (this.timerSubscription) this.timerSubscription.unsubscribe();
        this.cdr.detectChanges();
        return;
      }

      this.currentParkingSeconds--;

      // Triggers
      if (this.currentParkingSeconds === 3480) { this.sendExpiryNotification('Update: Mai ai 58 de minute din timpul de parcare.'); }
      if (this.currentParkingSeconds === 3240) { this.sendExpiryNotification('Mai ai 54 de minute din timpul de parcare.'); }
      if (this.currentParkingSeconds === 300) { this.sendExpiryNotification('ATENȚIE: Parcarea expiră în 5 minute!'); }
      
      this.timeLeft = this.formatTime(this.currentParkingSeconds);
      this.cdr.detectChanges();
    });
  }

  private formatTime(totalSeconds: number): string {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  isExpiryWarning(): boolean {
    if (this.timeLeft === '00:00:00') return false;
    const [h, m] = this.timeLeft.split(':').map(Number);
    return h === 0 && m < 5;
  }

  private addToHistory() {
    const now = new Date();
    const months = ['IAN', 'FEB', 'MAR', 'APR', 'MAI', 'IUN', 'IUL', 'AUG', 'SEP', 'OCT', 'NOI', 'DEC'];
    
    const newEntry = {
      day: String(now.getDate()).padStart(2, '0'),
      month: months[now.getMonth()],
      plate: this.carPlate || 'BV 01 ABC',
      zone: 'Zona 0 - Centru Vechi',
      amount: (this.selectedHours * 0.6).toFixed(2)
    };

    this.history.unshift(newEntry);
    if (this.history.length > 5) this.history.pop();
  }

  toggleTariffs() { this.showTariffs = !this.showTariffs; }
  toggleQuickAdd() { this.showQuickAdd = !this.showQuickAdd; }

  extendTime(minutes: number) {
    this.currentParkingSeconds += (minutes * 60);
    this.timeLeft = this.formatTime(this.currentParkingSeconds);
    
    // If timer is not already running, start it
    if (!this.timerSubscription || this.currentParkingSeconds <= minutes * 60) {
      this.startCountdown(this.currentParkingSeconds / 3600);
    }

    this.showQuickAdd = false;
    this.cdr.detectChanges();
    alert(`Plată confirmată pentru încă ${minutes} minute!`);
  }
}
