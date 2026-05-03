import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-welcome',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="welcome-shell">
      <div class="fullscreen-bg">
        <img
          src="/images/poza%20intro%20screen%20.jpg"
          alt="Brașov city background"
          class="hero-image"
        />
        <div class="scrim"></div>
      </div>

      <div class="content">
        <div class="top-section">
          <span class="city-name">Smart City Brașov</span>
        </div>

        <div class="center-section">
          <h1>Experience your city</h1>
          <p>The official portal for modern citizens.</p>
        </div>

        <div class="bottom-section">
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
        position: fixed;
        inset: 0;
        width: 100vw;
        height: 100dvh;
        background: #000;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        font-family: 'Outfit', sans-serif;
      }

      .fullscreen-bg {
        position: absolute;
        inset: 0;
        z-index: 0;
      }

      .hero-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        filter: brightness(0.7) saturate(1.2);
      }

      .scrim {
        position: absolute;
        inset: 0;
        background: linear-gradient(
          to bottom,
          rgba(0,0,0,0.2) 0%,
          rgba(0,0,0,0.5) 50%,
          rgba(0,0,0,0.8) 100%
        );
      }

      .content {
        position: relative;
        z-index: 10;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 
          calc(3rem + env(safe-area-inset-top)) 
          1.5rem 
          calc(2.5rem + env(safe-area-inset-bottom));
        text-align: center;
        color: #fff;
      }

      .city-name {
        font-size: 0.85rem;
        font-weight: 700;
        letter-spacing: 0.3em;
        text-transform: uppercase;
        color: rgba(255,255,255,0.9);
      }

      h1 {
        font-size: clamp(2.5rem, 10vw, 3.5rem);
        font-weight: 800;
        line-height: 1;
        margin: 0 0 1rem;
        letter-spacing: -0.04em;
      }

      p {
        font-size: 1.1rem;
        color: rgba(255,255,255,0.8);
        margin: 0 auto;
        max-width: 280px;
      }

      .bottom-section {
        width: 100%;
        display: flex;
        justify-content: center;
      }

      /* Bicolored Button Precisely matching image */
      .bicolored-btn {
        background: #fff;
        text-decoration: none;
        padding: 0.35rem 0.35rem 0.35rem 2rem;
        border-radius: 999px;
        display: flex;
        align-items: center;
        gap: 1rem;
        width: 100%;
        max-width: 310px;
        justify-content: space-between;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        transition: transform 0.2s ease;
      }

      .bicolored-btn:active {
        transform: scale(0.96);
      }

      .btn-text {
        color: #000;
        font-weight: 700;
        font-size: 1.15rem;
      }

      .btn-icon {
        width: 3.25rem;
        height: 3.25rem;
        background: #ff4500;
        border-radius: 999px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .chevron-group {
        display: flex;
        gap: 2px;
      }

      .chevron {
        width: 8px;
        height: 8px;
        border-right: 2.5px solid #fff;
        border-top: 2.5px solid #fff;
        transform: rotate(45deg);
        display: block;
      }

      .chevron:nth-child(1) { opacity: 0.4; }
      .chevron:nth-child(2) { opacity: 0.7; }
      .chevron:nth-child(3) { opacity: 1; }
    `
  ]
})
export class WelcomeComponent {}
