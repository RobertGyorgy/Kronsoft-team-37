import { ChangeDetectionStrategy, Component, OnInit, afterNextRender, ElementRef, ViewChild } from '@angular/core';
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
            <span *ngFor="let word of splitByWord('Brașov Transit')" class="word">
              <span *ngFor="let char of word.split('')" class="char">{{ char }}</span>
              <span class="char">&nbsp;</span>
            </span>
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
    .bus-shell { height: 100dvh; background: #fff; font-family: 'Outfit', sans-serif; color: #1a1a1a; display: flex; flex-direction: column; overflow-x: hidden; overflow-y: auto; -webkit-overflow-scrolling: touch; }
    
    .top-nav { padding: calc(var(--safe-top) + 1.5rem) 1.5rem 1rem; }
    .minimal-back-btn { background: none; border: none; padding: 0.5rem; display: flex; align-items: center; color: #1a1a1a; cursor: pointer; }

    .welcome-hero { padding: 1rem 2.5rem 3rem; }
    .bold-header { font-size: 3.5rem; font-weight: 800; letter-spacing: -0.06em; line-height: 0.9; margin: 0; white-space: nowrap; display: flex; flex-wrap: nowrap; }
    .word { display: inline-block; white-space: nowrap; }
    .char { display: inline-block; opacity: 0; }

    .menu-grid { padding: 0 1.5rem; display: flex; flex-direction: column; gap: 1.25rem; }
    .bold-menu-card { 
      display: flex; justify-content: space-between; align-items: center; 
      padding: 2.2rem 2rem; border-radius: 36px; background: #fafafa; 
      text-decoration: none; border: 1px solid rgba(0,0,0,0.03); 
      transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
      opacity: 0; transform: translateY(30px);
    }
    .bold-menu-card:active { transform: scale(0.96); background: #f0f0f0; }

    .card-content { display: flex; align-items: center; gap: 1.5rem; }
    .card-icon { width: 56px; height: 56px; background: #fff; border-radius: 18px; display: flex; align-items: center; justify-content: center; color: #1a1a1a; box-shadow: 0 8px 20px rgba(0,0,0,0.06); }
    .card-icon .material-icons { font-size: 1.8rem; }
    
    .card-text { display: flex; flex-direction: column; gap: 0.2rem; }
    .card-title { font-size: 1.4rem; font-weight: 800; color: #1a1a1a; letter-spacing: -0.02em; }
    .card-sub { font-size: 0.95rem; color: #999; font-weight: 600; }
    
    .arrow { color: #ddd; transition: transform 0.3s; }
    .bold-menu-card:hover .arrow { transform: translateX(8px); color: #1a1a1a; }

    .green-footer { margin-top: auto; padding: 2.5rem 1.5rem 4rem; opacity: 0; }
    .green-friday-card { background: #ebfaf0; padding: 1.8rem; border-radius: 32px; display: flex; gap: 1.5rem; align-items: center; }
    .gf-icon-box { width: 52px; height: 52px; background: #fff; border-radius: 16px; display: flex; align-items: center; justify-content: center; color: #2ecc71; box-shadow: 0 4px 12px rgba(46,204,113,0.1); }
    .gf-info h3 { font-size: 1.2rem; font-weight: 800; margin: 0; color: #1a1a1a; }
    .gf-info p { font-size: 0.95rem; color: #5a5a5a; margin: 0.3rem 0 0; font-weight: 600; line-height: 1.4; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BusMenuComponent implements OnInit {
  @ViewChild('container') container!: ElementRef;
  
  ngOnInit() {}

  constructor() {
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
