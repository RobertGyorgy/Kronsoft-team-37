import { ChangeDetectionStrategy, Component, AfterViewInit, ElementRef, ViewChildren, QueryList } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { gsap } from 'gsap';

interface DashboardCard {
  title: string;
  image: string;
  action: () => void;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <main class="dashboard-wrapper">
      <!-- Header Section -->
      <header class="header">
        <h1 class="welcome-text">Salut, Ion Popescu!</h1>
        <div class="header-icons">
          <button class="icon-btn" (mouseenter)="animateIcon($event)" (mouseleave)="resetIcon($event)">
            <svg class="h-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
          </button>
          <button class="icon-btn" (mouseenter)="animateIcon($event)" (mouseleave)="resetIcon($event)">
            <svg class="h-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 2 0 0 1 2-2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </button>
        </div>
      </header>

      <div class="divider"></div>

      <!-- Interaction Grid -->
      <section class="grid-container">
        <div *ngFor="let card of cards" #gridCard class="card" (mouseenter)="onCardHover($event)" (mouseleave)="onCardLeave($event)" (click)="card.action()">
          <div class="card-bg" [style.backgroundImage]="'url(' + card.image + ')'"></div>
          <div class="card-overlay"></div>
          <span class="title">{{ card.title }}</span>
        </div>
      </section>
    </main>
  `,
  styles: [
    `
      .dashboard-wrapper {
        min-height: 100dvh;
        background: #fdfdfd;
        padding: 1.5rem;
        font-family: 'Surgena', sans-serif;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.5rem 0;
      }

      .welcome-text {
        font-size: 1.75rem;
        font-weight: 700;
        color: #1e3a8a;
        margin: 0;
        letter-spacing: -0.02em;
      }

      .header-icons {
        display: flex;
        gap: 1rem;
      }

      .icon-btn {
        background: none;
        border: none;
        color: #1e3a8a;
        cursor: pointer;
        padding: 0.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .h-icon {
        width: 1.75rem;
        height: 1.75rem;
      }

      .divider {
        width: 100%;
        height: 1px;
        background: #eee;
        margin-bottom: 0.5rem;
      }

      /* Grid Layout */
      .grid-container {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 16px;
      }

      .card {
        position: relative;
        background: #ffffff;
        border-radius: 12px;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        aspect-ratio: 1 / 1; /* Makes cards square */
        cursor: pointer;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      }

      .card-bg {
        position: absolute;
        inset: 0;
        background-size: cover;
        background-position: center;
        filter: blur(2px) brightness(0.7); /* Slight blur and darkened for text contrast */
        transition: transform 0.5s ease;
        z-index: 0;
      }

      .card:hover .card-bg {
        transform: scale(1.1);
        filter: blur(0px) brightness(0.8);
      }

      .card-overlay {
        position: absolute;
        inset: 0;
        background: linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.4) 100%);
        z-index: 1;
      }

      .title {
        position: relative;
        z-index: 2;
        font-size: 1.1rem;
        font-weight: 700;
        color: #fff;
        line-height: 1.2;
        padding: 1rem;
        text-shadow: 0 2px 4px rgba(0,0,0,0.5);
      }

      @media (min-width: 600px) {
        .grid-container {
          max-width: 600px;
          margin: 0 auto;
        }
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements AfterViewInit {
  @ViewChildren('gridCard') gridCards!: QueryList<ElementRef>;

  protected readonly cards: DashboardCard[] = [
    { 
      title: 'Program Autobuze', 
      image: '/images/bus_brasov_1777833498194.png',
      action: () => console.log('Navigating to Bus Schedule...')
    },
    { 
      title: 'Recomandări de Weekend', 
      image: '/images/mountain_weekend_1777833511005.png',
      action: () => console.log('Opening Weekend Recommendations...')
    },
    { 
      title: 'Raportează Nereguli', 
      image: '/images/city_issue_1777833527299.png',
      action: () => console.log('Opening Issue Reporting...')
    },
    { 
      title: 'Evenimente în Oraș', 
      image: '/images/city_events_1777833540976.png',
      action: () => console.log('Opening City Events...')
    },
    { 
      title: 'Plătește Parcarea', 
      image: '/images/parking_brasov_1777833555386.png',
      action: () => console.log('Navigating to Parking Payment...')
    },
    { 
      title: 'Servicii Online Primărie', 
      image: '/images/city_hall_online_1777833573148.png',
      action: () => console.log('Navigating to Online Services...')
    }
  ];

  ngAfterViewInit() {
    const tl = gsap.timeline();

    tl.from('.welcome-text', {
      opacity: 0,
      y: 40,
      duration: 0.8,
      ease: 'power2.out'
    });

    tl.from('.icon-btn', {
      opacity: 0,
      y: 20,
      duration: 0.6,
      stagger: 0.1,
      ease: 'power2.out'
    }, '-=0.6');

    tl.from(this.gridCards.map(c => c.nativeElement), {
      opacity: 0,
      scale: 0.8,
      duration: 0.8,
      stagger: 0.1,
      ease: 'back.out(1.7)'
    }, '-=0.4');
  }

  onCardHover(event: MouseEvent) {
    gsap.to(event.currentTarget, {
      scale: 1.05,
      boxShadow: '0 12px 24px rgba(0,0,0,0.2)',
      duration: 0.3,
      ease: 'power2.out'
    });
  }

  onCardLeave(event: MouseEvent) {
    gsap.to(event.currentTarget, {
      scale: 1.0,
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
      duration: 0.3,
      ease: 'power2.in'
    });
  }

  animateIcon(event: MouseEvent) {
    gsap.to(event.currentTarget, { rotate: 15, scale: 1.1, duration: 0.2 });
  }

  resetIcon(event: MouseEvent) {
    gsap.to(event.currentTarget, { rotate: 0, scale: 1.0, duration: 0.2 });
  }
}
