import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { ModalManager } from '@Schoolingo/modal';
import { HttpClient } from '@angular/common/http';
import { Config } from '@Schoolingo/config';
import { AdminPaymentAccount } from '../manage/manage.component';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule],
  template: `
    <div class="form-group">
      <div class="form-label">{{ l.s('payments.manage.deposit_amount') }}</div>
      <div class="input-unit-row">
        <input type="number" class="form-input" [(ngModel)]="amount" min="1" autofocus>
        <div class="unit-badge">Kč</div>
      </div>
    </div>
    <div class="form-group" style="margin-top: 1rem;">
      <div class="form-label">{{ l.s('payments.manage.deposit_desc') }}</div>
      <input type="text" class="form-input" [(ngModel)]="description" [placeholder]="l.s('payments.manage.deposit_desc_placeholder')">
    </div>

    @if (error) {
      <div class="message message--danger" style="margin-top: 1rem;">{{ error }}</div>
    }

    <div class="modal-actions" style="margin-top: 1.5rem;">
      <button class="btn btn--secondary" (click)="close()">Zrušit</button>
      <button class="btn btn--success" (click)="submit()" [disabled]="loading">
        @if(loading) {
          <i-tabler name="loader-2" class="spin"></i-tabler>
        } @else {
          <i-tabler name="cash"></i-tabler>
        }
        Vložit
      </button>
    </div>
  `,
  styles: []
})
export class AdminDepositModalComponent {
  public l = inject(Locale);
  private http = inject(HttpClient);
  private modalManager = inject(ModalManager);

  public data: { account: AdminPaymentAccount, onSuccess: Function } = this.modalManager.getModalData('payments_admin_deposit');

  public amount: number | null = null;
  public description = '';
  public error: string | null = null;
  public loading = false;

  public close() {
    this.modalManager.closeModal('payments_admin_deposit');
  }

  public submit() {
    this.error = null;
    if (!this.amount || this.amount <= 0) {
      this.error = 'Zadejte platnou částku.';
      return;
    }

    this.loading = true;
    this.http.post(
      `${Config.API_URL}/v1/payments/deposit`,
      {
        target_account_id: this.data.account.payment_account_id,
        amount: this.amount,
        description: this.description || null
      },
      { withCredentials: true }
    ).subscribe({
      next: (res: any) => {
        this.loading = false;
        if (res.error) {
          this.error = res.error;
        } else {
          // Fire success callback if passed
          if (this.data.onSuccess) {
            this.data.onSuccess(res.new_balance);
          }
          this.close();
        }
      },
      error: () => {
        this.loading = false;
        this.error = this.l.s('global.error_server');
      }
    });
  }
}
