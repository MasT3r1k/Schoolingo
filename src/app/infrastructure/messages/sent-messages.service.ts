import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { Config } from '@Schoolingo/config';

export interface SentMessage {
  message_id: number;
  subject: string;
  content: string;
  type: string;
  created_at: Date;
  is_read: boolean;
  recipients: {
    person: number;
    name: string;
    is_read: boolean;
  }[];
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

@Injectable({
  providedIn: 'root'
})
export class SentMessagesService {
  private http = inject(HttpClient);
  
  public messages = signal<SentMessage[]>([]);
  public pagination = signal<Pagination>({ page: 1, limit: 20, total: 0, pages: 0 });
  public loading = signal<boolean>(false);

  /**
   * Load sent messages with pagination
   */
  loadMessages(page: number = 1, limit: number = 20): Observable<SentMessage[]> {
    this.loading.set(true);
    
    return this.http.get<{ messages: any[]; pagination: Pagination }>(
      `${Config.API_URL}/v1/messages/sent?page=${page}&limit=${limit}`,
      { withCredentials: true }
    ).pipe(
      map(response => {
        const messages = response.messages.map(m => ({
          ...m,
          created_at: new Date(m.created_at)
        }));
        this.messages.set(messages);
        this.pagination.set(response.pagination);
        this.loading.set(false);
        return messages;
      }),
      catchError(() => {
        this.loading.set(false);
        return of([]);
      })
    );
  }

  /**
   * Get single message with recipients
   */
  getMessage(id: number): Observable<{ message: SentMessage; recipients: any[] } | null> {
    return this.http.get<{ message: any; recipients: any[] }>(
      `${Config.API_URL}/v1/messages/sent/${id}`,
      { withCredentials: true }
    ).pipe(
      map(response => ({
        message: { ...response.message, created_at: new Date(response.message.created_at) },
        recipients: response.recipients
      })),
      catchError(() => of(null))
    );
  }

  /**
   * Delete sent message
   */
  deleteMessage(id: number): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(
      `${Config.API_URL}/v1/messages/sent/${id}`,
      { withCredentials: true }
    );
  }

  /**
   * Go to next page
   */
  nextPage(): void {
    const current = this.pagination();
    if (current.page < current.pages) {
      this.loadMessages(current.page + 1, current.limit).subscribe();
    }
  }

  /**
   * Go to previous page
   */
  previousPage(): void {
    const current = this.pagination();
    if (current.page > 1) {
      this.loadMessages(current.page - 1, current.limit).subscribe();
    }
  }
}
