import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

// ── Request Interfaces (from OpenAPI spec) ─────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'CITIZEN' | 'TOURIST' | 'ADMIN';
}

export interface GoogleLoginRequest {
  idToken: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

// ── Response Interface ─────────────────────────────────────────

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  role: string;
  fullName: string;
}

// ── Session Keys ───────────────────────────────────────────────

export const ACCESS_TOKEN_KEY = 'smart_city_access_token';
const REFRESH_TOKEN_KEY = 'smart_city_refresh_token';
const USER_NAME_KEY = 'smart_city_user_name';
const USER_ROLE_KEY = 'smart_city_user_role';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/auth';

  // ── Core Auth ────────────────────────────────────────────────

  public login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, request)
      .pipe(tap((res) => this.persistSession(res)));
  }

  public register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/register`, request)
      .pipe(tap((res) => this.persistSession(res)));
  }

  public loginWithGoogle(idToken: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/google`, { idToken } satisfies GoogleLoginRequest)
      .pipe(tap((res) => this.persistSession(res)));
  }

  // ── Token Management ─────────────────────────────────────────

  public refresh(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) throw new Error('No refresh token available');
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/refresh`, { refreshToken } satisfies RefreshTokenRequest)
      .pipe(tap((res) => this.persistSession(res)));
  }

  public logout(): Observable<void> {
    const refreshToken = this.getRefreshToken();
    this.clearSession();
    if (!refreshToken) return new Observable(sub => sub.complete());
    return this.http.post<void>(`${this.baseUrl}/logout`, { refreshToken } satisfies RefreshTokenRequest);
  }

  // ── Password Recovery ────────────────────────────────────────

  public forgotPassword(email: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/forgot-password`, { email } satisfies ForgotPasswordRequest);
  }

  public resetPassword(request: ResetPasswordRequest): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/reset-password`, request);
  }

  // ── Session Helpers ──────────────────────────────────────────

  public getAccessToken(): string | null {
    return (
      localStorage.getItem(ACCESS_TOKEN_KEY) ??
      sessionStorage.getItem(ACCESS_TOKEN_KEY)
    );
  }

  public getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  public getUserName(): string | null {
    return localStorage.getItem(USER_NAME_KEY);
  }

  public getUserRole(): string | null {
    return localStorage.getItem(USER_ROLE_KEY);
  }

  public isLoggedIn(): boolean {
    return !!this.getAccessToken();
  }

  public clearSession(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_NAME_KEY);
    localStorage.removeItem(USER_ROLE_KEY);
  }

  private persistSession(response: AuthResponse): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, response.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
    localStorage.setItem(USER_NAME_KEY, response.fullName);
    localStorage.setItem(USER_ROLE_KEY, response.role);
  }
}
