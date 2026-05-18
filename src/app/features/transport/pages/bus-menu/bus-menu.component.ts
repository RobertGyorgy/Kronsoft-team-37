import { ChangeDetectionStrategy, Component, OnInit, OnDestroy, afterNextRender, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { gsap } from 'gsap';

@Component({
  selector: 'app-bus-menu',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <main class="bus-shell" #container>
      <header class="top-nav">
        <button class="minimal-back-btn" routerLink="/dashboard">
          <span class="material-icons">arrow_back_ios_new</span>
        </button>
      </header>

      <section class="welcome-hero" #hero>
        <div class="greeting-block">
          <h1 class="bold-header">
            @for (word of splitByWord('Brașov Transit'); track word) {
              <span class="word">
                @for (char of word.split(''); track char) {
                  <span class="char">{{ char }}</span>
                }
                <span class="char">&nbsp;</span>
              </span>
            }
          </h1>
        </div>
      </section>

      <div class="menu-grid" #grid>
        <a routerLink="/transport/bus/search" class="bold-menu-card">
          <div class="card-content">
            <div class="card-icon">
              <span class="material-icons">explore</span>
            </div>
            <div class="card-text">
              <span class="card-title">Stații & Sosiri</span>
              <span class="card-sub">Găsește cea mai apropiată stație</span>
            </div>
          </div>
          <span class="material-icons arrow">arrow_forward</span>
        </a>

        <a routerLink="/transport/bus/program" class="bold-menu-card">
          <div class="card-content">
            <div class="card-icon">
              <span class="material-icons">route</span>
            </div>
            <div class="card-text">
              <span class="card-title">Unde mergem?</span>
              <span class="card-sub">Planifică-ți traseul prin oraș</span>
            </div>
          </div>
          <span class="material-icons arrow">arrow_forward</span>
        </a>
      </div>

      <footer class="green-footer" #footer>
        <div class="green-friday-card">
          <div class="gf-icon-box">
            <span class="material-icons">eco</span>
          </div>
          <div class="gf-info">
            <h3>Vinerea Verde</h3>
            <p>Transport gratuit în fiecare vineri în Brașov.</p>
          </div>
        </div>
      </footer>
    </main>
  `,
  styles: [`
    .bus-shell { height: 100dvh; background: var(--bg-primary); font-family: 'Outfit', sans-serif; color: var(--text-primary); display: flex; flex-direction: column; overflow-x: hidden; overflow-y: auto; -webkit-overflow-scrolling: touch; position: relative; }
    .bus-shell::before { content: ''; position: absolute; top: -10%; right: -20%; width: 400px; height: 400px; background: radial-gradient(circle, rgba(46, 204, 113, 0.08) 0%, rgba(24, 128, 56, 0.02) 60%, transparent 100%); filter: blur(80px); pointer-events: none; z-index: 0; }
    
    .top-nav { padding: calc(var(--safe-top) + 1.5rem) 1.5rem 1rem; z-index: 10; }
    .minimal-back-btn { background: none; border: none; padding: 0.5rem; display: flex; align-items: center; color: var(--text-primary); cursor: pointer; transition: transform 0.2s; }
    .minimal-back-btn:active { transform: scale(0.9); }

    .welcome-hero { padding: 1rem 2.5rem 3rem; z-index: 10; }
    .bold-header { font-size: 3.6rem; font-weight: 900; letter-spacing: -0.05em; line-height: 0.95; margin: 0; white-space: nowrap; display: flex; flex-wrap: nowrap; }
    .word { display: inline-block; white-space: nowrap; }
    .char { display: inline-block; opacity: 0; background: linear-gradient(135deg, var(--text-primary) 30%, #2ecc71 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }

    .menu-grid { padding: 0 1.5rem; display: flex; flex-direction: column; gap: 1.25rem; z-index: 10; }
    .bold-menu-card { 
      display: flex; justify-content: space-between; align-items: center; 
      padding: 2.2rem 2rem; border-radius: 28px; background: var(--bg-secondary); 
      text-decoration: none; border: 1px solid var(--border-color); 
      box-shadow: 0 6px 24px rgba(0,0,0,0.02);
      transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      opacity: 0; transform: translateY(30px);
    }
    .bold-menu-card:hover { 
      transform: translateY(-4px); 
      background: var(--bg-card); 
      border-color: rgba(46, 204, 113, 0.3);
      box-shadow: 0 16px 36px rgba(46, 204, 113, 0.06); 
    }
    .bold-menu-card:active { transform: scale(0.98); }

    .card-content { display: flex; align-items: center; gap: 1.5rem; }
    .card-icon { width: 58px; height: 58px; background: linear-gradient(135deg, rgba(46, 204, 113, 0.15) 0%, rgba(24, 128, 56, 0.1) 100%); border-radius: 18px; display: flex; align-items: center; justify-content: center; color: #2ecc71; box-shadow: 0 6px 18px rgba(46,204,113,0.12); transition: all 0.3s; }
    .bold-menu-card:hover .card-icon { transform: rotate(5deg) scale(1.05); background: linear-gradient(135deg, rgba(46, 204, 113, 0.25) 0%, rgba(24, 128, 56, 0.2) 100%); }
    .card-icon .material-icons { font-size: 1.7rem; }
    
    .card-text { display: flex; flex-direction: column; gap: 0.2rem; }
    .card-title { font-size: 1.4rem; font-weight: 800; color: var(--text-primary); letter-spacing: -0.02em; }
    .card-sub { font-size: 0.95rem; color: var(--text-secondary); font-weight: 600; }
    
    .arrow { color: var(--text-secondary); opacity: 0.4; transition: all 0.3s; font-size: 1.6rem; }
    .bold-menu-card:hover .arrow { transform: translateX(6px); color: #2ecc71; opacity: 1; }

    .green-footer { margin-top: auto; padding: 2.5rem 1.5rem 4rem; opacity: 0; z-index: 10; }
    .green-friday-card { background: linear-gradient(135deg, rgba(46, 204, 113, 0.08) 0%, rgba(24, 128, 56, 0.02) 100%); border: 1px solid rgba(46, 204, 113, 0.15); padding: 1.8rem; border-radius: 28px; display: flex; gap: 1.5rem; align-items: center; box-shadow: 0 10px 30px rgba(46, 204, 113, 0.03); }
    .gf-icon-box { width: 52px; height: 52px; background: var(--bg-card); border-radius: 16px; display: flex; align-items: center; justify-content: center; color: #2ecc71; box-shadow: 0 4px 12px rgba(46,204,113,0.1); }
    .gf-info h3 { font-size: 1.2rem; font-weight: 800; margin: 0; color: var(--text-primary); }
    .gf-info p { font-size: 0.95rem; color: var(--text-secondary); margin: 0.3rem 0 0; font-weight: 600; line-height: 1.4; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BusMenuComponent implements OnInit, OnDestroy {
  @ViewChild('container') container!: ElementRef;
  
  ngOnInit() {}

  ngOnDestroy() {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('just_entered_transport_menu');
    }
  }

  constructor() {
    if (typeof window !== 'undefined') {
      const justEntered = sessionStorage.getItem('just_entered_transport_menu');
      if (!justEntered) {
        sessionStorage.setItem('just_entered_transport_menu', 'true');
        window.location.reload();
        return;
      }
    }

    afterNextRender(() => {
      this.animateEntrance();
    });
  }

  splitByWord(text: string): string[] {
    return text ? text.split(' ') : [];
  }

  private animateEntrance() {
    if (!this.container?.nativeElement) return;
    const container = this.container.nativeElement;
    
    const chars = container.querySelectorAll('.char');
    const cards = container.querySelectorAll('.bold-menu-card');
    const footer = container.querySelector('.green-footer');

    gsap.set(chars, { y: 40, opacity: 0 });
    
    const tl = gsap.timeline({ defaults: { ease: 'power2.out', duration: 0.8 } });
    
    tl.to(chars, {
      y: 0,
      opacity: 1,
      stagger: 0.03,
    })
    .to(cards, {
      y: 0,
      opacity: 1,
      stagger: 0.15,
      duration: 0.6
    }, '-=0.4')
    .to(footer, {
      opacity: 1,
      duration: 1
    }, '-=0.6');
  }
}
