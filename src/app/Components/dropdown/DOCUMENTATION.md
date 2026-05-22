# Dropdown Component - Dokumentace

## Přehled

Plnohodnotná Angular dropdown komponenta s podporou:
- ✅ Keyboard navigace (šipky, Enter, Space, Escape)
- ✅ Vyhledávání (automaticky se zobrazí nad 10 položek)
- ✅ Scrollování s smooth perf
- ✅ Two-way data binding
- ✅ Event emittery pro reagování na změny
- ✅ Accessibility (ARIA atributy, semantic HTML)
- ✅ Responsive design
- ✅ Deaktivace položek
- ✅ Smazání vybrané hodnoty

---

## Instalace a Setup

### HTML Template
```html
<schoolingo-dropdown
  [options]="myOptions"
  [(ngModel)]="selectedValue"
></schoolingo-dropdown>
```

### TypeScript
```typescript
import { DropdownOption } from './dropdown.component';

export class MyComponent {
  selectedValue: any = null;
  
  myOptions: DropdownOption[] = [
    { label: 'Volba 1', value: 'opt1' },
    { label: 'Volba 2', value: 'opt2' },
    { label: 'Volba 3', value: 'opt3' },
  ];
}
```

---

## API Reference

### Input Properties

| Property | Type | Default | Popis |
|----------|------|---------|-------|
| `options` | `DropdownOption[]` | `[]` | Pole dostupných voleb |
| `value` | `any` | `null` | Aktuálně vybraná hodnota |
| `placeholder` | `string` | `'Vyberte možnost...'` | Text placeholderu |
| `disabled` | `boolean` | `false` | Zakázat interakci s dropdownem |
| `clearable` | `boolean` | `true` | Zobrazit tlačítko pro smazání |

### Output Events

| Event | Typ | Popis |
|-------|-----|-------|
| `valueChange` | `EventEmitter<any>` | Emituje se když se změní vybraná hodnota |
| `opened` | `EventEmitter<boolean>` | Emituje se když se dropdown otevře/zavře |

### DropdownOption Interface
```typescript
interface DropdownOption {
  label: string;      // Text zobrazovaný uživateli
  value: any;         // Hodnota vrácená při výběru
  disabled?: boolean; // Volitelně deaktivovat položku
}
```

---

## Příklady Použití

### 1. Two-Way Binding
```html
<schoolingo-dropdown
  [options]="categories"
  [(ngModel)]="selectedCategory"
></schoolingo-dropdown>

<p>Vybrané: {{ selectedCategory }}</p>
```

### 2. One-Way Binding + Event
```html
<schoolingo-dropdown
  [options]="countries"
  [value]="selectedCountry"
  (valueChange)="onCountryChanged($event)"
></schoolingo-dropdown>
```

```typescript
onCountryChanged(country: any): void {
  console.log('Nová země:', country);
  this.loadCities(country);
}
```

### 3. S Placeholderem a Disabled
```html
<schoolingo-dropdown
  [options]="options"
  [(ngModel)]="value"
  placeholder="Prosím vyberte..."
  [disabled]="isLoading"
></schoolingo-dropdown>
```

### 4. S Deaktivovanými Položkami
```typescript
options: DropdownOption[] = [
  { label: 'Aktivní volba', value: 1 },
  { label: 'Deaktivovaná volba', value: 2, disabled: true },
  { label: 'Další aktivní', value: 3 },
];
```

---

## Keyboard Shortcuts

| Klávesa | Efekt |
|---------|-------|
| **Enter / Space** | Otevřít dropdown / Vybrat položku |
| **ArrowDown** | Přesunout se na další položku |
| **ArrowUp** | Přesunout se na předchozí položku |
| **Escape** | Zavřít dropdown |
| **Tab** | Zavřít dropdown a přesunout se na další prvek |

---

## Best Practices

### ✅ Dobré Praktiky
1. Vždy poskytni `placeholder` pro lepší UX
2. Používej `DropdownOption` interface pro správnou typizaci
3. Debounce API volání v `valueChange` eventu
4. Validuj selected value na serveru

---

## Accessibility (a11y)

Komponenta splňuje WCAG 2.1 AA standardy:
- ✅ ARIA attributes (`aria-haspopup`, `aria-expanded`, `role="option"`)
- ✅ Semantic HTML (`<button>`, `<input>`)
- ✅ Keyboard navigace
- ✅ Focus management
- ✅ Color contrast (splňuje 4.5:1 ratio)

---

## Troubleshooting

### Problém: Dropdown se nezobrazuje
**Řešení**: Zajisti, že komponenta má `width: 100%` v parent kontejneru

### Problém: Search se nezobrazuje
**Řešení**: Musíš mít v options array **více jak 10 položek**

### Problém: Value se neupdatuje
**Řešení**: 
1. Ujisti se, že používáš `[(ngModel)]` nebo `(valueChange)` event
2. Importuj `FormsModule` v komponentě

### Problém: Keyboard navigace nefunguje
**Řešení**: Ujisti se, že je dropdown element focused (klikni na něj)

---

## Performance Tips

1. **Change Detection**: Komponenta používá `ChangeDetectionStrategy.OnPush` pro optimální výkon
2. **Lazy Rendering**: Options se renderují jenom když je dropdown otevřený
3. **Virtualization**: Pro extra velké listy (1000+) zvážit implementaci virtual scroll

```typescript
// Přidání virtual scroll pro velké listy
import { ScrollingModule } from '@angular/cdk/scrolling';

@Component({
  imports: [ScrollingModule, ...],
})
```

---

## Pro Pokročilé: Rozšíření Komponenty

### Přidání Custom Renderer pro Optiony
```typescript
// V dropdown.component.ts
@Input() optionTemplate?: TemplateRef<any>;

// V dropdown.html
<ng-container *ngIf="optionTemplate; else defaultOption">
  <ng-container *ngTemplateOutlet="optionTemplate; context: { $implicit: option }"></ng-container>
</ng-container>
<ng-template #defaultOption>
  <span>{{ option.label }}</span>
</ng-template>
```

### Přidání Custom Search Logiky
```typescript
@Input() customSearchFn?: (query: string, options: DropdownOption[]) => DropdownOption[];

onSearchChange(query: string): void {
  if (this.customSearchFn) {
    this.filteredOptions = this.customSearchFn(query, this.options);
  } else {
    // Default search
  }
}
```