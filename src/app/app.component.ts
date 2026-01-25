import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Config } from '@Schoolingo/config';
import { Authentication } from './infrastructure/authentication';
import { polyfillCountryFlagEmojis } from "country-flag-emoji-polyfill";
import { ModalComponent } from '@Components/modal';
import { CalendarManager } from '@Components/calendar-dropdown';
import { SeasonalService } from '@Schoolingo/seasonal';
import { SnowEffectComponent } from '@Components/seasonal/snow-effect/snow-effect.component';
import { SeasonalDecorationsComponent } from '@Components/seasonal/decorations/decorations.component';
import { School } from '@Schoolingo/school';
import { Locale } from '@Schoolingo/locale';
import { SystemErrorComponent } from "@Components/system-error/system-error.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ModalComponent, CalendarManager, SnowEffectComponent, SeasonalDecorationsComponent, SystemErrorComponent],
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
    });
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
