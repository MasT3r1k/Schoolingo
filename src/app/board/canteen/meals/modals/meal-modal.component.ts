import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ModalManager } from '@Schoolingo/modal';
import { Config } from '@Schoolingo/config';
import { Locale } from '@Schoolingo/locale';
import { DropdownComponent } from '@Components/dropdown/dropdown';

@Component({
  selector: 'app-canteen-meal-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, DropdownComponent],
  template: `
    <div class="modal-body">
      <div class="form-group">
        <label class="form-label">
          {{ l.s('canteen.meal_name') }}
        </label>
        <input type="text" class="form-input" [placeholder]="l.s('canteen.meal_name_placeholder')" [(ngModel)]="mealForm.name">
      </div>
      
      <div class="form-group">
        <label class="form-label">
          {{ l.s('canteen.category') }}
        </label>
        <schoolingo-dropdown [options]="categoryOptions" [(ngModel)]="mealForm.category" [settings]="{ locale: false }" [clearable]="false" style="width: 100%;"></schoolingo-dropdown>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
        <div class="form-group">
          <label class="form-label">
            {{ l.s('canteen.price') }}
          </label>
          <input type="number" class="form-input" min="0" [(ngModel)]="mealForm.price">
        </div>
        <div class="form-group">
          <label class="form-label">
            {{ l.s('canteen.calories') }}
          </label>
          <input type="number" class="form-input" min="0" [placeholder]="l.s('canteen.calories_placeholder')" [(ngModel)]="mealForm.calories">
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">
          {{ l.s('canteen.allergens') }}
        </label>
        <input type="text" class="form-input" placeholder="Např. 1, 3, 7" [(ngModel)]="mealForm.allergens">
        <small style="color: var(--text-muted); font-size: 0.75rem;">
          {{ l.s('canteen.allergens_hint') }}
        </small>
      </div>
    </div>
    <div class="modal-actions">
      <button class="btn btn--secondary" (click)="closeModal()">
        {{ l.s('buttons.cancel') }}
      </button>
      <button class="btn btn--primary" (click)="saveMeal()" [disabled]="!mealForm.name.trim()">
        {{ l.s('canteen.save_meal') }}
      </button>
    </div>
  `
})
export class CanteenMealModalComponent implements OnInit {
  public l = inject(Locale);
  private http = inject(HttpClient);
  public modalManager = inject(ModalManager);

  public mealForm = {
    meal_id: null as number | null,
    name: '',
    category: 'meat' as 'meat' | 'veg' | 'sweet' | 'other',
    price: 80,
    calories: null as number | null,
    allergens: ''
  };

  public categoryOptions: { label: string, value: string }[] = [];

  ngOnInit(): void {
    this.categoryOptions = [
      { label: this.l.s('canteen.category_meat'), value: 'meat' },
      { label: this.l.s('canteen.category_veg'), value: 'veg' },
      { label: this.l.s('canteen.category_sweet'), value: 'sweet' },
      { label: this.l.s('canteen.category_other'), value: 'other' }
    ];

    const data = this.modalManager.getModalData('canteen-meal-modal');
    if (data?.meal) {
      this.mealForm = {
        meal_id: data.meal.meal_id,
        name: data.meal.name,
        category: data.meal.category,
        price: parseFloat(data.meal.price) || 0,
        calories: data.meal.calories,
        allergens: data.meal.allergens || ''
      };
    }
  }

  saveMeal() {
    const payload = {
      name: this.mealForm.name,
      category: this.mealForm.category,
      price: this.mealForm.price,
      calories: this.mealForm.calories,
      allergens: this.mealForm.allergens || null
    };

    const url = this.mealForm.meal_id 
      ? `${Config.API_URL}/v1/canteen/meal/${this.mealForm.meal_id}`
      : `${Config.API_URL}/v1/canteen/meal`;
    
    const request = this.mealForm.meal_id
      ? this.http.put(url, payload, { withCredentials: true })
      : this.http.post(url, payload, { withCredentials: true });

    request.subscribe(() => {
      const data = this.modalManager.getModalData('canteen-meal-modal');
      if (data?.refreshCallback) {
        data.refreshCallback();
      }
      this.modalManager.closeModal('canteen-meal-modal');
    });
  }

  closeModal() {
    this.modalManager.closeModal('canteen-meal-modal');
  }
}
