import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LabelComponent } from '@Components/label/label.component';
import { IconsModule } from '@Schoolingo/icons';
import { MoneyPipe } from '../../../../pipes/money/money.pipe';
import { DatePickerComponent } from '@Components/date-picker/date-picker.component';
import { Locale } from '@Schoolingo/locale';
import { ModalManager } from '@Schoolingo/modal';
import { HttpClient } from '@angular/common/http';
import { Config } from '@Schoolingo/config';
import { DropdownComponent } from '@Components/dropdown/dropdown';
import moment from 'moment';

@Component({
  imports: [LabelComponent, FormsModule, ReactiveFormsModule, IconsModule, DatePickerComponent, DropdownComponent],
  templateUrl: './new-payment.component.html',
  styleUrl: './new-payment.component.css'
})
export class NewPaymentComponent {
  public l = inject(Locale);
  private moneyPipe = inject(MoneyPipe);
  private modalManager = inject(ModalManager);
  private http = inject(HttpClient);

  public name = '';
  public description = '';
  public amount: number | null = null;
  public date_due = new Date();
  public errors: any = {};
  public loading = false;

  public categories: { label: string; value: number }[] = [];
  public selected_category: number | null = null;

  public classes: { label: string; value: number | null }[] = [
    { label: 'Celá škola', value: null }
  ];
  public selected_class: number | null = null;

  constructor() {
    this.http.get<any[]>(`${Config.API_URL}/v1/payments/categories`, { withCredentials: true })
      .subscribe({
        next: (data) => {
          if (Array.isArray(data)) {
            this.categories = data.map((c) => ({ label: c.category, value: c.category_id }));
            if (this.categories.length) this.selected_category = this.categories[0].value;
          }
        },
        error: () => {}
      });

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
        error: () => {}
      });
  }

  public getMoneyText(): string[] {
    return this.moneyPipe.transform(0).split('0', 2);
  }

  public newPayment(): void {
    this.errors = {};

    if (!this.name || this.name.trim() === '') {
      this.errors.name = 'form.required';
    }

    if (!this.description || this.description.trim() === '') {
      this.errors.description = 'form.required';
    }

    if (!this.amount || this.amount <= 0) {
      this.errors.amount = 'form.invalid';
    }

    if (!this.selected_category) {
      this.errors.category = 'form.required';
    }

    const date = moment(this.date_due);
    if (!date.isValid()) {
      this.errors.date_due = 'form.required';
    }
    if (date.isValid() && date.isSameOrBefore(moment(), 'day')) {
      this.errors.date_due = 'payments.errors.cant_be_before';
    }

    if (Object.keys(this.errors).length) return;

    this.loading = true;

    this.http.post(
      `${Config.API_URL}/v1/payments/fee`,
      {
        name: this.name.trim(),
        description: this.description.trim(),
        amount: this.amount,
        due_date: moment(this.date_due).format('YYYY-MM-DD'),
        category_id: this.selected_category,
        class_id: this.selected_class,
        is_draft: false
      },
      { withCredentials: true }
    ).subscribe({
      next: (data: any) => {
        this.loading = false;
        if (data?.error) {
          this.errors['server'] = data.error;
          return;
        }
        this.modalManager.closeModal('payments_new_payment');
      },
      error: () => {
        this.loading = false;
        this.errors['server'] = 'server_error';
      }
    });
  }
}
