import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { HttpClient, HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { School, SchoolInfo } from '@Schoolingo/School';
import { Locale } from '@Schoolingo/Locale';
import { Subscription } from 'rxjs';
import { Theme } from '@Schoolingo/Theme';
import { ErrorMain } from './Errors';
import { SchoolYear } from '@Schoolingo/School';
import { Config } from '@Schoolingo/Config';
import { polyfillCountryFlagEmojis } from "country-flag-emoji-polyfill";
import { IPManager } from '@Schoolingo/IPManager';
import { errorAPI } from '@Components/Datalist/Datalist';
import { UserService } from '@Schoolingo/User';
import moment from 'moment';


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
    public theme: Theme,
    public ipManager: IPManager,
    private userService: UserService,
    private router: Router
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

    this.ipManager.getIP('');

    this.http.get<SchoolInfo & { modules?: number }>(Config.API_URL + 'v1/getSchoolInfo', { withCredentials: true }).subscribe((data: (SchoolInfo & { modules?: number })): void => {
      this.school.setSchoolInfo(data, data.modules ?? 0);
      this.http.get<{ user: string } & errorAPI>(Config.API_URL + 'v1/getUser', { withCredentials: true }).subscribe((data: { user: string } & errorAPI) => {
        this.afterLoadedSchool = true;
        if ('user' in data) {
          this.userService.username = data.user;
          this.userService.setExpiration(moment().add(this.school.schoolInfo.loginExpires, 'ms'));
          if (this.router.url.startsWith('/login')) {
            this.router.navigate(['', 'main']);          
          }
        }
        if ('error' in data) {
          this.userService.username = null;
        }
      });
    }, this.httpError);

    
    this.http.get<SchoolYear>(Config.API_URL + 'v1/getSchoolYear', { withCredentials: true }).subscribe((data: SchoolYear): void => {
      this.school.setSchoolYear(data)
    }, this.httpError);
  }

  ngOnDestroy(): void {
    this.localeLanguageSubscribe.unsubscribe();
  }

}
