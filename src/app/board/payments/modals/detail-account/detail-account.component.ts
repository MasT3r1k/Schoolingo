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

type PaymentTransaction = {
  transaction_id: number;
  type: 'in' | 'out';
  source_id: number;
  target_id: number;
  amount: number;
  new_balance: number;
  description: string;
  created_at: Date;
}

type AccountDetail = {
  total_in: number;
  total_out: number;
  last_payment: {
    amount: number;
    created_at: Date;
  }
}

@Component({
  imports: [TabsComponent, MoneyPipe, CheckboxComponent, IconsModule, FormsModule, ReactiveFormsModule],
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
  
  public accountDetail: AccountDetail = {
    total_in: 0,
    total_out: 0,
    last_payment: {
      amount: 0,
      created_at: new Date()
    }
  }
  
  public transactions: PaymentTransaction[] = [
    { transaction_id: 9, type: 'in', source_id: 1, target_id: 2, amount: 300, new_balance: 1240, description: "školní výlet ZOO", created_at: new Date('2026-06-18') },
    { transaction_id: 8, type: 'out', source_id: 2, target_id: 4, amount: 150, new_balance: 940, description: "pracovní sešity", created_at: new Date('2026-06-12') },
    { transaction_id: 7, type: 'out', source_id: 2, target_id: 4, amount: 120, new_balance: 1090, description: "vstupné, divadlo", created_at: new Date('2026-06-2') },
    { transaction_id: 6, type: 'in', source_id: 1, target_id: 2, amount: 150, new_balance: 1210, description: "měsíční příspěvek", created_at: new Date('2026-05-28') },
    { transaction_id: 5, type: 'out', source_id: 2, target_id: 4, amount: 85, new_balance: 1060, description: "pastelky a papíry", created_at: new Date('2026-05-14') }
  ];

  public moreTransactions(): void {
    this.http.get<PaymentTransaction[]>(
      `${Config.API_URL}/v1/payments/account_transfers/${this.data.payment_account_id}?cursor=${this.last_id}`,
      { withCredentials: true }
    )
    .subscribe((data: PaymentTransaction[]) => {
      this.transactions.push(...data)
    })
  }

  ngOnInit(): void {
  }
}
