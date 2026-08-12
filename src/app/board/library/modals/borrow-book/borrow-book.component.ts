import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalManager } from '@Schoolingo/modal';
import { Locale } from '@Schoolingo/locale';
import { LibraryBook, LibraryService } from '../../library.service';
import { BoardAlertManager } from '../../../../infrastructure/alert/board.alert.manager';
import { TabsComponent } from '@Components/Tabs';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-borrow-book',
  standalone: true,
  imports: [CommonModule, FormsModule, TabsComponent],
  templateUrl: './borrow-book.component.html',
  styleUrl: './borrow-book.component.css'
})
export class BorrowBookComponent implements OnInit {
  modalManager = inject(ModalManager);
  l = inject(Locale);
  libraryService = inject(LibraryService);
  alertManager = inject(BoardAlertManager) as BoardAlertManager;

  book = signal<LibraryBook | null>(null);
  borrowDate = signal<string>('');
  
  durationOptions = ['14 dní', '1 měsíc', '3 měsíce'];
  durationValues = [14, 30, 90]; // Days
  durationValue = new BehaviorSubject<number>(0);

  ngOnInit() {
    const data = this.modalManager.getModalData('library_borrow-book');
    if (data && data.book) {
      this.book.set(data.book);
    }
    // Set default borrow date to today
    this.borrowDate.set(new Date().toISOString().split('T')[0]);
  }

  closeModal() {
    this.modalManager.closeModal('library_borrow-book');
  }

  confirmBorrow() {
    const currentBook = this.book();
    const targetDate = this.borrowDate();
    
    if (!currentBook || !targetDate) return;

    const id = currentBook.bookId ?? (currentBook as any).book_id;
    if (!id) {
        this.alertManager.alert('error', 'Chyba: Kniha nemá platné ID.').closeable(true);
        return;
    }

    const duration = this.durationValues[this.durationValue.value];

    this.libraryService.reserveBook(id, targetDate, duration).subscribe({
      next: () => {
        this.alertManager.alert('success', 'library.success_borrow_request').closeable(true);
        this.closeModal();
      },
      error: () => {
        this.alertManager.alert('error', 'library.error_borrow_request').closeable(true);
      }
    });
  }
}
