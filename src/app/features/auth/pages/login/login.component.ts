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
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="auth-shell">
      <div class="bg-glow"></div>
      <div class="bg-glow-bottom"></div>

      <header class="auth-header">
        <div class="header-meta">
          <button class="back-btn" routerLink="/">
            <span class="material-icons">arrow_back</span>
          </button>
          <div class="brand-mark">Brașov Smart City</div>
        </div>
        
        <div class="greeting-block">
          <h1>Bine ai revenit</h1>
          <p>Conectează-te pentru a accesa serviciile orașului tău.</p>
        </div>
      </header>

      <div class="auth-content">
        <div class="toggle-pill animate-up">
          <div class="active-glider"></div>
          <button class="toggle-btn active" routerLink="/login">Sign In</button>
          <button class="toggle-btn" routerLink="/register">Sign Up</button>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="submit()" class="form" novalidate>
          <div class="input-wrapper email-wrapper">
            <span class="material-icons input-icon">mail_outline</span>
            <input
              type="email"
              placeholder="Email sau Telefon"
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
              [type]="isPasswordVisible() ? 'text' : 'password'"
              placeholder="Parolă"
              formControlName="password"
              class="input-field"
              autocomplete="current-password"
            />
            <button type="button" class="password-toggle-btn" (click)="togglePasswordVisibility()" tabindex="-1">
              <span class="material-icons">{{ isPasswordVisible() ? 'visibility_off' : 'visibility' }}</span>
            </button>
          </div>
          @if (passwordControl.touched && passwordControl.invalid) {
            <span class="error-text">Parola este obligatorie</span>
          }

          <a routerLink="#" class="forgot-link">Ai uitat parola?</a>

          <button type="submit" class="primary-btn" [disabled]="isSubmitting()">
            {{ isSubmitting() ? 'Se autentifică...' : 'Continuă' }}
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
export class LoginComponent implements AfterViewInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly googleAuthService = inject(GoogleAuthService);
  private readonly router = inject(Router);
  private readonly googleBtnHost = viewChild<ElementRef<HTMLElement>>('googleBtnHost');

  protected readonly isPasswordVisible = signal(false);
  protected readonly isSubmitting = signal(false);
  protected readonly authError = signal<string | null>(null);
  protected readonly loginForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  constructor() {
    afterNextRender(() => {
      this.animateEntrance();
    });
  }

  private animateEntrance() {
    gsap.from('.animate-up', {
      y: 40,
      opacity: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: 'power3.out'
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
    if (this.loginForm.invalid || this.isSubmitting()) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.authError.set(null);
    this.isSubmitting.set(true);
    this.authService.login(this.loginForm.getRawValue()).subscribe({
      next: async () => {
        this.isSubmitting.set(false);
        await this.router.navigateByUrl('/dashboard');
      },
      error: () => {
        this.isSubmitting.set(false);
        this.authError.set('Email sau parola incorecta.');
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

  protected get emailControl() {
    return this.loginForm.controls.email;
  }

  protected get passwordControl() {
    return this.loginForm.controls.password;
  }
}
