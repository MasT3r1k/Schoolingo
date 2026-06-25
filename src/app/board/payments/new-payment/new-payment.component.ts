import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '@Schoolingo/icons';
import { DropdownComponent, DropdownOption } from '@Components/dropdown/dropdown';
import { Payments } from '@Schoolingo/payments';
import { Locale } from '@Schoolingo/locale';
import { HttpClient } from '@angular/common/http';
import { Config } from '@Schoolingo/config';

@Component({
  selector: 'app-new-payment-page',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule, DropdownComponent],
  templateUrl: './new-payment.component.html',
  styleUrls: ['./new-payment.component.css']
})
export class NewPaymentComponent implements OnInit {
  public l = inject(Locale);
  private payments = inject(Payments);
  private http = inject(HttpClient);

  public pay_methods_dropdown: DropdownOption[] = [];
  public pay_method = this.payments.getMethods('add_payment')[0].value;

  public accounts: { label: string; value: number }[] = [];
  public selected_account: number | null = null;
  
  public form = {
    recipient: '',
    purpose: '',
    amount: null as number | null,
    date: '',
    note: ''
  };

  public loading = false;
  public error: string | null = null;
  public success = false;

  public submitPayment() {
    this.error = null;
    if (!this.selected_account || !this.form.amount || this.form.amount <= 0 || !this.form.purpose) {
      this.error = 'Zadejte účel, částku a zdrojový účet.';
      return;
    }

    this.loading = true;

    this.http.post(
      `${Config.API_URL}/v1/payments/expense`,
      {
        source_account_id: this.selected_account,
        amount: this.form.amount,
        description: `${this.form.purpose} ${this.form.recipient ? `(${this.form.recipient})` : ''}`.trim()
      },
      { withCredentials: true }
    ).subscribe({
      next: (data: any) => {
        this.loading = false;
        if (data?.error) {
          this.error = data.error;
          return;
        }
        this.success = true;
        setTimeout(() => this.success = false, 3000);
        this.form = { recipient: '', purpose: '', amount: null, date: '', note: '' };
      },
      error: () => {
        this.loading = false;
        this.error = 'Chyba serveru';
      }
    });
  }

  ngOnInit(): void {
    this.pay_methods_dropdown = this.payments.getMethods('add_payment').map(
      (method) => ({
        label: 'payments.methods.' + method.value,
        value: method.value
      })
    );

    // Načíst účty
    this.http.get<any[]>(`${Config.API_URL}/v1/payments/accounts`, { withCredentials: true })
      .subscribe({
        next: (data) => {
          if (Array.isArray(data)) {
            this.accounts = data
              .filter((a) => a.is_active)
              .map((a) => ({ label: a.name, value: a.payment_account_id }));
            if (this.accounts.length) this.selected_account = this.accounts[0].value;
          }
        },
        error: () => {}
      });
  }
}
