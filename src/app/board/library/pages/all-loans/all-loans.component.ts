import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '@Schoolingo/icons';
import { LibraryService } from '../../library.service';
import { Locale } from '@Schoolingo/locale';
import { DropdownComponent } from '@Components/dropdown/dropdown';
import { StatCardComponent } from '@Components/stat-card/stat-card.component';

@Component({
  selector: 'app-all-loans',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule, DropdownComponent, StatCardComponent],
  templateUrl: './all-loans.component.html',
  styleUrls: ['./all-loans.component.css']
})
export class AllLoansComponent implements OnInit {
  private libraryService = inject(LibraryService);
  public l = inject(Locale);

  // Data
  allLoans = signal<any[]>([]);
  loading = signal<boolean>(true);

  // Filters
  searchQuery = signal<string>('');
  statusFilter = signal<string>('all');

  // Alert
  alertMessage = signal<{ type: 'success' | 'error'; text: string } | null>(null);

  // Notify tracking
  notifyingIds = signal<Set<number>>(new Set());

  // Status filter dropdown options
  statusOptions = [
    { label: 'library.all_statuses', value: 'all' },
    { label: 'library.status_active', value: 'active' },
    { label: 'library.status_overdue', value: 'overdue' },
    { label: 'library.status_returned', value: 'returned' },
  ];

  // Computed: filtered loans
  filteredLoans = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const status = this.statusFilter();

    return this.allLoans().filter(loan => {
      // Text search: book title or user name
      const matchesSearch = !query ||
        (loan.title || '').toLowerCase().includes(query) ||
        (loan.userName || '').toLowerCase().includes(query);

      // Status filter
      let matchesStatus = true;
      if (status === 'active') {
        matchesStatus = !loan.returnedDate && !this.isOverdue(loan.dueDate);
      } else if (status === 'overdue') {
        matchesStatus = !loan.returnedDate && this.isOverdue(loan.dueDate);
      } else if (status === 'returned') {
        matchesStatus = !!loan.returnedDate;
      }

      return matchesSearch && matchesStatus;
    });
  });

  // Computed summary counts
  activeCount = computed(() =>
    this.allLoans().filter(l => !l.returnedDate && !this.isOverdue(l.dueDate)).length
  );
  overdueCount = computed(() =>
    this.allLoans().filter(l => !l.returnedDate && this.isOverdue(l.dueDate)).length
  );
  totalCount = computed(() => this.allLoans().length);

  ngOnInit(): void {
    this.libraryService.getAllLoans().subscribe({
      next: (data) => {
        this.allLoans.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.showAlert('error', this.l.s('general.error'));
      }
    });
  }

  isOverdue(dueDate: string | null): boolean {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  }

  getLoanStatus(loan: any): 'active' | 'overdue' | 'returned' {
    if (loan.returnedDate) return 'returned';
    if (this.isOverdue(loan.dueDate)) return 'overdue';
    return 'active';
  }

  notifyLoan(loanId: number): void {
    const ids = new Set(this.notifyingIds());
    ids.add(loanId);
    this.notifyingIds.set(ids);

    this.libraryService.notifyLoan(loanId).subscribe({
      next: () => {
        const updated = new Set(this.notifyingIds());
        updated.delete(loanId);
        this.notifyingIds.set(updated);
        this.showAlert('success', this.l.s('library.notify_sent'));
      },
      error: () => {
        const updated = new Set(this.notifyingIds());
        updated.delete(loanId);
        this.notifyingIds.set(updated);
        this.showAlert('error', this.l.s('general.error'));
      }
    });
  }

  isNotifying(loanId: number): boolean {
    return this.notifyingIds().has(loanId);
  }

  showAlert(type: 'success' | 'error', text: string): void {
    this.alertMessage.set({ type, text });
    setTimeout(() => this.alertMessage.set(null), 4000);
  }

  getInitials(name: string): string {
    if (!name) return '?';
    const parts = name.split(' ');
    return parts.slice(0, 2).map(p => p[0] || '').join('').toUpperCase();
  }
}
