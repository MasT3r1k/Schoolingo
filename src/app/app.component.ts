import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { School, SchoolInfo } from '@Schoolingo/School';
import * as config from '@Schoolingo/Config';
import { languages, Locale } from '@Schoolingo/Locale';
import { Subscription } from 'rxjs';
import { Theme } from '@Schoolingo/Theme';

type loadingStates = 'language' | 'school';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HttpClientModule],
  templateUrl: './app.component.html',
  styleUrls: ['Styles/app.css']
})
export class AppComponent implements OnInit {
  private localeLanguageSubscribe!: Subscription;

  constructor(
    private http: HttpClient,
    private school: School,
    public locale: Locale,
    private theme: Theme
  ) {}

  public loadedState: loadingStates[] = [];

  public isBackendWorking: boolean = true;


  ngOnInit(): void {

    this.locale.language.subscribe((lng: languages) => {
      if (lng !== "null") {
        if (!this.loadedState.includes("language")) {
          this.loadedState.push('language');
        }
      }
    });
    this.http.post<SchoolInfo>(config.api + 'v1/getSchoolInfo', { domain: window.location.host }).subscribe((res: SchoolInfo): void => {
      this.school.getAPI(res);
      if (!this.loadedState.includes("school")) {
        this.loadedState.push('school');

      }
    }, (err: string) => {
      this.isBackendWorking = false;
    });
  }

  ngOnDestroy(): void {
    this.localeLanguageSubscribe.unsubscribe();
  }

}
