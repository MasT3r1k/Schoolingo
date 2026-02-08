import { Injectable, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Config } from '@Schoolingo/config';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private visitorIdKey = 'visitor_id';
  private http = inject(HttpClient);
  private router = inject(Router);
  private userId: number | null = null;
  private gaMeasurementId: string = 'G-K81P8DG338';

  constructor() {
    this.initGoogleAnalytics();
    
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.trackPageView();
      }
    });
  }

  private initGoogleAnalytics() {
    try {
      if (!this.gaMeasurementId || this.gaMeasurementId.startsWith('G-XXXX')) {
          console.warn('Google Analytics Measurement ID is not set.');
          return;
      }

      // Check if script already exists
      if (document.querySelector(`script[src*="googletagmanager.com/gtag/js"]`)) {
          return;
      }

      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${this.gaMeasurementId}`;
      document.head.appendChild(script);

      const win = window as any;
      win.dataLayer = win.dataLayer || [];
      // Use standard arguments access for GTM/GA compatibility
      win.gtag = function() { win.dataLayer.push(arguments); };
      
      win.gtag('js', new Date());
      // Debug mode enabled for local dev visibility
      win.gtag('config', this.gaMeasurementId, { 
          send_page_view: false,
          debug_mode: true 
      });
      console.log('Google Analytics Initialized:', this.gaMeasurementId);
    } catch (e) {
      console.error('Failed to initialize Google Analytics', e);
    }
  }

  public getVisitorId(): string {
    let visitorId = localStorage.getItem(this.visitorIdKey);
    if (!visitorId) {
      visitorId = this.generateUUID();
      localStorage.setItem(this.visitorIdKey, visitorId);
    }
    return visitorId;
  }

  public generateUUID(): string {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
  }

  public setUserId(userId: number | null) {
      this.userId = userId;
      const win = window as any;
      if (win.gtag && userId) {
          win.gtag('set', 'user_properties', { user_id: userId }); // Setting user_id property
          win.gtag('config', this.gaMeasurementId, { 'user_id': userId });
      }
  }

  public trackPageView() {
      const url = window.location.href;
      const path = this.router.url;

      // 1. Internal Tracking
      const payload: any = {
          visitor_id: this.getVisitorId(),
          url: url,
          path: path
      };
      
      // Only include user_id if valid
      if (this.userId) {
          payload.user_id = this.userId;
      }

      this.http.post(`${Config.API_URL}/v1/analytics/track`, payload).subscribe({
          error: (err) => console.error('Internal analytics error', err)
      });

      // 2. Google Analytics Tracking
      const win = window as any;
      if (win.gtag) {
          win.gtag('event', 'page_view', {
              page_path: path,
              page_location: url,
              page_title: document.title
          });
      }
  }
}
