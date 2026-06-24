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

  // ── Mock data: active fees (vedení) ──
  public activeFees: any[] = [
    // { id: 1, name: 'Školní výlet - Praha',        class: '7.A', deadline: '2025-03-15', paid: 18, total: 28 },
    // { id: 2, name: 'Učebnice ČJ 7. ročník',        class: '7.A', deadline: '2025-02-28', paid: 26, total: 28 },
    // { id: 3, name: 'Školní výlet - ZOO',            class: '6.B', deadline: '2025-03-20', paid: 24, total: 30 },
    // { id: 5, name: 'Plavání - pololetní poplatek',  class: '5.A', deadline: '2025-04-01', paid: 12, total: 26 },
    // { id: 6, name: 'Pracovní sešit MAT',            class: '9.D', deadline: '2025-02-10', paid: 28, total: 30 },
  ];

  // ── Mock data: classes (vedení + učitel) ──
  public classes = [
    { name: '5.A', ucitel: 'Mgr. Karásková',  students: 26, balance: 12450, outstanding: 3200, overdue: 2 },
    { name: '6.B', ucitel: 'Mgr. Pospíšilová', students: 30, balance: 18700, outstanding: 1890, overdue: 1 },
    { name: '7.A', ucitel: 'Mgr. Dvořák',      students: 28, balance: 22100, outstanding: 5340, overdue: 4 },
    { name: '8.C', ucitel: 'Mgr. Tomášková',   students: 32, balance: 19800, outstanding: 890,  overdue: 0 },
    { name: '9.D', ucitel: 'Mgr. Váňa',        students: 30, balance: 16200, outstanding: 2100, overdue: 3 },
  ];

  // ── Mock data: all payments (vedení + učitel) ──
  public payments = [
    { id: 1, student: 'Novák Adam',        class: '7.A', parent: 'Novák Martin',    fee: 'Školní výlet - Praha',  amount: 890, date: '2025-01-28', method: 'Bankovní převod', status: 'confirmed' },
    { id: 2, student: 'Horáčková Eliška', class: '7.A', parent: 'Horáčková Jana',  fee: 'Školní výlet - Praha',  amount: 890, date: '2025-01-30', method: 'Hotovost',        status: 'confirmed' },
    { id: 3, student: 'Procházka Jakub',  class: '7.A', parent: 'Procházka Tomáš', fee: 'Učebnice ČJ',          amount: 245, date: '2025-01-25', method: 'Bankovní převod', status: 'confirmed' },
    { id: 4, student: 'Blažková Tereza',  class: '6.B', parent: 'Blažková Petra',  fee: 'Školní výlet - ZOO',   amount: 420, date: '2025-02-01', method: 'Bankovní převod', status: 'pending'   },
    { id: 5, student: 'Krejčí Ondřej',   class: '7.A', parent: 'Krejčí Pavel',    fee: 'Školní výlet - Praha',  amount: 890, date: '2025-01-20', method: 'Hotovost',        status: 'confirmed' },
    { id: 6, student: 'Marková Karolína', class: '8.C', parent: 'Marková Lenka',   fee: 'Divadelní představení', amount: 150, date: '2025-01-15', method: 'Bankovní převod', status: 'confirmed' },
  ];

  // ── Mock data: students in teacher's class ──
  public students7A = [
    { name: 'Novák Adam',        initials: 'NA', balance: 1200, status: 'ok',      paid: 2, total: 3 },
    { name: 'Horáčková Eliška', initials: 'HE', balance: 890,  status: 'ok',      paid: 3, total: 3 },
    { name: 'Procházka Jakub',  initials: 'PJ', balance: 500,  status: 'ok',      paid: 2, total: 3 },
    { name: 'Krejčí Ondřej',   initials: 'KO', balance: 0,    status: 'overdue',  paid: 1, total: 3 },
    { name: 'Blažková Tereza',  initials: 'BT', balance: 200,  status: 'ok',      paid: 2, total: 3 },
    { name: 'Marková Karolína', initials: 'MK', balance: 1500, status: 'ok',      paid: 3, total: 3 },
    { name: 'Šimánek Radek',    initials: 'ŠR', balance: 0,    status: 'overdue',  paid: 0, total: 3 },
  ];

  // ── Mock data: parent/student fees ──
  public myFees: { id: number; name: string; category: string; amount: number; deadline: string; status: string; paidDate?: string }[] = [
    { id: 1, name: 'Školní výlet - Praha',    category: 'Výlet',    amount: 890, deadline: '2025-03-15', status: 'pending' },
    { id: 2, name: 'Učebnice ČJ 7. ročník',  category: 'Učebnice', amount: 245, deadline: '2025-02-28', status: 'paid',    paidDate: '2025-01-25' },
    { id: 3, name: 'Třídní fond - únor',      category: 'Fond',     amount: 100, deadline: '2025-02-15', status: 'pending' },
  ];

  // ── Mock data: payment history (parent) ──
  public payHistory = [
    { title: 'Učebnice ČJ 7. ročník',   date: '25. 1. 2025', amount: '−245', type: 'expense', method: 'Bankovní převod' },
    { title: 'Třídní fond - prosinec',   date: '3. 12. 2024', amount: '−100', type: 'expense', method: 'Hotovost' },
    { title: 'Plavecký kurz - podzim',   date: '10. 10. 2024', amount: '−600', type: 'expense', method: 'Bankovní převod' },
    { title: 'Divadelní představení',    date: '5. 9. 2024',  amount: '−150', type: 'expense', method: 'Hotovost' },
    { title: 'Přeplatek - vrácení',      date: '30. 6. 2024', amount: '+200', type: 'income',  method: 'Bankovní převod' },
  ];

  // ── Computed getters ──
  public get pendingFees() {
    return this.myFees.filter(f => f.status === 'pending');
  }

  public get paidFees() {
    return this.myFees.filter(f => f.status === 'paid');
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
    )

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
    )
  }

  loadData() {
    // TODO: fetch from API based on role
    // if (this.perm.checkPermission(['principal', 'admin'])) { ... }
    // else if (this.perm.checkPermission(['teacher'])) { ... }
    // else if (this.perm.checkPermission(['parent'])) { ... }
    // else if (this.perm.checkPermission(['student'])) { ... }
  }

  confirmPayment(id: number) {
    const payment = this.payments.find(p => p.id === id);
    if (payment) payment.status = 'confirmed';
  }

  newPaymentModal() {
    this.modalManager.openModal('payments_new_payment');
  }

  openPayModal(feeId: number) {
    const fee = this.myFees.find(f => f.id === feeId);
    if (!fee) return;

    this.modalManager.openModal('payments_paytrip', fee);
  }
}
