import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '@Schoolingo/icons';
import { CheckboxComponent } from '@Components/Checkbox';
import { Permission } from '@Schoolingo/permission';
import { HttpClient } from '@angular/common/http';
import { Config } from '@Schoolingo/config';
import { MoneyPipe } from "../../../pipes/money/money.pipe";
import { ModalManager } from '@Schoolingo/modal';
import { NewRegularPaymentComponent } from '../modals/new-regular-payment/new-regular-payment.component';
import { Locale } from '@Schoolingo/locale';

@Component({
  selector: 'app-regular-payments',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule, CheckboxComponent, MoneyPipe],
  templateUrl: './regular-payments.component.html',
  styleUrls: ['./regular-payments.component.css']
})
export class RegularPaymentsComponent implements OnInit {
  public l = inject(Locale);

  public perms = inject(Permission);
  private http = inject(HttpClient);
  private modalManager = inject(ModalManager);

  public hasAccess = {
    canCreate: true,
    canDelete: true,
    canEdit: true,
    canView: true
  }

  public regularPayments = [
    { id: 1, name: 'Školní družina', frequency: 'Měsíčně', amount: 300, recipients: 45, active: true },
    { id: 2, name: 'Stravné', frequency: 'Měsíčně', amount: 800, recipients: 120, active: true },
    { id: 3, name: 'Kroužek keramiky', frequency: 'Pololetně', amount: 1500, recipients: 15, active: false }
  ];

  ngOnInit(): void {
    this.http.get(
      `${Config.API_URL}/v1/payments/regular_payments`,
      { withCredentials: true }
    ).subscribe((data: any) => {
      if ('perms' in data) {
        this.hasAccess = data.perms;
      }
      if ('payments' in data) {
        this.regularPayments = data.payments;
      }
    });

    this.modalManager.addModal(
      'payments_new_regular_payment',
      {
        title: 'payments.regular_payments.new_payment.title',
        icon: 'cash-banknote-plus',
        closeable: true,
        items: [
          { type: 'component', component: NewRegularPaymentComponent }
        ]
      }
    )
  }

  public newRegularPayment(): void {
    this.modalManager.openModal('payments_new_regular_payment');
  }
}
