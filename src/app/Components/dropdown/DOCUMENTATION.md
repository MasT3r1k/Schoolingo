# Dropdown Component - Dokumentace

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
    { label: 'Option 1', value: 'opt1' },
    { label: 'Option 2', value: 'opt2' },
    { label: 'Option 3', value: 'opt3' },
  ];
}
```

---

## API Reference
### Input Properties

| Property | Type | Default | Popis |
|----------|------|---------|-------|
| `options` | `DropdownOption[]` | `[]` | Options |
| `value` | `any` | `null` | Selected option |
| `placeholder` | `string` | `'Vyberte možnost...'` | Placeholder text |
| `disabled` | `boolean` | `false` | Disable interaction with dropdown |
| `clearable` | `boolean` | `true` | Show button to clear selected option |

### Output Events

| Event | Typ | Popis |
|-------|-----|-------|
| `valueChange` | `EventEmitter<any>` | Emits when the value is change |
| `opened` | `EventEmitter<boolean>` | Emits when the dropdown is opened / closed |

### DropdownOption Interface
```typescript
interface DropdownOption {
  label: string;
  value: any;
  disabled?: boolean;
}
```

---

## Examples

### 1. Two-Way Binding
```html
<schoolingo-dropdown
  [options]="categories"
  [(ngModel)]="selectedCategory"
></schoolingo-dropdown>

<p>Selected: {{ selectedCategory }}</p>
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
  console.log('New Country:', country);
  this.loadCities(country);
}
```

### 3. S Placeholderem a Disabled
```html
<schoolingo-dropdown
  [options]="options"
  [(ngModel)]="value"
  placeholder="Please select"
  [disabled]="isLoading"
></schoolingo-dropdown>
```

### 4. S Deaktivovanými Položkami
```typescript
options: DropdownOption[] = [
  { label: 'Valid option', value: 1 },
  { label: 'Disabled option', value: 2, disabled: true },
  { label: 'Another valid option', value: 3 },

];
```

---

## Keyboard Shortcuts

| Keyboard | Effect |
|---------|-------|
| **Enter / Space** | Open dropdown / select option |
| **ArrowDown** | Move to next option |
| **ArrowUp** | Move to previous option |
| **Escape** | Close dropdown |
| **Tab** | Close dropdown and move to another element |

---

## Troubleshooting

### Dropdown doesn't show up
**Solve**: Make sure component has css: `width: 100%` in the parent element

### Search input doesn't show up
**Solve**: You need to have at least 10 options in array

### Value doesn't update
**Solves**: 
1. Make sure you are using `[(ngModel)]` or `(valueChange)` event
2. Import `FormsModule` in component

### Keyboard navigation isn't working
**Solve**: Make sure dropdown element is focused

---

## Performance Tips

1. **Change Detection**: Use `ChangeDetectionStrategy.OnPush` for better performance
2. **Lazy Rendering**: Options are rendered only when the dropdown is opened
3. **Virtualization**: For really big list of options is recommended to use virtual scroll

```typescript
// Add Virtual scroll
import { ScrollingModule } from '@angular/cdk/scrolling';

@Component({
  imports: [ScrollingModule, ...],
})
```

---

## Expand components

### Custom Renderer for Options
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

### Custom search logic
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