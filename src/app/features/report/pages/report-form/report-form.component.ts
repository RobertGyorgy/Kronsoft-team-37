import { ChangeDetectionStrategy, Component, signal, inject, ViewChild, ElementRef, afterNextRender } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ReportService } from '../../services/report.service';
import { gsap } from 'gsap';

@Component({
  selector: 'app-report-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './report-form.html',
  styleUrl: './report-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportFormComponent {
  private reportService = inject(ReportService);
  private router = inject(Router);

  @ViewChild('container') container!: ElementRef;
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement') canvasElement!: ElementRef<HTMLCanvasElement>;

  categories = this.reportService.categories;
  now = new Date();

  formData = {
    title: '',
    address: '',
    description: '',
    categoryId: 0,
    categoryName: '',
    latitude: 45.6427, // Default Brasov
    longitude: 25.5890,
    anonymous: true
  };

  uploadedPhotos = signal<string[]>([]);
  photoFile: File | null = null;
  isCameraActive = signal<boolean>(false);
  showActionSheet = signal<boolean>(false);
  isPreviewMode = signal<boolean>(false);
  stream: MediaStream | null = null;

  constructor() {
    afterNextRender(() => {
      this.animateEntrance();
    });
  }

  splitByWord(text: string): string[] {
    return text ? text.split(' ') : [];
  }

  getRomanianDate(): string {
    const months = [
      'Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie',
      'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie'
    ];
    const day = this.now.getDate();
    const month = months[this.now.getMonth()];
    const year = this.now.getFullYear();
    return `${day} ${month} ${year}`;
  }

  private animateEntrance() {
    if (!this.container?.nativeElement) return;
    const container = this.container.nativeElement;
    
    const chars = container.querySelectorAll('.char');
    const inputs = container.querySelectorAll('.input-group');
    const photos = container.querySelector('.photos-list-container');
    const submit = container.querySelector('.submit-btn-premium');

    gsap.set(chars, { y: 30, opacity: 0 });
    gsap.set(inputs, { y: 20, opacity: 0 });
    
    const tl = gsap.timeline({ defaults: { ease: 'power2.out', duration: 0.8 } });
    
    tl.to(chars, {
      y: 0,
      opacity: 1,
      stagger: 0.02,
    })
    .to(inputs, {
      y: 0,
      opacity: 1,
      stagger: 0.1
    }, '-=0.5');
  }

  goBack() {
    this.stopCamera();
    window.history.back();
  }

  toggleActionSheet() {
    this.showActionSheet.set(!this.showActionSheet());
    if (this.showActionSheet()) {
      setTimeout(() => {
        gsap.fromTo('.action-sheet', 
          { y: '100%' }, 
          { y: '0%', duration: 0.5, ease: 'power3.out' }
        );
      }, 0);
    }
  }

  async selectCamera() {
    this.showActionSheet.set(false);
    this.startCamera();
  }

  async selectGallery() {
    this.showActionSheet.set(false);
    this.triggerFilePicker();
  }

  private triggerFilePicker() {
    const fileInput = document.getElementById('galleryInput') as HTMLInputElement;
    if (fileInput) fileInput.click();
  }

  onFileSelected(event: any) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    this.photoFile = file;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.uploadedPhotos.set([e.target.result]);
    };
    reader.readAsDataURL(file);

    event.target.value = '';
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

  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    this.isCameraActive.set(false);
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
      this.uploadedPhotos.set([photoData]);
      
      // Convert to file
      canvas.toBlob((blob) => {
        if (blob) {
          this.photoFile = new File([blob], `capture_${Date.now()}.jpg`, { type: 'image/jpeg' });
        }
      }, 'image/jpeg');

      this.stopCamera();
    }
  }

  onSubmit() {
    if (!this.formData.title) {
      alert('Te rugăm să completezi titlul incidentului!');
      return;
    }
    if (!this.formData.categoryId) {
      alert('Te rugăm să selectezi o categorie!');
      return;
    }
    if (!this.formData.description) {
      alert('Te rugăm să completezi descrierea!');
      return;
    }
    this.isPreviewMode.set(true);
    setTimeout(() => {
      gsap.fromTo('.pdf-container', 
        { y: 50, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }
      );
    }, 0);
  }

  cancelPreview() {
    this.isPreviewMode.set(false);
  }

  async confirmSubmit() {
    const finalDescription = `[${this.formData.title}] ${this.formData.address ? 'Locație: ' + this.formData.address + '. ' : ''}${this.formData.description}`;

    const payload = {
      description: finalDescription,
      categoryId: this.formData.categoryId,
      latitude: this.formData.latitude,
      longitude: this.formData.longitude,
      anonymous: this.formData.anonymous
    };

    await this.reportService.addReport(payload, this.photoFile || undefined);
    await this.router.navigate(['/report']);
  }
}
