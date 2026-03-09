import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@Schoolingo/icons';
import { ModalManager } from '@Schoolingo/modal';
import { Locale } from '@Schoolingo/locale';
import { Utils } from '@Schoolingo/utils';
import { MarksManager } from '@Schoolingo/marks';

@Component({
  selector: 'app-mark-detail-modal',
  standalone: true,
  imports: [CommonModule, IconsModule],
  templateUrl: './mark-detail-modal.component.html',
  styleUrls: ['./mark-detail-modal.component.css']
})
export class MarkDetailModalComponent implements OnInit {
  public modalManager = inject(ModalManager);
  public l = inject(Locale);
  public Utils = Utils;
  public marksManager = inject(MarksManager);

  public data: any;

  // Convenience getters
  get mark() { return this.data?.selectedMark; }
  get markStats() { return this.data?.markStats; }

  ngOnInit(): void {
    this.data = this.modalManager.getModalData('mark_detail');
  }

  public getPointGrade(pointsRaw: string | number | null, maxPoints: number, overrideScale?: number[]): number {
    if (pointsRaw === null || pointsRaw === undefined) return 0;
    const pointsStr = String(pointsRaw);
    const points = parseFloat(pointsStr.replace(',', '.'));
    if (isNaN(points)) return 0;
    if (maxPoints <= 0) return 1;
    const percentage = (points / maxPoints) * 100;
    
    // Check marking_scales from data if not provided via overrideScale
    const scale = overrideScale || this.data?.marking_scale || [85, 70, 50, 30, 0];
    if (scale && scale.length >= 4) {
      for (let i = 0; i < 4; i++) {
        if (percentage >= scale[i]) return i + 1;
      }
      return 5;
    }
    if (percentage >= 85) return 1;
    if (percentage >= 70) return 2;
    if (percentage >= 50) return 3;
    if (percentage >= 30) return 4;
    return 5;
  }

  public getBaseMark(mark: any): number {
    if (!mark) return 0;
    let mark_id: number;
    let type = typeof mark === 'object' ? mark.type : 0;
    let markNum = typeof mark === 'object' ? mark.mark : mark;

    if (type === 1) { // Points
      const scale = this.data?.marking_scales?.[`${mark.subject_id}_${mark.group_id}`] || this.data?.marking_scale;
      return this.getPointGrade(markNum, mark.max_points || 1, scale);
    }
    
    mark_id = markNum;
    if (mark_id > 100) mark_id = Math.floor(mark_id / 100);
    if (mark_id > 5) return 0;
    return mark_id;
  }

  public formatMark(mark: any): string {
    if (!mark) return "";
    let mark_id: number;
    let type = typeof mark === 'object' ? mark.type : 0;
    let markNum = typeof mark === 'object' ? mark.mark : mark;

    if (type === 1) {
      const scale = this.data?.marking_scales?.[`${mark.subject_id}_${mark.group_id}`] || this.data?.marking_scale;
      return this.getPointGrade(markNum, mark.max_points || 1, scale).toString();
    }
    
    mark_id = markNum;

    const config = this.marksManager.getConfig();
    let idIndex = config.mark_ids.findIndex((m: number) => m == mark_id);
    let displayMark = config.mark_display[idIndex];
    if (displayMark) return displayMark;
    return mark_id.toString();
  }

  public getGradeClass(grade: any): string {
    if (grade === null || grade === '-') return '';
    const g = typeof grade === 'number' ? grade : parseInt(grade);
    if (isNaN(g)) return '';
    if (g === 1) return 'grade--success';
    if (g >= 4) return 'grade--danger';
    if (g === 3) return 'grade--warning';
    return 'grade--primary';
  }

  public closeModal(): void {
    this.modalManager.closeModal('mark_detail');
  }
}
