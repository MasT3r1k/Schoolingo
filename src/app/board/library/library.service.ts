import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Config } from '../../infrastructure/config';
import { Observable } from 'rxjs';

export interface LibraryBook {
  bookId: number;
  isbn: string | null;
  title: string;
  author: string;
  publisher: string | null;
  published_year: number | null;
  description: string | null;
  coverUrl: string | null;
  genreId: number | null;
  pages: number | null;
  createdAt: Date;
  available_copies: number;
  total_copies: number;
  rating?: number;
}

export interface LibraryGenre {
    genreId: number;
    genreName: string;
}

export interface OpenLibraryBook {
    isbn: string;
    title: string;
    author: string;
    publisher: string;
    published_year: number;
    pages: number;
    description: string;
    coverUrl: string;
}

@Injectable({
  providedIn: 'root'
})
export class LibraryService {
  private http = inject(HttpClient);

  // === BOOKS ===
  getBooks(): Observable<LibraryBook[]> {
    return this.http.get<LibraryBook[]>(`${Config.API_URL}/v1/library/books`, { withCredentials: true });
  }

  addBook(book: Partial<LibraryBook> & { copies: number }): Observable<{ id: number; message: string }> {
    return this.http.post<{ id: number; message: string }>(`${Config.API_URL}/v1/library/books`, book, { withCredentials: true });
  }

  lookupBook(query: string, type: 'isbn' | 'title'): Observable<OpenLibraryBook> {
    return this.http.get<OpenLibraryBook>(`${Config.API_URL}/v1/library/lookup?${type}=${encodeURIComponent(query)}`, { withCredentials: true });
  }

  // === GENRES ===
  getGenres(): Observable<LibraryGenre[]> {
    return this.http.get<LibraryGenre[]>(`${Config.API_URL}/v1/library/genres`, { withCredentials: true });
  }

  // === USERS ===
  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${Config.API_URL}/v1/library/users`, { withCredentials: true });
  }

  // === STATS ===
  getStats(): Observable<{ totalBooks: number; activeLoans: number; overdueLoans: number }> {
    return this.http.get<{ totalBooks: number; activeLoans: number; overdueLoans: number }>(`${Config.API_URL}/v1/library/stats`, { withCredentials: true });
  }

  // === LOANS & COPIES ===
  addCopies(bookId: number, count: number): Observable<any> {
    return this.http.post(`${Config.API_URL}/v1/library/copies`, { bookId, count }, { withCredentials: true });
  }

  borrowBook(userId: number, copyId: number): Observable<any> {
    return this.http.post(`${Config.API_URL}/v1/library/borrow`, { userId, copyId }, { withCredentials: true });
  }

  reserveBook(bookId: number, date: string, duration: number = 14): Observable<any> {
    return this.http.post(`${Config.API_URL}/v1/library/reserve`, { bookId, date, duration }, { withCredentials: true });
  }

  getReservations(): Observable<any[]> {
    return this.http.get<any[]>(`${Config.API_URL}/v1/library/reservations`, { withCredentials: true });
  }

  fulfillReservation(reservationId: number, copyId: number): Observable<any> {
    return this.http.post(`${Config.API_URL}/v1/library/reservations/${reservationId}/fulfill`, { copyId }, { withCredentials: true });
  }

  cancelReservation(reservationId: number): Observable<any> {
    return this.http.post(`${Config.API_URL}/v1/library/reservations/${reservationId}/cancel`, {}, { withCredentials: true });
  }

  returnBook(copyId: number): Observable<any> {
    return this.http.post(`${Config.API_URL}/v1/library/return`, { copyId }, { withCredentials: true });
  }

  getMyLoans(): Observable<any[]> {
    return this.http.get<any[]>(`${Config.API_URL}/v1/library/loans`, { withCredentials: true });
  }

  getAllLoans(): Observable<any[]> {
    return this.http.get<any[]>(`${Config.API_URL}/v1/library/loans/all`, { withCredentials: true });
  }

  getInventory(): Observable<any[]> {
    return this.http.get<any[]>(`${Config.API_URL}/v1/library/inventory`, { withCredentials: true });
  }

  notifyLoan(loanId: number): Observable<any> {
    return this.http.post(`${Config.API_URL}/v1/library/loans/${loanId}/notify`, {}, { withCredentials: true });
  }

  // === RATINGS ===
  rateBook(bookId: number, rating: number, review_text: string = ''): Observable<any> {
    return this.http.post(`${Config.API_URL}/v1/library/books/${bookId}/rate`, { rating, review_text }, { withCredentials: true });
  }

  getBookRatings(bookId: number): Observable<any[]> {
    return this.http.get<any[]>(`${Config.API_URL}/v1/library/books/${bookId}/ratings`, { withCredentials: true });
  }


}
