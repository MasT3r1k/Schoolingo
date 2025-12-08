import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Config } from '@Schoolingo/config';
import { Authentication } from './infrastructure/authentication';
import { polyfillCountryFlagEmojis } from "country-flag-emoji-polyfill";
import { ModalComponent } from '@Components/modal';
import { CalendarManager } from '@Components/calendar-dropdown';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ModalComponent, CalendarManager],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  public appState: boolean | null = null;
  private http = inject(HttpClient);

  public auth = inject(Authentication);
  ngOnInit(): void {
    // Enable flags Windows 11
    polyfillCountryFlagEmojis();

    this.http.get<any>(`${Config.API_URL}/v1/version`).subscribe((data) => {
      if (data.version) {
        Config.APP_VERSION = data.version;
      }
    });

    this.auth.getAuthState()
    .subscribe((data) => {
      if (data == "offline") {
        this.appState = false;
      } else {
        this.appState = true;
      }
    });
  }

}
