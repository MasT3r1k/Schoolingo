import { Component, inject, OnInit } from '@angular/core';
import { TabsComponent } from '@Components/Tabs';
import { ModalManager } from '@Schoolingo/modal';
import { MoneyPipe } from "../../../../pipes/money/money.pipe";
import { BehaviorSubject } from 'rxjs';
import { CheckboxComponent } from '@Components/Checkbox';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Utils } from '@Schoolingo/utils';
import { HttpClient } from '@angular/common/http';
import { Config } from '@Schoolingo/config';
import { PaymentAccount } from '../../accounts/accounts.component';
import { CommonModule } from '@angular/common';
import { DropdownComponent } from '@Components/dropdown/dropdown';

type PaymentTransaction = {
  transaction_id: number;
  type: 'in' | 'out';
  source_id: number;
  target_id: number;
  amount: number;
  new_balance: number;
  description: string | null;
  created_at: Date;
}

type AccountDetail = {
  total_in: number;
  total_out: number;
  last_payment: {
    amount: number;
    created_at: Date;
  } | null;
}

@Component({
  imports: [TabsComponent, MoneyPipe, CheckboxComponent, IconsModule, FormsModule, ReactiveFormsModule, CommonModule, DropdownComponent],
  templateUrl: './detail-account.component.html',
  styleUrl: './detail-account.component.css'
})
export class DetailAccountComponent implements OnInit {
  public Utils = Utils;
  public l = inject(Locale)
  public selectedTab = new BehaviorSubject(0);
  private http = inject(HttpClient);

  private modalManager = inject(ModalManager);
  public data: PaymentAccount = this.modalManager.getModalData('payments_detail_account');

  public types = ['all', 'in', 'out'];
  public filters = {
    search: '',
    type: 'all'
  };
  public last_id: number | null = null;
  public loadingMore = false;
  public allLoaded = false;

  public accountDetail: AccountDetail = {
    total_in: 0,
    total_out: 0,
    last_payment: null
  };

  public transactions: PaymentTransaction[] = [];
  public loading = true;

  // Transfer form
  public otherAccounts: { label: string; value: string }[] = [];
  public transfer = {
    target_account_id: null as string | null,
    amount: null as number | null,
    description: ''
  };
  public transferLoading = false;
  public transferError: string | null = null;
  public transferSuccess = false;

  public get filteredTransactions(): PaymentTransaction[] {
    return this.transactions.filter((t) => {
      const matchType = this.filters.type === 'all' || t.type === this.filters.type;
      const matchSearch = !this.filters.search ||
        (t.description ?? '').toLowerCase().includes(this.filters.search.toLowerCase());
      return matchType && matchSearch;
    });
  }

  public moreTransactions(): void {
    if (this.loadingMore || this.allLoaded) return;
    this.loadingMore = true;
    const cursor = this.last_id ?? '';

    this.http.get<PaymentTransaction[]>(
      `${Config.API_URL}/v1/payments/account_transfers/${this.data.payment_account_id}?cursor=${cursor}`,
      { withCredentials: true }
    )
    .subscribe((data: PaymentTransaction[]) => {
      this.loadingMore = false;
      if (data.length === 0) {
        this.allLoaded = true;
        return;
      }
      this.transactions.push(...data);
      this.last_id = data[data.length - 1].transaction_id;
    });
  }

  public submitTransfer(): void {
    this.transferError = null;
    if (!this.transfer.target_account_id || !this.transfer.amount || this.transfer.amount <= 0) {
      this.transferError = 'Vyplňte všechna povinná pole';
      return;
    }
    this.transferLoading = true;

    this.http.post(
      `${Config.API_URL}/v1/payments/transfer`,
      {
        source_account_id: this.data.payment_account_id,
        target_account_id: parseInt(this.transfer.target_account_id),
        amount: this.transfer.amount,
        description: this.transfer.description || null
      },
      { withCredentials: true }
    ).subscribe({
      next: (data: any) => {
        this.transferLoading = false;
        if (data?.error) {
          this.transferError = data.error;
          return;
        }
        this.transferSuccess = true;
        // Refresh balance
        if (data.new_source_balance !== undefined) {
          this.data = { ...this.data, balance: data.new_source_balance };
        }
        setTimeout(() => {
          this.transferSuccess = false;
          this.selectedTab.next(0);
          // Refresh transactions
          this.transactions = [];
          this.last_id = null;
          this.allLoaded = false;
          this.moreTransactions();
        }, 1500);
      },
      error: () => {
        this.transferLoading = false;
        this.transferError = 'Chyba serveru';
      }
    });
  }

  ngOnInit(): void {
    // Načíst přehled účtu (stats za 30 dní)
    this.http.get<AccountDetail>(
      `${Config.API_URL}/v1/payments/account/${this.data.payment_account_id}`,
      { withCredentials: true }
    ).subscribe({
      next: (data) => {
        if (data) this.accountDetail = data;
      },
      error: () => {}
    });

    // Načíst transakce
    this.http.get<PaymentTransaction[]>(
      `${Config.API_URL}/v1/payments/account_transfers/${this.data.payment_account_id}`,
      { withCredentials: true }
    ).subscribe({
      next: (data) => {
        this.loading = false;
        this.transactions = data;
        if (data.length > 0) {
          this.last_id = data[data.length - 1].transaction_id;
        }
        if (data.length < 50) this.allLoaded = true;
      },
      error: () => { this.loading = false; }
    });

    // Načíst ostatní účty pro převod
    this.http.get<any[]>(`${Config.API_URL}/v1/payments/accounts`, { withCredentials: true })
      .subscribe({
        next: (data) => {
          if (Array.isArray(data)) {
            this.otherAccounts = data
              .filter((a) => a.payment_account_id !== this.data.payment_account_id && a.is_active)
              .map((a) => ({ label: a.name, value: String(a.payment_account_id) }));
            if (this.otherAccounts.length) {
              this.transfer.target_account_id = this.otherAccounts[0].value;
            }
          }
        },
        error: () => {}
      });
  }
}
