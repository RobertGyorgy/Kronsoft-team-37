import { ChangeDetectionStrategy, Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';

interface ReportIssue {
  id: number;
  category: string;
  location: string;
  title: string;
  image: string;
  status: 'În lucru' | 'Rezolvat' | 'Sesizat';
}

@Component({
  selector: 'app-report',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './report.html',
  styleUrl: './report.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportComponent {
  activeCategory = signal<string>('Toate');
  
  categories = [
    'Toate', 'Infrastructură', 'Deșeuri', 'Graffiti', 
    'Clădiri', 'Iluminare', 'Spații verzi', 'Altele'
  ];

  reports = signal<ReportIssue[]>([
    {
      id: 1,
      category: 'Infrastructură',
      location: 'Str. Republicii',
      title: 'Groapă în carosabil',
      image: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?q=80&w=800',
      status: 'În lucru'
    },
    {
      id: 2,
      category: 'Deșeuri',
      location: 'Parcul Titulescu',
      title: 'Coș de gunoi distrus',
      image: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?q=80&w=800',
      status: 'Sesizat'
    },
    {
      id: 3,
      category: 'Iluminare',
      location: 'Piața Sfatului',
      title: 'Stâlp iluminat defect',
      image: 'https://images.unsplash.com/photo-1473116763249-2faaef81ccda?q=80&w=800',
      status: 'Rezolvat'
    },
    {
      id: 4,
      category: 'Spații verzi',
      location: 'Aleea de sub Tâmpa',
      title: 'Arbore prăbușit',
      image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=800',
      status: 'În lucru'
    }
  ]);

  filteredReports = computed(() => {
    const cat = this.activeCategory();
    if (cat === 'Toate') return this.reports();
    return this.reports().filter(r => r.category === cat);
  });

  setCategory(cat: string) {
    this.activeCategory.set(cat);
  }

  goBack() {
    window.history.back();
  }

  constructor(private router: Router) {}

  onNewReport() {
    this.router.navigate(['/report/form']);
  }
}
