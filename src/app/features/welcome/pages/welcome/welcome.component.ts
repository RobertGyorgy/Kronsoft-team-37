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
      </figure>

      <div class="content">
        <div class="middle-title">
          <h1>Smart City Brașov</h1>
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
        font-family: 'Surgena', sans-serif;
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
        filter: blur(2px) brightness(0.85); /* Added professional blur */
        transform: scale(1.1); /* Scale up to cover edges from blur */
      }

      .content {
        position: relative;
        z-index: 10;
        flex: 1;
        padding: 3rem 2rem calc(4rem + env(safe-area-inset-bottom));
        display: flex;
        flex-direction: column;
        justify-content: space-between; /* Spreads title to middle and button to bottom */
        align-items: center;
        text-align: center;
      }

      .middle-title {
        flex: 1;
        display: flex;
        align-items: center; /* Vertical center */
        justify-content: center;
      }

      h1 {
        font-size: 3.5rem;
        font-weight: 800;
        line-height: 1;
        letter-spacing: -0.04em;
        text-shadow: 0 10px 30px rgba(0,0,0,0.5);
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
        padding: 0.35rem 0.35rem 0.35rem 2rem;
        border-radius: 999px;
        display: flex;
        align-items: center;
        gap: 1.25rem;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.25);
        max-width: 100%;
        width: 300px;
        justify-content: space-between;
      }

      .bicolored-btn:hover {
        transform: translateY(-2px);
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
        width: 3rem;
        height: 3rem;
        background: #ff4500;
        border-radius: 999px;
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
      }
    `
  ]
})
export class WelcomeComponent {}
