import { ChangeDetectionStrategy, Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ReportService } from '../../services/report';

@Component({
  selector: 'app-report-form',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './report-form.html',
  styleUrl: './report-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportFormComponent {
  private reportService = inject(ReportService);
  private router = inject(Router);

  formData = {
    title: '',
    address: '',
    description: '',
    category: 'Altele' // Default category
  };

  uploadedPhotos = signal<string[]>([]);

  goBack() {
    window.history.back();
  }

  onUploadPhoto() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
          stream.getTracks().forEach(track => track.stop());
          this.triggerFilePicker();
        })
        .catch((err) => {
          console.warn('Permisiune cameră refuzată sau eroare:', err);
          this.triggerFilePicker();
        });
    } else {
      this.triggerFilePicker();
    }
  }

  private triggerFilePicker() {
    const fileInput = document.getElementById('cameraInput') as HTMLInputElement;
    if (fileInput) fileInput.click();
  }

  onFileSelected(event: any) {
    const files = event.target.files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.uploadedPhotos.update(photos => [...photos, e.target.result]);
      };
      reader.readAsDataURL(files[i]);
    }
  }

  onSubmit() {
    if (!this.formData.title || !this.formData.address) {
      alert('Te rugăm să completezi titlul și adresa!');
      return;
    }

    // Salvăm raportul în serviciu
    this.reportService.addReport({
      title: this.formData.title,
      location: this.formData.address,
      description: this.formData.description,
      category: this.formData.category,
      image: this.uploadedPhotos().length > 0 
        ? this.uploadedPhotos()[0] 
        : 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?q=80&w=800' // Fallback
    });

    alert('Raportul a fost salvat și trimis cu succes!');
    this.router.navigate(['/report']);
  }
}
