import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-report-form',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './report-form.html',
  styleUrl: './report-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportFormComponent {
  formData = {
    title: '',
    address: '',
    description: ''
  };

  uploadedPhotos = signal<string[]>([]);

  constructor(private router: Router) {}

  goBack() {
    window.history.back();
  }

  onUploadPhoto() {
    console.log('Deschide selectorul de poze...');
    // Simulăm adăugarea unei poze
    const demoPhotos = [
      'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?q=80&w=400',
      'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?q=80&w=400'
    ];
    if (this.uploadedPhotos().length < 2) {
      this.uploadedPhotos.update(photos => [...photos, demoPhotos[this.uploadedPhotos().length]]);
    }
  }

  onSubmit() {
    console.log('Trimitere raport:', this.formData);
    // Aici s-ar face trimiterea către backend
    alert('Raportul a fost trimis cu succes!');
    this.router.navigate(['/report']);
  }
}
