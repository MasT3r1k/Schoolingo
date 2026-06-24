import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '@Schoolingo/icons';
import { PaymentMethodType, Payments } from '@Schoolingo/payments';
import { DropdownComponent, DropdownOption } from '@Components/dropdown/dropdown';

@Component({
  selector: 'app-new-deposit',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule, DropdownComponent],
  templateUrl: './new-deposit.component.html',
  styleUrls: ['./new-deposit.component.css']
})
export class NewDepositComponent implements OnInit {
  private payments = inject(Payments);

  public pay_methods_dropdown: DropdownOption[] = [];
  public pay_method = this.payments.getMethods('add_payment')[0];

  public form = {
    student: '',
    fee: '',
    amount: null,
    date: '',
    method: this.payments.getMethods('add_payment')[0].value,
    vs: '',
    note: ''
  };

  public justSaved = false;

  public recentDeposits = [
    { id: 1, student: 'Jan Novák', amount: 450, date: 'Dnes 14:20' },
    { id: 2, student: 'Eva Malá', amount: 200, date: 'Dnes 11:15' }
  ];

  public submitDeposit() {
    if (!this.form.student || !this.form.amount) return;
    this.recentDeposits.unshift({ id: Date.now(), student: this.form.student, amount: this.form.amount, date: 'Právě teď' });
    this.justSaved = true;
    setTimeout(() => this.justSaved = false, 3000);
    this.form = { student: '', fee: '', amount: null, date: '', method: 'cash', vs: '', note: '' };
  }

  ngOnInit(): void {
    this.pay_methods_dropdown = this.payments.getMethods('add_payment').map(
      (method) => (
        {
          label: 'payments.methods.' + method,
          value: method
        }
      )
    );
  }
}
