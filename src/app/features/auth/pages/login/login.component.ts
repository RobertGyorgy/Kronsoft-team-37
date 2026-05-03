import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="auth-shell">
      <div class="auth-header">
        <button class="back-btn" routerLink="/">
          <span class="material-icons">arrow_back</span>
        </button>
      </div>

      <div class="auth-content">
        <div class="toggle-pill">
          <div class="active-glider"></div>
          <button class="toggle-btn active" routerLink="/login">Sign In</button>
          <button class="toggle-btn" routerLink="/register">Sign Up</button>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="submit()" class="form" novalidate>
          <div class="input-wrapper">
            <span class="material-icons input-icon">mail_outline</span>
            <input
              type="email"
              placeholder="Phone/Email Id"
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
              autocomplete="current-password"
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

          <a routerLink="#" class="forgot-link">Forgotten Password?</a>

          <button type="submit" class="primary-btn" [disabled]="isSubmitting()">
            {{ isSubmitting() ? 'Signing In...' : 'Continue' }}
          </button>
        </form>

        <div class="divider">OR</div>

        <div class="social-login">
          <button class="google-btn-large">
            <svg viewBox="0 0 24 24" class="google-icon-svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Sign in with Google
          </button>
        </div>
      </div>
      </div>
    </section>
  `,
})
export class LoginComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly isPasswordVisible = signal(false);
  protected readonly isSubmitting = signal(false);
  protected readonly loginForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  protected togglePasswordVisibility(): void {
    this.isPasswordVisible.update((visible) => !visible);
  }

  protected submit(): void {
    if (this.loginForm.invalid || this.isSubmitting()) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.authService.login(this.loginForm.getRawValue()).subscribe({
      next: async () => {
        this.isSubmitting.set(false);
        await this.router.navigateByUrl('/dashboard');
      },
      error: () => {
        this.isSubmitting.set(false);
      }
    });
  }

  protected get emailControl() {
    return this.loginForm.controls.email;
  }

  protected get passwordControl() {
    return this.loginForm.controls.password;
  }
}
