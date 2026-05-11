import { ChangeDetectionStrategy, Component, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { gsap } from 'gsap';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <main class="dashboard-container" #container>
      <!-- Premium Header Section -->
      <header class="dashboard-header">
        <div class="greeting-wrapper">
          <h1 class="hello-text line-mask">
            <span *ngFor="let word of helloWords" class="word">
              <span *ngFor="let char of word.split('')" class="char">{{ char }}</span>
              <span class="char">&nbsp;</span>
            </span>
          </h1>
          <h2 class="interest-text line-mask">
            <span *ngFor="let word of interestWords" class="word">
              <span *ngFor="let char of word.split('')" class="char">{{ char }}</span>
              <span class="char">&nbsp;</span>
            </span>
          </h2>
        </div>
      </header>

      <!-- Interaction Grid (2x3) -->
      <section class="interaction-grid" #grid>
        <div class="grid-card orange" routerLink="/transport/bus">
          <span class="material-icons card-bg-icon">directions_bus</span>
          <span class="card-title">Program Autobuze</span>
        </div>

        <div class="grid-card blue" routerLink="/parking">
          <span class="material-icons card-bg-icon">local_parking</span>
          <span class="card-title">Plătește Parcarea</span>
        </div>

        <div class="grid-card red" routerLink="/report">
          <span class="material-icons card-bg-icon">report_problem</span>
          <span class="card-title">Sesizează o Problemă</span>
        </div>

        <div class="grid-card green" (click)="onTownHallClick()">
          <span class="material-icons card-bg-icon">account_balance</span>
          <span class="card-title">Servicii Primărie</span>
        </div>

        <div class="grid-card purple" (click)="onCityEventsClick()">
          <span class="material-icons card-bg-icon">event</span>
          <span class="card-title">Evenimente Oraș</span>
        </div>

        <div class="grid-card teal" routerLink="/weekend">
          <span class="material-icons card-bg-icon">auto_awesome</span>
          <span class="card-title">Recomandări de Weekend</span>
        </div>
      </section>

      <!-- Footer Action -->
      <footer class="dashboard-footer" #footer>
        <button class="icon-btn footer-btn" aria-label="Settings">
          <span class="material-icons">settings</span>
        </button>
        <a routerLink="/login" class="logout-link">
          <span class="material-icons">logout</span>
          Deconectare
        </a>
      </footer>
    </main>
  `,
  styles: [
    `
      .dashboard-container {
        min-height: 100dvh;
        width: 100%;
        overflow-x: hidden;
        background: #ffffff;
        padding: calc(var(--safe-top) + 1.5rem) 1.25rem calc(var(--safe-bottom) + 1.5rem);
        font-family: 'Outfit', sans-serif;
        display: flex;
        flex-direction: column;
        gap: 2rem;
        position: relative;
      }

      .dashboard-header {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        padding-top: 1rem;
      }

      .greeting-wrapper {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }

      .line-mask {
        overflow: visible;
        display: block;
        margin: 0;
      }

      .hello-text {
        font-size: 3.2rem;
        font-weight: 800;
        color: #1a1a1a;
        letter-spacing: -0.05em;
        line-height: 1;
      }

      .interest-text {
        font-size: 1.35rem;
        font-weight: 500;
        color: #666;
        letter-spacing: -0.02em;
        line-height: 1.2;
        max-width: 100%; /* Allow full width for better wrapping */
      }

      .word {
        display: inline-block;
        white-space: nowrap; /* Keep letters together */
      }

      .char {
        display: inline-block;
        opacity: 0;
      }

      /* Grid Layout */
      .interaction-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
        flex: 1;
      }

      .grid-card {
        position: relative;
        border-radius: 28px;
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        align-items: flex-start;
        overflow: hidden;
        cursor: pointer;
        border: none;
        min-height: 130px;
        opacity: 0;
      }
      
      .grid-card.animated {
        transition: transform 0.3s cubic-bezier(0.165, 0.84, 0.44, 1), box-shadow 0.3s ease;
      }

      .grid-card:active {
        transform: scale(0.96);
      }

      .card-bg-icon {
        position: absolute;
        top: 10%;
        right: -5%;
        font-size: 5rem !important;
        opacity: 0.15;
        color: #fff;
        transform: rotate(-10deg);
        pointer-events: none;
      }

      .card-title {
        font-size: 1.1rem;
        font-weight: 800;
        color: #fff;
        line-height: 1.1;
        z-index: 2;
        letter-spacing: -0.01em;
      }

      /* Card Themes */
      .orange { background: #ff4500; box-shadow: 0 10px 20px rgba(255, 69, 0, 0.15); }
      .blue { background: #4285f4; box-shadow: 0 10px 20px rgba(66, 133, 244, 0.15); }
      .red { background: #ff4757; box-shadow: 0 10px 20px rgba(255, 71, 87, 0.15); }
      .green { background: #2ed573; box-shadow: 0 10px 20px rgba(46, 213, 115, 0.15); }
      .purple { background: #a55eea; box-shadow: 0 10px 20px rgba(165, 94, 234, 0.15); }
      .teal { background: #2bcbba; box-shadow: 0 10px 20px rgba(43, 203, 186, 0.15); }

      .dashboard-footer {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 1.25rem;
        margin-top: 1.5rem;
        opacity: 0;
      }

      .footer-btn {
        width: 3.5rem;
        height: 3.5rem;
        border-radius: 50%;
        border: 1px solid #eee;
        background: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #666;
        cursor: pointer;
      }

      .logout-link {
        flex: 1;
        max-width: 200px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.6rem;
        text-decoration: none;
        color: #1a1a1a;
        font-weight: 700;
        font-size: 1rem;
        padding: 1.1rem 1.5rem;
        border-radius: 999px;
        background: #f5f5f5;
      }

      @media (min-width: 600px) {
        .interaction-grid {
          grid-template-columns: repeat(3, 1fr);
          max-width: 800px;
          margin: 0 auto;
        }
        .hello-text { font-size: 5.5rem; }
        .interest-text { font-size: 2.2rem; }
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements AfterViewInit {
  @ViewChild('container') container!: ElementRef;
  @ViewChild('grid') grid!: ElementRef;
  @ViewChild('footer') footer!: ElementRef;

  helloWords = 'Hello, Ion'.split(' ');
  interestWords = 'What are you interested in today?'.split(' ');

  ngAfterViewInit() {
    const tl = gsap.timeline({ 
      defaults: { ease: 'power2.out', duration: 0.8 } 
    });

    // Initial state setup
    gsap.set('.char', { y: 30 });
    gsap.set('.grid-card', { y: 40 });
    gsap.set(this.footer.nativeElement, { y: 20 });

    // 1. Hello Heading Reveal
    tl.to('.hello-text .char', {
      y: 0,
      opacity: 1,
      stagger: 0.02,
    })
    
    // 2. Interest Text & Cards
    .to('.interest-text .char', {
      y: 0,
      opacity: 1,
      stagger: 0.008,
    }, '-=0.5')
    
    .to('.grid-card', {
      y: 0,
      opacity: 1,
      stagger: 0.04,
      duration: 0.8,
      onComplete: () => {
        document.querySelectorAll('.grid-card').forEach(el => el.classList.add('animated'));
      }
    }, '-=0.6')
    
    // 3. Footer
    .to(this.footer.nativeElement, {
      y: 0,
      opacity: 1,
    }, '-=0.5');
  }

  onTownHallClick() { 
    window.open('https://www.brasovcity.ro', '_blank');
  }
  
  onCityEventsClick() { console.log('Opening City Events...'); }
}





