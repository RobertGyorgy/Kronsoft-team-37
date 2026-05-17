import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../../features/auth/auth.service';

/** Proxied to the PWA bridge on port 8081 — no JWT required. */
const BRIDGE_API_PREFIX = '/api/v1';

const PUBLIC_AUTH_PATHS = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/google',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
];

function requestPath(url: string): string {
  if (url.startsWith('/')) {
    return url;
  }
  try {
    return new URL(url).pathname;
  } catch {
    return url;
  }
}

/**
 * Attaches the JWT access token from localStorage/sessionStorage to backend
 * API calls (port 8083 via proxy). Skips the PWA bridge on 8081 (/api/v1).
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const path = requestPath(req.url);

  if (!path.startsWith('/api/')) {
    return next(req);
  }

  if (path.startsWith(BRIDGE_API_PREFIX)) {
    return next(req);
  }

  if (PUBLIC_AUTH_PATHS.some((publicPath) => path.includes(publicPath))) {
    return next(req);
  }

  const token = inject(AuthService).getAccessToken();

  if (token) {
    return next(
      req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      }),
    );
  }

  return next(req);
};
