import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Locale } from '@Schoolingo/locale';
import { IconsModule } from '@Schoolingo/icons';
import { ModalManager } from '@Schoolingo/modal';
import { Config } from '@Schoolingo/config';
import { CalendarComponent } from '@Components/calendar';
import moment from 'moment';

@Component({
  selector: 'inventory-item-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule, CalendarComponent],
  template: `
    <div class="card__body">
        <div class="form-group">
            <label class="form-label">{{ l.s('architecture.inventory_fields.name') }}</label>
            <input type="text" class="form-input" [(ngModel)]="itemForm.name" [placeholder]="l.s('architecture.placeholders.item_name')">
        </div>
        <div class="form-row">
            <div class="form-group">
                <label class="form-label">{{ l.s('architecture.inventory_fields.category') }}</label>
                <input type="text" class="form-input" [(ngModel)]="itemForm.category" [placeholder]="l.s('architecture.placeholders.category')">
            </div>
            <div class="form-group">
                <label class="form-label">{{ l.s('architecture.inventory_fields.serial_number') }}</label>
                <input type="text" class="form-input" [(ngModel)]="itemForm.serial_number" [placeholder]="l.s('architecture.placeholders.serial_number')">
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label class="form-label">{{ l.s('architecture.inventory_fields.room') }}</label>
                <select class="form-select" [(ngModel)]="itemForm.room_id">
                    <option [value]="null">{{ l.s('architecture.unassigned_room') }}</option>
                    @for (room of rooms; track room.br_id) {
                        <option [value]="room.br_id">{{ room.building_name }} - {{ room.name }}</option>
                    }
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">{{ l.s('architecture.inventory_fields.status') }}</label>
                <select class="form-select" [(ngModel)]="itemForm.status">
                    @for (st of ['active', 'broken', 'maintenance', 'discarded']; track st) {
                        <option [value]="st">{{ l.s('architecture.inventory_status.' + st) }}</option>
                    }
                </select>
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label class="form-label">{{ l.s('architecture.inventory_fields.acquisition_date') }}</label>
                <app-calendar id="acquisition_date" [value]="itemForm.acquisition_date" (valueChange)="itemForm.acquisition_date = $event" size="full"></app-calendar>
            </div>
            <div class="form-group">
                <label class="form-label">{{ l.s('architecture.inventory_fields.purchase_price') }}</label>
                <input type="number" class="form-input" [(ngModel)]="itemForm.purchase_price">
            </div>
        </div>
        <div class="form-group">
            <label class="form-label">{{ l.s('architecture.inventory_fields.description') }}</label>
            <textarea class="form-input" style="min-height: 100px" [(ngModel)]="itemForm.description" [placeholder]="l.s('architecture.placeholders.room_description')"></textarea>
        </div>
    </div>
    <div class="card__footer">
        <button class="btn btn--secondary" (click)="closeModal()">{{ l.s('cancel') }}</button>
        <button class="btn btn--primary" (click)="saveItem()">{{ l.s('buttons.save') }}</button>
    </div>
  `,
  styles: [`
    .card__body { padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem; }
    .card__footer { padding: 1.5rem; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; gap: 0.75rem; }
    .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .form-label { font-size: 0.875rem; font-weight: 500; color: var(--text); }
    .form-input, .form-select { padding: 0.75rem 1rem; background: var(--surface-2); border: 1px solid var(--border); border-radius: var(--radius); font-size: 0.9375rem; color: var(--text); }
    @media (max-width: 768px) {
        .form-row { grid-template-columns: 1fr; }
    }
  `]
})
export class InventoryItemModalComponent implements OnInit {
  public l = inject(Locale);
  private http = inject(HttpClient);
  private modalManager = inject(ModalManager);
 
  public rooms: any[] = [];
  public itemForm: any = {
    room_id: null,
    name: '',
    category: '',
    description: '',
    serial_number: '',
    acquisition_date: moment(),
    purchase_price: 0,
    status: 'active'
  };
  private editingId: number | null = null;
 
  ngOnInit(): void {
    const data = this.modalManager.getModalData('inventory-item');
    if (data) {
      this.rooms = data.rooms || [];
      if (data.item) {
        this.itemForm = { 
            ...data.item,
            acquisition_date: moment(data.item.acquisition_date)
        };
        this.editingId = data.item.inventory_id;
      }
    }
  }
 
  saveItem(): void {
    const url = `${Config.API_URL}/v1/school/inventory`;
    const payload = { 
        ...this.itemForm, 
        inventory_id: this.editingId,
        acquisition_date: this.itemForm.acquisition_date.format('YYYY-MM-DD')
    };
    
    this.http.post(url, payload, { withCredentials: true })
        .subscribe(() => {
            const data = this.modalManager.getModalData('inventory-item');
            if (data?.refreshCallback) data.refreshCallback();
            this.modalManager.closeModal('inventory-item');
        });
  }
 
  closeModal(): void {
    this.modalManager.closeModal('inventory-item');
  }
}
