import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IconsModule } from '../../../../infrastructure/icons';
import { LibraryService, LibraryBook, OpenLibraryBook } from '../../library.service';
import { Locale } from '../../../../infrastructure/locale';

@Component({
  selector: 'app-library-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IconsModule],
  templateUrl: './manager.component.html',
  styleUrls: ['./manager.component.css']
})
export class ManagerComponent {
  private libraryService = inject(LibraryService);
  public l = inject(Locale);

  activeTab = signal<'loans' | 'books'>('loans');

  // LOAN CONSOLE
  userIdInput = signal<number | null>(null);
  copyIdInput = signal<number | null>(null);
  loanMessage = signal<{ type: 'success' | 'error', text: string } | null>(null);

  // ADD BOOK
  isbnInput = signal<string>('');
  lookupLoading = signal<boolean>(false);
  foundBook = signal<OpenLibraryBook | null>(null);
  manualBook = signal<Partial<LibraryBook> & { copies: number }>({
      title: '', author: '', isbn: '', copies: 1
  });

  // TABS
  switchTab(tab: 'loans' | 'books') {
      this.activeTab.set(tab);
      this.loanMessage.set(null);
  }

  // === LOANS ===
  borrowBook() {
      if (!this.userIdInput() || !this.copyIdInput()) return;
      
      this.libraryService.borrowBook(this.userIdInput()!, this.copyIdInput()!).subscribe({
          next: () => this.showMessage('success', 'Book borrowed successfully'),
          error: () => this.showMessage('error', 'Failed to borrow book (Unavailable or Invalid User)')
      });
  }

  returnBook() {
      if (!this.copyIdInput()) return;

      this.libraryService.returnBook(this.copyIdInput()!).subscribe({
          next: () => this.showMessage('success', 'Book returned successfully'),
          error: () => this.showMessage('error', 'Failed to return book (No active loan)')
      });
  }

  showMessage(type: 'success' | 'error', text: string) {
      this.loanMessage.set({ type, text });
      setTimeout(() => this.loanMessage.set(null), 3000);
  }

  // === BOOKS ===
  lookupBook() {
      if (!this.isbnInput()) return;
      this.lookupLoading.set(true);
      this.libraryService.lookupBook(this.isbnInput()).subscribe({
          next: (book) => {
              this.foundBook.set(book);
              this.manualBook.set({
                  ...book,
                  copies: 1,
                  genreId: 1 // Default genre if not mapped
              });
              this.lookupLoading.set(false);
          },
          error: () => {
              this.lookupLoading.set(false);
              this.showMessage('error', 'Book not found in Open Library');
          }
      });
  }

  addBook() {
      const book = this.manualBook();
      if (!book.title || !book.author) return;

      this.libraryService.addBook(book).subscribe({
          next: () => {
              this.showMessage('success', 'Book added to library');
              this.foundBook.set(null);
              this.isbnInput.set('');
              this.manualBook.set({ title: '', author: '', isbn: '', copies: 1 });
          },
          error: () => this.showMessage('error', 'Failed to add book')
      });
  }
}
