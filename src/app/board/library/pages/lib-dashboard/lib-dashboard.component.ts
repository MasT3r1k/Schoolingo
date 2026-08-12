import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { LibraryService } from '../../library.service';
import { StatCardComponent } from '@Components/stat-card/stat-card.component';

interface TopBook {
  bookId: string | number;
  title: string;
  author: string;
  count: number;
}

@Component({
  selector: 'app-lib-dashboard',
  standalone: true,
  imports: [CommonModule, IconsModule, StatCardComponent],
  templateUrl: './lib-dashboard.component.html',
  styleUrl: './lib-dashboard.component.css'
})
export class LibDashboardComponent implements OnInit {
  private libraryService = inject(LibraryService);
  public l = inject(Locale);

  isLoading = signal<boolean>(true);

  stats = signal<{ totalBooks: number; activeLoans: number; overdueLoans: number }>({
    totalBooks: 0,
    activeLoans: 0,
    overdueLoans: 0
  });

  allLoans = signal<any[]>([]);

  topBooks = computed<TopBook[]>(() => {
    const loans = this.allLoans();
    const counts: Record<string, { title: string; author: string; count: number }> = {};

    for (const loan of loans) {
      const key = String(loan.bookId ?? loan.book_id ?? '');
      if (!key) continue;
      if (!counts[key]) {
        counts[key] = {
          title: loan.title ?? '—',
          author: loan.author ?? '—',
          count: 0
        };
      }
      counts[key].count++;
    }

    return Object.entries(counts)
      .map(([bookId, data]) => ({ bookId, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  });

  ngOnInit(): void {
    this.libraryService.getStats().subscribe({
      next: (data) => this.stats.set(data),
      error: () => {}
    });

    this.libraryService.getAllLoans().subscribe({
      next: (data) => {
        this.allLoans.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }
}
