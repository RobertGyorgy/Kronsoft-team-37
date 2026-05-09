import { ChangeDetectionStrategy, Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { ReportService } from '../../services/report';

@Component({
  selector: 'app-report',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './report.html',
  styleUrl: './report.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportComponent {
  private reportService = inject(ReportService);
  private router = inject(Router);

  activeCategory = signal<string>('Toate');
  
  categories = [
    'Toate', 'Infrastructură', 'Deșeuri', 'Graffiti', 
    'Clădiri', 'Iluminare', 'Spații verzi', 'Altele'
  ];

  filteredReports = computed(() => {
    const cat = this.activeCategory();
    const allReports = this.reportService.reports();
    if (cat === 'Toate') return allReports;
    return allReports.filter(r => r.category === cat);
  });

  setCategory(cat: string) {
    this.activeCategory.set(cat);
  }

  goBack() {
    window.history.back();
  }

  onNewReport() {
    this.router.navigate(['/report/form']);
  }
}
