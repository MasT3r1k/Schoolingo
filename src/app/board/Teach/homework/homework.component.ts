import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { TabsComponent } from '@Components/Tabs';
import { Config } from '@Schoolingo/config';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { Utils } from '@Schoolingo/utils';
import { BehaviorSubject } from 'rxjs';

@Component({
  imports: [TabsComponent, IconsModule],
  templateUrl: './homework.component.html',
  styleUrl: './homework.component.css'
})
export class HomeworkComponent implements OnInit {
  private http = inject(HttpClient);
  public l = inject(Locale);
  public Utils = Utils;

  // Tabs
  public selectedTab = new BehaviorSubject(0);
  public options = ['homework.active', 'homework.all'];

  public homework: any[] = [];

  ngOnInit(): void {
    this.http.get<any[]>(
      `${Config.API_URL}/v1/homework`,
      { withCredentials: true }
    )
    .subscribe((data) => {
      this.homework = data
      console.log(data);
    })
  }
}
