import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HttpClient, HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { School, SchoolInfo } from '@Schoolingo/School';
import * as config from '@Schoolingo/Config';
import { Locale } from '@Schoolingo/Locale';
import { Subscription } from 'rxjs';
import { Theme } from '@Schoolingo/Theme';
import { ErrorMain } from './Errors';

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

  public afterLoadedSchool: boolean = false;

  ngOnInit(): void {


    this.http.get<SchoolInfo>(config.api + 'v1/getSchoolInfo').subscribe((res: SchoolInfo): void => {
      this.school.getAPI(res);
      this.afterLoadedSchool = true;
    }, (err: HttpErrorResponse) => {
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
    });
  }

  ngOnDestroy(): void {
    this.localeLanguageSubscribe.unsubscribe();
  }

}
