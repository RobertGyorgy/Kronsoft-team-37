import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-welcome',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="welcome-shell">
      <figure class="hero-figure">
        <img
          src="/images/poza%20intro%20screen%20.jpg"
          alt="Brașov city background"
          class="hero-image"
        />
        <div class="scrim"></div>
      </figure>

      <div class="content">
        <div class="header">
          <span class="city-name">Smart City Brașov</span>
        </div>

        <div class="text-group">
          <h1>Experience your city</h1>
          <p>The official portal for modern citizens.</p>
        </div>

        <div class="actions">
          <a routerLink="/login" class="bicolored-btn">
            <span class="btn-text">Get Started</span>
            <div class="btn-icon">
              <span class="chevron-group">
                <span class="chevron"></span>
                <span class="chevron"></span>
                <span class="chevron"></span>
              </span>
            </div>
          </a>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .welcome-shell {
        height: 100dvh;
        width: 100%;
        position: relative;
        display: flex;
        flex-direction: column;
        background: #000;
        font-family: 'Outfit', sans-serif;
        color: #fff;
        overflow: hidden;
      }

      .hero-figure {
        position: absolute;
        inset: 0;
        margin: 0;
        z-index: 0;
      }

      .hero-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        filter: brightness(0.6) saturate(1.1);
      }

      .scrim {
        position: absolute;
        inset: 0;
        background: linear-gradient(
          to bottom,
          rgba(0,0,0,0.1) 0%,
          rgba(0,0,0,0.7) 100%
        );
      }

      .content {
        position: relative;
        z-index: 10;
        flex: 1;
        padding: 3rem 2rem calc(4rem + env(safe-area-inset-bottom));
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        text-align: center;
      }

      .city-name {
        font-size: 0.9rem;
        font-weight: 700;
        letter-spacing: 0.25em;
        text-transform: uppercase;
        color: rgba(255,255,255,0.9);
      }

      h1 {
        font-size: 3.25rem;
        font-weight: 800;
        line-height: 1;
        margin: 0 0 1rem;
        letter-spacing: -0.04em;
      }

      p {
        font-size: 1.1rem;
        color: rgba(255,255,255,0.8);
        margin: 0;
      }

      .actions {
        width: 100%;
        display: flex;
        justify-content: center;
      }

      /* Bicolored Button Implementation */
      .bicolored-btn {
        background: #fff;
        text-decoration: none;
        padding: 0.35rem 0.35rem 0.35rem 2rem; /* Reduced height */
        border-radius: 999px;
        display: flex;
        align-items: center;
        gap: 1.25rem;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
        max-width: 100%;
        width: 300px;
        justify-content: space-between;
      }

      .bicolored-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 28px rgba(0, 0, 0, 0.2);
      }

      .bicolored-btn:active {
        transform: translateY(0) scale(0.97);
      }

      .btn-text {
        color: #000;
        font-weight: 800;
        font-size: 1.15rem;
        letter-spacing: -0.01em;
      }

      .btn-icon {
        width: 3rem; /* Reduced size */
        height: 3rem; /* Reduced size */
        background: #ff4500; /* Solid Orange */
        border-radius: 999px; /* More rounded for compactness */
        display: flex;
        align-items: center;
        justify-content: center;
      }

      /* Animated CSS Chevrons */
      .chevron-group {
        display: flex;
        gap: 3px;
      }

      .chevron {
        width: 8px;
        height: 8px;
        border-right: 2.5px solid #fff;
        border-top: 2.5px solid #fff;
        transform: rotate(45deg);
        display: block;
        opacity: 0.2;
        animation: chevron-flow 1.5s infinite;
      }

      .chevron:nth-child(2) { animation-delay: 0.2s; }
      .chevron:nth-child(3) { animation-delay: 0.4s; }

      @keyframes chevron-flow {
        0%, 100% { opacity: 0.2; transform: rotate(45deg) scale(1); }
        50% { opacity: 1; transform: rotate(45deg) scale(1.1); }
      }

      @media (max-width: 400px) {
        h1 { font-size: 2.75rem; }
        .bicolored-btn { width: 100%; padding-left: 1.25rem; }
        .btn-icon { width: 2.75rem; height: 2.75rem; }
      }
    `
  ]
})
export class WelcomeComponent {}
