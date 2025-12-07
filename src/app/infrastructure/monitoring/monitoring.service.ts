import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

export interface AuthError {
  type: 'no_user' | 'unauthorized' | 'token_expired' | 'other';
  timestamp: Date;
  error: HttpErrorResponse;
  url?: string;
  statusCode?: number;
}

@Injectable({
  providedIn: 'root'
})
export class MonitoringService {
  private authErrors: AuthError[] = [];
  private readonly MAX_STORED_ERRORS = 100;

  /**
   * Log authentication error
   */
  public logAuthError(type: AuthError['type'], error: HttpErrorResponse): void {
    const authError: AuthError = {
      type,
      timestamp: new Date(),
      error,
      url: error.url || undefined,
      statusCode: error.status
    };

    this.authErrors.push(authError);

    // Keep only last MAX_STORED_ERRORS
    if (this.authErrors.length > this.MAX_STORED_ERRORS) {
      this.authErrors.shift();
    }

    // Log to console in development
    console.error(`[MonitoringService] Auth error (${type}):`, {
      url: authError.url,
      status: authError.statusCode,
      message: error.error?.message || error.message,
      timestamp: authError.timestamp
    });

    // TODO: Send to external monitoring service (e.g., Sentry)
    // this.sendToSentry(authError);
  }

  /**
   * Log general error
   */
  public logError(message: string, error?: any): void {
    console.error(`[MonitoringService] ${message}`, error);
    
    // TODO: Send to external monitoring service
  }

  /**
   * Get authentication error statistics
   */
  public getAuthErrorStats(): {
    total: number;
    byType: Record<AuthError['type'], number>;
    last24Hours: number;
  } {
    const now = new Date().getTime();
    const yesterday = now - 24 * 60 * 60 * 1000;

    const byType: Record<AuthError['type'], number> = {
      no_user: 0,
      unauthorized: 0,
      token_expired: 0,
      other: 0
    };

    let last24Hours = 0;

    this.authErrors.forEach(error => {
      byType[error.type]++;
      if (error.timestamp.getTime() > yesterday) {
        last24Hours++;
      }
    });

    return {
      total: this.authErrors.length,
      byType,
      last24Hours
    };
  }

  /**
   * Get recent auth errors
   */
  public getRecentAuthErrors(limit: number = 10): AuthError[] {
    return this.authErrors.slice(-limit).reverse();
  }

  /**
   * Clear all stored errors
   */
  public clearErrors(): void {
    this.authErrors = [];
  }
}
