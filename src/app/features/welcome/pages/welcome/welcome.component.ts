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
        min-height: 100dvh;
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
        position: fixed; /* Use fixed to stay pinned to viewport */
        top: 0;
        left: 0;
        width: 100%;
        height: 100dvh;
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
        padding: 0.35rem 0.35rem 0.35rem 2.5rem;
        border-radius: 999px;
        display: flex;
        align-items: center;
        gap: 1.5rem;
        transition: transform 0.2s ease;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        max-width: 100%;
        width: 320px;
        justify-content: space-between;
      }

      .bicolored-btn:active {
        transform: scale(0.97);
      }

      .btn-text {
        color: #000;
        font-weight: 700;
        font-size: 1.15rem;
      }

      .btn-icon {
        width: 3.25rem;
        height: 3.25rem;
        background: #ff4500; /* Solid Orange */
        border-radius: 999px; /* Pill/Circle */
        display: flex;
        align-items: center;
        justify-content: center;
      }

      /* Custom CSS Chevrons for '>>>' effect */
      .chevron-group {
        display: flex;
        gap: 2px;
      }

      .chevron {
        width: 10px;
        height: 10px;
        border-right: 2.5px solid #fff;
        border-top: 2.5px solid #fff;
        transform: rotate(45deg);
        display: block;
      }

      .chevron:nth-child(1) { opacity: 0.4; }
      .chevron:nth-child(2) { opacity: 0.7; }
      .chevron:nth-child(3) { opacity: 1; }

      @media (max-width: 400px) {
        h1 { font-size: 2.75rem; }
        .bicolored-btn { width: 100%; padding-left: 1.5rem; }
        .btn-icon { width: 3.5rem; height: 3.5rem; }
      }
    `
  ]
})
export class WelcomeComponent {}
