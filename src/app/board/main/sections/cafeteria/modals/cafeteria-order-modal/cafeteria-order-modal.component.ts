import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalManager } from '@Schoolingo/modal';
import { Locale } from '@Schoolingo/locale';
import { IconsModule } from '@Schoolingo/icons';
import { DropdownComponent } from '@Components/dropdown/dropdown';

@Component({
  selector: 'app-cafeteria-order-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule, DropdownComponent],
  template: `
    <div class="modal-body">
      <div class="form-group">
        <label class="form-label">{{ l.s('canteen.select_meal') }}</label>
        <schoolingo-dropdown [options]="mealOptions" [(ngModel)]="selectedMealId" (ngModelChange)="onMealSelect()" [settings]="{ locale: false }"></schoolingo-dropdown>
      </div>
      @if (selectedMealDetails) {
        <div class="meal-details" style="margin-top: 1rem; padding: 1rem; background: var(--surface-2); border-radius: 8px;">
           <div style="font-weight: 500; margin-bottom: 0.5rem">{{ selectedMealDetails.name }}</div>
           @if (selectedMealDetails.allergens) {
             <div style="font-size: 0.85rem; color: var(--text-muted);">{{ l.s('canteen.allergens') }}: {{ selectedMealDetails.allergens }}</div>
           }
        </div>
      }
    </div>
    <div class="modal-actions">
      <button class="btn btn--secondary" (click)="close()">{{ l.s('buttons.cancel') }}</button>
      <button class="btn btn--primary" [disabled]="selectedMealId === undefined" (click)="confirm()">
        <i-tabler name="device-floppy"></i-tabler>
        {{ l.s('buttons.save') }}
      </button>
    </div>
  `
})
export class CafeteriaOrderModalComponent implements OnInit {
  public modalManager = inject(ModalManager);
  public l = inject(Locale);
  
  public data: any;
  public mealOptions: any[] = [];
  public selectedMealId: number | null = null;

  ngOnInit() {
    this.data = this.modalManager.getModalData('cafeteria-order-modal');
    if (this.data && this.data.meals) {
      this.mealOptions = this.data.meals.map((m: any) => {
        let label = `${this.l.s('canteen.weekly_menu_td')} ${m.variant_index}`;
        if (m.name) label += `: ${m.name}`;
        return {
          label: label,
          value: m.menu_id
        };
      });
    }
    if (this.data && this.data.selectedMealId !== undefined) {
      this.selectedMealId = this.data.selectedMealId;
      this.onMealSelect();
    }
  }

  public selectedMealDetails: any = null;

  public onMealSelect(): void {
    if (!this.selectedMealId || !this.data || !this.data.meals) {
      this.selectedMealDetails = null;
      return;
    }
    this.selectedMealDetails = this.data.meals.find((m: any) => m.menu_id === this.selectedMealId);
  }

  close() {
    this.modalManager.closeModal('cafeteria-order-modal');
  }

  confirm() {
    if (this.selectedMealId !== undefined) {
      if (this.data.onConfirm) {
         this.data.onConfirm(this.selectedMealId);
      }
      this.close();
    }
  }
}
