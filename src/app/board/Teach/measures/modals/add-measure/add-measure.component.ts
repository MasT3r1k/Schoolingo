import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EducationMeasuresService, EducationMeasure, MeasureType, MeasureCategory, MeasureSeverity } from '../../../../../infrastructure/measures/education-measures.service';
import { IconsModule } from '@Schoolingo/icons';
import { ModalManager } from '@Schoolingo/modal';
import { DropdownManager } from '@Schoolingo/dropdown';
import { HttpClient } from '@angular/common/http';
import { Config } from '@Schoolingo/config';
import { debounceTime, distinctUntilChanged } from 'rxjs';

export interface StudentSearchDataAPI {
  personId: number;
  firstName: string;
  lastName: string;
  fullName: string;
  className: string;
  year: number;
}

export interface SearchMetaAPI {
  limit: number;
  page: number;
  total: number;
}

export interface StudentSearchAPI {
  data: StudentSearchDataAPI[];
  meta: SearchMetaAPI;
}

export interface StudentBehaveAPI {
  mark: number;
  allow_add: boolean;
}

@Component({
  imports: [FormsModule, ReactiveFormsModule, IconsModule],
  templateUrl: './add-measure.component.html',
  styleUrl: './add-measure.component.css'
})
export class AddMeasureComponent implements OnInit {
  private modalManager = inject(ModalManager);
  private measuresService = inject(EducationMeasuresService);
  public dropdownManager = inject(DropdownManager);
  private http = inject(HttpClient);

  public measureTypes: MeasureType[] = ['praise', 'reprimand', 'warning', 'reduced_behavior', 'other'];
  public measureCategories: MeasureCategory[] = ['positive', 'negative'];
  public measureSeverities: MeasureSeverity[] = ['low', 'medium', 'high'];
  public students: StudentSearchDataAPI[] = [];
  public selected_student: StudentSearchDataAPI | null = null;
  public student_behave: StudentBehaveAPI = { mark: -1, allow_add: false };
  public filters = {
    search: new FormControl(),
    loading: false,
    loading_details: true
  };

  ngOnInit(): void {
    this.http.post<StudentSearchAPI>(
      `${Config.API_URL}/v1/students/search`,
      { limit: 10, search: '', status: 'active' },
      { withCredentials: true }
    )
    .subscribe((data) => {
      this.students = data.data;
      console.log(data)
    })

    this.filters.search.valueChanges
    .pipe(distinctUntilChanged())
    .pipe(debounceTime(500))
    .subscribe((data) => {
      this.filters.loading = true;
      this.http.post<StudentSearchAPI>(
        `${Config.API_URL}/v1/students/search`,
        { limit: 10, search: data, status: 'active' },
        { withCredentials: true }
      )
      .subscribe((data) => {
        this.students = data.data;
      }, (err) => {}, () => this.filters.loading = false);
    })
  }

  public getTypeLabel(type: MeasureType | 'all'): string {
    const labels: Record<MeasureType | 'all', string> = {
      'all': 'Všechny',
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
      'praise': 'thumb-up',
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

  public getTypeColor(type: MeasureType): string {
    const icons: Record<MeasureType, string> = {
      'praise': '#22c55e',
      'reprimand': '#f97316',
      'warning': '#eab308',
      'reduced_behavior': '#ef4444',
      'other': '#64748b'
    };
    return icons[type] || '#64748b';
  }

  public getCategoryLabel(type: MeasureCategory): string {
    const labels: Record<MeasureCategory, string> = {
      'positive': 'Pozitivní',
      'negative': 'Negativní'
    };
    return labels[type] || type;
  }

  public getCategoryIcon(type: MeasureCategory): string {
    const icons: Record<MeasureCategory, string> = {
      'positive': 'thumb-up',
      'negative': 'thumb-down'
    };
    return icons[type] || type;
  }

  public getCategoryColor(type: MeasureCategory): string {
    const icons: Record<MeasureCategory, string> = {
      'positive': '#22c55e',
      'negative': '#ef4444'
    };
    return icons[type] || '#64748b';
  }

  public getSeverityLabel(type: MeasureSeverity): string {
    const labels: Record<MeasureSeverity, string> = {
      'low': 'Nízká závažnost',
      'medium': 'Střední závažnost',
      'high': 'Vysoká závažnost',
    };
    return labels[type] || type;
  }

  public getSeverityIcon(type: MeasureSeverity): string {
    return 'circle-filled';
  }

  public getSeverityColor(type: MeasureSeverity): string {
    const icons: Record<MeasureSeverity, string> = {
      'low': '#22c55e',
      'medium': '#eab308',
      'high': '#ef4444',
    };
    return icons[type] || '#64748b';
  }

  public closeModal(): void {
    this.modalManager.closeModal('add_education_measure');
  }

  public loadBehaveMark(): void {
    this.filters.loading_details = true;
    if (!this.selected_student || this.newMeasure.type != "reduced_behavior") return;
    this.http.get<StudentBehaveAPI>(
      `${Config.API_URL}/v1/measure/student?id=${this.selected_student!.personId}`,
      { withCredentials: true }
    )
    .subscribe(
      (data) => {
        this.student_behave = data;
        this.filters.loading_details = false;
      },
      (err) => {},
      () => { this.filters.loading_details = false }
    );
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
          this.closeModal();
        }
      }
    });
  }

  public newMeasure = {
    studentId: 0,
    type: 'praise' as MeasureType,
    category: 'positive' as MeasureCategory,
    severity: 'low' as MeasureSeverity,
    reason: '',
    date: new Date().toISOString().split('T')[0],
    note: ''
  };
}
