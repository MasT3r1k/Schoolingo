import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { ModalManager } from '@Schoolingo/modal';

@Component({
  selector: 'delete-floor-modal',
  standalone: true,
  imports: [CommonModule, IconsModule],
  template: `
    <div class="modal-body">
        <div class="danger-notice"
            style="margin-top: 1.5rem; display: flex; align-items: center; gap: 0.75rem; color: var(--danger); font-size: 13px; font-weight: 600;">
            <i-tabler name="alert-triangle" style="width: 18px; height: 18px;"></i-tabler>
            <span>{{ l.s('architecture.delete_floor_desc') }}</span>
        </div>
    </div>

    <div class="modal-actions"
        style="margin-top: 2rem; padding-top: 1rem; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; gap: 1rem;">
        <button class="btn btn--secondary" (click)="closeModal()">
            <i-tabler name="x"></i-tabler>
            <span>{{ l.s('cancel') }}</span>
        </button>
        <button class="btn btn--danger" (click)="confirm()">
            <i-tabler name="trash"></i-tabler>
            <span>{{ l.s('architecture.delete_floor_btn') }}</span>
        </button>
    </div>
  `
})
export class DeleteFloorModalComponent implements OnInit {
  public l = inject(Locale);
  private modalManager = inject(ModalManager);
  
  public data: any;

  ngOnInit(): void {
    this.data = this.modalManager.getModalData('delete-floor');
  }

  public closeModal(): void {
    this.modalManager.closeModal('delete-floor');
  }

  public confirm(): void {
    if (this.data && this.data.callback) {
      this.data.callback();
    }
    this.closeModal();
  }
}
