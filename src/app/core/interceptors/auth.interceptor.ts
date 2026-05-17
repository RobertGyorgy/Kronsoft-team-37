import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Functional HTTP interceptor that attaches the JWT access token
 * to every outgoing request targeting `/api/`.
 *
 * The token is read from localStorage where AuthService persists it.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Only attach token to our backend API calls
  if (!req.url.includes('/api/')) {
    return next(req);
  }

  // Skip auth endpoints that don't need a token
  const publicPaths = ['/api/auth/login', '/api/auth/register', '/api/auth/google', '/api/auth/forgot-password', '/api/auth/reset-password'];
  if (publicPaths.some(path => req.url.includes(path))) {
    return next(req);
  }

  const token = localStorage.getItem('smart_city_access_token');

  if (token) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(authReq);
  }

  return next(req);
};
