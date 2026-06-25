import { Component, OnInit, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { Authentication } from '@Schoolingo/authentication';
import { Permission } from '@Schoolingo/permission';
import { School } from '@Schoolingo/school';
import { DropdownManager } from '@Schoolingo/dropdown';
import { ModalManager } from '@Schoolingo/modal';
import { PayModalComponent } from '../modals/pay-modal/pay-modal.component';
import { MoneyPipe } from "../../../pipes/money/money.pipe";
import { StatCardComponent } from "@Components/stat-card/stat-card.component";
import { Utils } from '@Schoolingo/utils';
import { NewPaymentComponent } from '../modals/new-payment/new-payment.component';
import { Config } from '@Schoolingo/config';

@Component({
  standalone: true,
  imports: [CommonModule, IconsModule, FormsModule, MoneyPipe, StatCardComponent],
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.css']
})
export class PaymentOverviewComponent implements OnInit {
  Utils = Utils;

  private http = inject(HttpClient);
  public l = inject(Locale);
  public auth = inject(Authentication);
  public perm = inject(Permission);
  public school = inject(School);
  public dropdownManager = inject(DropdownManager);
  private modalManager = inject(ModalManager);

  public loading = false;

  // ── Filter state (vedení / admin) ──
  public searchQuery = '';
  public filterClass = '';
  public filterStatus = '';

  // ── Admin data ──
  public stats = {
    total_collected: 0,
    pending_amount: 0,
    overdue_amount: 0,
    active_fees_count: 0,
    overdue_count: 0,
  };
  public activeFees: any[] = [];
  public classes: any[] = [];
  public payments: any[] = [];

  // ── Teacher data ──
  public students7A: any[] = [];

  // ── Parent/Student data ──
  public pendingFees: any[] = [];
  public paidFees: any[] = [];
  public payHistory: any[] = [];
  public myBalance = 0;
  public lastTransaction: any = null;

  // ── Computed getters ──
  public get filteredPayments() {
    return this.payments.filter((p) => {
      const matchSearch = !this.searchQuery ||
        p.student?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        p.fee?.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchClass = !this.filterClass || p.class === this.filterClass;
      const matchStatus = !this.filterStatus || p.status === this.filterStatus;
      return matchSearch && matchClass && matchStatus;
    });
  }

  public get studentsPaid(): number {
    return this.students7A.filter(s => s.status === 'ok').length;
  }

  public get studentsOverdue(): number {
    return this.students7A.filter(s => s.status === 'overdue').length;
  }

  ngOnInit(): void {
    this.loadData();

    this.modalManager.addModal(
      'payments_new_payment',
      {
        icon: 'receipt',
        title: 'payments.new_payment.title',
        closeable: true,
        items: [
          { type: 'component', component: NewPaymentComponent }
        ]
      }
    );

    this.modalManager.addModal(
      'payments_paytrip',
      {
        icon: 'receipt',
        title: 'payments.confirm_payment.title',
        closeable: true,
        items: [
          { type: 'component', component: PayModalComponent }
        ]
      }
    );
  }

  loadData() {
    this.loading = true;

    // Admin / vedení
    if (this.perm.checkPermission(['principal', 'admin'])) {
      this.http.get<any>(`${Config.API_URL}/v1/payments/overview`, { withCredentials: true })
        .subscribe({
          next: (data) => {
            this.loading = false;
            if (data?.stats) this.stats = data.stats;
            if (data?.active_fees) this.activeFees = data.active_fees;
          },
          error: () => { this.loading = false; }
        });
    }
    // Rodič / žák
    else if (this.perm.checkPermission(['parent', 'student'])) {
      this.http.get<any>(`${Config.API_URL}/v1/payments/my_fees`, { withCredentials: true })
        .subscribe({
          next: (data) => {
            this.loading = false;
            if (Array.isArray(data)) {
              this.pendingFees = data.filter((f) => f.status === 'pending' || f.status === 'partially_paid');
              this.paidFees = data.filter((f) => f.status === 'paid');
            }
          },
          error: () => { this.loading = false; }
        });
    }
    // Učitel — zatím mock data (needs teacher-specific endpoint)
    else {
      this.loading = false;
    }
  }

  confirmPayment(id: number) {
    const payment = this.payments.find(p => p.id === id);
    if (payment) payment.status = 'confirmed';
  }

  newPaymentModal() {
    this.modalManager.openModal('payments_new_payment');
  }

  openPayModal(fee: any) {
    this.modalManager.openModal('payments_paytrip', {
      id: fee.payment_assign_id,
      amount: parseFloat(fee.amount),
      name: fee.name,
      category: fee.category,
      deadline: fee.due_date,
      status: fee.status,
      variable_symbol: fee.variable_symbol
    });
  }
}
