import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  signal,
  viewChild,
  afterNextRender,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth.service';
import { GoogleAuthService } from '../../google-auth.service';
import { gsap } from 'gsap';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  styleUrl: './register.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="auth-shell">
      <div class="bg-glow"></div>
      <div class="bg-glow-bottom"></div>

      <header class="auth-header">
        <div class="header-meta">
          <button class="back-btn" (click)="goBack()">
            <span class="material-icons">arrow_back</span>
          </button>
          <div class="brand-mark">Brașov Smart City</div>
        </div>
        
        <div class="greeting-block">
          <h1>Creează Cont</h1>
          <p>Alătură-te comunității și accesează serviciile orașului.</p>
        </div>
      </header>

      <div class="auth-content">
        <div class="toggle-pill on-register">
          <div class="active-glider"></div>
          <button class="toggle-btn" routerLink="/login">Sign In</button>
          <button class="toggle-btn active" routerLink="/register">Sign Up</button>
        </div>

        <form [formGroup]="registerForm" (ngSubmit)="submit()" class="form" novalidate>
          <div class="steps-container">
            <!-- Step 1: Email and Passwords -->
            @if (currentStep() === 1) {
              <div class="step-content step-1">
                <div class="input-wrapper email-wrapper">
                  <span class="material-icons input-icon">mail_outline</span>
                  <input
                    type="email"
                    placeholder="Adresă Email"
                    formControlName="email"
                    class="input-field"
                    autocomplete="email"
                  />
                </div>
                @if (emailControl.touched && emailControl.invalid) {
                  <span class="error-text">Introdu o adresă de email validă</span>
                }

                <div class="input-wrapper password-wrapper">
                  <span class="material-icons input-icon">lock_outline</span>
                  <input
                    type="password"
                    placeholder="Parolă"
                    formControlName="password"
                    class="input-field"
                    autocomplete="new-password"
                  />
                </div>
                
                <div class="input-wrapper confirm-password-wrapper">
                  <span class="material-icons input-icon">lock_outline</span>
                  <input
                    type="password"
                    placeholder="Confirmă Parola"
                    formControlName="confirmPassword"
                    class="input-field"
                  />
                </div>
                @if (passwordControl.touched && registerForm.errors?.['mismatch']) {
                  <span class="error-text">Parolele nu se potrivesc</span>
                }

                <button type="button" class="primary-btn" (click)="nextStep()">
                  Continuă
                </button>
              </div>
            }

            <!-- Step 2: Name, Age, Phone -->
            @if (currentStep() === 2) {
              <div class="step-content step-2">
                <div class="input-wrapper name-wrapper">
                  <span class="material-icons input-icon">person_outline</span>
                  <input
                    type="text"
                    placeholder="Nume Complet"
                    formControlName="fullName"
                    class="input-field"
                    autocomplete="name"
                  />
                </div>

                <div class="input-wrapper phone-wrapper">
                  <span class="material-icons input-icon">phone_iphone</span>
                  <input
                    type="tel"
                    placeholder="Număr Telefon"
                    formControlName="phone"
                    class="input-field"
                    autocomplete="tel"
                  />
                </div>

                <div class="input-wrapper age-wrapper">
                  <span class="material-icons input-icon">cake</span>
                  <input
                    type="number"
                    placeholder="Vârstă"
                    formControlName="age"
                    class="input-field"
                  />
                </div>

                <label class="checkbox-label">
                  <input type="checkbox" class="checkbox-input" />
                  <span>Am citit și sunt de acord cu <a href="#">Termenii și Condițiile</a></span>
                </label>

                <button type="submit" class="primary-btn" [disabled]="isSubmitting()">
                  {{ isSubmitting() ? 'Se creează contul...' : 'Finalizează Înregistrarea' }}
                </button>
              </div>
            }
          </div>

          <button type="button" class="secondary-btn" (click)="demoContinue()">
            Continuă (Demo)
          </button>
        </form>

        <div class="divider">SAU</div>

        <div class="google-btn-host" #googleBtnHost></div>
        @if (authError()) {
          <span class="error-text">{{ authError() }}</span>
        }
      </div>
    </section>
  `,
})
export class RegisterComponent implements AfterViewInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly googleAuthService = inject(GoogleAuthService);
  private readonly router = inject(Router);
  private readonly googleBtnHost = viewChild<ElementRef<HTMLElement>>('googleBtnHost');

  protected readonly currentStep = signal(1);
  protected readonly isPasswordVisible = signal(false);
  protected readonly isSubmitting = signal(false);
  protected readonly authError = signal<string | null>(null);

  protected readonly registerForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]],
    fullName: ['', [Validators.required]],
    phone: ['', [Validators.required]],
    age: ['', [Validators.required, Validators.min(13)]],
    role: ['CITIZEN' as 'CITIZEN' | 'TOURIST' | 'ADMIN', [Validators.required]]
  }, {
    validators: (group) => {
      const pass = group.get('password')?.value;
      const confirmPass = group.get('confirmPassword')?.value;
      return pass === confirmPass ? null : { mismatch: true };
    }
  });

  constructor() {
    afterNextRender(() => {
      this.animateEntrance();
    });
  }

  private animateEntrance() {
    gsap.from('.form', {
      y: 20,
      opacity: 0,
      duration: 0.6,
      ease: 'power3.out'
    });
  }

  protected nextStep(): void {
    const step1Fields = ['email', 'password', 'confirmPassword'];
    let step1Valid = true;
    
    step1Fields.forEach(field => {
      const control = this.registerForm.get(field);
      control?.markAsTouched();
      if (control?.invalid) step1Valid = false;
    });

    if (this.registerForm.errors?.['mismatch']) step1Valid = false;

    if (step1Valid) {
      this.animateStep(2);
    }
  }

  protected demoContinue(): void {
    if (this.currentStep() === 1) {
      this.animateStep(2);
    } else {
      this.router.navigateByUrl('/dashboard');
    }
  }

  protected goBack(): void {
    if (this.currentStep() === 2) {
      this.animateStep(1, true);
    } else {
      this.router.navigateByUrl('/');
    }
  }

  private animateStep(targetStep: number, isReverse = false): void {
    const tl = gsap.timeline({
      onComplete: () => {
        this.currentStep.set(targetStep);
        setTimeout(() => {
          gsap.fromTo('.step-content', 
            { x: isReverse ? -50 : 50, opacity: 0 },
            { x: 0, opacity: 1, duration: 0.4, ease: 'power2.out' }
          );
        }, 0);
      }
    });

    tl.to('.step-content', { 
      x: isReverse ? 50 : -50, 
      opacity: 0, 
      duration: 0.3, 
      ease: 'power2.in' 
    });
  }

  public ngAfterViewInit(): void {
    const host = this.googleBtnHost()?.nativeElement;
    if (!host) {
      return;
    }

    void this.googleAuthService
      .attachButton(host, (idToken) => this.handleGoogleSignIn(idToken))
      .catch(() => this.authError.set('Google Sign-In nu este disponibil. Verifica GOOGLE_CLIENT_ID.'));
  }

  protected togglePasswordVisibility(): void {
    this.isPasswordVisible.update((visible) => !visible);
  }

  protected submit(): void {
    if (this.registerForm.invalid || this.isSubmitting()) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.authError.set(null);
    this.isSubmitting.set(true);
    const { phone, age, ...submitData } = this.registerForm.getRawValue();

    this.authService
      .register({
        ...submitData,
        confirmPassword: submitData.confirmPassword,
        role: submitData.role
      })
      .subscribe({
        next: async () => {
          this.isSubmitting.set(false);
          await this.router.navigateByUrl('/dashboard');
        },
        error: () => {
          this.isSubmitting.set(false);
          this.authError.set('Inregistrarea a esuat. Verifica datele introduse.');
        },
      });
  }

  private handleGoogleSignIn(idToken: string): void {
    if (this.isSubmitting()) {
      return;
    }

    this.authError.set(null);
    this.isSubmitting.set(true);
    this.authService.loginWithGoogle(idToken).subscribe({
      next: async () => {
        this.isSubmitting.set(false);
        await this.router.navigateByUrl('/dashboard');
      },
      error: () => {
        this.isSubmitting.set(false);
        this.authError.set('Autentificarea cu Google a esuat.');
      },
    });
  }

  protected get emailControl() { return this.registerForm.controls.email; }
  protected get passwordControl() { return this.registerForm.controls.password; }
  protected get fullNameControl() { return this.registerForm.controls.fullName; }
}
