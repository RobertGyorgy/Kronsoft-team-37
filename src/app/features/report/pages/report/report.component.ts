import { ChangeDetectionStrategy, Component, signal, computed, inject, AfterViewInit, ElementRef, ViewChild, afterNextRender } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { ReportService } from '../../services/report.service';
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
  private router = inject(Router);

  @ViewChild('container') container!: ElementRef;

  activeCategory = signal<string>('Toate');
  
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

    gsap.set(chars, { y: 40, opacity: 0 });
    gsap.set([hero, title, chips, cards], { y: 30, opacity: 0 });
    
    const tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 0.8 } });
    
    tl.to(chars, {
      y: 0,
      opacity: 1,
      stagger: 0.02,
    })
    .to(hero, {
      y: 0,
      opacity: 1,
      duration: 1
    }, '-=0.6')
    .to(title, {
      y: 0,
      opacity: 1,
    }, '-=0.7')
    .to(chips, {
      y: 0,
      opacity: 1,
      stagger: 0.05
    }, '-=0.6')
    .to(cards, {
      y: 0,
      opacity: 1,
      stagger: 0.1,
      onComplete: () => {
        cards.forEach((el: any) => el.classList.add('animated'));
      }
    }, '-=0.5');
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
