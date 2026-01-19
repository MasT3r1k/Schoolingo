import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, interval, Subject } from 'rxjs';
import { takeWhile, map } from 'rxjs/operators';

export interface TokenExpirationState {
  expiresAt: Date | null;
  timeRemaining: number; // milliseconds
  isWarning: boolean;
  isExpired: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class TokenExpirationService {
  private readonly WARNING_THRESHOLD_MS = 2 * 60 * 1000; // 2 minutes before expiration
  
  private expiresAt$ = new BehaviorSubject<Date | null>(null);
  private warningTriggered = false;
  private checkInterval: any;
  
  // Public observables
  public readonly warningThreshold$ = new Subject<void>();
  public readonly expired$ = new Subject<void>();
  public readonly state$: Observable<TokenExpirationState>;

  constructor() {
    // Create state observable that combines expiration time with current time
    this.state$ = this.expiresAt$.pipe(
      map(expiresAt => this.calculateState(expiresAt))
    );

    // Start checking expiration every second
    this.startExpirationCheck();
  }

  /**
   * Set the token expiration time from the server
   */
  public setTokenExpiration(expires: Date | string): void {
    const expirationDate = typeof expires === 'string' ? new Date(expires) : expires;
    this.expiresAt$.next(expirationDate);
    this.warningTriggered = false;
    
    console.log('[TokenExpiration] Token expires at:', expirationDate);
  }

  public getExpirationListener(): typeof this.expiresAt$ {
    return this.expiresAt$;
  }

  /**
   * Get current expiration time
   */
  public getExpiresAt(): Date | null {
    return this.expiresAt$.getValue();
  }

  /**
   * Get time remaining until expiration in milliseconds
   */
  public getTimeRemaining(): number {
    const expiresAt = this.expiresAt$.getValue();
    if (!expiresAt) return 0;
    
    const now = new Date().getTime();
    const expiresAtMs = expiresAt.getTime();
    return Math.max(0, expiresAtMs - now);
  }

  /**
   * Clear token expiration (on logout)
   */
  public clearExpiration(): void {
    this.expiresAt$.next(null);
    this.warningTriggered = false;
  }

  /**
   * Calculate current state based on expiration time
   */
  private calculateState(expiresAt: Date | null): TokenExpirationState {
    if (!expiresAt) {
      return {
        expiresAt: null,
        timeRemaining: 0,
        isWarning: false,
        isExpired: false
      };
    }

    const now = new Date().getTime();
    const expiresAtMs = expiresAt.getTime();
    const timeRemaining = Math.max(0, expiresAtMs - now);
    const isWarning = timeRemaining > 0 && timeRemaining <= this.WARNING_THRESHOLD_MS;
    const isExpired = timeRemaining === 0;

    return {
      expiresAt,
      timeRemaining,
      isWarning,
      isExpired
    };
  }

  /**
   * Start interval to check expiration status
   */
  private startExpirationCheck(): void {
    // Check every second
    this.checkInterval = setInterval(() => {
      const state = this.calculateState(this.expiresAt$.getValue());
      
      // Trigger warning when entering warning threshold
      if (state.isWarning && !this.warningTriggered) {
        this.warningTriggered = true;
        this.warningThreshold$.next();
        console.log('[TokenExpiration] Warning threshold reached - 2 minutes remaining');
      }
      
      // Trigger expired event
      if (state.isExpired && this.expiresAt$.getValue() !== null) {
        this.expired$.next();
        console.log('[TokenExpiration] Token expired');
        this.clearExpiration();
      }
    }, 1000);
  }

  /**
   * Clean up on service destruction
   */
  public ngOnDestroy(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
  }
}
