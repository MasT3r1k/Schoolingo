import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { Config } from '@Schoolingo/config';

export interface Backup {
  filename: string;
  size: number;
  createdAt: Date;
  compressed: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class BackupService {
  private http = inject(HttpClient);
  
  public backups = signal<Backup[]>([]);
  public loading = signal<boolean>(false);

  /**
   * Load all backups (admin only)
   */
  loadBackups(): Observable<Backup[]> {
    this.loading.set(true);
    
    return this.http.get<{ backups: any[] }>(
      `${Config.API_URL}/v1/backup`,
      { withCredentials: true }
    ).pipe(
      map(response => {
        const backups = response.backups.map(b => ({
          ...b,
          createdAt: new Date(b.createdAt)
        }));
        this.backups.set(backups);
        this.loading.set(false);
        return backups;
      }),
      catchError(() => {
        this.loading.set(false);
        return of([]);
      })
    );
  }

  /**
   * Create new backup (admin only)
   */
  createBackup(description?: string): Observable<{ success: boolean; backup: Backup }> {
    this.loading.set(true);
    
    return this.http.post<{ success: boolean; backup: any }>(
      `${Config.API_URL}/v1/backup`,
      { description },
      { withCredentials: true }
    ).pipe(
      map(response => {
        this.loading.set(false);
        // Reload list after creating
        this.loadBackups().subscribe();
        return {
          success: response.success,
          backup: { ...response.backup, createdAt: new Date(response.backup.createdAt) }
        };
      }),
      catchError(() => {
        this.loading.set(false);
        return of({ success: false, backup: null as any });
      })
    );
  }

  /**
   * Download backup file
   */
  downloadBackup(filename: string): void {
    window.open(`${Config.API_URL}/v1/backup/${filename}`, '_blank');
  }

  /**
   * Delete backup (admin only)
   */
  deleteBackup(filename: string): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(
      `${Config.API_URL}/v1/backup/${filename}`,
      { withCredentials: true }
    ).pipe(
      map(response => {
        if (response.success) {
          // Remove from local list
          this.backups.update(list => list.filter(b => b.filename !== filename));
        }
        return response;
      })
    );
  }

  /**
   * Restore from backup (admin only) - CAREFUL!
   */
  restoreBackup(filename: string): Observable<{ success: boolean; message?: string }> {
    return this.http.post<{ success: boolean; message?: string }>(
      `${Config.API_URL}/v1/backup/${filename}/restore`,
      {},
      { withCredentials: true }
    );
  }

  /**
   * Format file size for display
   */
  formatSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
