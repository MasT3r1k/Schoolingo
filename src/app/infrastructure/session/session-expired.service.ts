import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Authentication } from '../authentication';
import { ModalManager } from '@Schoolingo/modal';

@Injectable({
  providedIn: 'root'
})
export class SessionExpiredService {
  private router = inject(Router);
  private auth = inject(Authentication);
  private modalManager = inject(ModalManager);

  /**
   * Handle session expiration
   * Sets logout reason and redirects to login
   */
  public handleSessionExpired(): void {
    // Only handle session expiration if user is currently authenticated
    // This prevents showing the alert when loading the app with an expired token (e.g. refresh)
    if (!this.auth.isAuthenticated()) {
        return;
    }

    console.log('[SessionExpired] Handling session expiration');
    
    // Close token warning modal if it's open
    this.modalManager.closeModal('token-warning');
    this.modalManager.closeAllModals();

    // Set logout reason for display on login page
    sessionStorage.setItem('logoutReason', 'session_expired');
    
    // Clear authentication state session
    this.auth.setAuthState(false);
    
    // Redirect to login
    this.router.navigate(['/login']);
  }

  /**
   * Get logout reason from session storage
   */
  public getLogoutReason(): string | null {
    return sessionStorage.getItem('logoutReason');
  }

  /**
   * Clear logout reason from session storage
   */
  public clearLogoutReason(): void {
    sessionStorage.removeItem('logoutReason');
  }
}
