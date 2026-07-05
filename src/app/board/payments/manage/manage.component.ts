import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { ModalManager } from '@Schoolingo/modal';
import { MoneyPipe } from "../../../pipes/money/money.pipe";
import { HttpClient } from '@angular/common/http';
import { Config } from '@Schoolingo/config';
import { DetailAccountComponent } from '../modals/detail-account/detail-account.component';
import { AdminDepositModalComponent } from './admin-deposit-modal.component';

export type AdminPaymentAccount = {
  payment_account_id: number;
  type: 'bank' | 'cash';
  name: string;
  iban: string;
  balance: number;
  is_active: boolean;
  created_at: Date;
  first_name: string;
  last_name: string;
}

@Component({
  standalone: true,
  imports: [CommonModule, IconsModule, MoneyPipe],
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.css']
})
export class ManageComponent implements OnInit {
  public l = inject(Locale);
  private http = inject(HttpClient);
  private modalManager = inject(ModalManager);

  public accounts: AdminPaymentAccount[] = [];

  public showAccountDetail(account: AdminPaymentAccount): void {
    this.modalManager.addTitlePlaceholders('payments_detail_account', 'name', account.name)
    this.modalManager.openModal('payments_detail_account', account);
  }

  ngOnInit(): void {
    this.http.get<AdminPaymentAccount[]>(
      `${Config.API_URL}/v1/payments/admin/accounts`,
      { withCredentials: true }
    )
    .subscribe({
      next: (data) => {
        if (Array.isArray(data)) {
          this.accounts = data;
        }
      },
      error: (e) => console.error(e)
    });

    this.modalManager.addModal(
      'payments_detail_account',
      {
        title: 'payments.detail_account.title',
        icon: 'cash-banknote',
        width: 1000,
        closeable: true,
        items: [
          { type: 'component', component: DetailAccountComponent }
        ]
      }
    );
    this.modalManager.addModal(
      'payments_admin_deposit',
      {
        title: 'payments.manage.deposit_title',
        icon: 'cash-plus',
        width: 450,
        closeable: true,
        items: [
          { type: 'component', component: AdminDepositModalComponent }
        ]
      }
    );
  }

  public openDeposit(account: AdminPaymentAccount, event: Event): void {
    event.stopPropagation();
    this.modalManager.addTitlePlaceholders('payments_admin_deposit', 'name', account.name);
    this.modalManager.openModal('payments_admin_deposit', {
      account,
      onSuccess: (newBalance: number) => {
        account.balance = newBalance;
      }
    });
  }
}
