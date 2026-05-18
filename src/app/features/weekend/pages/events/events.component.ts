import { ChangeDetectionStrategy, Component, signal, inject, computed, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EventsService } from '../../services/events.service';
import { AuthService } from '../../../auth/auth.service';
import { gsap } from 'gsap';

interface EventItem {
  id: number | string;
  title: string;
  when: string;
  location: string;
  imageUrl: string;
  category?: string;
  link?: string;
  isPromoted?: boolean;
  plan?: string;
  promotedBy?: string;
}

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <main class="events-shell" #container>
      <!-- Standard Unified Header -->
      <header class="standard-header">
        <button class="unified-back-btn" (click)="goBack()">
          <span class="material-icons">arrow_back</span>
          <span>Înapoi</span>
        </button>
      </header>

      <div class="scroll-wrapper">
        
        <!-- ==================== VIEW 1: INTERMEDIATE HUB DASHBOARD ==================== -->
        <div class="events-content-container hub-view-container" *ngIf="currentView() === 'hub'">
          <!-- Hub Hero Section -->
          <section class="hub-hero">
            <p class="eyebrow-purple">PORTAL CULTURAL</p>
            <h1 class="premium-title">
              <span *ngFor="let word of splitByWord('Evenimente & Știri')" class="word">
                <span *ngFor="let char of word.split('')" class="char">{{ char }}</span>
                <span class="char">&nbsp;</span>
              </span>
            </h1>
            <p class="hub-subtitle">
              Descoperă pulsul cultural al Brașovului. Agenda completă a evenimentelor și cele mai noi știri din comunitate, la un singur click distanță.
            </p>
          </section>

          <!-- Centered 3 Premium Action Cards Grid -->
          <div class="hub-actions-grid">
            
            <!-- Card 1: Agenda Evenimentelor -->
            <div class="hub-action-card purple-glow" (click)="navigateToListView('evenimente')">
              <div class="card-icon-box bg-purple">
                <span class="material-icons">calendar_today</span>
              </div>
              <div class="card-details">
                <h2>Agenda Evenimentelor</h2>
                <p>Concerte live, festivaluri, spectacole de teatru și vernisaje în desfășurare în Brașov.</p>
              </div>
              <span class="material-icons chevron">chevron_right</span>
            </div>

            <!-- Card 2: Știri Culturale -->
            <div class="hub-action-card blue-glow" (click)="navigateToListView('stiri')">
              <div class="card-icon-box bg-blue">
                <span class="material-icons">newspaper</span>
              </div>
              <div class="card-details">
                <h2>Știri Culturale</h2>
                <p>Noutăți de ultimă oră din presă, interviuri exclusive cu artiști locali și lansări de filme.</p>
              </div>
              <span class="material-icons chevron">chevron_right</span>
            </div>

            <!-- Card 3: Promovează Eveniment -->
            <div class="hub-action-card gold-glow" (click)="openPromoteModal()">
              <div class="card-icon-box bg-gold">
                <span class="material-icons">campaign</span>
              </div>
              <div class="card-details">
                <h2>Promovează evenimentul tău</h2>
                <p class="gold-desc">
                  Transformă-ți evenimentul într-un succes local! Promovează-l în rândul comunității cu pachetele noastre Premium sau Elite și atrage vizitatori instant.
                </p>
              </div>
              <span class="material-icons chevron">chevron_right</span>
            </div>

          </div>
        </div>

        <!-- ==================== VIEW 2: LIST AND SEARCH VIEW ==================== -->
        <div class="events-content-container" *ngIf="currentView() === 'list'">

          <!-- Section Header -->
          <section class="list-header">
            <div class="list-header-top">
              <div class="list-title-group">
                <p class="section-eyebrow">{{ activeTab() === 'evenimente' ? 'AGENDA CULTURALĂ' : 'ȘTIRI & NOUTĂȚI' }}</p>
                <h1 class="list-main-title">{{ activeTab() === 'evenimente' ? 'Evenimente în Brașov' : 'Știri culturale' }}</h1>
              </div>
            </div>

          </section>

          <!-- Events List -->
          <div class="events-list-clean">
            @for (event of events(); track event.id; let i = $index) {

              <!-- Featured card (first item, full width with large image) -->
              <div class="event-featured" *ngIf="i === 0" (click)="openEvent(event.link)">
                <div class="featured-img-wrap">
                  <img [src]="event.imageUrl" [alt]="event.title" class="featured-img">
                  <div class="featured-overlay"></div>
                  <span class="cat-tag">{{ event.category || 'EVENIMENT' }}</span>
                  <div class="date-pill">
                    <span class="date-pill-d">{{ event.when | date:'dd' }}</span>
                    <span class="date-pill-m">{{ event.when | date:'MMM' }}</span>
                  </div>
                  <span class="promo-badge prem" *ngIf="event.isPromoted && event.plan === 'PREMIUM'">premium</span>
                  <span class="promo-badge elit" *ngIf="event.isPromoted && event.plan === 'ELITE'">elite</span>
                </div>
                <div class="featured-body">
                  <div class="feat-meta">
                    <span class="feat-date">
                      <span class="material-icons">calendar_today</span>
                      {{ event.when | date:'EEEE, d MMMM' }}
                    </span>
                    <span class="feat-time">{{ event.when | date:'HH:mm' }}</span>
                  </div>
                  <h2 class="feat-title">{{ event.title }}</h2>
                  <div class="feat-loc">
                    <span class="material-icons">place</span>
                    <span>{{ event.location }}</span>
                  </div>
                  <span class="read-link">Vezi detalii <span class="material-icons">arrow_forward</span></span>
                </div>
              </div>

              <!-- Regular horizontal cards (remaining items) -->
              <div class="event-row" *ngIf="i > 0" (click)="openEvent(event.link)" [class.promoted-row]="event.isPromoted">
                <div class="row-img-wrap">
                  <img [src]="event.imageUrl" [alt]="event.title" class="row-img">
                  <span class="promo-badge prem sm" *ngIf="event.isPromoted && event.plan === 'PREMIUM'">premium</span>
                  <span class="promo-badge elit sm" *ngIf="event.isPromoted && event.plan === 'ELITE'">elite</span>
                </div>
                <div class="row-body">
                  <span class="row-cat">{{ event.category || 'EVENIMENT' }}</span>
                  <h3 class="row-title">{{ event.title }}</h3>
                  <div class="row-meta">
                    <span class="row-date">{{ event.when | date:'d MMM' }} · {{ event.when | date:'HH:mm' }}</span>
                    <span class="row-loc">
                      <span class="material-icons">place</span>{{ event.location }}
                    </span>
                  </div>
                </div>
                <span class="material-icons row-chevron">chevron_right</span>
              </div>

            } @empty {
              <div class="empty-state">
                <span class="material-icons">event_busy</span>
                <h3>Momentan liniște</h3>
                <p>Nu am găsit conținut pentru această secțiune.</p>
              </div>
            }
          </div>
        </div>
      </div>


      <!-- Premium Glassmorphic Promotion Modal -->
      <div class="modal-backdrop" *ngIf="showModal" (click)="closePromoteModal()">
        <div class="promote-modal-card" (click)="$event.stopPropagation()">
          <header class="modal-header">
            <div class="modal-header-title">
              <h2>Promovează eveniment</h2>
            </div>
            <button class="close-modal-btn" (click)="closePromoteModal()">
              <span class="material-icons">close</span>
            </button>
          </header>

          <form (submit)="submitPromotion($event)" class="modal-form-content">
            <div class="form-grid-compact">
              
              <div class="input-group">
                <label>Titlu Eveniment *</label>
                <input type="text" [(ngModel)]="formModel.title" name="title" required placeholder="ex: Concert Jazz sub Tâmpa">
              </div>

              <div class="input-group">
                <label>Locație / Adresă *</label>
                <input type="text" [(ngModel)]="formModel.location" name="location" required placeholder="ex: Piața Sfatului, Brașov">
              </div>

              <div class="input-group">
                <label>Categorie *</label>
                <select [(ngModel)]="formModel.category" name="category" required>
                  <option value="CONCERT">Concert / Muzică</option>
                  <option value="TEATRU">Teatru / Spectacol</option>
                  <option value="FESTIVAL">Festival</option>
                  <option value="EXPOZIȚIE">Expoziție / Vernisaj</option>
                  <option value="SPORT">Eveniment Sportiv</option>
                  <option value="CARITABIL">Caritabil</option>
                  <option value="DIVERSE">Diverse / Altele</option>
                </select>
              </div>
              
              <div class="input-group">
                <label>Abonament *</label>
                <select [(ngModel)]="formModel.plan" name="plan" required (change)="onPlanChange()">
                  <option value="BASIC">Basic - Gratuit</option>
                  <option value="PREMIUM">Premium - 25 LEI / lună</option>
                  <option value="ELITE">Elite - 60 LEI / lună</option>
                </select>
              </div>

              <!-- Mini Interfață Dynamic Plan Benefits -->
              <div class="plan-info-mini-card" [ngClass]="formModel.plan.toLowerCase()">
                <div class="plan-info-header">
                  <span class="plan-badge-mini">{{ formModel.plan }}</span>
                  <span class="plan-price-mini">{{ planCost }}</span>
                </div>
                <ul class="plan-features-mini">

                  <li *ngIf="formModel.plan === 'PREMIUM'">
                    <span class="material-icons">check_circle</span>
                    <span>Afișare prioritară în fața evenimentelor Basic</span>
                  </li>
                  <li *ngIf="formModel.plan === 'PREMIUM'">
                    <span class="material-icons">check_circle</span>
                    <span>Ecuson distinctiv violet "SPONSORIZAT"</span>
                  </li>
                  <li *ngIf="formModel.plan === 'ELITE'">
                    <span class="material-icons">check_circle</span>
                    <span>Afișare pe prima poziție garantată</span>
                  </li>
                  <li *ngIf="formModel.plan === 'ELITE'">
                    <span class="material-icons">check_circle</span>
                    <span>Ecuson auriu exclusiv "ELITE"</span>
                  </li>
                  <li *ngIf="formModel.plan === 'ELITE'">
                    <span class="material-icons">check_circle</span>
                    <span>Contur aurit premium și vizibilitate maximă</span>
                  </li>
                </ul>
              </div>

              <div class="input-row">
                <div class="input-group">
                  <label>Dată Eveniment *</label>
                  <input type="date" [(ngModel)]="formModel.date" name="date" required>
                </div>
                <div class="input-group">
                  <label>Ora *</label>
                  <input type="time" [(ngModel)]="formModel.time" name="time" required>
                </div>
              </div>

              <div class="input-group">
                <label>Descriere Eveniment *</label>
                <textarea [(ngModel)]="formModel.description" name="description" required rows="2" placeholder="Adaugă detalii atractive despre evenimentul tău..."></textarea>
              </div>

              <div class="input-group">
                <label>Link Bilete (opțional)</label>
                <input type="url" [(ngModel)]="formModel.link" name="link" placeholder="https://exple.ro/bilete">
              </div>
              <div class="input-group">
                <label>Link Imagine Copertă (opțional)</label>
                <input type="text" [(ngModel)]="formModel.imageUrl" name="imageUrl" placeholder="ex: https://site.ro/imagine-coperta.jpg">
              </div>

            </div>

            <!-- Submit details -->
            <footer class="modal-footer">
              <button type="submit" class="submit-prom-btn" [disabled]="submitting">
                <span class="spinner" *ngIf="submitting"></span>
                <span>{{ submitting ? 'Se procesează...' : 'Activează promovarea' }}</span>
              </button>
            </footer>
          </form>
        </div>
      </div>

      <!-- Bank Payment Simulation Modal -->
      <div class="modal-backdrop payment-backdrop" *ngIf="showPaymentModal" (click)="closePaymentModal()">
        <div class="payment-modal-card" (click)="$event.stopPropagation()">
          <header class="payment-header">
            <div class="payment-header-left">
              <h3>Plată Securizată</h3>
            </div>
            <button class="close-payment-btn" (click)="closePaymentModal()" [disabled]="paymentProcessing">
              <span class="material-icons">close</span>
            </button>
          </header>

          <!-- Main payment body -->
          <div class="payment-body" *ngIf="!paymentProcessing && !paymentSuccess">
            <!-- Summary -->
            <div class="payment-summary">
              <div class="summary-row">
                <span class="summary-label">Serviciu:</span>
                <span class="summary-val">Promovare Eveniment ({{ formModel.plan }})</span>
              </div>
              <div class="summary-row total">
                <span class="summary-label">Total de plată:</span>
                <span class="summary-val">{{ planCost }}</span>
              </div>
            </div>

            <!-- Simulated Card Fields Form -->
            <form (submit)="onPaySubmit($event)" class="payment-card-form">
              <div class="pay-input-group">
                <label>Nume Titular Card</label>
                <input type="text" [(ngModel)]="paymentModel.cardholder" name="cardholder" required placeholder="ex: KRONSOFT TEAM 37">
              </div>

              <div class="pay-input-group">
                <label>Număr Card</label>
                <div class="card-num-wrapper">
                  <span class="material-icons card-brand-icon">credit_card</span>
                  <input type="text" [(ngModel)]="paymentModel.cardNumber" name="cardNumber" required placeholder="4111 2222 3333 4444" maxlength="19" (input)="formatCardNumber($event)">
                </div>
              </div>

              <div class="pay-input-group">
                <label>Dată Expirare</label>
                <input type="text" [(ngModel)]="paymentModel.expiry" name="expiry" required placeholder="MM/YY" maxlength="5" (input)="formatExpiry($event)">
              </div>
              
              <div class="pay-input-group">
                <label>CVV / CVC</label>
                <input type="password" [(ngModel)]="paymentModel.cvv" name="cvv" required placeholder="***" maxlength="3">
              </div>


              <button type="submit" class="pay-btn">
                <span>Plătește în Siguranță</span>
              </button>
            </form>
          </div>

          <!-- Processing Overlay/State -->
          <div class="payment-status-wrapper" *ngIf="paymentProcessing">
            <div class="payment-spinner"></div>
            <h4>Se procesează plata...</h4>
            <p>Vă rugăm să nu închideți fereastra sau să reîncărcați pagina.</p>
          </div>

          <!-- Success Overlay/State -->
          <div class="payment-status-wrapper success" *ngIf="paymentSuccess">
            <span class="material-icons success-check animated">check_circle</span>
            <h4>Plată Confirmată! 🎉</h4>
            <p>Tranzacția de {{ planCost }} a fost finalizată cu succes.</p>
          </div>
        </div>
      </div>
    </main>
  `,
  styles: [`
    .events-shell {
      height: 100dvh;
      width: 100%;
      background: var(--bg-primary);
      font-family: 'Outfit', sans-serif;
      display: flex;
      flex-direction: column;
      color: var(--text-primary);
      overflow: hidden;
      transition: background 0.3s, color 0.3s;
    }

    .scroll-wrapper {
      flex: 1;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
      padding-bottom: calc(var(--safe-bottom) + 2rem);
    }

    .events-content-container {
      padding: 0 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .events-hero { margin-top: 0.5rem; }

    .hero-header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1.5rem;
      flex-wrap: wrap;
    }

    .promote-btn-premium {
      background: #a55eea;
      color: #fff;
      border: none;
      border-radius: 20px;
      padding: 0.8rem 1.6rem;
      font-family: inherit;
      font-weight: 800;
      font-size: 0.9rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      box-shadow: 0 4px 15px rgba(165, 94, 234, 0.2);
      transition: all 0.25s ease;
    }
    .promote-btn-premium:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(165, 94, 234, 0.3);
      background: #9b6be6;
    }
    .promote-btn-premium:active {
      transform: translateY(0);
    }
    .promote-btn-premium .material-icons {
      font-size: 1.2rem;
    }
    
    .eyebrow-purple {
      font-size: 0.75rem;
      font-weight: 950;
      color: #a55eea;
      text-transform: uppercase;
      letter-spacing: 0.2em;
      margin-bottom: 0.75rem;
    }

    .premium-title {
      font-size: 2.8rem;
      font-weight: 900;
      line-height: 1;
      margin: 0;
      letter-spacing: -0.05em;
      color: var(--text-primary);
    }

    .word { display: inline-block; white-space: nowrap; }
    .char { display: inline-block; opacity: 0; transform: translateY(30px); }

    /* Search Box (Match Bus/Parking Style) */
    .search-area { width: 100%; }
    .search-box {
      background: var(--bg-secondary);
      border-radius: 24px;
      padding: 1.1rem 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      border: 1px solid var(--border-color);
      transition: all 0.25s ease;
    }
    .search-box .material-icons { color: #a55eea; font-size: 1.4rem; }
    .search-box input {
      background: transparent;
      border: none;
      outline: none;
      font-family: inherit;
      font-weight: 700;
      font-size: 1rem;
      width: 100%;
      color: var(--text-primary);
    }
    .search-box input::placeholder { color: var(--text-secondary); opacity: 0.6; font-weight: 500; }

    /* ---- OLD stack kept for modal compatibility, new clean list below ---- */
    .events-stack { display: flex; flex-direction: column; gap: 1.5rem; margin-top: -1rem; }
    .event-card-premium { background: var(--bg-card); border-radius: 36px; overflow: hidden; border: 1px solid var(--border-color); cursor: pointer; display: flex; flex-direction: column; }
    .image-box { height: 240px; width: 100%; position: relative; overflow: hidden; }
    .event-img { width: 100%; height: 100%; object-fit: cover; }
    .img-overlay { position: absolute; inset: 0; background: linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.4)); }
    .cat-chip { position: absolute; top: 1.25rem; left: 1.25rem; background: rgba(165,94,234,0.95); backdrop-filter: blur(15px); color: #fff; padding: 0.5rem 1.1rem; border-radius: 50px; font-size: 0.75rem; font-weight: 900; letter-spacing: 0.05em; }
    .event-date-badge { position: absolute; top: 1.25rem; right: 1.25rem; background: var(--bg-card); border: 1px solid var(--border-color); padding: 0.6rem 0.8rem; border-radius: 18px; display: flex; flex-direction: column; align-items: center; line-height: 1; }
    .event-date-badge .d-val { font-size: 1.2rem; font-weight: 950; color: var(--text-primary); }
    .event-date-badge .d-mo { font-size: 0.65rem; font-weight: 800; color: #a55eea; text-transform: uppercase; margin-top: 0.2rem; }
    .details-box { padding: 1.75rem; }
    .meta-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; gap: 0.5rem; flex-wrap: wrap; }
    .date-time-box { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
    .date-info { display: flex; align-items: center; gap: 0.35rem; font-size: 0.82rem; font-weight: 800; color: var(--text-secondary); text-transform: capitalize; }
    .date-info .material-icons { font-size: 1rem; color: #a55eea; }
    .time-info { display: flex; align-items: center; gap: 0.35rem; font-size: 0.82rem; font-weight: 900; color: #a55eea; }
    .time-info .material-icons { font-size: 1rem; }
    .price-info { font-size: 0.85rem; font-weight: 900; color: var(--text-primary); background: var(--bg-secondary); padding: 0.4rem 0.9rem; border-radius: 12px; }
    .details-box h3 { font-size: 1.6rem; font-weight: 950; margin: 0 0 0.75rem; line-height: 1.1; letter-spacing: -0.04em; color: var(--text-primary); }
    .location-info { display: flex; align-items: center; gap: 0.5rem; font-size: 0.95rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 1.25rem; }
    .location-info .material-icons { color: #a55eea; font-size: 1.2rem; }
    .card-action { display: flex; justify-content: flex-start; border-top: 1px solid var(--border-color); padding-top: 1.5rem; }
    .view-tag { font-size: 0.7rem; font-weight: 900; color: #a55eea; letter-spacing: 0.1em; background: rgba(165,94,234,0.08); padding: 0.4rem 1rem; border-radius: 50px; }

    /* ====================== CLEAN EDITORIAL LIST STYLES ====================== */

    /* Section header */
    .list-header { margin-top: 0.25rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border-color); }
    .list-header-top { display: flex; justify-content: space-between; align-items: flex-end; }
    .section-eyebrow { font-size: 0.68rem; font-weight: 900; color: #a55eea; letter-spacing: 0.18em; text-transform: uppercase; margin: 0 0 0.35rem; }
    .list-main-title { font-size: 1.85rem; font-weight: 900; letter-spacing: -0.04em; margin: 0; color: var(--text-primary); }
    .live-dot-group { display: flex; align-items: center; gap: 0.4rem; padding-bottom: 0.15rem; }
    .live-dot { width: 7px; height: 7px; border-radius: 50%; background: #2ecc71; animation: livePulse 1.8s ease-in-out infinite; }
    @keyframes livePulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(0.85); }
    }
    .live-label { font-size: 0.65rem; font-weight: 900; letter-spacing: 0.1em; color: #2ecc71; }

    /* Outer list wrapper */
    .events-list-clean { display: flex; flex-direction: column; gap: 0; }

    /* ---- FEATURED CARD ---- */
    .event-featured { border-radius: 24px; overflow: hidden; background: var(--bg-card); border: 1px solid var(--border-color); cursor: pointer; margin-bottom: 1.25rem; transition: transform 0.22s ease; }
    .event-featured:active { transform: scale(0.985); }
    .featured-img-wrap { position: relative; height: 210px; overflow: hidden; }
    .featured-img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .featured-overlay { position: absolute; inset: 0; background: linear-gradient(to bottom, transparent 45%, rgba(0,0,0,0.45)); }
    .cat-tag { position: absolute; top: 1rem; left: 1rem; font-size: 0.65rem; font-weight: 900; letter-spacing: 0.1em; text-transform: uppercase; background: rgba(0,0,0,0.55); backdrop-filter: blur(12px); color: #fff; padding: 0.3rem 0.75rem; border-radius: 50px; border: 1px solid rgba(255,255,255,0.12); }
    .date-pill { position: absolute; top: 1rem; right: 1rem; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 14px; padding: 0.4rem 0.65rem; display: flex; flex-direction: column; align-items: center; line-height: 1.15; }
    .date-pill-d { font-size: 1.05rem; font-weight: 950; color: var(--text-primary); }
    .date-pill-m { font-size: 0.58rem; font-weight: 800; color: #a55eea; text-transform: uppercase; }
    .featured-body { padding: 1.1rem 1.25rem 1.25rem; }
    .feat-meta { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.6rem; }
    .feat-date { display: flex; align-items: center; gap: 0.3rem; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: capitalize; }
    .feat-date .material-icons { font-size: 0.9rem; color: #a55eea; }
    .feat-time { font-size: 0.75rem; font-weight: 900; color: #a55eea; }
    .feat-title { font-size: 1.35rem; font-weight: 900; letter-spacing: -0.03em; color: var(--text-primary); margin: 0 0 0.6rem; line-height: 1.2; }
    .feat-loc { display: flex; align-items: center; gap: 0.3rem; font-size: 0.78rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 0.9rem; }
    .feat-loc .material-icons { font-size: 0.95rem; color: #a55eea; }
    .read-link { display: inline-flex; align-items: center; gap: 0.25rem; font-size: 0.73rem; font-weight: 900; letter-spacing: 0.04em; color: #a55eea; }
    .read-link .material-icons { font-size: 0.95rem; }

    /* ---- HORIZONTAL ROW CARDS ---- */
    .event-row { display: flex; align-items: center; gap: 1rem; padding: 1rem 0; border-bottom: 1px solid var(--border-color); cursor: pointer; transition: opacity 0.18s ease; }
    .event-row:active { opacity: 0.7; }
    .promoted-row { background: rgba(165, 94, 234, 0.03); }
    .row-img-wrap { position: relative; width: 88px; height: 72px; border-radius: 14px; overflow: hidden; flex-shrink: 0; }
    .row-img { width: 100%; height: 100%; object-fit: cover; }
    .row-body { flex: 1; display: flex; flex-direction: column; gap: 0.25rem; min-width: 0; }
    .row-cat { font-size: 0.62rem; font-weight: 900; letter-spacing: 0.1em; text-transform: uppercase; color: #a55eea; }
    .row-title { font-size: 0.92rem; font-weight: 800; letter-spacing: -0.02em; color: var(--text-primary); margin: 0; line-height: 1.25; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .row-meta { display: flex; flex-direction: column; gap: 0.1rem; }
    .row-date { font-size: 0.7rem; font-weight: 700; color: var(--text-secondary); }
    .row-loc { display: flex; align-items: center; gap: 0.2rem; font-size: 0.68rem; font-weight: 600; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .row-loc .material-icons { font-size: 0.75rem; color: #a55eea; flex-shrink: 0; }
    .row-chevron { font-size: 1.1rem; color: var(--text-secondary); opacity: 0.4; flex-shrink: 0; }

    /* ---- PROMO BADGES ---- */
    .promo-badge { position: absolute; bottom: 0.75rem; left: 0.75rem; font-size: 0.6rem; font-weight: 900; letter-spacing: 0.08em; text-transform: uppercase; padding: 0.25rem 0.65rem; border-radius: 50px; backdrop-filter: blur(10px); }
    .promo-badge.prem { background: rgba(165, 94, 234, 0.88); color: #fff; }
    .promo-badge.elit { background: rgba(255, 191, 0, 0.88); color: #000; }
    .promo-badge.sm { font-size: 0.5rem; padding: 0.2rem 0.5rem; bottom: 0.4rem; left: 0.4rem; }

    .empty-state {
      padding: 6rem 2rem;
      text-align: center;
      color: #bbb;
    }
    .empty-state .material-icons { font-size: 5rem; margin-bottom: 1.5rem; color: #eee; }
    .empty-state h3 { font-size: 1.5rem; font-weight: 900; color: #444; margin-bottom: 0.5rem; }



    /* --- PROMOTED CARDS SYSTEM --- */
    .promoted-premium {
      border: 1.5px solid rgba(165, 94, 234, 0.25) !important;
      box-shadow: 0 10px 35px rgba(165, 94, 234, 0.08) !important;
    }
    .promoted-elite {
      border: 1.5px solid rgba(255, 191, 0, 0.35) !important;
      box-shadow: 0 10px 35px rgba(255, 191, 0, 0.12) !important;
    }

    .promoted-badge {
      position: absolute;
      bottom: 1.25rem;
      left: 1.25rem;
      display: flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.4rem 0.9rem;
      border-radius: 50px;
      font-size: 0.65rem;
      font-weight: 950;
      letter-spacing: 0.08em;
      color: #fff;
      backdrop-filter: blur(15px);
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
      z-index: 2;
    }
    .promoted-badge.premium {
      background: rgba(165, 94, 234, 0.85);
      border: 1px solid rgba(255,255,255,0.15);
      color: #fff;
    }
    .promoted-badge.elite {
      background: rgba(255, 191, 0, 0.85);
      color: #000;
      border: 1px solid rgba(255,255,255,0.3);
    }

    .promoted-by-info {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.82rem;
      color: var(--text-secondary);
      background: rgba(165, 94, 234, 0.04);
      border-radius: 12px;
      padding: 0.5rem 0.9rem;
      margin-top: 0.5rem;
      margin-bottom: 1rem;
      border: 1px dashed rgba(165, 94, 234, 0.15);
    }
    .promoted-by-info .material-icons { color: #a55eea; font-size: 1.1rem; }

    /* --- PREMIUM GLASSMORPHIC MODAL --- */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(16px);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      animation: fadeInModal 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    @keyframes fadeInModal {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .promote-modal-card {
      background: var(--glass-bg);
      border: 1px solid var(--glass-border);
      backdrop-filter: blur(25px);
      border-radius: 28px;
      width: 100%;
      max-width: 500px;
      max-height: 98dvh;
      box-shadow: 0 30px 70px rgba(0,0,0,0.15);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      font-family: inherit;
      animation: slideUpModal 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    @keyframes slideUpModal {
      from { opacity: 0; transform: translateY(30px) scale(0.97); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    .modal-header {
      padding: 1.1rem 1.5rem 0.85rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--border-color);
    }

    .modal-header-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .modal-header h2 {
      font-size: 1.35rem;
      font-weight: 900;
      margin: 0;
      letter-spacing: -0.03em;
      color: var(--text-primary);
    }

    .close-modal-btn {
      background: var(--border-color);
      border: none;
      border-radius: 50%;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--text-primary);
      transition: all 0.2s ease;
    }
    .close-modal-btn:hover {
      background: rgba(235, 94, 94, 0.1);
      color: #eb5e5e;
      transform: rotate(90deg);
    }

    .modal-form-content {
      flex: 1;
      overflow-y: visible; /* no scroll needed! */
      padding: 1.25rem 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
    }

    .form-grid-compact {
      display: flex;
      flex-direction: column;
      gap: 0.8rem;
    }

    .input-group {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .input-group label {
      font-size: 0.78rem;
      font-weight: 850;
      color: var(--text-primary);
      letter-spacing: 0.02em;
      margin-bottom: 0.1rem;
      padding-left: 0.1rem;
    }

    .input-group input,
    .input-group select,
    .input-group textarea {
      background-color: var(--bg-primary) !important;
      border: 1px solid var(--border-color);
      border-radius: 14px;
      padding: 0.65rem 0.9rem;
      font-family: inherit;
      font-size: 0.9rem;
      font-weight: 700;
      color: var(--text-primary);
      outline: none;
      transition: all 0.22s ease;
      box-shadow: inset 0 1px 2px rgba(0,0,0,0.01);
    }

    .input-group input:focus,
    .input-group select:focus,
    .input-group textarea:focus {
      border-color: #a55eea;
      background-color: var(--bg-primary) !important;
      box-shadow: 0 0 0 3px rgba(165, 94, 234, 0.15);
    }

    .input-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.8rem;
    }

    /* Pricing Mini Interface Styles */
    .plan-info-mini-card {
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 16px;
      padding: 0.85rem 1.1rem;
      margin-top: 0.2rem;
      margin-bottom: 0.4rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      transition: all 0.25s ease;
    }
    .plan-info-mini-card.premium {
      border-color: rgba(165, 94, 234, 0.25);
      background: rgba(165, 94, 234, 0.03);
    }
    .plan-info-mini-card.elite {
      border-color: rgba(255, 191, 0, 0.35);
      background: rgba(255, 191, 0, 0.03);
    }
    .plan-info-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 800;
    }
    .plan-badge-mini {
      font-size: 0.72rem;
      letter-spacing: 0.05em;
      padding: 0.25rem 0.6rem;
      border-radius: 8px;
      font-weight: 900;
      background: var(--border-color);
      color: var(--text-primary);
    }
    .premium .plan-badge-mini {
      background: rgba(165, 94, 234, 0.15);
      color: #a55eea;
    }
    .elite .plan-badge-mini {
      background: rgba(255, 191, 0, 0.15);
      color: #ff9f43;
    }
    .plan-price-mini {
      font-size: 0.88rem;
      color: var(--text-primary);
      font-weight: 900;
    }
    .plan-features-mini {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }
    .plan-features-mini li {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      font-size: 0.8rem;
      color: var(--text-secondary);
      font-weight: 600;
      text-align: left;
    }
    .plan-features-mini li .material-icons {
      font-size: 0.95rem;
      color: #a55eea;
    }
    .elite .plan-features-mini li .material-icons {
      color: #ff9f43;
    }

    .modal-footer {
      padding-top: 1rem;
      border-top: 1px solid var(--border-color);
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 1rem;
      margin-top: 0.5rem;
    }

    .submit-prom-btn {
      background: #a55eea;
      color: #fff;
      border: none;
      border-radius: 14px;
      padding: 0.65rem 1.35rem;
      font-family: inherit;
      font-weight: 900;
      font-size: 0.9rem;
      display: flex;
      align-items: center;
      gap: 0.4rem;
      cursor: pointer;
      box-shadow: 0 4px 15px rgba(165, 94, 234, 0.2);
      transition: all 0.25s ease;
    }
    .submit-prom-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(165, 94, 234, 0.3);
      background: #9b6be6;
    }
    .submit-prom-btn:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    /* Loading Spinner */
    .spinner {
      width: 20px;
      height: 20px;
      border: 3px solid rgba(255,255,255,0.3);
      border-radius: 50%;
      border-top-color: #fff;
      animation: spin 0.8s ease-in-out infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* --- PREMIUM TAB NAVIGATION STYLING --- */
    .tabs-navigation-area {
      width: 100%;
      display: flex;
      justify-content: center;
      margin-top: -0.5rem;
      margin-bottom: 0.5rem;
    }

    .tabs-pill-box {
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      padding: 0.4rem;
      border-radius: 40px;
      display: flex;
      gap: 0.25rem;
      width: 100%;
      max-width: 500px;
    }

    .tab-pill-btn {
      flex: 1;
      border: none;
      background: transparent;
      padding: 0.8rem 1rem;
      border-radius: 30px;
      font-weight: 800;
      font-size: 0.88rem;
      color: var(--text-secondary);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      cursor: pointer;
      font-family: inherit;
      transition: all 0.25s ease;
    }

    .tab-pill-btn:hover {
      color: #a55eea;
    }

    .tab-pill-btn.active {
      background: var(--bg-card);
      color: #a55eea;
      box-shadow: 0 4px 15px rgba(165,94,234,0.12), 0 2px 5px rgba(165,94,234,0.05);
    }

    .tab-pill-btn .material-icons {
      font-size: 1.1rem;
    }

    .tab-badge {
      font-size: 0.72rem;
      font-weight: 900;
      background: rgba(0,0,0,0.06);
      color: #7f8c8d;
      padding: 0.15rem 0.5rem;
      border-radius: 50px;
      transition: all 0.3s ease;
    }

    .tab-badge.active-badge {
      background: #a55eea;
      color: #ffffff;
    }

    /* ==================== HUB DASHBOARD STYLING ==================== */
    .hub-view-container {
      display: flex;
      flex-direction: column;
      gap: 2.2rem;
      justify-content: center;
      align-items: center;
      max-width: 650px;
      margin: 1.5rem auto 0;
      width: 100%;
      padding: 0 1rem;
    }

    .hub-hero {
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      width: 100%;
    }

    .hub-subtitle {
      font-size: 1.05rem;
      font-weight: 500;
      color: var(--text-secondary);
      line-height: 1.5;
      text-align: center;
      max-width: 550px;
      margin-top: 0.35rem;
    }

    .hub-actions-grid {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      width: 100%;
    }

    .hub-action-card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 28px;
      padding: 1.5rem 1.75rem;
      display: flex;
      align-items: center;
      gap: 1.25rem;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.02);
      transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .hub-action-card:active {
      transform: scale(0.97);
    }

    .hub-action-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.05);
      background: var(--bg-card);
    }

    .card-icon-box {
      width: 54px;
      height: 54px;
      border-radius: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: transform 0.25s ease;
    }

    .card-icon-box .material-icons {
      font-size: 1.4rem;
    }

    .bg-purple {
      background: rgba(165, 94, 234, 0.1);
      color: #a55eea;
    }

    .bg-blue {
      background: rgba(66, 133, 244, 0.1);
      color: #4285f4;
    }

    .bg-gold {
      background: rgba(255, 191, 0, 0.12);
      color: #ff9f43;
    }

    .card-details {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
      text-align: left;
    }

    .card-details h2 {
      font-size: 1.25rem;
      font-weight: 850;
      color: var(--text-primary);
      margin: 0;
      letter-spacing: -0.01em;
    }

    .card-details p {
      font-size: 0.88rem;
      font-weight: 500;
      color: var(--text-secondary);
      margin: 0;
      line-height: 1.4;
    }

    .gold-desc {
      color: var(--text-secondary) !important;
      font-weight: 500 !important;
    }

    /* Glows on Hover */
    .purple-glow:hover {
      border-color: rgba(165, 94, 234, 0.35);
    }

    .blue-glow:hover {
      border-color: rgba(66, 133, 244, 0.35);
    }

    .gold-glow:hover {
      border-color: rgba(255, 191, 0, 0.4);
    }

    .chevron {
      font-size: 1.4rem;
      color: var(--text-secondary);
      opacity: 0.5;
      margin-left: auto;
      transition: all 0.3s ease;
    }

    .hub-action-card:hover .chevron {
      transform: translateX(4px);
      color: #a55eea;
      opacity: 1;
    }

    .gold-glow:hover .chevron {
      color: #ffbf00;
      opacity: 1;
    }

    @media (max-width: 600px) {
      .hub-action-card {
        padding: 1.25rem 1.25rem;
        border-radius: 24px;
      }
      .card-icon-box {
        width: 48px;
        height: 48px;
        border-radius: 14px;
      }
      .card-details h2 {
        font-size: 1.1rem;
      }
      .card-details p {
        font-size: 0.8rem;
      }
    }
    /* Payment Modal Styles */
    .payment-backdrop {
      z-index: 2000 !important;
      background: rgba(0, 0, 0, 0.6) !important;
    }
    .payment-modal-card {
      background: var(--glass-bg);
      border: 1px solid var(--glass-border);
      backdrop-filter: blur(25px);
      border-radius: 28px;
      width: 100%;
      max-width: 420px;
      box-shadow: 0 30px 80px rgba(0,0,0,0.3);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      font-family: inherit;
      animation: slideUpModal 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    .payment-header {
      padding: 1.1rem 1.4rem 0.85rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--border-color);
    }
    .payment-header-left {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .security-shield {
      color: #2ecc71;
      font-size: 1.3rem;
    }
    .payment-header h3 {
      font-size: 1.15rem;
      font-weight: 900;
      margin: 0;
      letter-spacing: -0.02em;
      color: var(--text-primary);
    }
    .close-payment-btn {
      background: var(--border-color);
      border: none;
      border-radius: 50%;
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--text-primary);
      transition: all 0.2s ease;
    }
    .close-payment-btn:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }
    .payment-body {
      padding: 1.25rem 1.4rem;
      display: flex;
      flex-direction: column;
      gap: 1.1rem;
    }
    .payment-summary {
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 16px;
      padding: 0.85rem 1.1rem;
      display: flex;
      flex-direction: column;
      gap: 0.45rem;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.82rem;
      font-weight: 600;
      color: var(--text-secondary);
    }
    .summary-row.total {
      border-top: 1px dashed var(--border-color);
      padding-top: 0.45rem;
      margin-top: 0.15rem;
      font-size: 0.95rem;
      font-weight: 900;
      color: var(--text-primary);
    }
    .summary-row.total .summary-val {
      color: #a55eea;
    }
    .payment-card-form {
      display: flex;
      flex-direction: column;
      gap: 0.95rem;
    }
    .pay-input-group {
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
      text-align: left;
    }
    .pay-input-group label {
      font-size: 0.72rem;
      font-weight: 850;
      color: var(--text-primary);
      text-transform: uppercase;
      letter-spacing: 0.03em;
      padding-left: 0.1rem;
    }
    .pay-input-group input {
      background-color: var(--bg-primary) !important;
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 0.65rem 0.85rem;
      font-family: inherit;
      font-size: 0.88rem;
      font-weight: 700;
      color: var(--text-primary);
      outline: none;
      transition: all 0.22s ease;
    }
    .pay-input-group input:focus {
      border-color: #a55eea;
      box-shadow: 0 0 0 3px rgba(165, 94, 234, 0.12);
    }
    .card-num-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }
    .card-num-wrapper input {
      width: 100%;
      padding-left: 2.3rem;
    }
    .card-brand-icon {
      position: absolute;
      left: 0.75rem;
      color: var(--text-secondary);
      font-size: 1.25rem;
      pointer-events: none;
    }
    .pay-row {
      display: grid;
      grid-template-columns: 1.2fr 0.8fr;
      gap: 0.75rem;
    }
    .payment-security-note {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.4rem;
      font-size: 0.72rem;
      color: var(--text-secondary);
      font-weight: 600;
    }
    .payment-security-note .material-icons {
      font-size: 0.9rem;
      color: #2ecc71;
    }
    .pay-btn {
      background: #2ecc71;
      color: #fff;
      border: none;
      border-radius: 14px;
      padding: 0.75rem;
      font-family: inherit;
      font-weight: 900;
      font-size: 0.95rem;
      cursor: pointer;
      box-shadow: 0 4px 15px rgba(46, 204, 113, 0.2);
      transition: all 0.25s ease;
    }
    .pay-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(46, 204, 113, 0.35);
      background: #27ae60;
    }
    
    /* Payment States Styles */
    .payment-status-wrapper {
      padding: 3rem 2rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      text-align: center;
    }
    .payment-status-wrapper h4 {
      font-size: 1.15rem;
      font-weight: 900;
      margin: 0;
      color: var(--text-primary);
    }
    .payment-status-wrapper p {
      font-size: 0.82rem;
      color: var(--text-secondary);
      font-weight: 500;
      margin: 0;
      max-width: 260px;
      line-height: 1.4;
    }
    
    /* Circular Spinner */
    .payment-spinner {
      width: 48px;
      height: 48px;
      border: 4px solid var(--border-color);
      border-top: 4px solid #a55eea;
      border-radius: 50%;
      animation: paySpin 1s linear infinite;
      margin-bottom: 0.5rem;
    }
    @keyframes paySpin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    /* Animated Success Check */
    .success-check {
      font-size: 3.5rem;
      color: #2ecc71;
      margin-bottom: 0.5rem;
      animation: checkPop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
    }
    @keyframes checkPop {
      0% { transform: scale(0.5); opacity: 0; }
      100% { transform: scale(1); opacity: 1; }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventsComponent implements AfterViewInit {
  private router = inject(Router);
  private eventsService = inject(EventsService);
  private authService = inject(AuthService);
  @ViewChild('container') container!: ElementRef;

  allEvents = this.eventsService.events;
  searchTerm = signal('');
  currentView = signal<'hub' | 'list'>('hub');

  // --- PROMOTION MODAL STATE ---
  showModal = false;
  submitting = false;
  loggedInUser = '';
  planCost = 'Gratuit';

  // --- BANK CARD PAYMENT SIMULATION STATE ---
  showPaymentModal = false;
  paymentProcessing = false;
  paymentSuccess = false;
  paymentModel = {
    cardholder: '',
    cardNumber: '',
    expiry: '',
    cvv: ''
  };

  formModel = {
    title: '',
    category: 'CONCERT',
    location: '',
    date: '',
    time: '',
    description: '',
    link: '',
    imageUrl: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=800&q=80',
    plan: 'BASIC'
  };

  presetImages = [
    { label: 'Muzică', url: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=400&q=80' },
    { label: 'Teatru', url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=400&q=80' },
    { label: 'Food/Fest', url: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=400&q=80' },
    { label: 'Sport', url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=400&q=80' }
  ];

  constructor() {
    this.eventsService.loadEvents();
  }

  activeTab = signal<'evenimente' | 'stiri'>('evenimente');

  isRecommendation(item: any): boolean {
    if (item.isPromoted) return false; // Promoted events can never be recommendations
    
    const title = (item.title || '').toLowerCase();
    const cat = (item.category || '').toUpperCase();
    
    const recKeywords = [
      'recomandare', 'recomandări', 'sfaturi', 'top ', 'metode', 'cum să', 
      'ce să nu ratezi', 'ghid', 'idei', 'cum ne ', 'planifici un', 'relaxare', 'vulnerabilitate'
    ];
    
    const recCategories = ['RECOMANDARE', 'RECOMANDARI', 'LIFESTYLE', 'MIXOLOGY'];
    
    return recKeywords.some(kw => title.includes(kw)) || recCategories.some(rc => cat.includes(rc));
  }

  isNewsItem(item: any): boolean {
    if (item.isPromoted) return false; // Promoted events always go to Events tab
    
    const cat = (item.category || '').toUpperCase();
    const title = (item.title || '').toLowerCase();
    
    // Strict news categories
    const newsCategories = [
      'CLIN D\'OEIL', 'POVESTI DE SUCCES', 'FASHION', 'OPINIE', 'ARTICOL', 'NEWS', 
      'STIRI', 'STIRE', 'CULTURĂ', 'CULTURA', 'MUZICĂ NOUĂ', 'MUZICA NOUA', 'FILM', 
      'PREMIERĂ', 'PREMIERA', 'CLIN D’OEIL', 'POVEȘTI DE SUCCES'
    ];
    
    const hasNewsCategory = newsCategories.some(nc => cat.includes(nc));
    const hasNewsKeywords = title.includes('interviu') || title.includes('anunț') || title.includes('lansare');
    
    return hasNewsCategory || hasNewsKeywords;
  }

  // Filtered and split signal list
  events = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const tab = this.activeTab();
    
    return this.allEvents().filter(e => {
      // 1. Strictly filter out recommendations (which belong to nature/evergreen leisure recommendations!)
      if (this.isRecommendation(e)) return false;

      // 2. Search term filter
      const matchesSearch = e.title.toLowerCase().includes(term) || 
                            e.location.toLowerCase().includes(term) ||
                            (e.category && e.category.toLowerCase().includes(term));
      if (!matchesSearch) return false;

      // 3. Tab split filter
      const isNews = this.isNewsItem(e);
      if (tab === 'evenimente') {
        return !isNews;
      } else {
        return isNews;
      }
    });
  });

  // Dynamic Badges (excluding recommendations)
  eventCount = computed(() => {
    return this.allEvents().filter(e => !this.isRecommendation(e) && !this.isNewsItem(e)).length;
  });

  newsCount = computed(() => {
    return this.allEvents().filter(e => !this.isRecommendation(e) && this.isNewsItem(e)).length;
  });

  setTab(tab: 'evenimente' | 'stiri') {
    this.activeTab.set(tab);
  }

  splitByWord(text: string): string[] {
    return text.split(' ');
  }

  triggerTitleAnimation() {
    // Reset initial state of characters
    gsap.set('.premium-title .char', { y: 30, opacity: 0 });
    
    // Play spectacular rise and fade-in stagger animation!
    gsap.to('.premium-title .char', {
      y: 0,
      opacity: 1,
      stagger: 0.02,
      ease: 'power3.out',
      duration: 0.85
    });
  }

  ngAfterViewInit() {
    // Stagger the default Hub Dashboard title immediately on load!
    this.triggerTitleAnimation();
  }

  goBack() {
    if (this.currentView() === 'hub') {
      this.router.navigate(['/dashboard']);
    } else {
      this.currentView.set('hub');
      // Stagger letters when going back to the Hub!
      setTimeout(() => this.triggerTitleAnimation(), 30);
    }
  }

  navigateToListView(tab: 'evenimente' | 'stiri') {
    this.activeTab.set(tab);
    this.currentView.set('list');
    // Stagger letters when going to the List view!
    setTimeout(() => this.triggerTitleAnimation(), 30);
  }

  onSearch(event: any) {
    this.searchTerm.set(event.target.value);
  }

  openEvent(link?: string) {
    if (link) {
      window.open(link, '_blank');
    }
  }

  // --- PROMOTION METHODS ---

  openPromoteModal() {
    if (this.authService.isLoggedIn()) {
      this.loggedInUser = this.authService.getUserName() || 'Utilizator Smart City';
    } else {
      // Simulation mode without account blocker!
      this.loggedInUser = 'Vizitator Demo 🚀 (Mod Simulare)';
    }
    this.showModal = true;
  }

  closePromoteModal() {
    this.showModal = false;
  }

  onPlanChange() {
    if (this.formModel.plan === 'BASIC') {
      this.planCost = 'Gratuit';
    } else if (this.formModel.plan === 'PREMIUM') {
      this.planCost = '25 LEI / lună';
    } else if (this.formModel.plan === 'ELITE') {
      this.planCost = '60 LEI / lună';
    }
  }

  async submitPromotion(e: Event) {
    e.preventDefault();
    if (!this.formModel.title || !this.formModel.location || !this.formModel.date || !this.formModel.time || !this.formModel.description) {
      alert('Vă rugăm să completați toate câmpurile obligatorii marked with (*)!');
      return;
    }

    // Reset card details
    this.paymentModel = {
      cardholder: '',
      cardNumber: '',
      expiry: '',
      cvv: ''
    };
    // Open secure simulated payment interface for all plans!
    this.showPaymentModal = true;
  }

  async registerPromotion() {
    // Build ISO Date from separate date & time inputs
    const eventDate = new Date(`${this.formModel.date}T${this.formModel.time}`);
    
    const payload = {
      title: this.formModel.title,
      description: this.formModel.description,
      category: this.formModel.category,
      imageUrl: this.formModel.imageUrl,
      when: eventDate.toISOString(),
      location: this.formModel.location,
      link: this.formModel.link,
      promotedBy: this.loggedInUser,
      plan: this.formModel.plan
    };

    await this.eventsService.promoteEvent(payload);
    
    alert('Felicitări! Evenimentul tău a fost înregistrat și promovat cu succes! 🎉 Este acum afișat în prim-plan în lista de evenimente.');
    
    // Auto-redirect to list view to show their active card!
    this.navigateToListView('evenimente');
    
    // Reset form
    this.formModel = {
      title: '',
      category: 'CONCERT',
      location: '',
      date: '',
      time: '',
      description: '',
      link: '',
      imageUrl: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=800&q=80',
      plan: 'BASIC'
    };
    this.planCost = 'Gratuit';
  }

  closePaymentModal() {
    this.showPaymentModal = false;
    this.paymentProcessing = false;
    this.paymentSuccess = false;
  }

  formatCardNumber(event: any) {
    let value = event.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    let matches = value.match(/\d{4,16}/g);
    let match = (matches && matches[0]) || '';
    let parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      this.paymentModel.cardNumber = parts.join(' ');
    } else {
      this.paymentModel.cardNumber = value;
    }
  }

  formatExpiry(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      this.paymentModel.expiry = value.slice(0, 2) + '/' + value.slice(2, 4);
    } else {
      this.paymentModel.expiry = value;
    }
  }

  onPaySubmit(event: Event) {
    event.preventDefault();
    if (!this.paymentModel.cardholder || !this.paymentModel.cardNumber || !this.paymentModel.expiry || !this.paymentModel.cvv) {
      alert('Vă rugăm să completați toate datele cardului bancar!');
      return;
    }

    this.paymentProcessing = true;
    this.paymentSuccess = false;

    // Simulate safe standard transaction flow!
    setTimeout(() => {
      this.paymentProcessing = false;
      this.paymentSuccess = true;

      // Register the promotion to database after successful payment animation completes!
      setTimeout(async () => {
        try {
          await this.registerPromotion();
          this.closePaymentModal();
          this.closePromoteModal();
        } catch (err) {
          console.error('Failed to register promotion after payment:', err);
          alert('A apărut o eroare la salvarea promovării după plată.');
          this.closePaymentModal();
        }
      }, 1500);
    }, 2200);
  }
}
