import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { TokenExpirationService } from '../token-expiration/token-expiration.service';
import { MonitoringService } from '../monitoring/monitoring.service';
import { SessionExpiredService } from '../session/session-expired.service';

export const httpInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const tokenExpirationService = inject(TokenExpirationService);
  const monitoringService = inject(MonitoringService);
  const sessionExpiredService = inject(SessionExpiredService);

  return next(req).pipe(
    tap({
      next: (event) => {
        // Track token expiration on successful responses
        if (event instanceof HttpResponse) {
          const body = event.body;
          
          // If response contains expires field, update token expiration
          if (body && typeof body === 'object' && 'expires' in body) {
            const expires = (body as any).expires;
            if (expires) {
              tokenExpirationService.setTokenExpiration(expires);
            }
          }
        }
      },
      error: (error) => {
        // Handle no_user error
        if (error.error?.error === 'no_user') {
          router.navigate(['/login']);
          monitoringService.logAuthError('no_user', error);
          sessionExpiredService.handleSessionExpired();
          return;
        }
        
        // Handle 401 unauthorized
        if (error.status === 401) {
          monitoringService.logAuthError('unauthorized', error);
          sessionExpiredService.handleSessionExpired();
          return;
        }
        
        // Handle token expired error
        if (error.error?.error === 'token_expired') {
          monitoringService.logAuthError('token_expired', error);
          sessionExpiredService.handleSessionExpired();
          return;
        }
        
        // Log other HTTP errors
        if (error.status >= 400) {
          monitoringService.logError(`HTTP ${error.status} error on ${error.url}`, error);
        }
      }
    })
  );
}; 