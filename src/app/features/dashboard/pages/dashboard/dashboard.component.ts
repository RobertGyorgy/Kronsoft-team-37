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
        <div class="user-info">
          <p class="greeting">Salut,</p>
          <h1 class="user-name">Ion Popescu!</h1>
        </div>
        <div class="header-actions">
          <button class="icon-btn" aria-label="Notifications">
            <span class="material-icons">notifications_none</span>
          </button>
          <button class="icon-btn" aria-label="Settings">
            <span class="material-icons">settings</span>
          </button>
        </div>
      </header>

      <!-- Interaction Grid (2x3) -->
      <section class="interaction-grid">
        <div class="grid-card orange" (click)="onBusScheduleClick()">
          <span class="material-icons">directions_bus</span>
          <span class="card-title">Program Autobuze</span>
        </div>

        <div class="grid-card blue" (click)="onPayParkingClick()">
          <span class="material-icons">local_parking</span>
          <span class="card-title">Plătește Parcarea</span>
        </div>

        <div class="grid-card red" (click)="onReportIssueClick()">
          <span class="material-icons">report_problem</span>
          <span class="card-title">Sesizează o Problemă</span>
        </div>

        <div class="grid-card green" (click)="onPayTaxesClick()">
          <span class="material-icons">payments</span>
          <span class="card-title">Plată Taxe și Impozite</span>
        </div>

        <div class="grid-card purple" (click)="onCityEventsClick()">
          <span class="material-icons">event</span>
          <span class="card-title">Evenimente Oraș</span>
        </div>

        <div class="grid-card teal" (click)="onUsefulInfoClick()">
          <span class="material-icons">info</span>
          <span class="card-title">Informații Utile</span>
        </div>
      </section>

      <!-- Footer Action -->
      <footer class="dashboard-footer">
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
        background: #fcfcfc;
        padding: 2rem 1.5rem;
        font-family: 'Surgena', sans-serif;
        display: flex;
        flex-direction: column;
        gap: 2.5rem;
      }

      .dashboard-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
      }

      .greeting {
        font-size: 1.1rem;
        color: #888;
        margin: 0;
        font-weight: 500;
      }

      .user-name {
        font-size: 2.25rem;
        font-weight: 800;
        color: #1a1a1a;
        margin: 0;
        letter-spacing: -0.02em;
      }

      .header-actions {
        display: flex;
        gap: 0.75rem;
      }

      .icon-btn {
        width: 3rem;
        height: 3rem;
        border-radius: 50%;
        border: 1px solid #eee;
        background: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #333;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .icon-btn:active {
        transform: scale(0.92);
        background: #f5f5f5;
      }

      /* Grid Layout */
      .interaction-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
        flex: 1;
      }

      .grid-card {
        border-radius: 24px;
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        gap: 1rem;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        color: #fff; /* All text white for contrast */
        min-height: 140px;
      }

      .grid-card:active {
        transform: scale(0.96);
      }

      .material-icons {
        font-size: 3rem; /* Larger icons */
        opacity: 0.9;
      }

      /* Card Themes */
      .grid-card.orange { background: #ff4500; box-shadow: 0 10px 20px rgba(255, 69, 0, 0.25); }
      .grid-card.blue { background: #4285f4; box-shadow: 0 10px 20px rgba(66, 133, 244, 0.25); }
      .grid-card.red { background: #ff4757; box-shadow: 0 10px 20px rgba(255, 71, 87, 0.25); }
      .grid-card.green { background: #2ed573; box-shadow: 0 10px 20px rgba(46, 213, 115, 0.25); }
      .grid-card.purple { background: #a55eea; box-shadow: 0 10px 20px rgba(165, 94, 234, 0.25); }
      .grid-card.teal { background: #2bcbba; box-shadow: 0 10px 20px rgba(43, 203, 186, 0.25); }

      .card-title {
        font-size: 1rem;
        font-weight: 700;
        line-height: 1.1;
      }

      .dashboard-footer {
        display: flex;
        justify-content: center;
        padding-bottom: 1rem;
      }

      .logout-link {
        display: flex;
        align-items: center;
        gap: 0.6rem;
        text-decoration: none;
        color: #999;
        font-weight: 600;
        font-size: 0.95rem;
        padding: 0.8rem 1.5rem;
        border-radius: 999px;
        background: #fff;
        border: 1px solid #eee;
      }

      /* Desktop adjustment to prevent cards from being too wide */
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
