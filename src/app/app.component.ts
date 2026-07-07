import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Config } from '@Schoolingo/config';
import { Authentication } from './infrastructure/authentication';
import { polyfillCountryFlagEmojis } from "country-flag-emoji-polyfill";
import { ModalComponent } from '@Components/modal';
import { CalendarDropdownsComponent } from '@Components/calendar-dropdown';
import { SeasonalService } from '@Schoolingo/seasonal';
import { SnowEffectComponent } from '@Components/seasonal/snow-effect/snow-effect.component';
import { SeasonalDecorationsComponent } from '@Components/seasonal/decorations/decorations.component';
import { School } from '@Schoolingo/school';
import { Locale } from '@Schoolingo/locale';
import { SystemErrorComponent } from "@Components/system-error/system-error.component";
import { AnalyticsService } from './infrastructure/analytics/analytics.service';
import { MonitoringService } from './infrastructure/monitoring/monitoring.service';
import { AlertComponent } from '@Components/Alert';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ModalComponent, CalendarDropdownsComponent, SnowEffectComponent, SeasonalDecorationsComponent, SystemErrorComponent, AlertComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  public appState: boolean | null = null;
  private http = inject(HttpClient);
  private school = inject(School);
  private locale = inject(Locale);

  public auth = inject(Authentication);
  public seasonalService = inject(SeasonalService);
  private analyticsService = inject(AnalyticsService);
  public monitoringService = inject(MonitoringService);
  private router = inject(Router);

  public isLoading = false;
  public loadingProgress = 0;
  private progressInterval: any;
  
  ngOnInit(): void {
    try {
      // Enable flags Windows 11
      polyfillCountryFlagEmojis();
    } catch(e) {
      console.error('Failed add support for Windows 11 flags.')
    }

    try {
      // Initialize seasonal effects immediately (for login page too)
      this.seasonalService.initialize();
    } catch(e) {
      console.error('Failed load seasonal service.')
    }

    this.http.get<any>(`${Config.API_URL}/v1/version`).subscribe((data) => {
      if (!data.version) {
        return;
      }
      Config.APP_VERSION = data.version;
    });

    this.auth.getAuthState()
    .subscribe((data) => {
      this.appState = data == "offline" ? false : true;
      if (this.appState === true && this.auth.getUser()) {
        this.analyticsService.setUserId(this.auth.getUser().user_id);
      } else {
        this.analyticsService.setUserId(null);
      }
    });

    // Set User ID for Matomo if logged in
    // This is optional and depends on Authentication service exposing user info
    // For now, we rely on basic page tracking
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.startLoading();
      } else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        this.stopLoading();
      }
    });
  }

  private startLoading(): void {
    this.isLoading = true;
    this.loadingProgress = 0;
    
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
    }
    
    this.loadingProgress = 5;
    
    this.progressInterval = setInterval(() => {
      if (this.loadingProgress < 30) {
        this.loadingProgress += Math.random() * 15 + 10;
      } else if (this.loadingProgress < 60) {
        this.loadingProgress += Math.random() * 5 + 2;
      } else if (this.loadingProgress < 85) {
        this.loadingProgress += Math.random() * 2 + 0.5;
      } else if (this.loadingProgress < 95) {
        this.loadingProgress += Math.random() * 0.5 + 0.1;
      } else if (this.loadingProgress < 98) {
        this.loadingProgress += 0.05;
      }
      
      if (this.loadingProgress >= 99) {
        this.loadingProgress = 99;
        clearInterval(this.progressInterval);
      }
    }, 150);
  }

  private stopLoading(): void {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
    }
    
    this.loadingProgress = 100;
    
    setTimeout(() => {
      this.isLoading = false;
      setTimeout(() => {
        if (!this.isLoading) {
          this.loadingProgress = 0;
        }
      }, 300);
    }, 200);
  }

  public getError(): string | null {
    if (this.appState !== false) return null
    if (this.locale.getState() == "error") {
      return 'Language failed to load';
    }
    if (this.school.school_loading_error) {
      return this.school.school_loading_error;
    }

    return 'App is offline';
  }

}
