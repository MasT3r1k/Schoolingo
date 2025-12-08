import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { Config } from '@Schoolingo/config';

export interface Substitution {
  substitution_id: number;
  date: string;
  hour: number;
  type: 'cancelled' | 'substitution' | 'room_change' | 'other';
  note?: string;
  className?: string;
  subjectName?: string;
  originalTeacher?: string;
  substituteTeacher?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SubstitutionService {
  private http = inject(HttpClient);
  
  public substitutions = signal<Substitution[]>([]);
  public loading = signal<boolean>(false);
  public currentDate = signal<string>(new Date().toISOString().split('T')[0]);

  /**
   * Load substitutions for a specific date
   */
  loadSubstitutions(date?: string): Observable<Substitution[]> {
    this.loading.set(true);
    const targetDate = date || this.currentDate();
    
    return this.http.get<{ substitutions: Substitution[]; date: string }>(
      `${Config.API_URL}/v1/schedule/substitution?date=${targetDate}`,
      { withCredentials: true }
    ).pipe(
      map(response => {
        this.substitutions.set(response.substitutions);
        this.currentDate.set(response.date);
        this.loading.set(false);
        return response.substitutions;
      }),
      catchError(() => {
        this.loading.set(false);
        return of([]);
      })
    );
  }

  /**
   * Create new substitution (teacher/admin only)
   */
  createSubstitution(data: {
    date: string;
    lessonNumber: number;
    originalTeacherId: number;
    substituteTeacherId?: number;
    classId: number;
    subjectId?: number;
    type: string;
    note?: string;
  }): Observable<{ substitution_id: number; success: boolean }> {
    return this.http.post<{ substitution_id: number; success: boolean }>(
      `${Config.API_URL}/v1/schedule/substitution`,
      data,
      { withCredentials: true }
    );
  }

  /**
   * Delete substitution
   */
  deleteSubstitution(id: number): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(
      `${Config.API_URL}/v1/schedule/substitution/${id}`,
      { withCredentials: true }
    );
  }

  /**
   * Navigate to next day
   */
  nextDay(): void {
    const current = new Date(this.currentDate());
    current.setDate(current.getDate() + 1);
    this.loadSubstitutions(current.toISOString().split('T')[0]).subscribe();
  }

  /**
   * Navigate to previous day
   */
  previousDay(): void {
    const current = new Date(this.currentDate());
    current.setDate(current.getDate() - 1);
    this.loadSubstitutions(current.toISOString().split('T')[0]).subscribe();
  }

  /**
   * Go to today
   */
  goToToday(): void {
    this.loadSubstitutions(new Date().toISOString().split('T')[0]).subscribe();
  }
}
