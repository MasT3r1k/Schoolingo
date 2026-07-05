import { Component, inject, OnInit, ViewChild, ElementRef } from '@angular/core';
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
import { PaymentCategories } from '../../payments.config';

type PaymentTransaction = {
  transaction_id: number;
  type: 'in' | 'out';
  source_id: number;
  target_id: number;
  amount: number;
  new_balance: number;
  description: string | null;
  category?: string | null;
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

type AccountSettings = {
  low_balance_threshold: number | null;
  notify_every_transaction: boolean;
  notify_monthly_summary: boolean;
  share_with_guardians: boolean;
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

  @ViewChild('settingsNameInput') settingsNameInput?: ElementRef<HTMLInputElement>;
  public filterTab = new BehaviorSubject<number>(0);
  public types = ['all', 'in', 'out'];
  public filters = {
    search: '',
    type: 'all',
    category: 'all' as string
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

  public sparklinePoints = '0,24 220,24';
  public sparklineCircle = { cx: 220, cy: 24 };

  public sparklineHoverPoints: { x: number, y: number, balance: number, date: Date | null }[] = [];
  public hoverPointIndex: number | null = null;
  public activeHoverPoint: { x: number, y: number, balance: number, date: Date | null } | null = null;

  private computeSparkline(): void {
    if (!this.transactions || this.transactions.length === 0) {
      this.sparklinePoints = '0,24 220,24';
      this.sparklineCircle = { cx: 220, cy: 24 };
      return;
    }

    const items = [...this.transactions].slice(0, 15).reverse();
    // Add current balance as the very last point to reflect the latest state
    const balances = items.map(t => t.new_balance);
    if (balances[balances.length - 1] !== this.data.balance) {
      balances.push(this.data.balance);
    }
    
    if (balances.length === 1) {
      this.sparklinePoints = `0,24 220,24`;
      this.sparklineCircle = { cx: 220, cy: 24 };
      return;
    }

    const min = Math.min(...balances);
    const max = Math.max(...balances);
    
    const width = 220;
    const height = 32; // Give some padding

    if (max === min) {
      this.sparklinePoints = `0,24 220,24`;
      this.sparklineCircle = { cx: 220, cy: 24 };
      return;
    }

    const points = balances.map((val, idx) => {
      const x = (idx / (balances.length - 1)) * width;
      const y = (40) - ((val - min) / (max - min)) * height;
      return `${x},${y}`;
    });

    this.sparklinePoints = points.join(' ');
    
    this.sparklineHoverPoints = balances.map((val, idx) => {
      const x = (idx / (balances.length - 1)) * width;
      const y = (40) - ((val - min) / (max - min)) * height;
      let date = null;
      if (idx < items.length) {
        date = items[idx].created_at;
      } else {
        date = new Date();
      }
      return { x, y, balance: val, date };
    });

    const lastX = width;
    const lastY = (40) - ((balances[balances.length - 1] - min) / (max - min)) * height;
    this.sparklineCircle = { cx: lastX, cy: lastY };
  }

  public focusSettingsName(): void {
    this.selectedTab.next(1);
    setTimeout(() => {
      if (this.settingsNameInput?.nativeElement) {
        this.settingsNameInput.nativeElement.focus();
        this.settingsNameInput.nativeElement.classList.add('glow-effect');
        setTimeout(() => this.settingsNameInput?.nativeElement.classList.remove('glow-effect'), 2000);
      }
    }, 50);
  }

  // Rename
  public editingName = false;
  public nameInput = '';
  public nameSaving = false;

  // Transaction Edit
  public availableCategories = PaymentCategories;
  public categoryFilterOptions = [
    { label: this.l.s('buttons.view_all'), value: 'all', icon: 'list' },
    ...this.availableCategories.map(c => ({ label: c.label, value: c.id, icon: c.icon }))
  ];
  public editingTx: number | null = null;
  public txEditDesc = '';
  public txEditCategory: string | null = null;
  public txEditSaving = false;

  // Settings
  public settings: AccountSettings = {
    low_balance_threshold: null,
    notify_every_transaction: false,
    notify_monthly_summary: false,
    share_with_guardians: false
  };
  public settingsSaving = false;
  public settingsSaved = false;
  public settingsError: string | null = null;

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
      const matchCategory = this.filters.category === 'all' || t.category === this.filters.category;
      const matchSearch = !this.filters.search ||
        (t.description ?? '').toLowerCase().includes(this.filters.search.toLowerCase());
      return matchType && matchCategory && matchSearch;
    });
  }

  public goToRename(): void {
    this.selectedTab.next(1);
    setTimeout(() => {
      const el = document.getElementById('nazev') as HTMLInputElement | null;
      if (!el) return;
      el.focus();
      el.classList.add('input-highlight');
      setTimeout(() => el.classList.remove('input-highlight'), 1400);
    }, 80);
  }

  public startRename(): void {
    this.nameInput = this.data.name;
    this.editingName = true;
  }

  public cancelRename(): void {
    this.editingName = false;
    this.nameInput = this.data.name;
  }

  public saveName(): void {
    if (!this.nameInput.trim() || this.nameSaving) return;
    this.nameSaving = true;
    this.http.patch(
      `${Config.API_URL}/v1/payments/account/${this.data.payment_account_id}`,
      { name: this.nameInput.trim() },
      { withCredentials: true }
    ).subscribe({
      next: () => {
        this.data = { ...this.data, name: this.nameInput.trim() };
        this.modalManager.addTitlePlaceholders('payments_detail_account', 'name', this.nameInput.trim());
        this.editingName = false;
        this.nameSaving = false;
      },
      error: () => { this.nameSaving = false; }
    });
  }

  public startEditTx(tx: PaymentTransaction): void {
    this.editingTx = tx.transaction_id;
    this.txEditDesc = tx.description || '';
    this.txEditCategory = tx.category || null;
  }

  public setTxCategory(catId: string): void {
    if (this.txEditCategory === catId) {
      this.txEditCategory = null;
    } else {
      this.txEditCategory = catId;
    }
  }

  public cancelEditTx(): void {
    this.editingTx = null;
  }

  public saveEditTx(tx: PaymentTransaction): void {
    if (this.txEditSaving) return;
    this.txEditSaving = true;

    this.http.patch(
      `${Config.API_URL}/v1/payments/transfer/${tx.transaction_id}`,
      {
        description: this.txEditDesc.trim() || null,
        category: this.txEditCategory || null
      },
      { withCredentials: true }
    ).subscribe({
      next: () => {
        this.txEditSaving = false;
        tx.description = this.txEditDesc.trim() || null;
        tx.category = this.txEditCategory || null;
        this.editingTx = null;
      },
      error: () => {
        this.txEditSaving = false;
      }
    });
  }

  public getCategoryLabel(catId: string | null | undefined): string | null {
    if (!catId) return null;
    const cat = this.availableCategories.find(c => c.id === catId);
    return cat ? cat.label : null;
  }

  public getCategoryIcon(catId: string | null | undefined): string | null {
    if (!catId) return null;
    const cat = this.availableCategories.find(c => c.id === catId);
    return cat ? cat.icon : null;
  }

  public getCategoryColor(catId: string | null | undefined): string {
    if (!catId) return 'neutral';
    const cat = this.availableCategories.find(c => c.id === catId);
    return cat && cat.badgeColor ? cat.badgeColor : 'neutral';
  }

  public saveSettings(): void {
    this.settingsSaving = true;
    this.settingsSaved = false;
    this.settingsError = null;
    this.http.patch(
      `${Config.API_URL}/v1/payments/account/${this.data.payment_account_id}/settings`,
      { ...this.settings, name: this.data.name },
      { withCredentials: true }
    ).subscribe({
      next: () => {
        this.settingsSaving = false;
        this.settingsSaved = true;
        setTimeout(() => this.settingsSaved = false, 2500);
      },
      error: () => {
        this.settingsSaving = false;
        this.settingsError = this.l.s('global.error_generic');
      }
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
      this.computeSparkline();
    });
  }

  public submitTransfer(): void {
    this.transferError = null;
    if (!this.transfer.target_account_id || !this.transfer.amount || this.transfer.amount <= 0) {
      this.transferError = this.l.s('payments.detail_account.transfer_validation_error');
      return;
    }
    if (this.transfer.amount > this.data.balance) {
      this.transferError = this.l.s('payments.detail_account.transfer_insufficient_funds');
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
        if (data.new_source_balance !== undefined) {
          this.data = { ...this.data, balance: data.new_source_balance };
        }
        setTimeout(() => {
          this.transferSuccess = false;
          this.selectedTab.next(0);
          this.transactions = [];
          this.last_id = null;
          this.allLoaded = false;
          this.moreTransactions();
        }, 1500);
      },
      error: () => {
        this.transferLoading = false;
        this.transferError = this.l.s('global.error_server');
      }
    });
  }

  ngOnInit(): void {
    this.nameInput = this.data.name;

    this.filterTab.subscribe(index => {
      this.filters.type = this.types[index] || 'all';
    });

    // Account stats
    this.http.get<AccountDetail>(
      `${Config.API_URL}/v1/payments/account/${this.data.payment_account_id}`,
      { withCredentials: true }
    ).subscribe({
      next: (data) => { if (data) this.accountDetail = data; },
      error: () => {}
    });

    // Transactions
    this.http.get<PaymentTransaction[]>(
      `${Config.API_URL}/v1/payments/account_transfers/${this.data.payment_account_id}`,
      { withCredentials: true }
    ).subscribe({
      next: (data) => {
        this.loading = false;
        this.transactions = data;
        if (data.length > 0) this.last_id = data[data.length - 1].transaction_id;
        if (data.length < 50) this.allLoaded = true;
        this.computeSparkline();
      },
      error: () => { this.loading = false; }
    });

    // Account settings
    this.http.get<AccountSettings>(
      `${Config.API_URL}/v1/payments/account/${this.data.payment_account_id}/settings`,
      { withCredentials: true }
    ).subscribe({
      next: (data) => { if (data) this.settings = data; },
      error: () => {}
    });

    // Other accounts for transfer
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
