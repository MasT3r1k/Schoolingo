import { Component, inject, OnInit } from '@angular/core';
import { DropdownComponent, DropdownOption } from '@Components/dropdown/dropdown';
import { QrpaymentComponent } from '@Components/qr-payment/qr-payment.component';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { ModalManager } from '@Schoolingo/modal';
import { Payments } from '@Schoolingo/payments';
import { School } from '@Schoolingo/school';
import { Utils } from '@Schoolingo/utils';
import { MoneyPipe } from '../../../../pipes/money/money.pipe';

interface PaymentData {
  id: number;
  amount: number;
  name: string;
  category: string;
  deadline: Date;
  status: string;
  bank_account: string;
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
  public Utils = Utils;
  public l = inject(Locale);
  public school = inject(School);
  public modal_data: PaymentData = this.modalManager.getModalData('payments_paytrip');

  public show_qrcode = false;

  public pay_methods_dropdown: DropdownOption[] = [];
  public pay_method = this.payments.getMethods('pay')[0].value;

  public payments_accounts = [
    { label: 'Hlavní účet', value: '2', balance: 6000 }
  ];

  public closeModal(): void {
    this.modalManager.closeModal('payments_paytrip');
  }

  ngOnInit() {
    this.pay_methods_dropdown = this.payments.getMethods('pay').map(
      (method) => (
        {
          label: 'payments.confirm_payment.methods.' + method.value,
          value: method.value
        }
      )
    );

    this.modal_data = {
      ...this.modalManager.getModalData('payments_paytrip'),
      bank_account: '8088810003/5500'
    };
    console.log(this.modal_data);
  }
}
