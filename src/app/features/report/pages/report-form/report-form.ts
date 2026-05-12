import { ChangeDetectionStrategy, Component, signal, inject, ViewChild, ElementRef, afterNextRender } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ReportService } from '../../services/report';
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

  categories = ['Infrastructură', 'Deșeuri', 'Graffiti', 'Clădiri', 'Iluminare', 'Spații verzi', 'Altele'];
  now = new Date();

  formData = {
    title: '',
    address: '',
    description: '',
    category: 'Altele'
  };

  uploadedPhotos = signal<string[]>([]);
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

    // Process each file
    Array.from(files as FileList).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const base64Data = e.target.result;
        this.uploadedPhotos.update(photos => [...photos, base64Data]);
      };
      reader.onerror = (err) => console.error('FileReader error:', err);
      reader.readAsDataURL(file);
    });

    // Reset input so the same file can be selected again
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
    this.isPreviewMode.set(true);
    setTimeout(() => {
      gsap.fromTo('.pdf-preview-container', 
        { y: 50, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }
      );
    }, 0);
  }

  cancelPreview() {
    this.isPreviewMode.set(false);
  }

  confirmSubmit() {
    this.reportService.addReport({
      title: this.formData.title,
      location: this.formData.address,
      description: this.formData.description,
      category: this.formData.category,
      image: this.uploadedPhotos().length > 0 
        ? this.uploadedPhotos()[0] 
        : 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?q=80&w=800'
    });

    this.router.navigate(['/report']);
  }
}
