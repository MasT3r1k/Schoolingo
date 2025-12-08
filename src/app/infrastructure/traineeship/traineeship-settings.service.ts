import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { Config } from '@Schoolingo/config';

export interface TraineeshipConfig {
  trConfig: number;
  isActivated: boolean;
  manager?: number;
  defaultIgnoreDays?: string;
  allowMap: boolean;
}

export interface TraineeshipCompany {
  company_id: number;
  name: string;
  address?: string;
  city?: string;
  phone?: string;
  email?: string;
  website?: string;
  note?: string;
  max_students?: number;
  isActivated: boolean;
}

export interface TraineeshipInstructor {
  instructor_id: number;
  company: number;
  name: string;
  phone?: string;
  email?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TraineeshipSettingsService {
  private http = inject(HttpClient);
  
  public config = signal<TraineeshipConfig | null>(null);
  public companies = signal<TraineeshipCompany[]>([]);
  public loading = signal<boolean>(false);

  /**
   * Load traineeship config
   */
  loadConfig(): Observable<TraineeshipConfig | null> {
    this.loading.set(true);
    
    return this.http.get<{ config: TraineeshipConfig }>(
      `${Config.API_URL}/v1/traineeship/config`,
      { withCredentials: true }
    ).pipe(
      map(response => {
        this.config.set(response.config);
        this.loading.set(false);
        return response.config;
      }),
      catchError(() => {
        this.loading.set(false);
        return of(null);
      })
    );
  }

  /**
   * Update traineeship config
   */
  updateConfig(data: Partial<TraineeshipConfig>): Observable<{ success: boolean }> {
    return this.http.put<{ success: boolean }>(
      `${Config.API_URL}/v1/traineeship/config`,
      data,
      { withCredentials: true }
    );
  }

  /**
   * Load companies
   */
  loadCompanies(): Observable<TraineeshipCompany[]> {
    this.loading.set(true);
    
    return this.http.get<{ companies: TraineeshipCompany[] }>(
      `${Config.API_URL}/v1/traineeship/companies`,
      { withCredentials: true }
    ).pipe(
      map(response => {
        this.companies.set(response.companies);
        this.loading.set(false);
        return response.companies;
      }),
      catchError(() => {
        this.loading.set(false);
        return of([]);
      })
    );
  }

  /**
   * Get single company with details
   */
  getCompany(id: number): Observable<{ company: TraineeshipCompany; scopes: any[]; instructors: any[]; ratings: any[] } | null> {
    return this.http.get<any>(
      `${Config.API_URL}/v1/traineeship/companies/${id}`,
      { withCredentials: true }
    ).pipe(
      catchError(() => of(null))
    );
  }

  /**
   * Create company
   */
  createCompany(data: Partial<TraineeshipCompany>): Observable<{ company_id: number; success: boolean }> {
    return this.http.post<{ company_id: number; success: boolean }>(
      `${Config.API_URL}/v1/traineeship/companies`,
      data,
      { withCredentials: true }
    );
  }

  /**
   * Update company
   */
  updateCompany(id: number, data: Partial<TraineeshipCompany>): Observable<{ success: boolean }> {
    return this.http.put<{ success: boolean }>(
      `${Config.API_URL}/v1/traineeship/companies/${id}`,
      data,
      { withCredentials: true }
    );
  }

  /**
   * Delete company
   */
  deleteCompany(id: number): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(
      `${Config.API_URL}/v1/traineeship/companies/${id}`,
      { withCredentials: true }
    );
  }
}
