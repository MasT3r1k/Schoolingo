import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '@Schoolingo/icons';
import { ModalManager } from '@Schoolingo/modal';
import { Locale } from '@Schoolingo/locale';

@Component({
  selector: 'app-adjust-vacation-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule],
  template: `
    <div class="message message--info">
      <p>Zadejte celkový počet dní dovolené pro zaměstnance <strong>{{ data.employee.full_name }}</strong> v aktuálním roce.</p>
    </div>
    
    <div class="form-group mb-4">
      <label>Počet dní (celkem)</label>
      <div class="input-icon-wrap">
          <i-tabler name="beach"></i-tabler>
          <input type="number" class="form-input" [(ngModel)]="amount" min="0" max="100">
      </div>
    </div>

    <div class="info-alert mt-4">
      <div class="info-alert__icon">
        <i-tabler name="info-circle"></i-tabler>
      </div>
      <div class="info-alert__content">
        Tato hodnota přepíše základní nárok pro aktuální rok.
      </div>
    </div>
    
    <div class="modal-actions mt-6">
      <button class="btn btn--secondary" (click)="close()">Zrušit</button>
      <button class="btn btn--primary" (click)="confirm()">Uložit změny</button>
    </div>
  `,
  styles: [`
    .message--info {
        background: rgba(var(--primary-rgb), 0.05);
        border: 1px solid rgba(var(--primary-rgb), 0.1);
        border-radius: 12px;
        padding: 1rem;
        margin-bottom: 1.5rem;
    }
    .message--info p {
        margin: 0;
        font-size: 0.9375rem;
        color: var(--text-main);
    }

    .info-alert {
        display: flex;
        gap: 0.75rem;
        padding: 1rem;
        background: var(--bg-secondary);
        border-radius: 12px;
        align-items: flex-start;
    }
    .info-alert__icon {
        color: var(--primary-color);
        flex-shrink: 0;
        display: flex;
        align-items: center;
        margin-top: 2px;
    }
    .info-alert__icon i-tabler {
        width: 1.125rem;
        height: 1.125rem;
    }
    .info-alert__content {
        font-size: 0.8125rem;
        line-height: 1.4;
        color: var(--text-secondary);
    }
  `]
})
export class AdjustVacationModalComponent implements OnInit {
  modalManager = inject(ModalManager);
  l = inject(Locale);
  
  data: any;
  amount: number = 20;

  ngOnInit() {
    this.data = this.modalManager.getModalData('adjust_vacation');
    if (this.data && this.data.entitlement !== undefined) {
        this.amount = this.data.entitlement;
    }
  }

  close() {
    this.modalManager.closeModal('adjust_vacation');
  }

  confirm() {
    if (this.data.onConfirm) {
      this.data.onConfirm(this.amount);
    }
    this.close();
  }
}
