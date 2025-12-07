import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Authentication } from '../../infrastructure/authentication';
import { TokenExpirationService } from '../../infrastructure/token-expiration/token-expiration.service';
import { ModalManager } from '@Schoolingo/modal';
import { Locale } from '@Schoolingo/locale';
import { IconsModule } from '@Schoolingo/icons';
import { Subscription, interval } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Config } from '../../infrastructure/config';

@Component({
  selector: 'app-token-warning-modal',
  standalone: true,
  imports: [CommonModule, IconsModule],
  templateUrl: './token-warning-modal.component.html',
  styleUrls: ['./token-warning-modal.component.css']
})
export class TokenWarningModalComponent implements OnInit, OnDestroy {
  private auth = inject(Authentication);
  private tokenExpiration = inject(TokenExpirationService);
  private modalManager = inject(ModalManager);
  private http = inject(HttpClient);
  public l = inject(Locale);

  public timeRemaining: string = '';
  public progressPercentage: number = 100;
  private subscription?: Subscription;
  public isRefreshing = false;
  private readonly WARNING_THRESHOLD_MS = 2 * 60 * 1000; // 2 minutes

  ngOnInit(): void {
    // Update countdown every second
    this.subscription = interval(1000).subscribe(() => {
      this.updateTimeRemaining();
    });
    this.updateTimeRemaining();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  private updateTimeRemaining(): void {
    const ms = this.tokenExpiration.getTimeRemaining();
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    this.timeRemaining = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    this.progressPercentage =  Math.max(0, Math.min(100, ((ms / this.WARNING_THRESHOLD_MS) * 100)));
  }

  public extendSession(): void {
    this.isRefreshing = true;
    
    this.http.post<{ success: boolean; expires: string }>(
      Config.API_URL + '/v1/sessionexpand',
      {},
      { withCredentials: true }
    ).subscribe({
      next: (response) => {
        console.log('[TokenWarning] Session extended successfully');
        this.tokenExpiration.setTokenExpiration(response.expires);
        this.modalManager.closeModal('token-warning');
        this.isRefreshing = false;
      },
      error: (error) => {
        console.error('[TokenWarning] Failed to extend session:', error);
        this.isRefreshing = false;
        // If refresh fails, user is probably already logged out
        // The interceptor will handle redirect
      }
    });
  }

  public logout(): void {
    this.modalManager.closeModal('token-warning');
    this.auth.logout();
  }
}
