import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { Authentication } from '@Schoolingo/authentication';
import { Permission } from '@Schoolingo/permission';
import { StatCardComponent } from "@Components/stat-card/stat-card.component";
import { ModalManager } from '@Schoolingo/modal';
import { AddAccountComponent } from '../modals/add-account/add-account.component';
import { MoneyPipe } from "../../../pipes/money/money.pipe";
import { HttpClient } from '@angular/common/http';
import { Config } from '@Schoolingo/config';
import { DetailAccountComponent } from '../modals/detail-account/detail-account.component';

export type PaymentAccount = {
  payment_account_id: number;
  type: 'bank' | 'cash';
  name: string;
  iban: string;
  balance: number;
  is_active: boolean;
  created_at: Date;
  deleted_at: Date | null;
}

@Component({
  standalone: true,
  imports: [CommonModule, IconsModule, StatCardComponent, MoneyPipe],
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.css']
})
export class AccountsComponent implements OnInit {
  public l = inject(Locale);
  public auth = inject(Authentication);
  public perm = inject(Permission);
  private http = inject(HttpClient);
  private modalManager = inject(ModalManager);

  public accounts: PaymentAccount[] = [];

  public get totalBalance() {
    return this.accounts.reduce((sum, acc) => sum + acc.balance, 0);
  }

  public addAcount(): void {
    this.modalManager.openModal('payments_add_account')
  }

  public getAccountsByType(type: PaymentAccount["type"], need_be_active: boolean = false): PaymentAccount[] {
    return this.accounts.filter((acc) => acc.type == type && ((need_be_active && acc.is_active) || !need_be_active));
  }

  public showAccountDetail(account: PaymentAccount): void {
    this.modalManager.addTitlePlaceholders('payments_detail_account', 'name', account.name)
    this.modalManager.openModal('payments_detail_account', account);
  }

  ngOnInit(): void {
    this.http.get<PaymentAccount[]>(
      `${Config.API_URL}/v1/payments/accounts`,
      { withCredentials: true }
    )
    .subscribe((data) => this.accounts = data.map((account) => ({
      ...account,
      currency: 'CZK'
    })))

    this.modalManager.addModal(
      'payments_add_account',
      {
        title: 'payments.add_account.title',
        icon: 'cash-banknote-plus',
        closeable: true,
        items: [
          { type: 'component', component: AddAccountComponent }
        ]
      }
    )

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
    )
  }
}
