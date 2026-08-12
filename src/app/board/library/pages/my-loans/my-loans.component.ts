import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@Schoolingo/icons';
import { LibraryService } from '../../library.service';
import { Locale } from '@Schoolingo/locale';
import { RouterLink } from '@angular/router';

export type LoanStatus = 'active' | 'overdue' | 'returned';

export interface MyLoan {
  loanId: number;
  bookId: number;
  title: string;
  author: string;
  coverUrl: string | null;
  dueDate: string;
  borrowedDate: string;
  returnedDate: string | null;
  genreId: number | null;
}

@Component({
  selector: 'app-library-my-loans',
  standalone: true,
  imports: [CommonModule, IconsModule, RouterLink],
  templateUrl: './my-loans.component.html',
  styleUrls: ['./my-loans.component.css']
})
export class MyLoansComponent implements OnInit {
  private libraryService = inject(LibraryService);
  public l = inject(Locale);

  loans = signal<MyLoan[]>([]);
  isLoading = signal<boolean>(true);

  ngOnInit(): void {
    this.loadLoans();
  }

  loadLoans(): void {
    this.isLoading.set(true);
    this.libraryService.getMyLoans().subscribe({
      next: (loans) => {
        this.loans.set(loans);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  getLoanStatus(loan: MyLoan): LoanStatus {
    if (loan.returnedDate) return 'returned';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(loan.dueDate);
    due.setHours(0, 0, 0, 0);
    return due < today ? 'overdue' : 'active';
  }

  getStatusLabel(loan: MyLoan): string {
    const status = this.getLoanStatus(loan);
    switch (status) {
      case 'active':   return this.l.s('library.status_active');
      case 'overdue':  return this.l.s('library.status_overdue');
      case 'returned': return this.l.s('library.status_returned');
    }
  }
}
