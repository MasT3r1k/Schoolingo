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
  roomId?: number;
  roomName?: string;
  maxStudents?: number;
  signedUpCount: number;
  isSignedUp: boolean;
  classLabel?: string;
  classId?: number;
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
          description: s.description,
          roomId: s.roomId,
          roomName: s.roomName,
          maxStudents: s.maxStudents,
          signedUpCount: s.signedUpCount,
          isSignedUp: s.isSignedUp > 0,
          classLabel: s.classLabel,
          classId: s.classId
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
    subjectId?: number;
    classId?: number;
    title: string;
    description?: string;
    date: string;
    maxStudents?: number;
    roomId?: number;
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
   * Get all subjects
   */
  getSubjects(): Observable<any[]> {
    return this.http.get<any[]>(
      `${Config.API_URL}/v1/school/subjects`,
      { withCredentials: true }
    );
  }

  /**
   * Get all classes
   */
  getClasses(): Observable<any[]> {
    return this.http.get<any[]>(
      `${Config.API_URL}/v1/school/classes`,
      { withCredentials: true }
    );
  }

  /**
   * Get all rooms
   */
  getRooms(): Observable<any[]> {
    return this.http.get<any[]>(
      `${Config.API_URL}/v1/school/rooms`,
      { withCredentials: true }
    );
  }

  /**
   * Sign up for tutoring session
   */
  signUp(id: number): Observable<{ success: boolean; error?: string }> {
    return this.http.post<{ success: boolean; error?: string }>(
      `${Config.API_URL}/v1/schedule/tutoring/${id}/signup`,
      {},
      { withCredentials: true }
    );
  }

  /**
   * Sign out from tutoring session
   */
  signOut(id: number): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(
      `${Config.API_URL}/v1/schedule/tutoring/${id}/signup`,
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
