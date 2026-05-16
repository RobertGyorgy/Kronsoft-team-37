import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth.service';
import { GoogleAuthService } from '../../google-auth.service';
import { gsap } from 'gsap';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  styleUrl: './register.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="auth-shell">
      <div class="auth-header">
        <button class="back-btn" (click)="goBack()">
          <span class="material-icons">arrow_back</span>
        </button>
      </div>

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
                    placeholder="Email Address"
                    formControlName="email"
                    class="input-field"
                    autocomplete="email"
                  />
                </div>
                @if (emailControl.touched && emailControl.invalid) {
                  <span class="error-text">Enter a valid email address</span>
                }

                <div class="input-wrapper password-wrapper">
                  <span class="material-icons input-icon">lock_outline</span>
                  <input
                    type="password"
                    placeholder="Password"
                    formControlName="password"
                    class="input-field"
                    autocomplete="new-password"
                  />
                </div>
                
                <div class="input-wrapper confirm-password-wrapper">
                  <span class="material-icons input-icon">lock_outline</span>
                  <input
                    type="password"
                    placeholder="Confirm Password"
                    formControlName="confirmPassword"
                    class="input-field"
                  />
                </div>
                @if (passwordControl.touched && registerForm.errors?.['mismatch']) {
                  <span class="error-text">Passwords do not match</span>
                }

                <button type="button" class="primary-btn" (click)="nextStep()">
                  Continue
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
                    placeholder="Full Name"
                    formControlName="fullName"
                    class="input-field"
                    autocomplete="name"
                  />
                </div>

                <div class="input-wrapper phone-wrapper">
                  <span class="material-icons input-icon">phone_iphone</span>
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    formControlName="phone"
                    class="input-field"
                    autocomplete="tel"
                  />
                </div>

                <div class="input-wrapper age-wrapper">
                  <span class="material-icons input-icon">cake</span>
                  <input
                    type="number"
                    placeholder="Age"
                    formControlName="age"
                    class="input-field"
                  />
                </div>

                <label class="checkbox-label">
                  <input type="checkbox" class="checkbox-input" />
                  <span>I Have Read And Agree To <a href="#">User Agreement Privacy Policy</a></span>
                </label>

                <button type="submit" class="primary-btn" [disabled]="isSubmitting()">
                  {{ isSubmitting() ? 'Creating Account...' : 'Complete Registration' }}
                </button>
              </div>
            }
          </div>

          <button type="button" class="secondary-btn" (click)="demoContinue()">
            Continue (Demo)
          </button>
        </form>

        <div class="divider">OR</div>

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
    age: ['', [Validators.required, Validators.min(13)]]
  }, {
    validators: (group) => {
      const pass = group.get('password')?.value;
      const confirmPass = group.get('confirmPassword')?.value;
      return pass === confirmPass ? null : { mismatch: true };
    }
  });

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
        // Wait for next tick to animate in
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
