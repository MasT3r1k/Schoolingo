import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DropdownComponent } from '@Components/dropdown/dropdown';
import { IconsModule } from '@Schoolingo/icons';
import { MoneyPipe } from '../../../../pipes/money/money.pipe';
import { Locale } from '@Schoolingo/locale';
import { HttpClient } from '@angular/common/http';
import { Config } from '@Schoolingo/config';
import { LabelComponent } from '@Components/label/label.component';

@Component({
  imports: [DropdownComponent, IconsModule, FormsModule, ReactiveFormsModule, LabelComponent],
  templateUrl: './new-regular-payment.component.html',
  styleUrl: './new-regular-payment.component.css'
})
export class NewRegularPaymentComponent {

  public l = inject(Locale);
  private moneyPipe = inject(MoneyPipe);
  private http = inject(HttpClient);
  public errors: any = {};

  public name = '';
  public amount = 0;

  // Frequency
  public frequencies = [
    { label: 'time.daily', value: 'daily' },
    { label: 'time.weekly', value: 'weekly' },
    { label: 'time.monthly', value: 'monthly' },
  ];

  public selected_frequency = this.frequencies[0].value;


  // Recipients
  public classes = [
    { label: 'Celá škola', value: null },
    { label: 'Třída B4.I', value: 1 },
  ]

  public selected_class = this.classes[0].value;

  public getMoneyText(): string[] {
    return this.moneyPipe.transform(0).split('0', 2);
  }

  public createRegularPayment(): void {
    const name = this.name;
    const amount = this.amount;
    const frequency = this.selected_frequency;
    const recipients = this.selected_class;
    
    this.errors = {};

    if (name == '') {
      this.errors['name'] = 'required';
    }

    if (amount.toString() == '') {
      this.errors['amount'] = 'required';
    }

    if (amount <= 0) {
      this.errors['amount'] = 'cant_be_lower_than_0';
    }

    if (amount == 0) {
      this.errors['amount'] = 'cant_be_zero';
    }

    if (!frequency) {
      this.errors['frequency'] = 'required';
    }

    if (Object.keys(this.errors).length) {
      return;
    }

    this.http.post(
      `${Config.API_URL}/v1/payments/regular_payment`,
      { withCredentials: true }
    ).subscribe((data) => {});
  }

}
