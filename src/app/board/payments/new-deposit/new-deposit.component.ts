import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '@Schoolingo/icons';
import { PaymentMethodType, Payments } from '@Schoolingo/payments';
import { DropdownComponent, DropdownOption } from '@Components/dropdown/dropdown';
import { HttpClient } from '@angular/common/http';
import { Config } from '@Schoolingo/config';

@Component({
  selector: 'app-new-deposit',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule, DropdownComponent],
  templateUrl: './new-deposit.component.html',
  styleUrls: ['./new-deposit.component.css']
})
export class NewDepositComponent implements OnInit {
  private payments = inject(Payments);
  private http = inject(HttpClient);

  public pay_methods_dropdown: DropdownOption[] = [];
  public pay_method = this.payments.getMethods('add_payment')[0].value;

  public accounts: { label: string; value: number }[] = [];
  public selected_account: number | null = null;

  public form = {
    amount: null as number | null,
    description: '',
  };

  public justSaved = false;
  public loading = false;
  public error: string | null = null;

  public recentDeposits: { id: number; description: string; amount: number; date: string }[] = [];

  public submitDeposit() {
    this.error = null;
    if (!this.selected_account || !this.form.amount || this.form.amount <= 0) {
      this.error = 'Vyplňte cílový účet a částku';
      return;
    }

    this.loading = true;

    this.http.post(
      `${Config.API_URL}/v1/payments/deposit`,
      {
        target_account_id: this.selected_account,
        amount: this.form.amount,
        description: this.form.description || null
      },
      { withCredentials: true }
    ).subscribe({
      next: (data: any) => {
        this.loading = false;
        if (data?.error) {
          this.error = data.error;
          return;
        }
        this.recentDeposits.unshift({
          id: Date.now(),
          description: this.form.description || 'Vklad',
          amount: this.form.amount!,
          date: 'Právě teď'
        });
        this.justSaved = true;
        setTimeout(() => this.justSaved = false, 3000);
        this.form = { amount: null, description: '' };
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
