import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of, Subject } from 'rxjs';
import { Config } from '@Schoolingo/config';

export interface CalendarEvent {
  event_id: number;
  name: string;
  description?: string;
  date: Date;
  type: string;
  classId?: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  private http = inject(HttpClient);
  
  public events = signal<CalendarEvent[]>([]);
  public loading = signal<boolean>(false);
  private refresh$ = new Subject<void>();

  public onRefresh(): Observable<void> {
    return this.refresh$.asObservable();
  }

  public refresh(): void {
    this.refresh$.next();
  }

  /**
   * Load events for a date range
   */
  loadEvents(start?: string, end?: string): Observable<CalendarEvent[]> {
    this.loading.set(true);
    let url = `${Config.API_URL}/v1/calendar/events`;
    
    const params: string[] = [];
    if (start) params.push(`start=${start}`);
    if (end) params.push(`end=${end}`);
    if (params.length > 0) url += `?${params.join('&')}`;

    return this.http.get<{ events: CalendarEvent[] }>(url, { withCredentials: true }).pipe(
      map(response => {
        const events = response.events.map(e => ({
          ...e,
          date: new Date(e.date)
        }));
        this.events.set(events);
        this.loading.set(false);
        return events;
      }),
      catchError(() => {
        this.loading.set(false);
        return of([]);
      })
    );
  }

  /**
   * Get single event
   */
  getEvent(id: number): Observable<CalendarEvent | null> {
    return this.http.get<{ event: CalendarEvent }>(
      `${Config.API_URL}/v1/calendar/events/${id}`,
      { withCredentials: true }
    ).pipe(
      map(response => ({ ...response.event, date: new Date(response.event.date) })),
      catchError(() => of(null))
    );
  }

  /**
   * Create new event
   */
  createEvent(data: { name: string; description?: string; date: string; type?: string; classId?: number | null }): Observable<{ event_id: number; success: boolean }> {
    return this.http.post<{ event_id: number; success: boolean }>(
      `${Config.API_URL}/v1/calendar/events`,
      data,
      { withCredentials: true }
    );
  }

  /**
   * Update event
   */
  updateEvent(id: number, data: Partial<CalendarEvent>): Observable<{ success: boolean }> {
    return this.http.put<{ success: boolean }>(
      `${Config.API_URL}/v1/calendar/events/${id}`,
      data,
      { withCredentials: true }
    );
  }

  /**
   * Delete event
   */
  deleteEvent(id: number): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(
      `${Config.API_URL}/v1/calendar/events/${id}`,
      { withCredentials: true }
    );
  }

  /**
   * Get events for a specific month
   */
  loadMonthEvents(year: number, month: number): Observable<CalendarEvent[]> {
    const start = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const end = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;
    return this.loadEvents(start, end);
  }

  /**
   * Get all classes for event assignment
   */
  getClasses(): Observable<{ classId: number; className: string }[]> {
    return this.http.get<{ classes: any[] }>(
      `${Config.API_URL}/v1/schedule/classes`,
      { withCredentials: true }
    ).pipe(
      map(response => response.classes.map(c => ({
        classId: c.class_id,
        className: c.class_name
      }))),
      catchError(() => of([]))
    );
  }
}
