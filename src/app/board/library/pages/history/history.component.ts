import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@Schoolingo/icons';
import { LibraryService } from '../../library.service';
import { Locale } from '@Schoolingo/locale';

export interface LoanRecord {
  loanId: number;
  bookId: number;
  title: string;
  author: string;
  coverUrl: string | null;
  dueDate: string | null;
  borrowedDate: string | null;
  returnedDate: string | null;
}

@Component({
  selector: 'app-library-history',
  standalone: true,
  imports: [CommonModule, IconsModule],
  templateUrl: './history.component.html',
  styleUrl: './history.component.css'
})
export class HistoryComponent implements OnInit {
  private libraryService = inject(LibraryService);
  public l = inject(Locale);

  loans = signal<LoanRecord[]>([]);
  isLoading = signal<boolean>(true);

  ngOnInit(): void {
    this.libraryService.getMyLoans().subscribe({
      next: (loans) => {
        this.loans.set(loans);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  getLoanStatus(loan: LoanRecord): 'returned' | 'overdue' | 'active' {
    if (loan.returnedDate) return 'returned';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (loan.dueDate && new Date(loan.dueDate) < today) return 'overdue';
    return 'active';
  }

  getStatusKey(loan: LoanRecord): string {
    const status = this.getLoanStatus(loan);
    return `library.status_${status}`;
  }

  getStatusBadgeClass(loan: LoanRecord): string {
    return `badge badge--${this.getLoanStatus(loan)}`;
  }
}
