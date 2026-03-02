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
  template: `
<div class="mark-detail-container" *ngIf="mark">
    <div class="mark-detail-row">
        <span class="label">{{ l.s('marks.subject') }}</span>
        <span class="value">{{ mark.subject_name }}</span>
    </div>
    <div class="mark-detail-row">
        <span class="label">{{ l.s('marks.topic') }}</span>
        <span class="value">{{ mark.topic }}</span>
    </div>
    <div class="mark-detail-row">
        <span class="label">{{ l.s('marks.mark') }}</span>
        <span class="value mark-value" [class]="'mark-color-' + getBaseMark(mark)">
            {{ formatMark(mark) }}
        </span>
    </div>
    <div class="mark-detail-row">
        <span class="label">{{ l.s('marks.weight') }}</span>
        <span class="value">{{ mark.weight }}</span>
    </div>
    @if (mark.type === 1) {
    <div class="mark-detail-row">
        <span class="label">{{ l.s('marks.points') }}</span>
        <span class="value">{{ mark.mark }} / {{ mark.max_points }}</span>
    </div>
    }
    <div class="mark-detail-row">
        <span class="label">{{ l.s('date') }}</span>
        <span class="value">{{ Utils.formatDateShort(mark.created) }}</span>
    </div>
    @if (mark.teacher_full_name || (mark.teacher_first_name && mark.teacher_last_name)) {
    <div class="mark-detail-row">
        <span class="label">{{ l.s('roles.teacher') }}</span>
        <span class="value">{{ mark.teacher_full_name || (mark.teacher_first_name + ' ' + mark.teacher_last_name) }}</span>
    </div>
    }
    @if (mark.column_id && markStats?.[mark.column_id]) {
    <div class="mark-detail-row">
        <span class="label">{{ l.s('marks.class_average') }}</span>
        <span class="value">{{ markStats[mark.column_id].avg }}</span>
    </div>
    <div class="mark-detail-row">
        <span class="label">{{ l.s('marks.class_rank') }}</span>
        <span class="value">{{ markStats[mark.column_id].rank }}</span>
    </div>
    }
</div>
  `,
  styles: [`
.mark-detail-container {
    display: flex;
    flex-direction: column;
    background-color: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    overflow: hidden;
}

.mark-detail-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    transition: var(--transition-fast);
}

.mark-detail-row:not(:last-child) {
    border-bottom: 1px solid var(--border);
}

.mark-detail-row:hover {
    background-color: var(--surface-3);
}

.mark-detail-row .label {
    font-size: var(--text-sm);
    color: var(--text-muted);
    font-weight: 500;
}

.mark-detail-row .value {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--text);
}

.mark-value {
    padding: 2px 8px;
    border-radius: 4px;
    font-weight: 700;
}
  `]
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

  public closeModal(): void {
    this.modalManager.closeModal('mark_detail');
  }
}
