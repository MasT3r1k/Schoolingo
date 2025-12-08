import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { Config } from '@Schoolingo/config';

/**
 * CSRF Token Service
 * Manages CSRF token retrieval and storage for secure POST/PUT/DELETE requests
 */
@Injectable({
  providedIn: 'root'
})
export class CsrfService {
  private csrfToken$ = new BehaviorSubject<string | null>(null);
  private isRefreshing = false;
  private http = inject(HttpClient);

  constructor() {
    // Fetch initial token
    this.refreshToken();
  }

  /**
   * Get current CSRF token
   */
  getToken(): string | null {
    return this.csrfToken$.getValue();
  }

  /**
   * Get token observable
   */
  getToken$(): Observable<string | null> {
    return this.csrfToken$.asObservable();
  }

  /**
   * Refresh CSRF token from server
   */
  async refreshToken(): Promise<string | null> {
    if (this.isRefreshing) {
      // Wait for existing refresh
      return firstValueFrom(this.csrfToken$);
    }

    this.isRefreshing = true;

    try {
      const response = await firstValueFrom(
        this.http.get<{ token: string }>(
          `${Config.API_URL}/csrf-token`,
          { withCredentials: true }
        )
      );

      this.csrfToken$.next(response.token);
      this.isRefreshing = false;
      return response.token;
    } catch (error) {
      console.error('[CSRF] Failed to refresh token:', error);
      this.isRefreshing = false;
      return null;
    }
  }

  /**
   * Ensure we have a valid token, refreshing if needed
   */
  async ensureToken(): Promise<string | null> {
    const token = this.getToken();
    if (token) {
      return token;
    }
    return this.refreshToken();
  }
}

/**
 * CSRF HTTP Interceptor
 * Automatically adds X-CSRF-Token header to all state-changing requests
 */
@Injectable()
export class CsrfInterceptor implements HttpInterceptor {
  private csrfService = inject(CsrfService);

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Only add CSRF token to state-changing requests
    const method = request.method.toUpperCase();
    if (!['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
      return next.handle(request);
    }

    // Skip CSRF for certain endpoints
    const skipUrls = ['/csrf-token', '/locales', '/version'];
    if (skipUrls.some(url => request.url.includes(url))) {
      return next.handle(request);
    }

    // Get current token
    const token = this.csrfService.getToken();
    
    if (token) {
      // Clone request with CSRF header
      const authReq = request.clone({
        headers: request.headers.set('X-CSRF-Token', token)
      });
      return next.handle(authReq);
    }

    // No token available, proceed without (will likely fail on server)
    return next.handle(request);
  }
}
