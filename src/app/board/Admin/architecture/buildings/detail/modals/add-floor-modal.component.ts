import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Locale } from '@Schoolingo/locale';
import { IconsModule } from '@Schoolingo/icons';
import { ModalManager } from '@Schoolingo/modal';
import { Config } from '@Schoolingo/config';

@Component({
  selector: 'add-floor-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule],
  template: `
    <div class="modal-body">
        <div class="form-group">
            <label class="form-label">Úroveň patra</label>
            <input type="number" class="form-input" [(ngModel)]="floorForm.level" placeholder="Např. 0 pro přízemí, 1 pro první patro, -1 pro suterén" />
            <span class="form-text text-muted">0 = přízemí, 1 = 1. patro, -1 = suterén.</span>
        </div>
        
        <div class="form-group" style="margin-top: 1rem;">
            <label class="form-label">Plánek patra (SVG formát nebo cokoliv spec. - nepovinné)</label>
            <textarea class="form-input" rows="5" [(ngModel)]="floorForm.floor_plan" placeholder="Zadejte SVG kód plánku budovy..."></textarea>
        </div>
    </div>
    <div class="modal-actions">
        <button class="btn btn--secondary" (click)="closeModal()">{{ l.s('cancel') }}</button>
        <button class="btn btn--primary" (click)="saveFloor()">{{ l.s('buttons.save') || 'Uložit' }}</button>
    </div>
  `,
  styles: [`
    .modal-body { padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem; }
    .form-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
    .form-label {
        font-weight: 500;
        color: var(--text);
        font-size: 0.875rem;
    }
    .form-input {
        padding: 0.5rem 0.75rem;
        border: 1px solid var(--border);
        border-radius: var(--radius-sm);
        background: var(--surface);
        color: var(--text);
        font-size: 0.875rem;
        transition: border-color 0.2s;
    }
    .form-input:focus {
        outline: none;
        border-color: var(--primary);
    }
    .form-text {
        font-size: 0.75rem;
        color: var(--text-muted);
    }
  `]
})
export class AddFloorModalComponent implements OnInit {
  public l = inject(Locale);
  private http = inject(HttpClient);
  public modalManager = inject(ModalManager);

  public floorForm: any = {
    level: 0,
    floor_plan: ''
  };
  private buildingId: number = 0;
  private editingId: number | null = null;

  ngOnInit(): void {
    const data = this.modalManager.getModalData('floor-modal');
    if (data) {
      if (data.buildingId) {
          this.buildingId = data.buildingId;
      }
      if (data.floor) {
        this.floorForm = {
            level: data.floor.level,
            floor_plan: data.floor.floor_plan || ''
        };
        this.editingId = data.floor.bf_id;
      }
    }
  }

  saveFloor(): void {
    const payload = {
        bf_id: this.editingId ? this.editingId : undefined,
        building_id: this.buildingId,
        level: this.floorForm.level,
        floor_plan: this.floorForm.floor_plan || ''
    };

    this.http.post(`${Config.API_URL}/v1/school/architecture/floors`, payload, { withCredentials: true })
        .subscribe(() => {
            const data = this.modalManager.getModalData('floor-modal');
            if (data?.refreshCallback) data.refreshCallback();
            this.modalManager.closeModal('floor-modal');
        });
  }

  closeModal(): void {
    this.modalManager.closeModal('floor-modal');
  }
}
