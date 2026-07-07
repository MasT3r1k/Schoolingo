import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalManager } from '@Schoolingo/modal';
import { Locale } from '@Schoolingo/locale';
import { IconsModule } from '@Schoolingo/icons';
import { HttpClient } from '@angular/common/http';
import { Config } from '../../../../../infrastructure/config';
import { Authentication } from '@Schoolingo/authentication';
import { DropdownComponent } from '@Components/dropdown/dropdown';
import { MoneyPipe } from '../../../../../pipes/money/money.pipe';

@Component({
  selector: 'app-payment-account-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule, DropdownComponent, MoneyPipe],
  templateUrl: './payment-account-modal.component.html',
  styleUrls: ['./payment-account-modal.component.css']
})
export class PaymentAccountModalComponent implements OnInit {
  l = inject(Locale);
  private modalManager = inject(ModalManager);
  private http = inject(HttpClient);
  private auth = inject(Authentication);
  
  submitting = false;
  accounts: any[] = [];
  accountOptions: { label: string, value: any }[] = [];
  selectedAccountId: number | null = null;
  loading = true;

  ngOnInit() {
    const data = this.modalManager.getModalData('payment-account-modal');
    if (data && data.accountId) {
      this.selectedAccountId = data.accountId;
    }

    this.http.get<any[]>(Config.API_URL + '/v1/payments/accounts', { withCredentials: true })
      .subscribe({
        next: (res) => {
          this.accounts = res;
          this.accountOptions = res.map(acc => ({
            label: acc.name + (acc.balance !== undefined ? ' (' + acc.balance + ' Kč)' : ''),
            value: acc.payment_account_id
          }));
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
  }

  close() {
    this.modalManager.closeModal('payment-account-modal');
  }

  save() {
    const data = this.modalManager.getModalData('payment-account-modal');
    if (data && data.refreshCallback) {
      data.refreshCallback(this.selectedAccountId);
    }
    this.close();
  }
}
