import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { Authentication } from '@Schoolingo/authentication';
import { Config } from '@Schoolingo/config';

@Component({
  imports: [],
  templateUrl: './marks.component.html',
  styleUrl: './marks.component.css'
})
export class MarksComponent implements OnInit {
  private http = inject(HttpClient);
  public u = inject(Authentication);
  public marks: any[] = [];

  public loadMarks(): void {
    this.http.post(
      `${Config.API_URL}/v1/marks/student?limit10`,
      { student_id: this.u.getId() },
      { withCredentials: true }
    )
    .subscribe((data) => {
      if ('marks' in data) {
        this.marks = data.marks as any[];
      }
    });
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
