import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <main class="dashboard-container">
      <!-- Header Section -->
      <header class="dashboard-header">
        <h1 class="user-greeting">Salut, Ion Popescu!</h1>
      </header>

      <!-- Interaction Grid (2x3) -->
      <section class="interaction-grid">
        <div class="grid-card orange" routerLink="/transport/bus">
          <span class="material-icons card-bg-icon">directions_bus</span>
          <span class="card-title">Program Autobuze</span>
        </div>
        <!-- ... (cards stay the same) -->

        <div class="grid-card blue" (click)="onPayParkingClick()">
          <span class="material-icons card-bg-icon">local_parking</span>
          <span class="card-title">Plătește Parcarea</span>
        </div>

        <div class="grid-card red" (click)="onReportIssueClick()">
          <span class="material-icons card-bg-icon">report_problem</span>
          <span class="card-title">Sesizează o Problemă</span>
        </div>

        <div class="grid-card green" (click)="onPayTaxesClick()">
          <span class="material-icons card-bg-icon">payments</span>
          <span class="card-title">Plată Taxe și Impozite</span>
        </div>

        <div class="grid-card purple" (click)="onCityEventsClick()">
          <span class="material-icons card-bg-icon">event</span>
          <span class="card-title">Evenimente Oraș</span>
        </div>

        <div class="grid-card teal" (click)="onUsefulInfoClick()">
          <span class="material-icons card-bg-icon">info</span>
          <span class="card-title">Informații Utile</span>
        </div>
      </section>

      <!-- Footer Action -->
      <footer class="dashboard-footer">
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
        background: #f8f9fa;
        padding: 1.5rem 1.25rem;
        font-family: 'Surgena', sans-serif;
        display: flex;
        flex-direction: column;
        gap: 1.25rem; /* Balanced gap */
      }

      .dashboard-header {
        display: flex;
        justify-content: flex-start;
        align-items: center;
      }

      .user-greeting {
        font-size: 1.75rem;
        font-weight: 800;
        color: #1a1a1a;
        margin: 0;
        letter-spacing: -0.03em;
      }

      /* Grid Layout */
      .interaction-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        grid-auto-rows: 1fr; /* Make rows equal height and dynamic */
        gap: 1.25rem;
        flex: 1; /* Stretch to fill available space */
      }

      .grid-card {
        position: relative;
        border-radius: 28px;
        padding: 1.25rem;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        align-items: flex-start;
        overflow: hidden;
        cursor: pointer;
        transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s ease;
        border: none;
        min-height: 120px; /* Minimum safety height */
      }

      .grid-card:active {
        transform: scale(0.95);
      }

      /* Full card icon background */
      .card-bg-icon {
        position: absolute;
        top: 10%;
        right: -5%;
        font-size: 5rem !important; /* Large icon */
        opacity: 0.15; /* Subtle background effect */
        color: #fff;
        transform: rotate(-10deg);
        pointer-events: none;
      }

      .card-title {
        font-size: 1rem;
        font-weight: 800;
        color: #fff;
        line-height: 1.1;
        z-index: 2;
        max-width: 90%;
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
        gap: 1rem;
        padding-bottom: 1rem;
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
        box-shadow: 0 4px 10px rgba(0,0,0,0.05);
      }

      .logout-link {
        flex: 1;
        max-width: 200px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.6rem;
        text-decoration: none;
        color: #ff4500;
        font-weight: 700;
        font-size: 1rem;
        padding: 1rem 1.5rem;
        border-radius: 999px;
        background: #fff;
        border: 1px solid #eee;
        box-shadow: 0 4px 10px rgba(0,0,0,0.05);
      }

      @media (min-width: 600px) {
        .interaction-grid {
          max-width: 500px;
          margin: 0 auto;
        }
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent {
  onBusScheduleClick() { console.log('Navigating to Bus Schedule...'); }
  onPayParkingClick() { console.log('Navigating to Parking Payment...'); }
  onReportIssueClick() { console.log('Opening Issue Reporting...'); }
  onPayTaxesClick() { console.log('Navigating to Tax Payments...'); }
  onCityEventsClick() { console.log('Opening City Events...'); }
  onUsefulInfoClick() { console.log('Opening Useful Information...'); }
}
