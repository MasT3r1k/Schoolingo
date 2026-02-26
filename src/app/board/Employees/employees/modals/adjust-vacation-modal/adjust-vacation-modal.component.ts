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
    <div class="modal-body">
      <div class="message message--info">
        <p>Zadejte celkový počet dní dovolené pro zaměstnance <strong>{{ data.employee.full_name }}</strong> v aktuálním roce.</p>
      </div>
      
      <div class="form-group">
        <label>Počet dní (celkem)</label>
        <input type="number" class="form-input" [(ngModel)]="amount" min="0" max="100">
      </div>

      <div class="info-alert mt">
        <i-tabler name="info-circle"></i-tabler>
        <span>Tato hodnota přepíše základní nárok pro aktuální rok.</span>
      </div>
      <div class="modal-actions">
        <button class="btn btn--ghost" (click)="close()">Zrušit</button>
        <button class="btn btn--primary" (click)="confirm()">Uložit změny</button>
      </div>
    </div>
  `,
  styles: [`
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
