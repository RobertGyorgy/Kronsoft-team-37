import { ChangeDetectionStrategy, Component, signal, inject, ViewChild, ElementRef } from '@angular/core';
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

  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement') canvasElement!: ElementRef<HTMLCanvasElement>;

  categories = ['Infrastructură', 'Deșeuri', 'Graffiti', 'Clădiri', 'Iluminare', 'Spații verzi', 'Altele'];

  formData = {
    title: '',
    address: '',
    description: '',
    category: 'Altele'
  };

  uploadedPhotos = signal<string[]>([]);
  isCameraActive = signal<boolean>(false);
  showActionSheet = signal<boolean>(false);
  stream: MediaStream | null = null;

  goBack() {
    this.stopCamera();
    window.history.back();
  }

  toggleActionSheet() {
    this.showActionSheet.set(!this.showActionSheet());
  }

  async selectCamera() {
    const agree = confirm('Sunteți de acord să utilizați camera pentru a fotografia incidentul?');
    if (agree) {
      this.showActionSheet.set(false);
      this.startCamera();
    }
  }

  async selectGallery() {
    const agree = confirm('Sunteți de acord să oferiți acces la galeria foto a telefonului?');
    if (agree) {
      this.showActionSheet.set(false);
      this.triggerFilePicker();
    }
  }

  private triggerFilePicker() {
    const fileInput = document.getElementById('galleryInput') as HTMLInputElement;
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

  async startCamera() {
    try {
      this.isCameraActive.set(true);
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }, 
        audio: false 
      });
      if (this.videoElement) {
        this.videoElement.nativeElement.srcObject = this.stream;
      }
    } catch (err) {
      console.error('Eroare acces cameră:', err);
      alert('Nu am putut accesa camera. Verifică permisiunile!');
      this.isCameraActive.set(false);
    }
  }

  capturePhoto() {
    if (!this.videoElement || !this.canvasElement) return;

    const video = this.videoElement.nativeElement;
    const canvas = this.canvasElement.nativeElement;
    const context = canvas.getContext('2d');

    if (context) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const photoData = canvas.toDataURL('image/jpeg');
      this.uploadedPhotos.update(photos => [...photos, photoData]);
      this.stopCamera();
    }
  }

  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    this.isCameraActive.set(false);
  }

  onSubmit() {
    if (!this.formData.title || !this.formData.address) {
      alert('Te rugăm să completezi titlul și adresa!');
      return;
    }

    this.reportService.addReport({
      title: this.formData.title,
      location: this.formData.address,
      description: this.formData.description,
      category: this.formData.category,
      image: this.uploadedPhotos().length > 0 
        ? this.uploadedPhotos()[0] 
        : 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?q=80&w=800'
    });

    alert('Raportul a fost salvat cu succes!');
    this.router.navigate(['/report']);
  }
}
