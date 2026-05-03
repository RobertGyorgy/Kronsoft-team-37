import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-welcome',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="welcome-shell">
      <div class="welcome-card">
        <figure class="hero-figure">
          <img
            src="/images/poza%20intro%20screen%20.jpg"
            alt="Brașov city background"
            class="hero-image"
          />
        </figure>

        <div class="overlay-copy">
          <h1>Welcome to Smart City Brașov</h1>
          <a routerLink="/login" class="continue-button">Get Started</a>
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
        padding: 0;
        display: grid;
        place-items: stretch;
        background: #000;
        overflow: hidden;
      }

      .welcome-card {
        position: relative;
        width: 100%;
        min-height: 100dvh;
        display: grid;
        overflow: hidden;
        background: #111;
        color: #fff;
      }

      h1 {
        margin: 0;
        color: #fff;
        font-size: clamp(2rem, 8vw, 3rem);
        line-height: 1.05;
        letter-spacing: -0.03em;
        text-align: center;
        text-shadow: 0 6px 18px rgba(0, 0, 0, 0.35);
      }

      .continue-button {
        min-height: 3.1rem;
        width: min(100%, 18rem);
        border-radius: 0.45rem;
        display: grid;
        place-items: center;
        text-decoration: none;
        font-weight: 700;
        color: #fff;
        background: linear-gradient(180deg, #d2732b 0%, #c45f13 100%);
        box-shadow: 0 8px 16px rgba(196, 95, 19, 0.24);
      }

      .hero-figure {
        position: absolute;
        inset: 0;
        margin: 0;
        display: grid;
        overflow: hidden;
        background: #111;
      }

      .hero-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center center;
        transform: scale(1.03);
        filter: saturate(0.95) contrast(0.98);
      }

      .hero-figure::after {
        content: '';
        position: absolute;
        inset: 0;
        background:
          linear-gradient(180deg, rgba(255, 255, 255, 0.16) 0%, rgba(255, 255, 255, 0.02) 18%, rgba(0, 0, 0, 0.1) 58%, rgba(0, 0, 0, 0.38) 100%),
          linear-gradient(180deg, rgba(0, 0, 0, 0.06) 0%, rgba(0, 0, 0, 0.2) 100%);
        pointer-events: none;
      }

      .overlay-copy {
        position: relative;
        z-index: 1;
        align-self: end;
        padding: 1.5rem 1.25rem calc(1.75rem + env(safe-area-inset-bottom));
        display: grid;
        gap: 1rem;
        justify-items: center;
      }

      @media (min-width: 768px) {
        .welcome-shell {
          padding: 0;
        }

        .welcome-card {
          min-height: 100dvh;
        }

        .hero-figure {
          inset: 0;
        }

        .overlay-copy {
          padding-bottom: 2.25rem;
        }
      }
    `
  ]
})
export class WelcomeComponent {}
