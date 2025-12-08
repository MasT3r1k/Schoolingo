import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { Config } from '@Schoolingo/config';

export type MeasureType = 'praise' | 'reprimand' | 'warning' | 'reduced_behavior' | 'other';

export interface EducationMeasure {
  id: number;
  type: MeasureType;
  reason: string;
  note?: string;
  date: Date;
  studentId: number;
  studentName?: string;
  issuedByName?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EducationMeasuresService {
  private http = inject(HttpClient);
  
  public measures = signal<EducationMeasure[]>([]);
  public loading = signal<boolean>(false);

  /**
   * Load education measures
   */
  loadMeasures(studentId?: number): Observable<EducationMeasure[]> {
    this.loading.set(true);
    const url = studentId 
      ? `${Config.API_URL}/v1/teach/measures?studentId=${studentId}`
      : `${Config.API_URL}/v1/teach/measures`;
    
    return this.http.get<{ measures: any[] }>(url, { withCredentials: true }).pipe(
      map(response => {
        const measures = response.measures.map(m => ({
          ...m,
          date: new Date(m.date)
        }));
        this.measures.set(measures);
        this.loading.set(false);
        return measures;
      }),
      catchError(() => {
        this.loading.set(false);
        return of([]);
      })
    );
  }

  /**
   * Create education measure (teacher only)
   */
  createMeasure(data: {
    studentId: number;
    type: MeasureType;
    reason: string;
    date: string;
    note?: string;
  }): Observable<{ measure_id: number; success: boolean }> {
    return this.http.post<{ measure_id: number; success: boolean }>(
      `${Config.API_URL}/v1/teach/measures`,
      data,
      { withCredentials: true }
    );
  }

  /**
   * Update education measure
   */
  updateMeasure(id: number, data: { reason?: string; note?: string }): Observable<{ success: boolean }> {
    return this.http.put<{ success: boolean }>(
      `${Config.API_URL}/v1/teach/measures/${id}`,
      data,
      { withCredentials: true }
    );
  }

  /**
   * Delete education measure (admin only)
   */
  deleteMeasure(id: number): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(
      `${Config.API_URL}/v1/teach/measures/${id}`,
      { withCredentials: true }
    );
  }

  /**
   * Get measure type label
   */
  getMeasureTypeLabel(type: MeasureType): string {
    const labels: Record<MeasureType, string> = {
      'praise': 'educationMeasures.type.praise',
      'reprimand': 'educationMeasures.type.reprimand',
      'warning': 'educationMeasures.type.warning',
      'reduced_behavior': 'educationMeasures.type.reducedBehavior',
      'other': 'educationMeasures.type.other'
    };
    return labels[type] || type;
  }

  /**
   * Get measure type color
   */
  getMeasureTypeColor(type: MeasureType): string {
    const colors: Record<MeasureType, string> = {
      'praise': 'var(--success)',
      'reprimand': 'var(--warning)',
      'warning': 'var(--danger)',
      'reduced_behavior': 'var(--danger)',
      'other': 'var(--text-muted)'
    };
    return colors[type] || 'var(--text-muted)';
  }
}
