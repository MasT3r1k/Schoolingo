import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HttpClient, HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { School, SchoolInfo } from '@Schoolingo/School';
import { Locale } from '@Schoolingo/Locale';
import { Subscription } from 'rxjs';
import { Theme } from '@Schoolingo/Theme';
import { ErrorMain } from './Errors';
import { SchoolYear } from '@Schoolingo/School';
import { Config } from '@Schoolingo/Config';
import { polyfillCountryFlagEmojis } from "country-flag-emoji-polyfill";


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HttpClientModule, ErrorMain],
  templateUrl: './app.component.html',
  styleUrls: ['Styles/app.css']
})
export class AppComponent implements OnInit {
  private localeLanguageSubscribe!: Subscription;

  constructor(
    private http: HttpClient,
    public school: School,
    public locale: Locale,
    public theme: Theme
    ) {}

  public afterLoadedSchool = false;

  public httpError = (err: HttpErrorResponse) => {
    console.log(err);
    if (err.ok === false) {
      switch(err.status) {
        case 0:
          this.school.errorReason = 1001;
          break;
        case 404:
          this.school.errorReason = 1003;
          break;
      }

    }

    this.afterLoadedSchool = true;
  }

  ngOnInit(): void {
    polyfillCountryFlagEmojis();


    this.http.get<SchoolInfo>(Config.API_URL + 'v1/getSchoolInfo', { withCredentials: true }).subscribe((data: (SchoolInfo & { modules?: number })): void => {
      this.school.setSchoolInfo(data, data.modules ?? 0);
      this.afterLoadedSchool = true;
    }, this.httpError);

    
    this.http.get<SchoolYear>(Config.API_URL + 'v1/getSchoolYear', { withCredentials: true }).subscribe((data: SchoolYear): void => {
      this.school.setSchoolYear(data)
    }, this.httpError);
  }

  ngOnDestroy(): void {
    this.localeLanguageSubscribe.unsubscribe();
  }

}
