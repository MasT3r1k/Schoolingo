import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { Config } from '@Schoolingo/config';

export interface TutoringSession {
  sessionId: number;
  title: string;
  subject?: string;
  teacher?: string;
  date: Date;
  description?: string;
  room?: string;
  maxStudents?: number;
}

@Injectable({
  providedIn: 'root'
})
export class TutoringService {
  private http = inject(HttpClient);
  
  public sessions = signal<TutoringSession[]>([]);
  public loading = signal<boolean>(false);

  /**
   * Load upcoming tutoring sessions
   */
  loadSessions(): Observable<TutoringSession[]> {
    this.loading.set(true);
    
    return this.http.get<{ sessions: any[] }>(
      `${Config.API_URL}/v1/schedule/tutoring`,
      { withCredentials: true }
    ).pipe(
      map(response => {
        const sessions = response.sessions.map(s => ({
          sessionId: s.sessionId,
          title: s.title,
          subject: s.subject,
          teacher: s.teacher,
          date: new Date(s.date),
          description: s.description
        }));
        this.sessions.set(sessions);
        this.loading.set(false);
        return sessions;
      }),
      catchError(() => {
        this.loading.set(false);
        return of([]);
      })
    );
  }

  /**
   * Create tutoring session (teacher only)
   */
  createSession(data: {
    subjectId: number;
    title: string;
    description?: string;
    date: string;
    maxStudents?: number;
    room?: string;
  }): Observable<{ sessionId: number; success: boolean }> {
    return this.http.post<{ sessionId: number; success: boolean }>(
      `${Config.API_URL}/v1/schedule/tutoring`,
      data,
      { withCredentials: true }
    );
  }

  /**
   * Cancel tutoring session
   */
  cancelSession(id: number): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(
      `${Config.API_URL}/v1/schedule/tutoring/${id}`,
      { withCredentials: true }
    );
  }

  /**
   * Get upcoming sessions count
   */
  getUpcomingCount(): number {
    const now = new Date();
    return this.sessions().filter(s => s.date > now).length;
  }
}
