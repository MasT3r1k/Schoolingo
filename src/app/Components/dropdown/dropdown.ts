import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, inject, forwardRef } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, NG_VALUE_ACCESSOR } from "@angular/forms";
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
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => DropdownComponent),
            multi: true
        }
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DropdownComponent implements OnInit, OnDestroy {
    @Input() options: DropdownOption[] = [];
    @Input() public settings: { locale?: boolean } = { locale: true };
    @Input() value: any = null;
    @Input() placeholder: string = 'buttons.choose';
    @Input() disabled: boolean = false;
    @Input() clearable: boolean = true;

    @Output() valueChange = new EventEmitter<any>();
    @Output() opened = new EventEmitter<boolean>();

    @ViewChild('trigger') trigger!: ElementRef<HTMLButtonElement>;
    @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;
    @ViewChild('optionsList') optionsList!: ElementRef<HTMLDivElement>;

    isOpen: boolean = false;
    searchQuery: string = '';
    filteredOptions: DropdownOption[] = [];
    highlightedIndex: number = -1;
    
    dropdownPosition: 'down' | 'up' = 'down';
    panelStyles: Record<string, string | number> = {};

    public l = inject(Locale);

    constructor(private cdr: ChangeDetectorRef) {}

    public getLabel(text: string): string {
        return this.settings.locale ? this.l.s(text) : text;
    }

    ngOnInit() {
        console.log(this.settings.locale)
        this.filteredOptions = this.options;
        window.addEventListener('scroll', this.updatePosition, true);
        window.addEventListener('resize', this.updatePosition, true);
    }

    ngOnDestroy() {
        window.removeEventListener('scroll', this.updatePosition, true);
        window.removeEventListener('resize', this.updatePosition, true);
    }

    updatePosition = () => {
        if (this.isOpen) {
            this.calculatePosition();
            this.cdr.markForCheck();
        }
    };

    get selectedLabel(): string {
        const selected = this.options.find(opt => opt.value === this.value);
        return selected ? this.getLabel(selected.label) : this.l.s(this.placeholder);
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
            this.calculatePosition();
            setTimeout(() => {
                this.searchInput?.nativeElement?.focus();
            });
        }

        this.cdr.markForCheck();
    }

    calculatePosition(): void {
        if (!this.trigger) return;

        const rect = this.trigger.nativeElement.getBoundingClientRect();
        const panelMaxHeight = 360;
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;

        if (spaceBelow < panelMaxHeight && spaceAbove > spaceBelow) {
            this.dropdownPosition = 'up';
            this.panelStyles = {
                position: 'fixed',
                bottom: `${window.innerHeight - rect.top}px`,
                left: `${rect.left}px`,
                width: `${rect.width}px`,
                zIndex: 9999
            };
        } else {
            this.dropdownPosition = 'down';
            this.panelStyles = {
                position: 'fixed',
                top: `${rect.bottom}px`,
                left: `${rect.left}px`,
                width: `${rect.width}px`,
                zIndex: 9999
            };
        }
    }

    onSearchChange(query: string | null): void {
        this.searchQuery = query!;
        this.filteredOptions = this.options.filter(opt =>
            opt.label.toLowerCase().includes(query!.toLowerCase())
        );
        this.highlightedIndex = this.filteredOptions.length > 0 ? 0 : -1;
        this.scrollToHighlighted();
        this.calculatePosition();
        this.cdr.markForCheck();
    }

    selectOption(option: DropdownOption, event?: Event): void {
        if (event) event.stopPropagation();
        if (option.disabled) return;

        this.value = option.value;
        this.valueChange.emit(this.value);
        this.onChange(this.value);
        this.onTouched();
        this.closeDropdown();
        this.cdr.markForCheck();
    }

    clearValue(event: Event): void {
        event.stopPropagation();
        this.value = null;
        
        this.valueChange.emit(null);
        this.onChange(null);
        this.onTouched();
        
        this.closeDropdown();
        this.cdr.markForCheck();
    }

    closeDropdown(): void {
        this.isOpen = false;
        this.searchQuery = '';
        this.filteredOptions = this.options;
        this.highlightedIndex = -1;
        this.opened.emit(false);
        this.onTouched();
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
            this.highlightedIndex = Math.min(this.highlightedIndex + 1, this.filteredOptions.length - 1);
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

    onChange: any = () => {};
    onTouched: any = () => {};

    writeValue(value: any): void {
        this.value = value;
        this.cdr.markForCheck();
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
        this.cdr.markForCheck();
    }
}