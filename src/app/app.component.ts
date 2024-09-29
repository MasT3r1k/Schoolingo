import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { School, SchoolInfo } from '@Schoolingo/School';
import * as config from '@Schoolingo/Config';
import { Locale } from '@Schoolingo/Locale';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HttpClientModule],
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  private localeLanguageSubscribe!: Subscription;
  public isLoaded: boolean = false;

  constructor(private http: HttpClient, private school: School, public locale: Locale) {}


  ngOnInit(): void {

    this.localeLanguageSubscribe = this.locale.language.subscribe(() => {
      this.isLoaded = true;
    });

    this.http.get<SchoolInfo>(config.api + 'v1/getSchoolInfo').subscribe((res: SchoolInfo): void => {
      this.school.getAPI(res);
    });
  }

  ngOnDestroy(): void {
    this.localeLanguageSubscribe.unsubscribe();
  }

}
