import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { ModalManager } from '@Schoolingo/modal';

@Component({
  selector: 'delete-room-modal',
  standalone: true,
  imports: [CommonModule, IconsModule],
  template: `
    <div class="modal-body">
        <div class="danger-notice"
            style="margin-top: 1.5rem; display: flex; align-items: center; gap: 0.75rem; color: var(--danger); font-size: 13px; font-weight: 600;">
            <i-tabler name="alert-triangle" style="width: 18px; height: 18px;"></i-tabler>
            <span>{{ l.s('architecture.delete_room_desc') }}</span>
        </div>
    </div>

    <div class="modal-actions">
        <button class="btn btn--secondary" (click)="closeModal()">
            <i-tabler name="x"></i-tabler>
            <span>{{ l.s('cancel') }}</span>
        </button>
        <button class="btn btn--danger" (click)="confirm()">
            <i-tabler name="trash"></i-tabler>
            <span>{{ l.s('architecture.delete_room_btn') }}</span>
        </button>
    </div>
  `
})
export class DeleteRoomModalComponent implements OnInit {
  public l = inject(Locale);
  private modalManager = inject(ModalManager);
  
  public data: any;

  ngOnInit(): void {
    this.data = this.modalManager.getModalData('delete-room');
  }

  public closeModal(): void {
    this.modalManager.closeModal('delete-room');
  }

  public confirm(): void {
    if (this.data && this.data.callback) {
      this.data.callback();
    }
    this.closeModal();
  }
}
