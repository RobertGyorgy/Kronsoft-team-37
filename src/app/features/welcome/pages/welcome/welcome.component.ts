import { ChangeDetectionStrategy, Component, afterNextRender, ElementRef, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { gsap } from 'gsap';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="welcome-shell">
      <!-- BLURRED BACKGROUND -->
      <div class="full-bg">
        <img
          src="/images/poza%20intro%20screen%20.jpg"
          alt="Brașov"
          class="bg-image"
          #bgImg
        />
        <div class="vignette-overlay"></div>
      </div>

      <!-- CONTENT LAYER -->
      <div class="safe-layer">
        <nav class="top-brand">
          <div class="brand-wrap">
            <img src="/images/ROU_BV_Brasov_CoA.svg.png" alt="Logo" class="brand-logo-img" />
            <span class="brand-text">Brașov Smart City</span>
          </div>
        </nav>

        <section class="main-content">
          <div class="text-group">
            <h1 class="headline">Descoperă Viitorul<br/>Mobilității Urbane</h1>
            <p class="tagline">Experimentează transportul public și parcarea inteligentă în Brașov — sigur, rapid și modern.</p>
          </div>
        </section>

        <footer class="bottom-action-zone">
          <div class="action-container">
            <a routerLink="/login" class="theme-action-btn">
              <span class="btn-label">Începe Acum</span>
              <div class="arrow-ico">
                <span class="material-icons">east</span>
              </div>
            </a>
          </div>
        </footer>
      </div>
    </main>
  `,
  styles: [`
    .welcome-shell {
      height: 100dvh;
      width: 100%;
      position: relative;
      background: #000;
      font-family: 'Outfit', sans-serif;
      overflow: hidden;
    }

    /* BACKGROUND */
    .full-bg {
      position: absolute;
      inset: 0;
      z-index: 0;
    }

    .bg-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
      transform: scale(1.1);
      filter: blur(5px) brightness(0.85);
      will-change: transform, filter;
    }

    .vignette-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(
        to bottom,
        rgba(0,0,0,0.4) 0%,
        rgba(0,0,0,0) 40%,
        rgba(0,0,0,0.8) 100%
      );
    }

    /* CONTENT LAYOUT */
    .safe-layer {
      position: relative;
      z-index: 10;
      height: 100%;
      display: flex;
      flex-direction: column;
      padding: calc(env(safe-area-inset-top) + 2rem) 2rem calc(env(safe-area-inset-bottom) + 2rem);
    }

    .top-brand {
      margin-bottom: 2rem;
    }

    .brand-wrap {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      justify-content: center;
    }

    .brand-logo-img {
      height: 48px;
      width: auto;
      object-fit: contain;
      filter: drop-shadow(0 2px 10px rgba(0,0,0,0.2));
    }

    .brand-text { color: #fff; font-weight: 800; font-size: 1.25rem; letter-spacing: -0.02em; }

    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      text-align: center;
    }

    .headline {
      font-size: clamp(2.6rem, 10vw, 3.5rem);
      font-weight: 950;
      color: #fff;
      line-height: 0.95;
      letter-spacing: -0.06em;
      margin-bottom: 1.5rem;
      text-shadow: 0 10px 40px rgba(0,0,0,0.4);
    }

    .tagline {
      font-size: 1.1rem;
      font-weight: 500;
      color: rgba(255,255,255,0.8);
      max-width: 320px;
      margin: 0 auto;
      line-height: 1.4;
    }

    /* ROUNDED FOOTER BUTTON */
    .bottom-action-zone {
      display: flex;
      justify-content: center;
    }

    .action-container {
      width: 100%;
      max-width: 400px;
    }

    .theme-action-btn {
      width: 100%;
      background: #fff;
      color: #000;
      text-decoration: none;
      height: 64px;
      padding: 0 0.5rem 0 2rem;
      border-radius: 999px; /* Reverted to fully rounded capsule */
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 25px 60px rgba(0,0,0,0.4);
      transition: transform 0.3s cubic-bezier(0.2, 0, 0, 1);
    }

    .theme-action-btn:active {
      transform: scale(0.96);
    }

    .btn-label {
      font-weight: 900;
      font-size: 1.15rem;
      letter-spacing: -0.02em;
    }

    .arrow-ico {
      width: 52px;
      height: 52px;
      background: #1a1a1a;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
    }

    @media (max-width: 480px) {
      .headline { font-size: 3rem; }
      .safe-layer { padding: calc(env(safe-area-inset-top) + 2rem) 1.5rem calc(env(safe-area-inset-bottom) + 1.5rem); }
    }
  `]
})
export class WelcomeComponent {
  @ViewChild('bgImg') bgImg!: ElementRef;

  constructor() {
    afterNextRender(() => {
      this.animateEntrance();
    });
  }

  private animateEntrance() {
    const tl = gsap.timeline({ defaults: { ease: 'power4.out', duration: 1.2 } });

    gsap.set('.headline, .tagline, .bottom-action-zone, .top-brand', { opacity: 0, y: 30 });
    gsap.set(this.bgImg.nativeElement, { scale: 1.2 });

    tl.to(this.bgImg.nativeElement, {
      scale: 1.1,
      duration: 3,
      ease: 'power2.out'
    })
    .to('.top-brand', { opacity: 1, y: 0 }, 0.5)
    .to('.headline', { opacity: 1, y: 0 }, 0.7)
    .to('.tagline', { opacity: 1, y: 0 }, 0.9)
    .to('.bottom-action-zone', { opacity: 1, y: 0 }, 1.1);
  }
}
