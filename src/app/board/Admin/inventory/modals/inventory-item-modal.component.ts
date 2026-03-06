import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Locale } from '@Schoolingo/locale';
import { IconsModule } from '@Schoolingo/icons';
import { ModalManager } from '@Schoolingo/modal';
import { Config } from '@Schoolingo/config';
import { DropdownManager } from '@Schoolingo/dropdown';
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
                <div class="custom-select"
                    (click)="$event.stopPropagation();dropdownManager.selected_dropdown = dropdownManager.selected_dropdown == 'inventory_room' ? '' : 'inventory_room'">
                    <div class="selected-value">
                        {{ getRoomName() }}
                        <i-tabler name="chevron-down"></i-tabler>
                    </div>
                    @if (dropdownManager.selected_dropdown == 'inventory_room') {
                    <div class="options-dropdown">
                        <div class="list">
                            <div class="option" (click)="$event.stopPropagation();dropdownManager.selected_dropdown = '';itemForm.room_id = null">
                                {{ l.s('architecture.unassigned_room') }}
                            </div>
                            @for (room of rooms; track room.room_id) {
                            <div class="option"
                                (click)="$event.stopPropagation();dropdownManager.selected_dropdown = '';itemForm.room_id = room.room_id">
                                {{ room.building_name }} - {{ room.name }}
                            </div>
                            }
                        </div>
                    </div>
                    }
                </div>
            </div>
            <div class="form-group">
                <label class="form-label">{{ l.s('architecture.inventory_fields.status') }}</label>
                <div class="custom-select"
                    (click)="$event.stopPropagation();dropdownManager.selected_dropdown = dropdownManager.selected_dropdown == 'inventory_status' ? '' : 'inventory_status'">
                    <div class="selected-value">
                        {{ l.s('architecture.inventory_status.' + itemForm.status) }}
                        <i-tabler name="chevron-down"></i-tabler>
                    </div>
                    @if (dropdownManager.selected_dropdown == 'inventory_status') {
                    <div class="options-dropdown">
                        <div class="list">
                            @for (st of ['active', 'broken', 'maintenance', 'discarded']; track st) {
                            <div class="option"
                                (click)="$event.stopPropagation();dropdownManager.selected_dropdown = '';itemForm.status = st">
                                {{ l.s('architecture.inventory_status.' + st) }}
                            </div>
                            }
                        </div>
                    </div>
                    }
                </div>
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
    <div class="modal-actions">
        <button class="btn btn--secondary" (click)="closeModal()">{{ l.s('cancel') }}</button>
        <button class="btn btn--primary" (click)="saveItem()">{{ l.s('buttons.save') }}</button>
    </div>
  `,
  styles: [`
    .card__body { padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem; }
    @media (max-width: 768px) {
        .form-row { grid-template-columns: 1fr; }
    }
  `]
})
export class InventoryItemModalComponent implements OnInit {
  public l = inject(Locale);
  private http = inject(HttpClient);
  private modalManager = inject(ModalManager);
  public dropdownManager = inject(DropdownManager);
 
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
 
  getRoomName(): string {
      if (!this.itemForm.room_id) return this.l.s('architecture.unassigned_room');
      const room = this.rooms.find(r => r.room_id === this.itemForm.room_id);
      return room ? `${room.building_name} - ${room.name}` : this.l.s('architecture.unassigned_room');
  }

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
