import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Locale } from '@Schoolingo/locale';
import { IconsModule } from '@Schoolingo/icons';
import { ModalManager } from '@Schoolingo/modal';
import { DropdownManager } from '@Schoolingo/dropdown';
import { Config } from '@Schoolingo/config';

@Component({
  selector: 'room-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule],
  template: `
    <div class="modal-body">
        <div class="form-row">
            <div class="form-group" style="grid-column: span 2">
                <label class="form-label">{{ l.s('architecture.building_floor') }}</label>
                <div class="custom-select" id="room_floor" [class.disabled]="isEditing"
                    (click)="!isEditing && ($event.stopPropagation()); dropdownManager.selected_dropdown = !isEditing && dropdownManager.selected_dropdown == 'room_floor' ? '' : (!isEditing ? 'room_floor' : dropdownManager.selected_dropdown)">
                    <div class="selected-value">
                        <div class="row" style="gap: .5rem">
                            {{ getSelectedFloorLabel() }}
                        </div>
                        <i-tabler name="chevron-down"></i-tabler>
                    </div>
                    @if (dropdownManager.selected_dropdown == 'room_floor') {
                    <div class="options-dropdown">
                        <div class="list">
                            @for (f of floors; track f.bf_id) {
                            <div class="option row" style="gap: .5rem"
                                (click)="$event.stopPropagation(); dropdownManager.selected_dropdown = ''; roomForm.floor_id = f.bf_id">
                                {{ f.building_name }} - {{ f.level }}. patro
                            </div>
                            }
                        </div>
                    </div>
                    }
                </div>
            </div>
        </div>
        <div class="form-group">
            <label class="form-label">{{ l.s('architecture.room_name') }}</label>
            <input type="text" class="form-input" [(ngModel)]="roomForm.name" placeholder="Např. 402, Kabinet IT...">
        </div>
        <div class="form-row">
            <div class="form-group">
                <label class="form-label">{{ l.s('architecture.room_type') }}</label>
                <div class="custom-select" id="room_type"
                    (click)="$event.stopPropagation(); dropdownManager.selected_dropdown = dropdownManager.selected_dropdown == 'room_type' ? '' : 'room_type'">
                    <div class="selected-value">
                        <div class="row" style="gap: .5rem">
                            {{ getSelectedTypeLabel() }}
                        </div>
                        <i-tabler name="chevron-down"></i-tabler>
                    </div>
                    @if (dropdownManager.selected_dropdown == 'room_type') {
                    <div class="options-dropdown">
                        <div class="list">
                            @for (type of ['classroom', 'cabinet', 'office', 'hallway', 'canteen', 'other']; track type) {
                            <div class="option row" style="gap: .5rem"
                                (click)="$event.stopPropagation(); dropdownManager.selected_dropdown = ''; roomForm.type = type">
                                {{ l.s('architecture.types.' + type) }}
                            </div>
                            }
                        </div>
                     </div>
                     }
                </div>
            </div>
            <div class="form-group">
                <label class="form-label">{{ l.s('architecture.capacity') }}</label>
                <input type="number" class="form-input" [(ngModel)]="roomForm.capacity" [placeholder]="l.s('capacity') || 'Kapacita'">
            </div>
        </div>
        <div class="form-group">
            <label class="form-label">{{ l.s('architecture.room_manager') }}</label>
            <div class="custom-select" id="room_manager"
                (click)="$event.stopPropagation(); dropdownManager.selected_dropdown = dropdownManager.selected_dropdown == 'room_manager' ? '' : 'room_manager'">
                <div class="selected-value">
                    <div class="row" style="gap: .5rem">
                        {{ getSelectedManagerLabel() }}
                    </div>
                    <i-tabler name="chevron-down"></i-tabler>
                </div>
                @if (dropdownManager.selected_dropdown == 'room_manager') {
                <div class="options-dropdown">
                    <div class="list">
                        <div class="option row" style="gap: .5rem"
                            (click)="$event.stopPropagation(); dropdownManager.selected_dropdown = ''; roomForm.manager = null">
                            {{ l.s('architecture.no_manager') }}
                        </div>
                        @for (emp of employees; track emp.person_id) {
                        <div class="option row" style="gap: .5rem"
                            (click)="$event.stopPropagation(); dropdownManager.selected_dropdown = ''; roomForm.manager = emp.person_id">
                            {{ emp.full_name }}
                        </div>
                        }
                    </div>
                 </div>
                 }
            </div>
        </div>
        <div class="form-group">
            <label class="form-label">{{ l.s('architecture.room_description_label') || 'Popis místnosti' }}</label>
            <textarea class="form-input" [(ngModel)]="roomForm.description" [placeholder]="l.s('architecture.placeholders.room_description') || '...'"></textarea>
        </div>
    </div>
    <div class="modal-actions">
        <button class="btn btn--secondary" (click)="closeModal()">{{ l.s('cancel') }}</button>
        <button class="btn btn--primary" (click)="saveRoom()">{{ l.s('buttons.save') }}</button>
    </div>
  `,
  styles: [`
    .modal-body { padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem; }
    .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .form-label { font-size: 0.875rem; font-weight: 500; color: var(--text); }
    .form-input, .form-select { padding: 0.75rem 1rem; background: var(--surface-2); border: 1px solid var(--border); border-radius: var(--radius); font-size: 0.9375rem; color: var(--text); }
    .disabled { opacity: 0.6; pointer-events: none; cursor:not-allowed; }
    @media (max-width: 768px) {
        .form-row { grid-template-columns: 1fr; }
    }
  `]
})
export class RoomModalComponent implements OnInit {
  public l = inject(Locale);
  private http = inject(HttpClient);
  public modalManager = inject(ModalManager);
  public dropdownManager = inject(DropdownManager);

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

  public getSelectedFloorLabel(): string {
    const f = this.floors.find(fl => fl.bf_id === this.roomForm.floor_id);
    return f ? `${f.building_name} - ${f.level}. patro` : (this.l.s('architecture.building_floor') || 'Vyberte patro');
  }

  public getSelectedTypeLabel(): string {
    return this.l.s('architecture.types.' + this.roomForm.type) || this.roomForm.type;
  }

  public getSelectedManagerLabel(): string {
    if (!this.roomForm.manager) return this.l.s('architecture.no_manager') || 'Bez správce';
    const emp = this.employees.find(e => e.person_id === this.roomForm.manager);
    return emp ? emp.full_name : (this.l.s('architecture.no_manager') || 'Bez správce');
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
