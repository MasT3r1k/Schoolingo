import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '@Schoolingo/icons';
import { DropdownComponent, DropdownOption } from '@Components/dropdown/dropdown';
import { Payments } from '@Schoolingo/payments';
import { Locale } from '@Schoolingo/locale';

@Component({
  selector: 'app-new-payment',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule, DropdownComponent],
  templateUrl: './new-payment.component.html',
  styleUrls: ['./new-payment.component.css']
})
export class NewPaymentComponent implements OnInit {
  public l = inject(Locale);
  private payments = inject(Payments);

  public pay_methods_dropdown: DropdownOption[] = [];
  public pay_method = this.payments.getMethods('add_payment')[0].value;
  
  public form = {
    recipient: '',
    purpose: '',
    amount: null,
    date: '',
    method: 'bank',
    note: ''
  };

  public submitPayment() {
    console.log('Platba zadána', this.form);
    this.form = { recipient: '', purpose: '', amount: null, date: '', method: 'bank', note: '' };
  }

  ngOnInit(): void {
    this.pay_methods_dropdown = this.payments.getMethods('add_payment').map(
      (method) => (
        {
          label: 'payments.methods.' + method.value,
          value: method.value
        }
      )
    );
  }
}
