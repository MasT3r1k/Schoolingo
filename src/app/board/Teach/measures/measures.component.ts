import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { Permission } from '@Schoolingo/permission';
import { EducationMeasuresService, EducationMeasure, MeasureType } from '../../../infrastructure/measures/education-measures.service';
import moment from 'moment';

@Component({
  selector: 'app-measures',
  standalone: true,
  imports: [FormsModule, IconsModule],
  templateUrl: './measures.component.html',
  styleUrls: ['./measures.component.css']
})
export class MeasuresComponent implements OnInit {
  public l = inject(Locale);
  public perm = inject(Permission);
  public measuresService = inject(EducationMeasuresService);

  public measures: EducationMeasure[] = [];
  public loading = true;
  public showCreateForm = false;
  public filterType: MeasureType | 'all' = 'all';

  public measureTypes: MeasureType[] = ['praise', 'reprimand', 'warning', 'reduced_behavior', 'other'];

  // Form fields
  public newMeasure = {
    studentId: 0,
    type: 'praise' as MeasureType,
    reason: '',
    date: new Date().toISOString().split('T')[0],
    note: ''
  };

  ngOnInit(): void {
    this.loadMeasures();
  }

  private loadMeasures(): void {
    this.loading = true;
    this.measuresService.loadMeasures().subscribe({
      next: (data) => {
        this.measures = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  public createMeasure(): void {
    if (!this.newMeasure.reason || !this.newMeasure.studentId) return;

    this.measuresService.createMeasure({
      studentId: this.newMeasure.studentId,
      type: this.newMeasure.type,
      reason: this.newMeasure.reason,
      date: this.newMeasure.date,
      note: this.newMeasure.note
    }).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadMeasures();
          this.resetForm();
        }
      }
    });
  }

  public deleteMeasure(measure: EducationMeasure): void {
    if (!confirm('Opravdu chcete smazat toto opatření?')) return;

    this.measuresService.deleteMeasure(measure.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.measures = this.measures.filter(m => m.id !== measure.id);
        }
      }
    });
  }

  public formatDate(date: Date): string {
    return moment(date).format('D. M. YYYY');
  }

  public getTypeLabel(type: MeasureType): string {
    const labels: Record<MeasureType, string> = {
      'praise': 'Pochvala',
      'reprimand': 'Důtka',
      'warning': 'Napomenutí',
      'reduced_behavior': 'Snížená známka z chování',
      'other': 'Jiné'
    };
    return labels[type] || type;
  }

  public getTypeIcon(type: MeasureType): string {
    const icons: Record<MeasureType, string> = {
      'praise': 'star',
      'reprimand': 'alert-triangle',
      'warning': 'alert-circle',
      'reduced_behavior': 'mood-sad',
      'other': 'file-text'
    };
    return icons[type] || 'file-text';
  }

  public getTypeClass(type: MeasureType): string {
    if (type === 'praise') return 'positive';
    if (type === 'reprimand' || type === 'warning' || type === 'reduced_behavior') return 'negative';
    return 'neutral';
  }

  public get filteredMeasures(): EducationMeasure[] {
    if (this.filterType === 'all') return this.measures;
    return this.measures.filter(m => m.type === this.filterType);
  }

  public get praiseCount(): number {
    return this.measures.filter(m => m.type === 'praise').length;
  }

  public get otherCount(): number {
    return this.measures.filter(m => m.type !== 'praise').length;
  }

  private resetForm(): void {
    this.newMeasure = {
      studentId: 0,
      type: 'praise',
      reason: '',
      date: new Date().toISOString().split('T')[0],
      note: ''
    };
    this.showCreateForm = false;
  }

  public toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
  }
}

