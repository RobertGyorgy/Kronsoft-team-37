import { ChangeDetectionStrategy, Component, inject, signal, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  styleUrl: './register.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="auth-shell on-register" #authShell>
      <!-- Background reference for WebGL capture (Liquid Glass needs an image) -->
      <img src="/images/poza%20intro%20screen%20.jpg" style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0; pointer-events: none; z-index: -1;" aria-hidden="true" />
      
      <!-- Actual background video -->
      <video
        src="/videos/brasov-drone.mp4"
        class="auth-bg"
        autoplay
        muted
        [muted]="true"
        loop
        playsinline
      ></video>
      
      <div class="toggle-pill" #togglePill [attr.data-config]="toggleConfig">
        <button
          class="toggle-btn"
          [class.active]="false"
          routerLink="/login"
        >
          Sign In
        </button>
        <button
          class="toggle-btn"
          [class.active]="true"
          routerLink="/register"
        >
          Sign Up
        </button>
      </div>

      <div class="active-glider" #activeGlider [attr.data-config]="gliderConfig"></div>

      <div class="form-container" #formContainer [attr.data-config]="formConfig">
        <form [formGroup]="registerForm" (ngSubmit)="submit()" class="form" novalidate>
          <input
            type="email"
            placeholder="Phone/Email Id"
            formControlName="email"
            class="input-field"
            autocomplete="email"
          />
          @if (emailControl.touched && emailControl.invalid) {
            <span class="error-text">Enter a valid email address</span>
          }

          <input
            type="text"
            placeholder="Full Name"
            formControlName="fullName"
            class="input-field"
            autocomplete="name"
          />
          @if (fullNameControl.touched && fullNameControl.invalid) {
            <span class="error-text">Enter your full name</span>
          }

          <div class="password-field">
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
              [attr.aria-label]="isPasswordVisible() ? 'Hide password' : 'Show password'"
            >
              {{ isPasswordVisible() ? 'Hide' : 'Show' }}
            </button>
          </div>
          @if (passwordControl.touched && passwordControl.invalid) {
            <span class="error-text">Password is required</span>
          }

          <label class="checkbox-label">
            <input type="checkbox" class="checkbox-input" />
            <span>I Have Read And Agree To User Agreement Privacy Policy</span>
          </label>

          <button type="submit" class="primary-btn" [disabled]="isSubmitting()">
            {{ isSubmitting() ? 'Creating Account...' : 'Continue' }}
          </button>
        </form>

        <div class="divider">OR</div>

        <button class="google-btn" (click)="signUpWithGoogle()">
          <svg class="google-icon" viewBox="0 0 24 24">
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
export class RegisterComponent implements AfterViewInit {
  @ViewChild('authShell') authShell!: ElementRef;
  @ViewChild('formContainer') formContainer!: ElementRef;
  @ViewChild('togglePill') togglePill!: ElementRef;
  @ViewChild('activeGlider') activeGlider!: ElementRef;

  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly isPasswordVisible = signal(false);
  protected readonly isSubmitting = signal(false);
  protected readonly registerForm = this.formBuilder.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  formConfig = JSON.stringify({
    blurAmount: 0.3,
    refraction: 0.8,
    chromAberration: 0.05,
    edgeHighlight: 0.1,
    specular: 0.1,
    fresnel: 0.8,
    cornerRadius: 24,
    zRadius: 20,
    opacity: 0.85,
    shadowOpacity: 0.25,
    shadowSpread: 8,
  });

  gliderConfig = JSON.stringify({
    blurAmount: 0.4,
    refraction: 0.9,
    cornerRadius: 999,
    zRadius: 15,
    opacity: 0.75,
    edgeHighlight: 0.15,
    shadowOpacity: 0.2,
    shadowSpread: 6,
  });

  toggleConfig = JSON.stringify({
    blurAmount: 0.15,
    refraction: 0.5,
    cornerRadius: 999,
    zRadius: 10,
    opacity: 0.7,
    edgeHighlight: 0.05,
    shadowOpacity: 0.15,
    shadowSpread: 4,
  });

  ngAfterViewInit(): void {
    this.initializeLiquidGlass();
  }

  private async initializeLiquidGlass(): Promise<void> {
    try {
      // Dynamically import liquid glass
      const { LiquidGlass } = await import('@ybouane/liquidglass');
      
      if (!this.authShell?.nativeElement) {
        console.warn('Auth shell not found');
        return;
      }

      // Collect glass elements - must be direct children of root
      const glassElements: HTMLElement[] = [];
      if (this.formContainer?.nativeElement) {
        glassElements.push(this.formContainer.nativeElement);
      }
      if (this.togglePill?.nativeElement) {
        glassElements.push(this.togglePill.nativeElement);
      }
      if (this.activeGlider?.nativeElement) {
        glassElements.push(this.activeGlider.nativeElement);
      }

      if (glassElements.length > 0) {
        const instance = await LiquidGlass.init({
          root: this.authShell.nativeElement,
          glassElements: glassElements,
        });
        console.log('LiquidGlass initialized successfully', instance);
      }
    } catch (error) {
      console.error('Failed to initialize LiquidGlass:', error);
    }
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
    const { fullName, email, password } = this.registerForm.getRawValue();

    this.authService.register({ fullName, email, password }).subscribe({
      next: async () => {
        this.isSubmitting.set(false);
        await this.router.navigateByUrl('/dashboard');
      },
      error: () => {
        this.isSubmitting.set(false);
      }
    });
  }

  protected signUpWithGoogle(): void {
    console.log('Sign up with Google');
  }

  protected get fullNameControl() {
    return this.registerForm.controls.fullName;
  }

  protected get emailControl() {
    return this.registerForm.controls.email;
  }

  protected get passwordControl() {
    return this.registerForm.controls.password;
  }
}
