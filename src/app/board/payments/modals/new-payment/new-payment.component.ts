import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LabelComponent } from '@Components/label/label.component';
import { IconsModule } from '@Schoolingo/icons';
import { MoneyPipe } from '../../../../pipes/money/money.pipe';
import { DatePickerComponent } from '@Components/date-picker/date-picker.component';
import { Locale } from '@Schoolingo/locale';
import moment from 'moment';

@Component({
  imports: [LabelComponent, FormsModule, ReactiveFormsModule, IconsModule, DatePickerComponent],
  templateUrl: './new-payment.component.html',
  styleUrl: './new-payment.component.css'
})
export class NewPaymentComponent {
  public l = inject(Locale);
  private moneyPipe = inject(MoneyPipe)

  public name = '';
  public description = '';
  public amount = 0;
  public date_due = new Date();
  public errors: any = {};
  public date = null;

  public getMoneyText(): string[] {
    return this.moneyPipe.transform(0).split('0', 2);
  }

  public newPayment(): void {
    this.errors = {};

    if (this.name == '') {
      this.errors.name = 'form.required';
    }

    if (this.description == '') {
      this.errors.description = 'form.required';
    }

    if (this.amount <= 0) {
      this.errors.amount = 'form.invalid';
    }

    const date = moment(this.date_due);
    if (!date.isValid()) {
      this.errors.date_due = 'form.required';
    }
    if (date.isValid() && date.isSameOrBefore(moment(), 'day')) {
      this.errors.date_due = 'payments.errors.cant_be_before'
    }

    if (Object.keys(this.errors).length) {
      return;
    }
  }
}
