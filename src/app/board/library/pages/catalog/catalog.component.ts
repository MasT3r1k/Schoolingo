import { Component, OnInit, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '@Schoolingo/icons';
import { LibraryService, LibraryBook, LibraryGenre } from '../../library.service';
import { Locale } from '@Schoolingo/locale';
import { TabsComponent } from '@Components/Tabs';
import { IsbnPipe } from "../../../../pipes/isbn/isbn.pipe";
import { ModalManager } from '@Schoolingo/modal';
import { BorrowBookComponent } from '../../modals/borrow-book/borrow-book.component';
import { RouterLink } from '@angular/router';

/** Colour map matching the genre spine colours from knihovna.html */
const GENRE_COLORS: Record<string, string> = {
  'Próza':         '#6E8570',
  'Prose':         '#6E8570',
  'Poezie':        '#B8862B',
  'Poetry':        '#B8862B',
  'Fantasy':       '#5B7A9C',
  'Sci-fi':        '#7C6B9C',
  'Humor':         '#C77D2E',
  'Drama':         '#A23E34',
  'Dobrodružné':   '#3F8F72',
  'Adventure':     '#3F8F72',
  'Učebnice':      '#8A8578',
  'Textbook':      '#8A8578',
  'Naučná':        '#4E7C8C',
  'Non-fiction':   '#4E7C8C',
};

const DEFAULT_SPINE_COLOR = '#5865f2';

@Component({
  selector: 'app-library-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule, RouterLink, IsbnPipe],
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.css']
})
export class CatalogComponent implements OnInit {
  private libraryService = inject(LibraryService);
  public l = inject(Locale);

  private modalManager = inject(ModalManager);

  // Signals
  books = signal<LibraryBook[]>([]);
  genres = signal<LibraryGenre[]>([]);
  searchQuery = signal<string>('');
  selectedGenreId = signal<number | null>(null);
  isLoading = signal<boolean>(true);

  // My Books
  showMyBooks = signal<boolean>(false);
  myLoans = signal<any[]>([]);

  // Computed
  filteredBooks = computed(() => {
    if (this.showMyBooks()) return [];

    const query = this.searchQuery().toLowerCase();
    const genreId = this.selectedGenreId();

    return this.books().filter(book => {
      const matchesSearch = book.title.toLowerCase().includes(query) ||
                            book.author.toLowerCase().includes(query) ||
                            (book.isbn && book.isbn.includes(query));
      const matchesGenre = genreId ? book.genreId === genreId : true;

      return matchesSearch && matchesGenre;
    });
  });

  constructor() {
    effect(() => {
        const _genres = this.genres();
    }, { allowSignalWrites: true });
  }

  ngOnInit() {
    this.loadData();
    this.loadMyLoans();

    this.modalManager.addModal(
      'library_borrow-book',
      {
        icon: 'rotate-rectangle',
        title: 'library.borrow_book',
        closeable: true,
        items: [
          { type: 'component', component: BorrowBookComponent }
        ]
      }
    )
  }

  loadData() {
    this.isLoading.set(true);
    this.libraryService.getGenres().subscribe(genres => {
        this.genres.set(genres);
    });
    this.libraryService.getBooks().subscribe({
      next: (books) => {
        this.books.set(books);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  loadMyLoans() {
      this.libraryService.getMyLoans().subscribe(loans => this.myLoans.set(loans));
  }

  getGenreName(id: number | null): string {
    if (!id) return '';
    const genre = this.genres().find(g => g.genreId === id);
    return genre ? genre.genreName : '';
  }

  /** Returns a spine colour based on the genre name, falling back to primary. */
  getGenreColor(genreId: number | null): string {
    const name = this.getGenreName(genreId);
    return GENRE_COLORS[name] ?? DEFAULT_SPINE_COLOR;
  }

  openBorrowModal(book: LibraryBook) {
    this.modalManager.openModal('library_borrow-book', { book });
  }
}
