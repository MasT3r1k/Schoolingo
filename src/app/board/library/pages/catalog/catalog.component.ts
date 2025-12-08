import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '../../../../infrastructure/icons';
import { LibraryService, LibraryBook, LibraryGenre } from '../../library.service';
import { Locale } from '../../../../infrastructure/locale';

@Component({
  selector: 'app-library-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule],
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.css']
})
export class CatalogComponent implements OnInit {
  private libraryService = inject(LibraryService);
  public l = inject(Locale);

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
    if (this.showMyBooks()) return []; // Not used for My Books view
    
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

  ngOnInit() {
    this.loadData();
    this.loadMyLoans();
  }

  loadData() {
    this.isLoading.set(true);
    // ForkJoin or separate? Separate is fine for now
    this.libraryService.getGenres().subscribe(genres => this.genres.set(genres));
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
}
