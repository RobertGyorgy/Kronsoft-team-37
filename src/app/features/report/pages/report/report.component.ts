import { ChangeDetectionStrategy, Component, signal, computed, inject, ElementRef, ViewChild, afterNextRender } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReportService } from '../../services/report.service';
import { AuthService } from '../../../auth/auth.service';
import { gsap } from 'gsap';

@Component({
  selector: 'app-report',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './report.html',
  styleUrl: './report.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportComponent {
  private reportService = inject(ReportService);
  private authService = inject(AuthService);
  private router = inject(Router);

  @ViewChild('container') container!: ElementRef;

  activeCategory = signal<string>('Toate');
  userName = signal<string>('');
  
  categories = [
    'Toate', 'Infrastructură', 'Deșeuri', 'Graffiti', 
    'Clădiri', 'Iluminare', 'Spații verzi', 'Altele'
  ];

  filteredReports = computed(() => {
    const cat = this.activeCategory();
    const allReports = this.reportService.reports();
    if (cat === 'Toate') return allReports;
    return allReports.filter(r => r.categoryName === cat);
  });

  constructor() {
    const sessionName = this.authService.getUserName() || '';
    if (sessionName) {
      this.userName.set(sessionName.split(' ')[0]);
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
    const hero = container.querySelector('.hero-card');
    const chips = container.querySelectorAll('.chip');
    const cards = container.querySelectorAll('.report-card');
    const title = container.querySelector('.section-title');

    const elements = [hero, title];
    if (chips.length) elements.push(...Array.from(chips));
    if (cards.length) elements.push(...Array.from(cards));
    
    const validElements = elements.filter(el => el);

    if (chars.length) gsap.set(chars, { y: 40, opacity: 0 });
    if (validElements.length) gsap.set(validElements, { y: 30, opacity: 0 });
    
    const tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 0.8 } });
    
    if (chars.length) {
      tl.to(chars, { y: 0, opacity: 1, stagger: 0.02 });
    }
    
    if (hero) {
      tl.to(hero, { y: 0, opacity: 1, duration: 1 }, chars.length ? '-=0.6' : 0);
    }
    
    if (title) {
      tl.to(title, { y: 0, opacity: 1 }, '-=0.7');
    }
    
    if (chips.length) {
      tl.to(chips, { y: 0, opacity: 1, stagger: 0.05 }, '-=0.6');
    }
    
    if (cards.length) {
      tl.to(cards, {
        y: 0, opacity: 1, stagger: 0.1,
        onComplete: () => {
          cards.forEach((el: any) => el.classList.add('animated'));
        }
      }, '-=0.5');
    }
  }

  setCategory(cat: string) {
    this.activeCategory.set(cat);
    // Re-trigger animation for cards when category changes
    setTimeout(() => {
      const cards = this.container.nativeElement.querySelectorAll('.report-card');
      gsap.fromTo(cards, 
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.08, duration: 0.6, ease: 'power2.out' }
      );
    }, 50);
  }

  goBack() {
    window.history.back();
  }

  onNewReport() {
    this.router.navigate(['/report/form']);
  }
}
