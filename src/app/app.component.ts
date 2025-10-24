import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Authentication } from './infrastructure/authentication';
import { polyfillCountryFlagEmojis } from "country-flag-emoji-polyfill";
import { ModalComponent } from '@Components/modal';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ModalComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  public appState: boolean | null = null;

  public auth = inject(Authentication);
  ngOnInit(): void {
    // Enable flags Windows 11
    polyfillCountryFlagEmojis();

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
