import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  role: string;
  fullName: string;
}

export interface GoogleLoginRequest {
  idToken: string;
}

const ACCESS_TOKEN_KEY = 'smart_city_access_token';
const REFRESH_TOKEN_KEY = 'smart_city_refresh_token';
const USER_NAME_KEY = 'smart_city_user_name';
const USER_ROLE_KEY = 'smart_city_user_role';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/auth';

  public login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, request).pipe(tap((res) => this.persistSession(res)));
  }

  public register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/register`, request).pipe(tap((res) => this.persistSession(res)));
  }

  public loginWithGoogle(idToken: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/google`, { idToken } satisfies GoogleLoginRequest)
      .pipe(tap((res) => this.persistSession(res)));
  }

  public getAccessToken(): string | null {
    return sessionStorage.getItem(ACCESS_TOKEN_KEY);
  }

  public clearSession(): void {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(USER_NAME_KEY);
    sessionStorage.removeItem(USER_ROLE_KEY);
  }

  private persistSession(response: AuthResponse): void {
    sessionStorage.setItem(ACCESS_TOKEN_KEY, response.accessToken);
    sessionStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
    sessionStorage.setItem(USER_NAME_KEY, response.fullName);
    sessionStorage.setItem(USER_ROLE_KEY, response.role);
  }
}
