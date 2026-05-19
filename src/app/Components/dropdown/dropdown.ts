import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { IconsModule } from "@Schoolingo/icons";
import { Locale } from "@Schoolingo/locale";

export interface DropdownOption {
  label: string;
  value: any;
  disabled?: boolean;
}

@Component({
  selector: 'schoolingo-dropdown',
  templateUrl: './dropdown.html',
  styleUrl: './dropdown.css',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DropdownComponent implements OnInit {
  @Input() options: DropdownOption[] = [];
  @Input() value: any = null;
  @Input() placeholder: string = 'buttons.choose';
  @Input() disabled: boolean = false;
  @Input() clearable: boolean = true;

  @Output() valueChange = new EventEmitter<any>();
  @Output() opened = new EventEmitter<boolean>();

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;
  @ViewChild('optionsList') optionsList!: ElementRef<HTMLDivElement>;

  isOpen: boolean = false;
  searchQuery: string = '';
  filteredOptions: DropdownOption[] = [];
  highlightedIndex: number = -1;

  public l = inject(Locale);

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.filteredOptions = this.options;
  }

  get selectedLabel(): string {
    const selected = this.options.find(opt => opt.value === this.value);
    return selected ? selected.label : this.placeholder;
  }

  get showSearch(): boolean {
    return this.options.length > 10;
  }

  toggleDropdown(event: Event): void {
    event.stopPropagation();
    if (this.disabled) return;

    this.isOpen = !this.isOpen;
    this.highlightedIndex = -1;
    this.searchQuery = '';
    this.filteredOptions = this.options;
    this.opened.emit(this.isOpen);

    if (this.isOpen) {
      setTimeout(() => {
        this.searchInput?.nativeElement?.focus();
      });
    }

    this.cdr.markForCheck();
  }

  onSearchChange(query: string | null): void {
    this.searchQuery = query!;
    this.filteredOptions = this.options.filter(opt =>
      opt.label.toLowerCase().includes(query!.toLowerCase())
    );
    this.highlightedIndex = this.filteredOptions.length > 0 ? 0 : -1;
    this.scrollToHighlighted();
    this.cdr.markForCheck();
  }

  selectOption(option: DropdownOption, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    if (option.disabled) return;

    this.value = option.value;
    this.valueChange.emit(this.value);
    this.closeDropdown();
    this.cdr.markForCheck();
  }

  clearValue(event: Event): void {
    event.stopPropagation();
    this.value = null;
    this.valueChange.emit(null);
    this.closeDropdown();
    this.cdr.markForCheck();
  }

  closeDropdown(): void {
    this.isOpen = false;
    this.searchQuery = '';
    this.filteredOptions = this.options;
    this.highlightedIndex = -1;
    this.opened.emit(false);
    this.cdr.markForCheck();
  }

  onKeyDown(event: KeyboardEvent): void {
    if (!this.isOpen) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        this.toggleDropdown(event);
      }
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.highlightedIndex = Math.min(
          this.highlightedIndex + 1,
          this.filteredOptions.length - 1
        );
        this.scrollToHighlighted();
        break;

      case 'ArrowUp':
        event.preventDefault();
        this.highlightedIndex = Math.max(this.highlightedIndex - 1, -1);
        this.scrollToHighlighted();
        break;

      case 'Enter':
      case ' ':
        event.preventDefault();
        if (this.highlightedIndex >= 0 && this.filteredOptions[this.highlightedIndex]) {
          this.selectOption(this.filteredOptions[this.highlightedIndex]);
        }
        break;

      case 'Escape':
        event.preventDefault();
        this.closeDropdown();
        break;

      case 'Tab':
        this.closeDropdown();
        break;
    }

    this.cdr.markForCheck();
  }

  private scrollToHighlighted(): void {
    setTimeout(() => {
      const highlightedElement = document.querySelector('.option.highlighted');
      if (highlightedElement && this.optionsList) {
        highlightedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        });
      }
    });
  }

  onMouseEnter(index: number): void {
    this.highlightedIndex = index;
    this.cdr.markForCheck();
  }

  isOptionSelected(option: DropdownOption): boolean {
    return this.value === option.value;
  }
}