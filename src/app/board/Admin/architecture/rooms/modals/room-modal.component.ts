import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Locale } from '@Schoolingo/locale';
import { IconsModule } from '@Schoolingo/icons';
import { ModalManager } from '@Schoolingo/modal';
import { Config } from '@Schoolingo/config';

@Component({
  selector: 'room-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule],
  template: `
    <div class="card__body">
        <div class="form-row">
            <div class="form-group" style="grid-column: span 2">
                <label class="form-label">{{ l.s('architecture.building_floor') }}</label>
                <select class="form-select" [(ngModel)]="roomForm.floor_id" [disabled]="isEditing">
                    @for (f of floors; track f.bf_id) {
                        <option [value]="f.bf_id">{{ f.building_name }} - {{ f.level }}. patro</option>
                    }
                </select>
            </div>
        </div>
        <div class="form-group">
            <label class="form-label">{{ l.s('architecture.room_name') }}</label>
            <input type="text" class="form-input" [(ngModel)]="roomForm.name" placeholder="Např. 402, Kabinet IT...">
        </div>
        <div class="form-row">
            <div class="form-group">
                <label class="form-label">{{ l.s('architecture.room_type') }}</label>
                <select class="form-select" [(ngModel)]="roomForm.type">
                    @for (type of ['classroom', 'cabinet', 'office', 'hallway', 'canteen', 'other']; track type) {
                        <option [value]="type">{{ l.s('architecture.types.' + type) }}</option>
                    }
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">{{ l.s('architecture.capacity') }}</label>
                <input type="number" class="form-input" [(ngModel)]="roomForm.capacity" [placeholder]="l.s('capacity')">
            </div>
        </div>
        <div class="form-group">
            <label class="form-label">{{ l.s('architecture.room_manager') }}</label>
            <select class="form-select" [(ngModel)]="roomForm.manager">
                <option [value]="null">{{ l.s('architecture.no_manager') }}</option>
                @for (emp of employees; track emp.person_id) {
                  <option [value]="emp.person_id">{{ emp.full_name }}</option>
                }
            </select>
        </div>
        <div class="form-group">
            <label class="form-label">{{ l.s('architecture.room_description_label') }}</label>
            <textarea class="form-input" [(ngModel)]="roomForm.description" [placeholder]="l.s('architecture.placeholders.room_description')"></textarea>
        </div>
    </div>
    <div class="card__footer">
        <button class="btn btn--secondary" (click)="closeModal()">{{ l.s('cancel') }}</button>
        <button class="btn btn--primary" (click)="saveRoom()">{{ l.s('buttons.save') }}</button>
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
export class RoomModalComponent implements OnInit {
  public l = inject(Locale);
  private http = inject(HttpClient);
  private modalManager = inject(ModalManager);

  public floors: any[] = [];
  public employees: any[] = [];
  public roomForm: any = {
    floor_id: 0,
    name: '',
    type: 'classroom',
    capacity: 30,
    manager: null,
    description: ''
  };
  public isEditing = false;
  private editingId: number | null = null;

  ngOnInit(): void {
    const data = this.modalManager.getModalData('room-modal');
    if (data) {
      this.floors = data.floors || [];
      this.employees = data.employees || [];
      if (data.room) {
        this.roomForm = { ...data.room };
        this.editingId = data.room.room_id;
        this.isEditing = true;
      } else {
        this.roomForm.floor_id = this.floors[0]?.bf_id || 0;
      }
    }
  }

  saveRoom(): void {
    this.http.post(`${Config.API_URL}/v1/school/architecture/rooms`, { ...this.roomForm, room_id: this.editingId }, { withCredentials: true })
        .subscribe(() => {
            const data = this.modalManager.getModalData('room-modal');
            if (data?.refreshCallback) data.refreshCallback();
            this.modalManager.closeModal('room-modal');
        });
  }

  closeModal(): void {
    this.modalManager.closeModal('room-modal');
  }
}
