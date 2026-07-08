import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalManager } from '@Schoolingo/modal';
import { Locale } from '@Schoolingo/locale';
import { IconsModule } from '@Schoolingo/icons';
import { HttpClient } from '@angular/common/http';
import { Config } from '../../../../../infrastructure/config';
import { DropdownComponent } from '@Components/dropdown/dropdown';

@Component({
  selector: 'app-add-credit-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule, DropdownComponent],
  templateUrl: './add-credit-modal.component.html',
  styleUrls: ['./add-credit-modal.component.css']
})
export class AddCreditModalComponent implements OnInit {
  l = inject(Locale);
  private modalManager = inject(ModalManager);
  private http = inject(HttpClient);
  
  submitting = false;
  accounts: any[] = [];
  accountOptions: { label: string, value: any }[] = [];
  
  sourceAccountId: number | null = null;
  targetAccountId: number | null = null;
  amount: number | null = null;
  
  loading = true;
  error: string | null = null;

  get sourceAccountOptions() {
    return this.accountOptions.filter(opt => opt.value !== this.targetAccountId);
  }

  getTargetAccountName(): string {
    const acc = this.accountOptions.find(opt => opt.value === this.targetAccountId);
    return acc ? acc.label : 'Neznámý účet';
  }

  openPaymentAccount() {
    const data = this.modalManager.getModalData('add-credit-modal');
    if (data && data.openPaymentAccount) {
      data.openPaymentAccount();
    }
  }

  ngOnInit() {
    const data = this.modalManager.getModalData('add-credit-modal');
    if (data && data.targetAccountId && !Array.isArray(data.targetAccountId)) {
      this.targetAccountId = data.targetAccountId;
    }

    this.http.get<any[]>(Config.API_URL + '/v1/payments/accounts', { withCredentials: true })
      .subscribe({
        next: (res) => {
          this.accounts = res;
          this.accountOptions = res.map(acc => ({
            label: acc.name + (acc.balance !== undefined ? ' (' + acc.balance + ' Kč)' : ''),
            value: acc.payment_account_id
          }));
          
          if (!this.targetAccountId && this.accountOptions.length > 0) {
            this.targetAccountId = this.accountOptions[0].value;
          }
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
  }

  close() {
    this.modalManager.closeModal('add-credit-modal');
  }

  save() {
    this.error = null;
    if (!this.sourceAccountId || !this.targetAccountId || !this.amount) {
      this.error = 'Vyplňte všechna pole.';
      return;
    }
    if (this.sourceAccountId === this.targetAccountId) {
      this.error = 'Zdrojový a cílový účet nesmí být stejný.';
      return;
    }
    if (this.amount <= 0) {
      this.error = 'Částka musí být větší než 0.';
      return;
    }

    this.submitting = true;
    
    this.http.post(Config.API_URL + '/v1/payments/transfer', {
      source_account_id: this.sourceAccountId,
      target_account_id: this.targetAccountId,
      amount: this.amount,
      description: 'Dobití kreditu (Jídelna)'
    }, { withCredentials: true }).subscribe({
      next: () => {
        this.submitting = false;
        const data = this.modalManager.getModalData('add-credit-modal');
        if (data && data.refreshCallback) {
          data.refreshCallback();
        }
        this.close();
      },
      error: (err) => {
        this.submitting = false;
        this.error = err.error?.error || 'Došlo k chybě při převodu.';
      }
    });
  }
}
