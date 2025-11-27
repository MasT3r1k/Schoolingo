import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { Authentication } from '@Schoolingo/authentication';
import { Config } from '@Schoolingo/config';
import { IconsModule } from '@Schoolingo/icons';
import moment from 'moment';
import { BehaviorSubject } from 'rxjs';

@Component({
  imports: [IconsModule],
  templateUrl: './timetable.component.html',
  styleUrl: './timetable.component.css'
})
export class TimetableComponent implements OnInit {
  private http = inject(HttpClient);
  private u = inject(Authentication);
  public selected_date = new BehaviorSubject(moment());
  public timetable = [];

  public getSelectedDateLessons(): any[] {
    return this.timetable.filter((lesson: any) => lesson.day == this.selected_date.getValue().isoWeekday());
  }

  ngOnInit(): void {
    this.u.getAuthState().subscribe((data) => {
      if (data) {
        this.http.post(
          Config.API_URL + '/v1/timetable',
          {
            type: 'person',
            id: this.u.getUser().personId,
            time: this.selected_date.getValue().format("YYYY-MM-DD")
          },
          { withCredentials: true })
        .subscribe((data: any) => {
          if ('timetable' in data) {
            this.timetable = data.timetable;
          }
          console.log(data)
        });
      }
    })
  }
}
