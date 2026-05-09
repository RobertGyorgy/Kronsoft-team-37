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
    // 1. Cerem permisiunea pentru cameră (explicit)
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
          // Permisiune acordată - oprim stream-ul imediat (doar am verificat accesul)
          stream.getTracks().forEach(track => track.stop());
          this.triggerFilePicker();
        })
        .catch((err) => {
          console.warn('Permisiune cameră refuzată sau eroare:', err);
          // Chiar dacă refuză camera live, permitem selectarea din galerie
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
    console.log('Trimitere raport:', this.formData);
    // Aici s-ar face trimiterea către backend
    alert('Raportul a fost trimis cu succes!');
    this.router.navigate(['/report']);
  }
}
