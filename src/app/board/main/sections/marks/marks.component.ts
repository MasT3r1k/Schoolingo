import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { Authentication } from '@Schoolingo/authentication';
import { Config } from '@Schoolingo/config';
import { Locale } from '@Schoolingo/locale';
import { IconsModule } from '@Schoolingo/icons';
import moment from 'moment';

@Component({
  imports: [IconsModule],
  templateUrl: './marks.component.html',
  styleUrl: './marks.component.css'
})
export class MarksComponent implements OnInit {
  private http = inject(HttpClient);
  public u = inject(Authentication);
  public l = inject(Locale);
  public marks: any[] = [];

  public loadMarks(): void {
    this.http.post(
      `${Config.API_URL}/v1/marks/student?limit=10`,
      { student_id: this.u.getId() },
      { withCredentials: true }
    )
    .subscribe((data) => {
      if ('marks' in data) {
        this.marks = data.marks as any[];
      }
    });
  }

  public formatMark(mark: number | string): string {
    const markStr = String(mark);
    if (markStr.includes('-')) return markStr.replace('-', '−');
    if (markStr.includes('+')) return markStr;
    return markStr;
  }

  public formatDate(date: string | Date): string {
    if (!date) return '';
    return moment(date).format('D. M.');
  }

  ngOnInit(): void {
    this.loadMarks();
    this.u.getAuthState()
    .subscribe((data) => {
      if (data) {
        this.loadMarks();
      }
    })
  }
}
