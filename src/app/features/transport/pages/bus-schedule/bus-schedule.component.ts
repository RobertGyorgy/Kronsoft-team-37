import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-bus-schedule',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <main class="bus-shell">
      <!-- Top Nav with Back Button Only -->
      <header class="top-nav">
        <button class="back-pill" routerLink="/dashboard">
          <span class="material-icons">arrow_back</span>
          Înapoi
        </button>
      </header>

      <section class="welcome-hero">
        <div class="greeting-block">
          <p class="greeting-time">Bună seara,</p>
          <h1 class="greeting-name">Ion</h1>
        </div>
        <div class="bus-illustration">
          <span class="material-icons bus-icon">directions_bus</span>
        </div>
      </section>

      <!-- Advanced Search Container -->
      <div class="search-container">
        <div class="search-group">
          <div class="search-pill">
            <span class="material-icons search-icon">place</span>
            <input type="text" placeholder="Caută stația" />
          </div>
          <div class="search-pill bus-number-search">
            <span class="material-icons search-icon">directions_bus</span>
            <input type="text" placeholder="Nr. Autobuz" />
            <button class="search-execute-btn">
              <span class="material-icons">search</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Main Action: Buy Ticket -->
      <div class="main-action-container">
        <a href="https://24pay.ro" target="_blank" class="buy-ticket-btn">
          <span class="material-icons">confirmation_number</span>
          Cumpără bilet (24pay)
        </a>
      </div>

      <!-- Scrollable Content Area -->
      <div class="scroll-content">
        <!-- Program Autobuze -->
        <section class="section">
          <div class="section-header">
            <h3>Program Autobuze</h3>
          </div>
          <div class="route-card">
            <div class="route-badge orange">40</div>
            <div class="route-details">
              <span class="destination">Livada Poștei</span>
              <span class="origin">din Gara Brașov</span>
            </div>
            <div class="arrival-info">
              <span class="time">în 12 min</span>
              <span class="status-pill">La timp</span>
            </div>
          </div>

          <div class="route-card">
            <div class="route-badge orange">28</div>
            <div class="route-details">
              <span class="destination">Livada Poștei</span>
              <span class="origin">din Fundătură</span>
            </div>
            <div class="arrival-info">
              <span class="time">în 5 min</span>
              <span class="status-pill warning">Întârziat</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  `,
  styles: [
    `
      .bus-shell {
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

      .welcome-hero {
        padding: 1rem 1.5rem 1.5rem;
        position: relative;
        overflow: hidden;
      }

      .greeting-time {
        font-size: 1.5rem;
        font-weight: 500;
        color: #1a1a1a;
        margin: 0;
      }

      .greeting-name {
        font-size: 2.25rem;
        font-weight: 800;
        color: #ff4500;
        margin: 0;
        letter-spacing: -0.02em;
      }

      .bus-illustration {
        position: absolute;
        top: 0;
        right: -10px;
        opacity: 0.1;
      }

      .bus-icon {
        font-size: 120px !important;
        color: #ff4500;
        transform: rotate(-10deg);
      }

      .search-container {
        padding: 0 1.5rem;
        margin-bottom: 2rem;
      }

      .search-group {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .search-pill {
        background: #fff;
        border: 1px solid #eee;
        border-radius: 999px;
        display: flex;
        align-items: center;
        padding: 0.5rem 0.5rem 0.5rem 1.25rem;
        box-shadow: 0 10px 25px rgba(0,0,0,0.04);
      }

      .search-icon { color: #ff4500; margin-right: 0.75rem; font-size: 1.25rem; }

      input {
        flex: 1;
        border: none;
        outline: none;
        font-size: 1rem;
        font-family: inherit;
        color: #333;
      }

      .bus-number-search {
        padding-right: 0.35rem;
      }

      .search-execute-btn {
        width: 3rem;
        height: 2.5rem;
        background: #ff4500;
        border: none;
        border-radius: 20px;
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      }

      .main-action-container {
        padding: 0 1.5rem;
        margin-bottom: 2.5rem;
      }

      .buy-ticket-btn {
        width: 100%;
        background: #ff4500;
        color: #fff;
        text-decoration: none;
        padding: 1.25rem;
        border-radius: 999px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.75rem;
        font-weight: 800;
        font-size: 1.1rem;
        box-shadow: 0 10px 25px rgba(255, 69, 0, 0.25);
        transition: transform 0.2s ease;
      }

      .buy-ticket-btn:active {
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

      /* Route Card */
      .route-card {
        background: #fff;
        border: 1px solid #eee;
        border-radius: 24px;
        padding: 1.25rem;
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 0.75rem;
      }

      .route-badge {
        width: 3rem;
        height: 3rem;
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 800;
        color: #fff;
        background: #ff4500;
      }

      .route-details { flex: 1; display: flex; flex-direction: column; }
      .destination { font-weight: 700; font-size: 1.05rem; }
      .origin { font-size: 0.85rem; color: #888; }

      .arrival-info { display: flex; flex-direction: column; align-items: flex-end; gap: 0.25rem; }
      .arrival-info .time { font-weight: 700; font-size: 1rem; }
      .status-pill {
        font-size: 0.7rem;
        background: #e8f5e9;
        color: #2e7d32;
        padding: 0.2rem 0.6rem;
        border-radius: 999px;
        font-weight: 700;
        text-transform: uppercase;
      }

      .status-pill.warning {
        background: #fff3e0;
        color: #ef6c00;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BusScheduleComponent {}
