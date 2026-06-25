import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DropdownComponent } from '@Components/dropdown/dropdown';
import { IconsModule } from '@Schoolingo/icons';
import { MoneyPipe } from '../../../../pipes/money/money.pipe';
import { Locale } from '@Schoolingo/locale';
import { HttpClient } from '@angular/common/http';
import { Config } from '@Schoolingo/config';
import { LabelComponent } from '@Components/label/label.component';
import { ModalManager } from '@Schoolingo/modal';

@Component({
  imports: [DropdownComponent, IconsModule, FormsModule, ReactiveFormsModule, LabelComponent],
  templateUrl: './new-regular-payment.component.html',
  styleUrl: './new-regular-payment.component.css'
})
export class NewRegularPaymentComponent {

  public l = inject(Locale);
  private moneyPipe = inject(MoneyPipe);
  private http = inject(HttpClient);
  private modalManager = inject(ModalManager);
  public errors: any = {};
  public loading = false;

  public name = '';
  public amount: number | null = null;

  // Frequency
  public frequencies = [
    { label: 'time.daily', value: 'daily' },
    { label: 'time.weekly', value: 'weekly' },
    { label: 'time.monthly', value: 'monthly' },
    { label: 'time.yearly', value: 'yearly' },
  ];

  public selected_frequency = this.frequencies[2].value;

  // Recipients
  public classes: { label: string; value: number | null }[] = [
    { label: 'Celá škola', value: null },
  ];

  public selected_class: number | null = null;

  constructor() {
    // Načíst třídy ze serveru
    this.http.get<any[]>(`${Config.API_URL}/v1/school/classes`, { withCredentials: true })
      .subscribe({
        next: (data) => {
          if (Array.isArray(data)) {
            this.classes = [
              { label: 'Celá škola', value: null },
              ...data.map((c) => ({ label: c.name, value: c.class_id }))
            ];
          }
        },
        error: () => {} // třídy nenačteny — ponecháme default
      });
  }

  public getMoneyText(): string[] {
    return this.moneyPipe.transform(0).split('0', 2);
  }

  public createRegularPayment(): void {
    this.errors = {};

    if (!this.name || this.name.trim() === '') {
      this.errors['name'] = 'required';
    }

    if (this.amount === null || this.amount === undefined || this.amount.toString() === '') {
      this.errors['amount'] = 'required';
    } else if (this.amount <= 0) {
      this.errors['amount'] = 'cant_be_lower_than_0';
    } else if (this.amount === 0) {
      this.errors['amount'] = 'cant_be_zero';
    }

    if (!this.selected_frequency) {
      this.errors['frequency'] = 'required';
    }

    if (Object.keys(this.errors).length) return;

    this.loading = true;

    this.http.post(
      `${Config.API_URL}/v1/payments/regular_payment`,
      {
        name: this.name.trim(),
        amount: this.amount,
        frequency: this.selected_frequency,
        class_id: this.selected_class
      },
      { withCredentials: true }
    ).subscribe({
      next: (data: any) => {
        this.loading = false;
        if (data?.error) {
          this.errors['server'] = data.error;
          return;
        }
        this.modalManager.closeModal('payments_new_regular_payment');
      },
      error: () => {
        this.loading = false;
        this.errors['server'] = 'server_error';
      }
    });
  }
}
