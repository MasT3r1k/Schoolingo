import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IconsModule } from '@Schoolingo/icons';
import { LibraryService, LibraryBook, OpenLibraryBook, LibraryGenre } from '../../library.service';
import { Locale } from '@Schoolingo/locale';
import { TabsComponent } from '@Components/Tabs';
import { DropdownComponent } from '@Components/dropdown/dropdown';
import { StatCardComponent } from '@Components/stat-card/stat-card.component';
import { BehaviorSubject } from 'rxjs';
import { IsbnFormatterDirective } from '../../../../directives/isbn-formatter.directive';

@Component({
  selector: 'app-library-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IconsModule, TabsComponent, DropdownComponent, StatCardComponent, IsbnFormatterDirective],
  templateUrl: './manager.component.html',
  styleUrls: ['./manager.component.css']
})
export class ManagerComponent implements OnInit {
  private libraryService = inject(LibraryService);
  public l = inject(Locale);

  // TABS
  tabOptions = ['library.librarian_dashboard', 'library.add_new_book', 'library.evidence_title', 'library.inventory', 'library.reservations'];
  tabIcons = ['list-details', 'plus', 'clock', 'books', 'bookmark'];
  tabValue = new BehaviorSubject<number>(0);
  activeTab = signal<'dashboard' | 'books' | 'evidence' | 'inventory' | 'reservations'>('dashboard');

  userOptions = signal<{ label: string; value: any }[]>([]);

  // LOAN CONSOLE
  userIdInput = signal<number | null>(null);
  copyIdInput = signal<number | null>(null);
  loanMessage = signal<{ type: 'success' | 'error', text: string } | null>(null);

  // ADD BOOK
  searchInput = signal<string>('');
  lookupLoading = signal<boolean>(false);
  foundBook = signal<OpenLibraryBook | null>(null);
  manualBook = signal<Partial<LibraryBook> & { copies: number }>({
      title: '', author: '', isbn: '', copies: 1, genreId: 1
  });
  
  genres = signal<LibraryGenre[]>([]);
  genreOptions = signal<{ label: string; value: any }[]>([]);

  // EVIDENCE & INVENTORY
  allLoans = signal<any[]>([]);
  inventory = signal<any[]>([]);

  // SEARCH & FILTERS — Evidence
  loanSearch = signal<string>('');
  loanFilter = signal<'all' | 'ongoing' | 'overdue' | 'returned'>('all');

  // SEARCH & FILTERS — Inventory
  inventorySearch = signal<string>('');
  inventoryFilter = signal<'all' | 'available' | 'borrowed' | 'discarded'>('all');

  // RESERVATIONS
  allReservations = signal<any[]>([]);
  reservationSearch = signal<string>('');
  reservationFilter = signal<'all' | 'pending' | 'fulfilled' | 'cancelled'>('all');

  // COMPUTED — filtered reservations
  filteredReservations = computed(() => {
      const query = this.reservationSearch().toLowerCase();
      const filter = this.reservationFilter();
      return this.allReservations().filter(res => {
          const matchesSearch = !query ||
              `${res.first_name} ${res.last_name}`.toLowerCase().includes(query) ||
              (res.title || '').toLowerCase().includes(query) ||
              String(res.person_id || '').includes(query);
          
          const matchesFilter = filter === 'all' || res.status === filter;
          return matchesSearch && matchesFilter;
      });
  });

  // COMPUTED — filtered loans
  filteredLoans = computed(() => {
      const query = this.loanSearch().toLowerCase();
      const filter = this.loanFilter();
      return this.allLoans().filter(loan => {
          const matchesSearch = !query ||
              `${loan.first_name} ${loan.last_name}`.toLowerCase().includes(query) ||
              (loan.title || '').toLowerCase().includes(query) ||
              String(loan.person_id || '').includes(query);
          
          let matchesFilter = true;
          if (filter === 'ongoing') matchesFilter = loan.status === 'ongoing' && !this.isOverdue(loan.due_date);
          else if (filter === 'overdue') matchesFilter = loan.status === 'ongoing' && this.isOverdue(loan.due_date);
          else if (filter === 'returned') matchesFilter = loan.status === 'returned';

          return matchesSearch && matchesFilter;
      });
  });

  // COMPUTED — filtered inventory
  filteredInventory = computed(() => {
      const query = this.inventorySearch().toLowerCase();
      const filter = this.inventoryFilter();
      return this.inventory().filter(item => {
          const matchesSearch = !query ||
              (item.title || '').toLowerCase().includes(query) ||
              (item.author || '').toLowerCase().includes(query) ||
              String(item.barcode || '').includes(query);
          
          let matchesFilter = true;
          if (filter !== 'all') matchesFilter = item.copy_status === filter;
          
          return matchesSearch && matchesFilter;
      });
  });

  periodOptions = [
      { label: 'library.monthly', value: 'monthly' },
      { label: 'library.half_year', value: 'half_year' },
      { label: 'library.yearly', value: 'yearly' }
  ];

  // STATS
  stats = signal<{ totalBooks: number; activeLoans: number; overdueLoans: number }>({
      totalBooks: 0,
      activeLoans: 0,
      overdueLoans: 0
  });

  ngOnInit(): void {
      this.tabValue.subscribe(index => {
          const tabs: ('dashboard' | 'books' | 'evidence' | 'inventory' | 'reservations')[] = ['dashboard', 'books', 'evidence', 'inventory', 'reservations'];
          this.activeTab.set(tabs[index] || 'dashboard');
          this.loanMessage.set(null);

          if (tabs[index] === 'evidence') {
              this.libraryService.getAllLoans().subscribe(data => this.allLoans.set(data));
          } else if (tabs[index] === 'inventory') {
              this.libraryService.getInventory().subscribe(data => this.inventory.set(data));
          } else if (tabs[index] === 'reservations') {
              this.libraryService.getReservations().subscribe(data => this.allReservations.set(data));
          }
      });

      this.libraryService.getGenres().subscribe(data => {
          this.genres.set(data);
          this.genreOptions.set(data.map(g => ({ label: g.genreName, value: g.genreId })));
      });

      this.libraryService.getStats().subscribe(data => this.stats.set(data));

      this.libraryService.getUsers().subscribe(users => {
          this.userOptions.set(users.map(u => ({
              label: `${u.last_name} ${u.first_name} (${u.person_id})`,
              value: u.person_id
          })));
      });
  }

  // === RESERVATIONS ===
  fulfillReservation(resId: number, copyIdStr: string) {
      const copyId = parseInt(copyIdStr, 10);
      if (!copyId) return;
      this.libraryService.fulfillReservation(resId, copyId).subscribe({
          next: () => {
              this.loanMessage.set({ type: 'success', text: 'Rezervace úspěšně vyřízena.' });
              this.libraryService.getReservations().subscribe(data => this.allReservations.set(data));
          },
          error: (err) => {
              this.loanMessage.set({ type: 'error', text: err.error?.error || 'Chyba při vyřizování rezervace.' });
          }
      });
  }

  cancelReservation(resId: number) {
      this.libraryService.cancelReservation(resId).subscribe({
          next: () => {
              this.loanMessage.set({ type: 'success', text: 'Rezervace byla zrušena.' });
              this.libraryService.getReservations().subscribe(data => this.allReservations.set(data));
          },
          error: () => this.loanMessage.set({ type: 'error', text: 'Chyba při rušení rezervace.' })
      });
  }

  // === BOOKS ===
  borrowBook() {
      if (!this.userIdInput() || !this.copyIdInput()) return;
      
      this.libraryService.borrowBook(this.userIdInput()!, this.copyIdInput()!).subscribe({
          next: () => {
              this.showMessage('success', 'Kniha byla úspěšně vypůjčena.');
              this.userIdInput.set(null);
              this.copyIdInput.set(null);
          },
          error: () => this.showMessage('error', 'Chyba: Kniha je nedostupná nebo uživatel neexistuje.')
      });
  }

  returnBook() {
      if (!this.copyIdInput()) return;

      this.libraryService.returnBook(this.copyIdInput()!).subscribe({
          next: (res: any) => {
              if (res.lateFee && res.lateFee > 0) {
                  this.showMessage('error', `Kniha byla vrácena s prodlením. Byla vyměřena pokuta: ${res.lateFee} Kč.`);
              } else {
                  this.showMessage('success', 'Kniha byla úspěšně vrácena.');
              }
              this.copyIdInput.set(null);
          },
          error: () => this.showMessage('error', 'Chyba: Nebyla nalezena aktivní výpůjčka pro tento kód.')
      });
  }

  showMessage(type: 'success' | 'error', text: string) {
      this.loanMessage.set({ type, text });
      setTimeout(() => this.loanMessage.set(null), 4000);
  }

  // === BOOKS ===
  lookupBook() {
      const input = this.searchInput();
      if (!input) return;

      const cleanInput = input.replace(/[\s-]/g, '');
      const type = /^\d{10,13}$/.test(cleanInput) ? 'isbn' : 'title';

      this.lookupLoading.set(true);
      this.libraryService.lookupBook(input, type).subscribe({
          next: (book) => {
              this.foundBook.set(book);
              this.manualBook.set({
                  ...book,
                  copies: 1,
                  genreId: this.genres().length > 0 ? this.genres()[0].genreId : 1
              });
              this.lookupLoading.set(false);
          },
          error: () => {
              this.lookupLoading.set(false);
              this.showMessage('error', 'Kniha podle zadaného údaje nebyla nalezena.');
          }
      });
  }

  startManualBook() {
      this.manualBook.set({
          title: ' ', author: '', isbn: '', copies: 1,
          genreId: this.genres().length > 0 ? this.genres()[0].genreId : 1
      });
      this.foundBook.set(null);
  }

  cancelBook() {
      this.foundBook.set(null);
      this.searchInput.set('');
      this.manualBook.set({ title: '', author: '', isbn: '', copies: 1, genreId: this.genres().length > 0 ? this.genres()[0].genreId : 1 });
  }

  addBook() {
      const book = this.manualBook();
      if (!book.title?.trim() || !book.author) {
          this.showMessage('error', 'Vyplňte prosím alespoň název a autora knihy.');
          return;
      }

      this.libraryService.addBook(book).subscribe({
          next: () => {
              this.showMessage('success', 'Kniha byla úspěšně přidána do knihovny!');
              this.cancelBook();
          },
          error: () => this.showMessage('error', 'Nastala chyba při ukládání knihy do databáze.')
      });
  }

  // === EVIDENCE ===
  isOverdue(dueDate: string | null): boolean {
      if (!dueDate) return false;
      return new Date(dueDate) < new Date();
  }

  notifyLoan(loanId: number) {
      this.libraryService.notifyLoan(loanId).subscribe({
          next: () => this.showMessage('success', 'Upozornění bylo odesláno.'),
          error: () => this.showMessage('error', 'Chyba při odesílání upozornění.')
      });
  }
}
