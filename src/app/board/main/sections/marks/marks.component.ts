import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { Authentication } from '@Schoolingo/authentication';
import { Config } from '@Schoolingo/config';
import { Locale } from '@Schoolingo/locale';
import { IconsModule } from '@Schoolingo/icons';
import { MarksManager } from '@Schoolingo/marks';
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
  private marksManager = inject(MarksManager);
  public marks: any[] = [];
  public marking_scales: Record<string, number[]> = {};

  public loadMarks(): void {
    this.http.post(
      `${Config.API_URL}/v1/marks/student?limit=10`,
      { student_id: this.u.getId() },
      { withCredentials: true }
    )
    .subscribe((data: any) => {
      if ('marks' in data) {
        this.marks = data.marks as any[];
      }
      if ('marking_scales' in data) {
        this.marking_scales = data.marking_scales;
      }
    });
  }

  public getPointGrade(pointsRaw: string | number | null, maxPoints: number, overrideScale?: number[]): number {
    if (pointsRaw === null || pointsRaw === undefined) return 0;
    const pointsStr = String(pointsRaw);
    const points = parseFloat(pointsStr.replace(',', '.'));
    if (isNaN(points)) return 0;
    if (maxPoints <= 0) return 1;
    const percentage = (points / maxPoints) * 100;
    
    const scale = overrideScale || [85, 70, 50, 30, 0];
    if (scale && scale.length >= 4) {
      for (let i = 0; i < 4; i++) {
        if (percentage >= scale[i]) return i + 1;
      }
      return 5;
    }
    return 5;
  }

  public getNumericalGrade(mark: any): number {
    if (!mark) return 0;
    let type = typeof mark === 'object' ? mark.type : 0;
    let markNum = typeof mark === 'object' ? mark.mark : mark;

    if (type === 1) { // Points
      const scale = this.marking_scales[`${mark.subject_id}_${mark.group_id}`];
      return this.getPointGrade(markNum, mark.max_points || 1, scale);
    }
    
    let mark_id = typeof markNum === 'string' ? parseInt(markNum) : markNum;
    if (mark_id > 100) mark_id = Math.floor(mark_id / 100);
    return mark_id;
  }

  public formatMark(mark: any): string {
    if (!mark) return "";
    let mark_id: number;
    let type = typeof mark === 'object' ? mark.type : 0;
    let markNum = typeof mark === 'object' ? mark.mark : mark;

    if (type === 1) { // Points
      const scale = this.marking_scales[`${mark.subject_id}_${mark.group_id}`];
      return this.getPointGrade(markNum, mark.max_points || 1, scale).toString();
    }
    
    mark_id = typeof markNum === 'string' ? parseInt(markNum) : markNum;

    const config = this.marksManager.getConfig();
    if (config) {
      let idIndex = config.mark_ids.findIndex((m: number) => m == mark_id);
      let displayMark = config.mark_display[idIndex];
      if (displayMark) {
        if (displayMark.includes('-')) return displayMark.replace('-', '−');
        return displayMark;
      }
    }
    
    const markStr = String(mark_id);
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
