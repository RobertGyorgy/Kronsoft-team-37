import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-bus-search',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <main class="bus-shell">
      <header class="top-nav">
        <button class="back-pill" routerLink="/transport/bus">
          <span class="material-icons">arrow_back</span>
          Meniu
        </button>
      </header>

      <section class="page-header">
        <p class="eyebrow">Program RATBV</p>
        <h1>Caută Stații</h1>
      </section>

      <!-- Search Section -->
      <div class="search-container">
        <div class="search-pill">
          <span class="material-icons search-icon">place</span>
          <input type="text" placeholder="Caută stația (ex: Gara Brașov)" />
          <button class="search-btn">
            <span class="material-icons">search</span>
          </button>
        </div>
      </div>

      <div class="scroll-content">
        <!-- Selected Station Details (Mock) -->
        <section class="station-details">
          <div class="station-header">
            <div class="header-info">
              <h2>Livada Poștei</h2>
              <span class="station-id">ID: 1042</span>
            </div>
            <button class="map-link">
              <span class="material-icons">near_me</span>
            </button>
          </div>

          <div class="linii-section">
            <p class="section-label">Linii în această stație</p>
            <div class="badge-grid">
              <span class="line-badge orange">4</span>
              <span class="line-badge orange">28</span>
              <span class="line-badge orange">40</span>
              <span class="line-badge orange">50</span>
              <span class="line-badge night">N1</span>
            </div>
          </div>

          <div class="sosiri-section">
            <p class="section-label">Următoarele sosiri</p>
            <div class="sosire-item">
              <div class="line-pill">40</div>
              <div class="target">Stupini</div>
              <div class="eta">în 4 min</div>
            </div>
            <div class="sosire-item">
              <div class="line-pill">28</div>
              <div class="target">Fundătură</div>
              <div class="eta">în 7 min</div>
            </div>
            <div class="sosire-item">
              <div class="line-pill">4</div>
              <div class="target">Gara Brașov</div>
              <div class="eta">în 15 min</div>
            </div>
          </div>
        </section>

        <!-- Nearby Stations Suggestion -->
        <section class="nearby-section">
          <p class="section-label">Stații în apropiere</p>
          <div class="nearby-card">
            <span class="material-icons">place</span>
            <div class="card-info">
              <span class="name">Teatrul Dramatic</span>
              <span class="dist">250m distanță</span>
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
      }

      .top-nav { padding: 1.5rem; }
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
        text-decoration: none;
      }

      .page-header { padding: 0 1.5rem 1rem; }
      .eyebrow { font-size: 1.1rem; color: #888; margin: 0; font-weight: 500; }
      h1 { font-size: 2.75rem; font-weight: 800; margin: 0; color: #4285f4; letter-spacing: -0.04em; }

      .search-container { padding: 0 1.5rem; margin-bottom: 2rem; }
      .search-pill {
        background: #fff;
        border: 1px solid #eee;
        border-radius: 999px;
        display: flex;
        align-items: center;
        padding: 0.4rem 0.4rem 0.4rem 1.25rem;
        box-shadow: 0 10px 25px rgba(0,0,0,0.04);
      }
      .search-icon { color: #4285f4; margin-right: 0.75rem; }
      input { flex: 1; border: none; outline: none; font-size: 1rem; font-family: inherit; }
      .search-btn {
        width: 3rem;
        height: 2.75rem;
        background: #4285f4;
        border: none;
        border-radius: 999px;
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .scroll-content { flex: 1; padding: 0 1.5rem 3rem; display: flex; flex-direction: column; gap: 2rem; }

      /* Station Details Section */
      .station-details {
        background: #fff;
        border-radius: 32px;
        padding: 1.75rem;
        box-shadow: 0 15px 35px rgba(0,0,0,0.03);
        border: 1px solid #f0f0f0;
      }

      .station-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 1.5rem;
      }

      h2 { font-size: 1.75rem; font-weight: 800; margin: 0; }
      .station-id { font-size: 0.85rem; color: #aaa; font-weight: 500; }
      .map-link {
        width: 3rem;
        height: 3rem;
        border-radius: 50%;
        background: #f0f4ff;
        border: none;
        color: #4285f4;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .section-label { font-size: 0.9rem; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 1rem; }

      .linii-section { margin-bottom: 2rem; }
      .badge-grid { display: flex; flex-wrap: wrap; gap: 0.5rem; }
      .line-badge {
        padding: 0.4rem 1rem;
        border-radius: 999px;
        font-weight: 800;
        color: #fff;
        font-size: 0.9rem;
      }
      .line-badge.orange { background: #ff4500; }
      .line-badge.night { background: #333; }

      .sosire-item {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem 0;
        border-bottom: 1px solid #f5f5f5;
      }
      .sosire-item:last-child { border: none; }

      .line-pill {
        width: 2.5rem;
        height: 2.5rem;
        background: #f5f5f5;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 800;
        color: #ff4500;
      }
      .target { flex: 1; font-weight: 700; color: #333; }
      .eta { font-weight: 700; color: #4285f4; }

      .nearby-card {
        background: #f8f9fa;
        padding: 1.25rem;
        border-radius: 24px;
        display: flex;
        align-items: center;
        gap: 1rem;
      }
      .nearby-card .material-icons { color: #bbb; }
      .card-info { display: flex; flex-direction: column; }
      .card-info .name { font-weight: 700; color: #333; }
      .card-info .dist { font-size: 0.85rem; color: #888; }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BusSearchComponent {}
