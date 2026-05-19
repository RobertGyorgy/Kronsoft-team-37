import { ChangeDetectionStrategy, Component, signal, computed, inject, AfterViewInit, ElementRef, ViewChild, ViewChildren, QueryList, afterNextRender } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReportService } from '../../services/report.service';
import { UserService } from '../../../../core/services/user.service';
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
export class ReportComponent implements AfterViewInit {
  private reportService = inject(ReportService);
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private router = inject(Router);

  @ViewChild('container') container!: ElementRef;
  @ViewChildren('chipBtn') chipBtns!: QueryList<ElementRef>;

  activeCategoryId = signal<number | null>(null);
  userName = signal<string>('');
  
  categories = computed(() => {
    const rawCategories = this.reportService.categories();
    return [
      { id: null, name: 'Toate' },
      ...rawCategories
    ];
  });

  filteredReports = computed(() => {
    return this.reportService.reports();
  });

  constructor() {
    const sessionName = this.authService.getUserName() || '';
    if (sessionName) {
      this.userName.set(sessionName.split(' ')[0]);
    }

    afterNextRender(() => {
      this.animateEntrance();
      this.userService.loadProfile(); // fetch in background
      this.reportService.loadReports(null); // fetch latest reports with empty category
    });
  }

  ngAfterViewInit() {
    this.chipBtns.changes.subscribe((list: QueryList<ElementRef>) => {
      const elRefs = list.toArray();
      if (elRefs.length > 1) {
        const secondaryChips = elRefs.slice(1).map(ref => ref.nativeElement);
        gsap.set(secondaryChips, { y: 15, opacity: 0 });
        gsap.to(secondaryChips, {
          y: 0,
          opacity: 1,
          stagger: 0.04,
          duration: 0.5,
          ease: 'power2.out'
        });
      }
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
    
    const tl = timeline => gsap.timeline({ defaults: { ease: 'power3.out', duration: 0.8 } });
    const activeTimeline = tl();
    
    if (chars.length) {
      activeTimeline.to(chars, { y: 0, opacity: 1, stagger: 0.02 });
    }
    
    if (hero) {
      activeTimeline.to(hero, { y: 0, opacity: 1, duration: 1 }, chars.length ? '-=0.6' : 0);
    }
    
    if (title) {
      activeTimeline.to(title, { y: 0, opacity: 1 }, '-=0.7');
    }
    
    if (chips.length) {
      activeTimeline.to(chips, { y: 0, opacity: 1, stagger: 0.05 }, '-=0.6');
    }
    
    if (cards.length) {
      activeTimeline.to(cards, {
        y: 0, opacity: 1, stagger: 0.1,
        onComplete: () => {
          cards.forEach((el: any) => el.classList.add('animated'));
        }
      }, '-=0.5');
    }
  }

  setCategory(id: number | null) {
    this.activeCategoryId.set(id);
    this.reportService.loadReports(id);
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
