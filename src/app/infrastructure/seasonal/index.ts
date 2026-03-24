import { HttpClient } from '@angular/common/http';
import { inject, Injectable, Renderer2, RendererFactory2, OnDestroy } from '@angular/core';
import { Authentication } from '@Schoolingo/authentication';
import { Config } from '@Schoolingo/config';
import { BehaviorSubject, Subscription } from 'rxjs';

/**
 * Seasonal theme modes
 * - off: No seasonal effects
 * - subtle: Colors and badges only
 * - full: Colors, animations, and snow effects
 */
export type SeasonalMode = 'off' | 'subtle' | 'full';

/**
 * Available seasons with unique theming
 */
export type SeasonalSeason = 'christmas' | 'easter' | 'summer' | 'graduation' | 'none';

/**
 * Season configuration with date ranges
 */
export interface SeasonConfig {
  season: SeasonalSeason;
  startMonth: number;
  startDay: number;
  endMonth: number;
  endDay: number;
  cssClass: string;
}

/**
 * Admin-configurable seasonal settings
 */
export interface SeasonalAdminSettings {
  enabled: boolean;
  allowUserOverride: boolean;
  seasons: {
    christmas: { enabled: boolean; startDate: string; endDate: string };
    easter: { enabled: boolean; startDate: string; endDate: string };
    summer: { enabled: boolean; startDate: string; endDate: string };
    graduation: { enabled: boolean; startDate: string; endDate: string };
  };
}

/**
 * Default season configurations
 * Christmas: Dec 12 – Jan 6
 * Easter: 2 weeks before Easter Sunday
 * Summer: Jun 15 – Sep 1
 * Graduation: May 15 – Jun 15
 */
const DEFAULT_SEASONS: SeasonConfig[] = [
  // {
  //   season: 'christmas',
  //   startMonth: 12,
  //   startDay: 12,
  //   endMonth: 1,
  //   endDay: 6,
  //   cssClass: 'seasonal-christmas'
  // },
  // {
  //   season: 'summer',
  //   startMonth: 6,
  //   startDay: 15,
  //   endMonth: 9,
  //   endDay: 1,
  //   cssClass: 'seasonal-summer'
  // },
  // {
  //   season: 'graduation',
  //   startMonth: 5,
  //   startDay: 15,
  //   endMonth: 6,
  //   endDay: 15,
  //   cssClass: 'seasonal-graduation'
  // }
  // Easter is calculated dynamically based on year
];

// localStorage key for saving preference
const SEASONAL_STORAGE_KEY = 'schoolingo_seasonal_mode';

@Injectable({ providedIn: 'root' })
export class SeasonalService implements OnDestroy {
  private renderer: Renderer2;
  private auth = inject(Authentication);
  private http = inject(HttpClient);

  // Reactive state
  private mode = new BehaviorSubject<SeasonalMode>('full'); // Default to 'full' for auto-activation
  private season = new BehaviorSubject<SeasonalSeason>('none');
  private adminSettings = new BehaviorSubject<SeasonalAdminSettings | null>(null);

  // Accessibility
  private prefersReducedMotion = false;
  private motionMediaQuery: MediaQueryList;

  // Subscriptions
  private authSubscription: Subscription | null = null;

  // Saving state
  private saveAction: 'idle' | 'saving' | 'error' = 'idle';
  
  // Whether user has cookies consent (cookies=2 = full consent)
  private canUseLocalStorage = false;

  constructor(private rendererFactory: RendererFactory2) {
    this.renderer = this.rendererFactory.createRenderer(null, null);

    // Detect reduced motion preference
    this.motionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.prefersReducedMotion = this.motionMediaQuery.matches;
    this.motionMediaQuery.addEventListener('change', (e) => {
      this.prefersReducedMotion = e.matches;
      this.applySeasonalClasses();
    });

    // Detect current season
    this.detectSeason();

    // Load from localStorage if available (will be validated later with cookies check)
    this.loadFromLocalStorage();

    // Auto-activate if in active season
    const currentSeason = this.season.getValue();
    if (currentSeason !== 'none') {
      // Apply immediately for login page and other non-auth pages
      this.applySeasonalClasses();
    }

    // Load user preferences when authenticated
    this.authSubscription = this.auth.getAuthState().subscribe((state) => {
      if (state === true) {
        this.loadUserPreferences();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    this.renderer.destroy();
  }

  /**
   * Check if user has full cookie consent (cookies=2) and enable localStorage
   */
  public setCookiesConsent(cookies: number): void {
    this.canUseLocalStorage = cookies === 2;
    
    // If user just gave consent, save current mode to localStorage
    if (this.canUseLocalStorage) {
      this.saveToLocalStorage(this.mode.getValue());
    }
  }

  /**
   * Load mode from localStorage
   */
  private loadFromLocalStorage(): void {
    try {
      const stored = localStorage.getItem(SEASONAL_STORAGE_KEY);
      if (stored && (stored === 'off' || stored === 'subtle' || stored === 'full')) {
        this.mode.next(stored as SeasonalMode);
      }
    } catch {
      // localStorage not available
    }
  }

  /**
   * Save mode to localStorage (only if cookies consent is given)
   */
  private saveToLocalStorage(mode: SeasonalMode): void {
    if (!this.canUseLocalStorage) return;
    
    try {
      localStorage.setItem(SEASONAL_STORAGE_KEY, mode);
    } catch {
      // localStorage not available
    }
  }

  /**
   * Detect the current season based on date
   */
  private detectSeason(): void {
    // const now = new Date();
    // const month = now.getMonth() + 1; // 1-12
    // const day = now.getDate();

    // for (const config of DEFAULT_SEASONS) {
    //   if (this.isDateInRange(month, day, config)) {
    //     this.season.next(config.season);
    //     return;
    //   }
    // }

    // // Check for Easter (dynamic calculation)
    // if (this.isEasterSeason(now)) {
    //   this.season.next('easter');
    //   return;
    // }

    // this.season.next('none');
  }

  /**
   * Check if current date falls within a season's range
   */
  private isDateInRange(month: number, day: number, config: SeasonConfig): boolean {
    const { startMonth, startDay, endMonth, endDay } = config;

    // Handle year wrap (e.g., Dec 12 – Jan 6)
    if (startMonth > endMonth) {
      return (month > startMonth || (month === startMonth && day >= startDay)) ||
             (month < endMonth || (month === endMonth && day <= endDay));
    }

    // Normal range within same year
    if (month > startMonth && month < endMonth) return true;
    if (month === startMonth && day >= startDay) return true;
    if (month === endMonth && day <= endDay) return true;

    return false;
  }

  /**
   * Calculate if we're in Easter season (2 weeks before Easter Sunday)
   */
  private isEasterSeason(date: Date): boolean {
    const year = date.getFullYear();
    const easter = this.calculateEasterDate(year);
    const twoWeeksBefore = new Date(easter);
    twoWeeksBefore.setDate(easter.getDate() - 14);

    return date >= twoWeeksBefore && date <= easter;
  }

  /**
   * Calculate Easter Sunday using Computus algorithm
   */
  private calculateEasterDate(year: number): Date {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31);
    const day = ((h + l - 7 * m + 114) % 31) + 1;

    return new Date(year, month - 1, day);
  }

  /**
   * Load user preferences from server
   */
  private loadUserPreferences(): void {
    const user = this.auth.getUser();
    if (user && 'seasonalMode' in user) {
      const mode = user.seasonalMode as SeasonalMode;
      this.mode.next(mode);
      this.applySeasonalClasses();
    }
    // If no preference saved, keep the default 'full' mode
  }

  /**
   * Apply seasonal CSS classes to document
   */
  public applySeasonalClasses(): void {
    const html = document.documentElement;
    const currentMode = this.mode.getValue();
    const currentSeason = this.season.getValue();

    // Remove all seasonal classes first
    this.renderer.removeClass(html, 'seasonal-christmas');
    this.renderer.removeClass(html, 'seasonal-easter');
    this.renderer.removeClass(html, 'seasonal-summer');
    this.renderer.removeClass(html, 'seasonal-graduation');
    this.renderer.removeClass(html, 'seasonal-subtle');
    this.renderer.removeClass(html, 'seasonal-full');
    this.renderer.removeClass(html, 'seasonal-reduced-motion');

    if (currentMode === 'off' || currentSeason === 'none') {
      return;
    }

    // Add season-specific class
    this.renderer.addClass(html, `seasonal-${currentSeason}`);

    // Add mode class
    this.renderer.addClass(html, `seasonal-${currentMode}`);

    // Add reduced motion class if needed
    if (this.prefersReducedMotion) {
      this.renderer.addClass(html, 'seasonal-reduced-motion');
    }
  }

  /**
   * Initialize seasonal effects on app start (call from app.component or main)
   */
  public initialize(): void {
    this.applySeasonalClasses();
  }

  /**
   * Get current mode as observable
   */
  public getMode(): BehaviorSubject<SeasonalMode> {
    return this.mode;
  }

  /**
   * Get current mode value
   */
  public getModeValue(): SeasonalMode {
    return this.mode.getValue();
  }

  /**
   * Get current season as observable
   */
  public getSeason(): BehaviorSubject<SeasonalSeason> {
    return this.season;
  }

  /**
   * Get current season value
   */
  public getSeasonValue(): SeasonalSeason {
    return this.season.getValue();
  }

  /**
   * Check if seasonal theme is currently active
   */
  public isActive(): boolean {
    return this.mode.getValue() !== 'off' && this.season.getValue() !== 'none';
  }

  /**
   * Check if reduced motion is preferred
   */
  public hasReducedMotion(): boolean {
    return this.prefersReducedMotion;
  }

  /**
   * Set seasonal mode and save preference
   */
  public setMode(mode: SeasonalMode): void {
    this.mode.next(mode);
    this.applySeasonalClasses();
    this.savePreference(mode);
    this.saveToLocalStorage(mode);
  }

  /**
   * Toggle between modes: off → subtle → full → off
   */
  public toggleMode(): void {
    const current = this.mode.getValue();
    let next: SeasonalMode;

    switch (current) {
      case 'off':
        next = 'full';
        break;
      case 'full':
      default:
        next = 'off';
        break;
    }

    this.setMode(next);
  }

  /**
   * Quick toggle: on/off (uses full mode when turning on)
   */
  public quickToggle(): void {
    if (this.mode.getValue() === 'off') {
      this.setMode('full');
    } else {
      this.setMode('off');
    }
  }

  /**
   * Save user preference to server
   */
  private savePreference(mode: SeasonalMode): void {
    if (this.auth.getAuthStateValue() !== true) {
      return;
    }

    this.saveAction = 'saving';

    this.http
      .post(
        `${Config.API_URL}/v1/user/update`,
        {
          method: 'UPDATE_SEASONAL_MODE',
          seasonalMode: mode
        },
        { withCredentials: true }
      )
      .subscribe({
        next: (data: any) => {
          if ('status' in data && data.status === true) {
            this.saveAction = 'idle';
          } else if ('error' in data) {
            this.saveAction = 'error';
          }
        },
        error: () => {
          this.saveAction = 'error';
        }
      });
  }

  /**
   * Get save action state
   */
  public getSaveAction(): typeof this.saveAction {
    return this.saveAction;
  }

  /**
   * Get admin settings observable
   */
  public getAdminSettings(): BehaviorSubject<SeasonalAdminSettings | null> {
    return this.adminSettings;
  }

  /**
   * Load admin settings from server
   */
  public loadAdminSettings(): void {
    this.http
      .get<SeasonalAdminSettings>(`${Config.API_URL}/v1/admin/seasonal`, {
        withCredentials: true
      })
      .subscribe({
        next: (data) => {
          this.adminSettings.next(data);
        },
        error: () => {
          // Use defaults if API fails
          this.adminSettings.next({
            enabled: true,
            allowUserOverride: true,
            seasons: {
              christmas: { enabled: true, startDate: '12-12', endDate: '01-06' },
              easter: { enabled: true, startDate: 'auto', endDate: 'auto' },
              summer: { enabled: true, startDate: '06-15', endDate: '09-01' },
              graduation: { enabled: true, startDate: '05-15', endDate: '06-15' }
            }
          });
        }
      });
  }

  /**
   * Save admin settings to server
   */
  public saveAdminSettings(settings: SeasonalAdminSettings): void {
    this.http
      .post(`${Config.API_URL}/v1/admin/seasonal`, settings, {
        withCredentials: true
      })
      .subscribe({
        next: (data: any) => {
          if ('status' in data && data.status === true) {
            this.adminSettings.next(settings);
          }
        }
      });
  }
}
