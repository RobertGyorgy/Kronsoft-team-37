import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  styleUrl: './register.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="auth-shell">
      <div class="auth-header">
        <button class="back-btn" (click)="goBack()" [routerLink]="step() === 1 ? '/' : null">
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
          
          <!-- Step 1: Email & Password -->
          @if (step() === 1) {
            <div class="input-wrapper">
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

            <div class="input-wrapper">
              <span class="material-icons input-icon">lock_outline</span>
              <input
                [type]="isPasswordVisible() ? 'text' : 'password'"
                placeholder="Password"
                formControlName="password"
                class="input-field"
                autocomplete="new-password"
              />
              <button
                type="button"
                class="password-toggle-btn"
                (click)="togglePasswordVisibility()"
              >
                {{ isPasswordVisible() ? 'Hide' : 'Show' }}
              </button>
            </div>
            @if (passwordControl.touched && passwordControl.invalid) {
              <span class="error-text">Password is required</span>
            }

            <div class="input-wrapper">
              <span class="material-icons input-icon">lock_outline</span>
              <input
                [type]="isPasswordVisible() ? 'text' : 'password'"
                placeholder="Confirm Password"
                formControlName="confirmPassword"
                class="input-field"
                autocomplete="new-password"
              />
            </div>
            @if (registerForm.hasError('mismatch') && confirmPasswordControl.touched) {
              <span class="error-text">Passwords do not match</span>
            }

            <button type="button" class="primary-btn" (click)="nextStep()">
              Continue
            </button>
          }

          <!-- Step 2: Details -->
          @if (step() === 2) {
            <div class="input-wrapper">
              <span class="material-icons input-icon">person_outline</span>
              <input
                type="text"
                placeholder="Full Name"
                formControlName="fullName"
                class="input-field"
                autocomplete="name"
              />
            </div>
            @if (fullNameControl.touched && fullNameControl.invalid) {
              <span class="error-text">Enter your full name</span>
            }

            <div class="input-wrapper">
              <span class="material-icons input-icon">phone_iphone</span>
              <input
                type="tel"
                placeholder="Phone Number"
                formControlName="phone"
                class="input-field"
                autocomplete="tel"
              />
            </div>
            @if (phoneControl.touched && phoneControl.invalid) {
              <span class="error-text">Enter a valid phone number</span>
            }

            <div class="input-wrapper">
              <span class="material-icons input-icon">event</span>
              <input
                type="number"
                placeholder="Age"
                formControlName="age"
                class="input-field"
              />
            </div>
            @if (ageControl.touched && ageControl.invalid) {
              <span class="error-text">Age must be between 14 and 120</span>
            }

            <label class="checkbox-label">
              <input type="checkbox" class="checkbox-input" />
              <span>I Have Read And Agree To <a href="#">User Agreement Privacy Policy</a></span>
            </label>

            <button type="submit" class="primary-btn" [disabled]="isSubmitting()">
              {{ isSubmitting() ? 'Creating Account...' : 'Finish' }}
            </button>
          }
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

  protected readonly step = signal(1);
  protected readonly isPasswordVisible = signal(false);
  protected readonly isSubmitting = signal(false);

  protected readonly registerForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]],
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    phone: ['', [Validators.required, Validators.pattern(/^[0-9+ ]{10,15}$/)]],
    age: [null as number | null, [Validators.required, Validators.min(14), Validators.max(120)]]
  }, { validators: this.passwordMatchValidator });

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    return password && confirmPassword && password.value !== confirmPassword.value 
      ? { mismatch: true } 
      : null;
  }

  protected togglePasswordVisibility(): void {
    this.isPasswordVisible.update((visible) => !visible);
  }

  protected nextStep(): void {
    const email = this.registerForm.controls.email;
    const password = this.registerForm.controls.password;
    const confirm = this.registerForm.controls.confirmPassword;

    if (email.valid && password.valid && confirm.valid && !this.registerForm.hasError('mismatch')) {
      this.step.set(2);
    } else {
      email.markAsTouched();
      password.markAsTouched();
      confirm.markAsTouched();
    }
  }

  protected goBack(): void {
    if (this.step() === 2) {
      this.step.set(1);
    }
  }

  protected submit(): void {
    if (this.registerForm.invalid || this.isSubmitting()) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const { confirmPassword, ...data } = this.registerForm.getRawValue();
    
    // Type casting age for safety
    const payload = { ...data, age: Number(data.age) };

    this.authService.register(payload as any).subscribe({
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
  protected get confirmPasswordControl() { return this.registerForm.controls.confirmPassword; }
  protected get fullNameControl() { return this.registerForm.controls.fullName; }
  protected get phoneControl() { return this.registerForm.controls.phone; }
  protected get ageControl() { return this.registerForm.controls.age; }
}
