# Schoolingo Development Rules and Guidelines

Welcome to Schoolingo project. When writing or modifying frontend components, you MUST follow these guidelines to maintain visual consistency, structure, and reuse existing components.

---

## 1. Modals System (`ModalManager`)
Do NOT create custom inline overlays or custom HTML overlays for modals. Always use the built-in dynamic modal system.

* **Importing:**
  ```typescript
  import { ModalManager } from '@Schoolingo/modal';
  ```
* **Adding a Modal (in Parent Component):**
  Register modals in `ngOnInit()` using `addModal`:
  ```typescript
  this.modalManager.addModal('my-modal-id', {
    title: 'My Modal Title',
    icon: 'settings', // Tabler icon name
    width: 500, // width in pixels
    closeable: true,
    items: [
      { type: 'component', component: MyModalComponent }
    ]
  });
  ```
* **Opening a Modal:**
  ```typescript
  this.modalManager.openModal('my-modal-id', {
    someData: 'hello',
    refreshCallback: () => this.refreshParentData()
  });
  ```
* **Inside the Modal Component:**
  - Retrieve data: `const data = this.modalManager.getModalData('my-modal-id');`
  - Close modal: `this.modalManager.closeModal('my-modal-id');`
  - The modal template should only contain `.modal-body` and `.modal-actions` divs. The outer envelope and header are handled by `schoolingo-modals`.

---

## 2. Dropdown Component (`schoolingo-dropdown`)
Do NOT use plain HTML `<select>` elements for option lists. Always use the custom dropdown component.

* **Importing:**
  ```typescript
  import { DropdownComponent } from '@Components/dropdown/dropdown';
  ```
* **Adding to Imports:**
  ```typescript
  @Component({
    imports: [DropdownComponent, ...],
    ...
  })
  ```
* **HTML Usage:**
  ```html
  <schoolingo-dropdown [options]="myOptions" [(ngModel)]="myValue"></schoolingo-dropdown>

  <!-- With settings to disable auto-localization -->
  <schoolingo-dropdown [options]="myOptions" [(ngModel)]="myValue" [settings]="{ locale: false }"></schoolingo-dropdown>
  ```
* **Options Format:**
  Must be an array of `DropdownOption` objects:
  ```typescript
  myOptions = [
    { label: 'Option A', value: 'a' },
    { label: 'Option B', value: 'b' }
  ];
  ```
* **Settings Input (`[settings]`):**
  Configure behavior using `{ locale?: boolean }`.
  * `locale` (default: `true`): If `true`, the dropdown automatically translates option labels using the localization system (`Locale.s`). Set to `false` if the labels are already localized or should be displayed exactly as provided.
* **Clearable Input (`[clearable]`):**
  Configure if selection can be cleared using `[clearable]="true|false"`.
  * `clearable` (default: `true`): If `true`, a clear button is displayed next to the selected option to allow resetting the value to `null`. Set to `false` if you want to prevent the user from deselecting once an option is chosen.

---

## 3. Delete Template Style
When designing confirmation modals for deleting objects, follow the standard delete draft look. Avoid browser `confirm()` calls.

* **HTML Structure:**
  ```html
  <div class="draft-preview-container">
    <div class="draft-card">
      <div class="draft-topic">
        <i-tabler name="trash-icon"></i-tabler>
        {{ objectName }}
      </div>
      <div class="draft-snippet">
        Opravdu chcete toto [jídlo/soubor/zprávu] smazat? Tato akce je trvalá.
      </div>
    </div>
  </div>
  
  <div class="modal-actions">
    <button class="btn btn--secondary" (click)="closeModal()">Zrušit</button>
    <button class="btn btn--danger" (click)="confirmDelete()">
      <i-tabler name="trash"></i-tabler>
      Smazat
    </button>
  </div>
  ```
* **CSS Styles (scope locally if needed or import):**
  ```css
  .draft-preview-container {
      margin: 0.5rem 0 2.5rem;
  }
  .draft-card {
      background: var(--surface-2);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 1.25rem;
      text-align: left;
      position: relative;
      box-shadow: var(--shadow-sm);
  }
  .draft-card:hover {
      transform: translateY(-2px) scale(1.01);
      border-color: var(--danger-700);
  }
  .draft-topic {
      font-weight: 700;
      color: var(--text);
      margin-bottom: 0.5rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
  }
  .draft-snippet {
      color: var(--text-muted);
      font-size: 0.875rem;
  }
  ```

---

## 4. UI Forms styling
Always style inputs and buttons using standard Schoolingo classes:
* Containers: `.form-group`
* Labels: `.form-label`
* Inputs/Fields: `.form-input`
* Actions: `.modal-actions` (wraps footer buttons)
* General buttons: `.btn` (modifiers: `.btn--primary`, `.btn--secondary`, `.btn--danger`, `.btn--ghost`)

---

## 5. Localization System (`Locale`)
Do NOT use hardcoded text strings in component templates or TypeScript files. Always use the built-in localization service.

* **Importing:**
  ```typescript
  import { Locale } from '@Schoolingo/locale';
  ```
* **Injecting:**
  ```typescript
  l = inject(Locale);
  ```
* **HTML Usage:**
  ```html
  <p>{{ l.s('module_name.translation_key') }}</p>
  
  <!-- With parameters/placeholders -->
  <span>{{ l.s('module_name.parameterized_key', { paramName: value }) }}</span>
  ```
* **TypeScript Usage:**
  ```typescript
  const alertText = this.l.s('module_name.alert_message');
  ```
* **Locale Files:**
  Translations are loaded from the backend localization files located in `SchoolingoElysia/src/locales/` (e.g. `Czech.json` and `English.json`). Always add matching keys to both files when introducing new translation paths.

---

## 6. CSS Styling Rules
* **No Inline Styles:**
  All component-specific CSS MUST be written in external `.css` files (referenced via `styleUrl` or `styleUrls` in the `@Component` metadata). Avoid using the inline `styles: [...]` property.
* **Reuse Existing Styles:**
  Eagerly reuse styles, classes, layouts, and CSS variables defined in global styles (e.g. `src/styles.css`) or standard components (such as `.mt-progress`, `.btn-spinner`, `.form-group`, etc.).
* **Custom CSS Fallback:**
  Write custom CSS rules in the component's style sheet only when a matching global class or utility does not exist or does not fit the design requirements.

---

## 7. Tabs Component (`schoolingo-tabs`)
Do NOT use custom badge lists or custom HTML button groups for filtering or tab views. Always use the built-in tabs component.

* **Importing:**
  ```typescript
  import { TabsComponent } from '@Components/Tabs';
  ```
* **Adding to Imports:**
  ```typescript
  @Component({
    imports: [TabsComponent, ...],
    ...
  })
  ```
* **HTML Usage:**
  ```html
  <schoolingo-tabs [options]="tabOptions" [icons]="tabIcons" [value]="tabValue" prefix="translation_prefix."></schoolingo-tabs>
  ```
* **Properties Setup:**
  ```typescript
  import { BehaviorSubject } from 'rxjs';

  tabOptions = ['all', 'meat', 'veg'];
  tabIcons = ['list', 'drumstick', 'leaf']; // Tabler icon names or null
  tabValue = new BehaviorSubject<number>(0);

  // Listen for changes in ngOnInit
  this.tabValue.subscribe((index) => {
    // Handle tab change (e.g. index 0 -> 'all', 1 -> 'meat', etc.)
  });
  ```

---

## 8. Checkbox Component (`schoolingo-checkbox`)
Do NOT use plain HTML `<input type="checkbox">` elements. Always use the custom checkbox component.

* **Importing:**
  ```typescript
  import { CheckboxComponent } from '@Components/Checkbox';
  ```
* **Adding to Imports:**
  ```typescript
  @Component({
    imports: [CheckboxComponent, ...],
    ...
  })
  ```
* **HTML Usage:**
  ```html
  <schoolingo-checkbox [checked]="myValue" (click)="myValue = !myValue"></schoolingo-checkbox>
  ```

---

## 9. Page Layout and Card Structure
Every main page or major component view MUST follow the standard card structure to maintain consistent padding, margins, shadows, and top borders.

* **HTML Structure:**
  ```html
  <div class="card">
    <div class="card-top"></div>
    <div class="card-header">
      <h2>
        <i-tabler name="icon-name"></i-tabler>
        <span>Page Title</span>
      </h2>
      <div class="flex-items">
        <!-- Actions, filters, buttons (optional) -->
      </div>
    </div>
    <div class="card-body">
      <!-- Main Content -->
    </div>
  </div>
  ```
* **Key Guidelines:**
  * **Top Highlight (`.card-top`):** Always include `<div class="card-top"></div>` directly under the parent `.card` class to render the decorative top line highlight.
  * **Headers:** Header elements `<h2>` inside `.card-header` must include an `<i-tabler>` icon next to the page title span for visual recognition.
  * **Consistency:** Avoid using standalone `<h2>` tags outside the card hierarchy. All main headers, searches, lists, and tables should be nested inside `.card-body` or a card structure.






---

## 10. Tabler Icons Sizing
When styling <i-tabler> icons, you MUST define their size using width and height CSS properties, rather than ont-size. Use ont-size only for text.

---

## 11. Locales from Backend
Always use locales from the backend for any text strings (using the `Locale` service and its `l.s()` method). Do not hardcode raw Czech or English texts directly into the HTML or TypeScript files.

---

## 12. Stat Cards
Do NOT use raw HTML markup for stat cards (e.g. `<div class="stat-card">`). Always use the built-in component from `@Components/stat-card/stat-card.component`. Example usage:
``html
<stat-card type="primary" icon="calendar-event" label="translation.key" [value]="myValue" sub="translation.sub_key"></stat-card>
``

