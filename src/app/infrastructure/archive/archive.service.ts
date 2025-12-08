import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { Config } from '@Schoolingo/config';

export interface SchoolYear {
  year_id: number;
  name: string;
  start_date: Date;
  end_date: Date;
  is_current: boolean;
}

export interface ArchivedGrade {
  semester_grade_id: number;
  subject: number;
  subjectName: string;
  grade: number;
  semester: number;
  year: number;
}

export interface ClassbookEntry {
  classbook_id: number;
  date: Date;
  hour: number;
  className: string;
  subjectName: string;
  content: string;
  note?: string;
}

export interface AuditLogEntry {
  auditId: number;
  type: string;
  data: string;
  ip?: string;
  created: Date;
  userName?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ArchiveService {
  private http = inject(HttpClient);
  
  public years = signal<SchoolYear[]>([]);
  public grades = signal<ArchivedGrade[]>([]);
  public classbook = signal<ClassbookEntry[]>([]);
  public auditLogs = signal<AuditLogEntry[]>([]);
  public loading = signal<boolean>(false);

  /**
   * Load archived school years
   */
  loadYears(): Observable<SchoolYear[]> {
    this.loading.set(true);
    
    return this.http.get<{ years: any[] }>(
      `${Config.API_URL}/v1/admin/archive/years`,
      { withCredentials: true }
    ).pipe(
      map(response => {
        const years = response.years.map(y => ({
          ...y,
          start_date: new Date(y.start_date),
          end_date: new Date(y.end_date)
        }));
        this.years.set(years);
        this.loading.set(false);
        return years;
      }),
      catchError(() => {
        this.loading.set(false);
        return of([]);
      })
    );
  }

  /**
   * Load archived grades for a school year
   */
  loadGrades(yearId: number): Observable<ArchivedGrade[]> {
    this.loading.set(true);
    
    return this.http.get<{ grades: ArchivedGrade[] }>(
      `${Config.API_URL}/v1/admin/archive/grades/${yearId}`,
      { withCredentials: true }
    ).pipe(
      map(response => {
        this.grades.set(response.grades);
        this.loading.set(false);
        return response.grades;
      }),
      catchError(() => {
        this.loading.set(false);
        return of([]);
      })
    );
  }

  /**
   * Load archived classbook entries for a school year
   */
  loadClassbook(yearId: number): Observable<ClassbookEntry[]> {
    this.loading.set(true);
    
    return this.http.get<{ entries: any[] }>(
      `${Config.API_URL}/v1/admin/archive/classbook/${yearId}`,
      { withCredentials: true }
    ).pipe(
      map(response => {
        const entries = response.entries.map(e => ({
          ...e,
          date: new Date(e.date)
        }));
        this.classbook.set(entries);
        this.loading.set(false);
        return entries;
      }),
      catchError(() => {
        this.loading.set(false);
        return of([]);
      })
    );
  }

  /**
   * Load audit log (admin only)
   */
  loadAuditLog(page: number = 1, limit: number = 50): Observable<{ logs: AuditLogEntry[]; pagination: any }> {
    this.loading.set(true);
    
    return this.http.get<{ logs: any[]; pagination: any }>(
      `${Config.API_URL}/v1/admin/archive/auditlog?page=${page}&limit=${limit}`,
      { withCredentials: true }
    ).pipe(
      map(response => {
        const logs = response.logs.map(l => ({
          ...l,
          created: new Date(l.created)
        }));
        this.auditLogs.set(logs);
        this.loading.set(false);
        return { logs, pagination: response.pagination };
      }),
      catchError(() => {
        this.loading.set(false);
        return of({ logs: [], pagination: { page: 1, limit: 50, total: 0 } });
      })
    );
  }
}
