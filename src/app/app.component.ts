import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { School, SchoolInfo } from '@Schoolingo/School';
import * as config from '@Schoolingo/Config';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HttpClientModule],
  templateUrl: './app.component.html'
})
export class AppComponent {
  constructor(private http: HttpClient, private school: School) {
    http.get<SchoolInfo>(config.api + 'v1/getSchoolInfo').subscribe((res: SchoolInfo): void => {
      school.getAPI(res);
    });
  }

}
