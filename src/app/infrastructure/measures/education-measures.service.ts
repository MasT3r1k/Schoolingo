import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { Config } from '@Schoolingo/config';

export type MeasureType = 'praise' | 'reprimand' | 'warning' | 'reduced_behavior' | 'other';
export type MeasureCategory = 'positive' | 'negative';
export type MeasureSeverity = 'low' | 'medium' | 'high';
export type MeasureStatus = 'draft' | 'approved' | 'cancelled';

export interface EducationMeasure {
  id: number;
  type: MeasureType;
  category: MeasureCategory;
  severity: MeasureSeverity;
  reason: string;
  description: string | null;
  issued_by: number;
  issued_at: Date;
  student_id: number;
  informed_parents: boolean;
  status: MeasureStatus;
  student_name: string;
  issued_by_name: string;
}

export interface MeasureTypeItem {
  id: number | string;
  order: number;
  shortcut: string;
  label_1st: string;
  label_4th: string;
}

@Injectable({
  providedIn: 'root'
})
export class EducationMeasuresService {
  private http = inject(HttpClient);
  
  public measures = signal<EducationMeasure[]>([]);
  public measureTypes = signal<MeasureTypeItem[]>([]);
  public loading = signal<boolean>(false);

  /**
   * Load education measures
   */
  loadMeasures(studentId?: number): Observable<EducationMeasure[]> {
    this.loading.set(true);
    const url = studentId 
      ? `${Config.API_URL}/v1/measures?studentId=${studentId}`
      : `${Config.API_URL}/v1/measures`;
    
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
   * Load measure types
   */
  loadMeasureTypes(): Observable<MeasureTypeItem[]> {
    return this.http.get<{ types: any[] }>(`${Config.API_URL}/v1/measure/types`, { withCredentials: true }).pipe(
      map(response => {
        const types = response.types.map(t => ({
          id: t.emt_id,
          order: t.order,
          shortcut: t.shortcut,
          label_1st: t.label_1st,
          label_4th: t.label_4th
        }));
        this.measureTypes.set(types);
        return types;
      }),
      catchError(() => {
        // Fallback to mock data if API fails (mocking based on user image)
        const mockTypes: MeasureTypeItem[] = [
          { id: 'Vy', order: 0, shortcut: 'Vy', label_1st: 'vyloučení ze studia', label_4th: 'vyloučení ze studia' },
          { id: 'pOV', order: 0, shortcut: 'pOV', label_1st: 'pochvala učitele OV', label_4th: 'pochvalu učitele OV' },
          { id: 'nOV', order: 0, shortcut: 'nOV', label_1st: 'napomenutí učitele OV', label_4th: 'napomenutí učitele OV' },
          { id: 'dOV', order: 0, shortcut: 'dOV', label_1st: 'důtka učitele OV', label_4th: 'důtku učitele OV' },
          { id: 'dŘŠ', order: 1, shortcut: 'dŘŠ', label_1st: 'důtka ředitele školy', label_4th: 'důtku ředitele školy' },
          { id: 'pŘŠ', order: 2, shortcut: 'pŘŠ', label_1st: 'pochvala ředitele školy', label_4th: 'pochvalu ředitele školy' },
          { id: 'dTU', order: 3, shortcut: 'dTU', label_1st: 'důtka třídního učitele', label_4th: 'důtku třídního učitele' },
          { id: 'pTU', order: 4, shortcut: 'pTU', label_1st: 'pochvala třídního učitele', label_4th: 'pochvalu třídního učitele' },
          { id: 'nTU', order: 5, shortcut: 'nTU', label_1st: 'napomenutí třídního učitele', label_4th: 'napomenutí třídního učitele' },
          { id: '2', order: 6, shortcut: '2', label_1st: '2 z chování', label_4th: '2 z chování' },
          { id: '3', order: 7, shortcut: '3', label_1st: '3 z chování', label_4th: '3 z chování' }
        ];
        this.measureTypes.set(mockTypes);
        return of(mockTypes);
      })
    );
  }

  /**
   * Save measure type
   */
  saveMeasureType(type: Omit<MeasureTypeItem, 'id'>): Observable<any> {
    return this.http.post<{ emt_id: number; success: boolean }>(
      `${Config.API_URL}/v1/measure/types`,
      type,
      { withCredentials: true }
    );
  }

  /**
   * Delete measure type
   */
  deleteMeasureType(id: number): Observable<any> {
    return this.http.delete<{ success: boolean }>(
      `${Config.API_URL}/v1/measure/types/${id}`,
      { withCredentials: true }
    );
  }

  /**
   * Update measure type
   */
  updateMeasureType(id: number | string, data: Partial<MeasureTypeItem>): Observable<any> {
    return this.http.put<{ success: boolean }>(
      `${Config.API_URL}/v1/measure/types/${id}`,
      data,
      { withCredentials: true }
    );
  }

  /**
   * Create education measure (teacher only)
   */
  createMeasure(data: {
    studentId: number;
    type: MeasureType | string;
    reason: string;
    date: string;
    note?: string;
  }): Observable<{ measure_id: number; success: boolean }> {
    return this.http.post<{ measure_id: number; success: boolean }>(
      `${Config.API_URL}/v1/measures`,
      data,
      { withCredentials: true }
    );
  }

  /**
   * Update education measure
   */
  updateMeasure(id: number, data: { reason?: string; note?: string }): Observable<{ success: boolean }> {
    return this.http.put<{ success: boolean }>(
      `${Config.API_URL}/v1/measures/${id}`,
      data,
      { withCredentials: true }
    );
  }

  /**
   * Delete education measure (admin only)
   */
  deleteMeasure(id: number): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(
      `${Config.API_URL}/v1/measures/${id}`,
      { withCredentials: true }
    );
  }

  public templates = signal<{ id: number; title: string; content: string }[]>([]);

  /**
   * Load measure templates
   */
  loadTemplates(): Observable<any[]> {
    // Mocking for now as requested by UI mockup, normally this would be an API call
    const mockTemplates = [
      { id: 1, title: 'DŮTKA ŘŠ', content: 'Dne dd.mm.202r byla udělena důtka ředitele školy za ...' },
      { id: 2, title: 'DŮTKA TU', content: 'Dne dd.mm.202r byla udělena důtka třídního učitele za ...' },
      { id: 3, title: 'NAPOM.TU', content: 'Dne dd.mm.202r bylo uděleno napomenutí třídního učitele za .....' },
      { id: 4, title: 'PODM. VYL.', content: 'Dne dd.mm.202r byl podmínečně vyloučen ze studia do dd.mm.202r za ...' },
      { id: 5, title: 'POCHV. ŘŠ', content: 'Dne dd.mm.202r byla udělena pochvala ředitele školy za ...' },
      { id: 6, title: 'POCHV. TU', content: 'Dne dd.mm.202r byla udělena pochvala třídního učitele za ...' }
    ];
    this.templates.set(mockTemplates);
    return of(mockTemplates);
  }

  /**
   * Add a new template
   */
  addTemplate(template: { title: string; content: string }): Observable<any> {
    const newTemplate = { ...template, id: Math.max(...this.templates().map(t => t.id), 0) + 1 };
    this.templates.update(current => [...current, newTemplate]);
    return of(newTemplate);
  }

  /**
   * Delete a template
   */
  deleteTemplate(id: number): Observable<any> {
    this.templates.update(current => current.filter(t => t.id !== id));
    return of({ success: true });
  }

  /**
   * Update an existing template
   */
  updateTemplate(id: number, template: { title: string; content: string }): Observable<any> {
    this.templates.update(current => 
      current.map(t => t.id === id ? { ...t, ...template } : t)
    );
    return of({ success: true });
  }

  /**
   * Get measure type label
   */
  getMeasureTypeLabel(type: MeasureType | string): string {
    const defaultLabels: Record<string, string> = {
      'praise': 'educationMeasures.type.praise',
      'reprimand': 'educationMeasures.type.reprimand',
      'warning': 'educationMeasures.type.warning',
      'reduced_behavior': 'educationMeasures.type.reducedBehavior',
      'other': 'educationMeasures.type.other'
    };

    const dynamicType = this.measureTypes().find(t => t.id == type);
    if (dynamicType) return dynamicType.label_1st;

    return defaultLabels[type] || type;
  }

  /**
   * Get measure type color
   */
  getMeasureTypeColor(type: MeasureType | string): string {
    const colors: Record<string, string> = {
      'praise': 'var(--success)',
      'reprimand': 'var(--warning)',
      'warning': 'var(--danger)',
      'reduced_behavior': 'var(--danger)',
      'other': 'var(--text-muted)'
    };
    return colors[type] || 'var(--text-muted)';
  }
}
