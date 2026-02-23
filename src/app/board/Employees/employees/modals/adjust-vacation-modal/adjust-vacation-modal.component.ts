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
    <div class="modal-content">
      <div class="modal-header">
        <h3>Upravit nárok na dovolenou</h3>
        <button class="close-btn" (click)="close()">
          <i-tabler name="x"></i-tabler>
        </button>
      </div>
      <div class="modal-body">
        <p>Zadejte celkový počet dní dovolené pro zaměstnance <strong>{{ data.employee.full_name }}</strong> v aktuálním roce.</p>
        
        <div class="form-group">
          <label>Počet dní (celkem)</label>
          <input type="number" class="form-input" [(ngModel)]="amount" min="0" max="100">
        </div>

        <div class="info-alert mt">
          <i-tabler name="info-circle"></i-tabler>
          <span>Tato hodnota přepíše základní nárok pro aktuální rok.</span>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn--ghost" (click)="close()">Zrušit</button>
        <button class="btn btn--primary" (click)="confirm()">Uložit změny</button>
      </div>
    </div>
  `,
  styles: [`
    .modal-content {
      padding: 1.5rem;
      width: 400px;
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }
    .modal-header h3 {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text-primary);
    }
    .close-btn {
      background: none;
      border: none;
      color: var(--text-secondary);
      cursor: pointer;
      padding: 0.25rem;
      border-radius: 0.375rem;
      transition: all 0.2s;
    }
    .close-btn:hover {
      background: var(--bg-hover);
      color: var(--text-primary);
    }
    .form-group {
      margin-bottom: 1.25rem;
    }
    .form-group label {
      display: block;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--text-secondary);
      margin-bottom: 0.5rem;
    }
    .form-input {
      width: 100%;
      padding: 0.625rem;
      border: 1px solid var(--border-color);
      border-radius: 0.5rem;
      background: var(--bg-card);
      color: var(--text-primary);
      font-size: 0.9375rem;
    }
    .info-alert {
      display: flex;
      gap: 0.75rem;
      padding: 1rem;
      background: var(--bg-secondary);
      border-radius: 0.5rem;
      font-size: 0.8125rem;
      color: var(--text-secondary);
      align-items: center;
    }
    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      margin-top: 2rem;
    }
    .mt { margin-top: 1rem; }
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
