import { Component, inject, OnInit } from '@angular/core';
import { DropdownComponent, DropdownOption } from '@Components/dropdown/dropdown';
import { QrpaymentComponent } from '@Components/qr-payment/qr-payment.component';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { ModalManager } from '@Schoolingo/modal';
import { Payments } from '@Schoolingo/payments';
import { Utils } from '@Schoolingo/utils';
import { MoneyPipe } from '../../../../pipes/money/money.pipe';
import { HttpClient } from '@angular/common/http';
import { Config } from '@Schoolingo/config';

interface PaymentData {
  id: number;
  amount: number;
  name: string;
  category: string;
  deadline: Date;
  status: string;
  bank_account: string;
  variable_symbol?: string;
}

@Component({
  selector: 'app-pay-modal',
  imports: [IconsModule, DropdownComponent, QrpaymentComponent, MoneyPipe],
  templateUrl: './pay-modal.component.html',
  styleUrls: ['./pay-modal.component.css', '../../../../Components/modal/modal.css']
})
export class PayModalComponent implements OnInit {
  private modalManager = inject(ModalManager);
  private payments = inject(Payments);
  private http = inject(HttpClient);
  public Utils = Utils;
  public l = inject(Locale);
  public modal_data: PaymentData = this.modalManager.getModalData('payments_paytrip');

  public show_qrcode = false;
  public loading = false;
  public confirmed = false;
  public error: string | null = null;

  public pay_methods_dropdown: DropdownOption[] = [];
  public pay_method = this.payments.getMethods('pay')[0].value;

  public payments_accounts: { label: string; value: string; balance: number }[] = [];
  public selected_account: string | null = null;

  public closeModal(): void {
    this.modalManager.closeModal('payments_paytrip');
  }

  public confirmPay(): void {
    if (this.loading) return;
    this.error = null;
    this.loading = true;

    this.http.post(
      `${Config.API_URL}/v1/payments/confirm_fee`,
      {
        payment_assign_id: this.modal_data.id,
        method: this.pay_method,
        account_id: this.pay_method === 'account' ? this.selected_account : null
      },
      { withCredentials: true }
    ).subscribe({
      next: (data: any) => {
        this.loading = false;
        if (data?.error) {
          this.error = data.error;
          return;
        }
        this.confirmed = true;
        setTimeout(() => this.closeModal(), 1500);
      },
      error: () => {
        this.loading = false;
        this.error = 'server_error';
      }
    });
  }

  ngOnInit() {
    this.pay_methods_dropdown = this.payments.getMethods('pay').map(
      (method) => ({
        label: 'payments.confirm_payment.methods.' + method.value,
        value: method.value
      })
    );

    const raw: any = this.modalManager.getModalData('payments_paytrip');
    this.modal_data = {
      ...raw,
      bank_account: raw?.bank_account ?? '—'
    };

    // Načíst účty uživatele pro možnost platby z účtu
    this.http.get<any[]>(`${Config.API_URL}/v1/payments/accounts`, { withCredentials: true })
      .subscribe({
        next: (data) => {
          if (Array.isArray(data)) {
            this.payments_accounts = data
              .filter((a) => a.is_active)
              .map((a) => ({
                label: a.name,
                value: String(a.payment_account_id),
                balance: parseFloat(a.balance) || 0
              }));
            if (this.payments_accounts.length) {
              this.selected_account = this.payments_accounts[0].value;
            }
          }
        },
        error: () => {}
      });
  }

  public get selectedAccountBalance(): number {
    const acc = this.payments_accounts.find((a) => a.value === this.selected_account);
    return acc?.balance ?? 0;
  }
}
