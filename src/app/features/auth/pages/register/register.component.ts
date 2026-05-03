import { ChangeDetectionStrategy, Component, inject, signal, AfterViewInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth.service';
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

        <button class="google-btn">
          <svg viewBox="0 0 24 24" class="google-icon">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>
      </div>
    </section>
  `,
})
export class RegisterComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly currentStep = signal(1);
  protected readonly isPasswordVisible = signal(false);
  protected readonly isSubmitting = signal(false);

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

  protected togglePasswordVisibility(): void {
    this.isPasswordVisible.update((visible) => !visible);
  }

  protected submit(): void {
    if (this.registerForm.invalid || this.isSubmitting()) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const { confirmPassword, ...submitData } = this.registerForm.getRawValue();
    
    this.authService.register(submitData).subscribe({
      next: async () => {
        this.isSubmitting.set(false);
        await this.router.navigateByUrl('/login');
      },
      error: () => {
        this.isSubmitting.set(false);
      }
    });
  }

  protected get emailControl() { return this.registerForm.controls.email; }
  protected get passwordControl() { return this.registerForm.controls.password; }
  protected get fullNameControl() { return this.registerForm.controls.fullName; }
}
