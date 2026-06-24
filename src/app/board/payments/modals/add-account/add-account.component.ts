import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DropdownComponent } from '@Components/dropdown/dropdown';
import { LabelComponent } from '@Components/label/label.component';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { ModalManager } from '@Schoolingo/modal';
import { IbanFormatterDirective } from '../../../../directives/iban-formatter.directive';
import * as ibanChecker from 'iban';
import { HttpClient } from '@angular/common/http';
import { Config } from '@Schoolingo/config';

@Component({
  imports: [DropdownComponent, IconsModule, FormsModule, ReactiveFormsModule, LabelComponent, IbanFormatterDirective],
  templateUrl: './add-account.component.html',
  styleUrl: './add-account.component.css'
})
export class AddAccountComponent {

  public name = '';
  public iban = '';
  public iban_max_len = 29;
  public want_bigger_iban = false;

  public l = inject(Locale);
  private modalManager = inject(ModalManager);
  private http = inject(HttpClient);
  public errors: any = {};

  public types = [
    { label: 'payments.add_account.types.bank', value: 'bank' },
    { label: 'payments.add_account.types.cash', value: 'cash' },
  ];

  public selectedType = this.types[0].value;

  public checkifwantmore(event: InputEvent): void {
    if (this.iban.length == 29 && this.iban_max_len == 29 && event.inputType == "insertText") {
      this.want_bigger_iban = true;
    }
    if (this.want_bigger_iban && event.inputType == "deleteContentBackward") {
      this.want_bigger_iban = false
    }
  }

  public closeModal(): void {
    this.modalManager.closeModal('payments_add_account');
  }

  public createAccount(): void {
    this.errors = {};

    if (this.name == '') {
      this.errors.name = 'payments.errors.required'
    }

    if (this.types.findIndex((type) => type.value == this.selectedType) == -1) {
      this.errors.type = 'payments.errors.unknown_value'
    }

    const iban = this.iban.trim().replace(/\s/g, '');

    if (this.selectedType == 'bank') {
      if (iban == '') {
        this.errors.iban = 'payments.errors.required'
      } else if (!ibanChecker.isValid(iban)) {
        this.errors.iban = 'payments.errors.wrong_iban';
      }
    }

    if (Object.keys(this.errors).length) {
      return;
    }

    this.http.post(
      `${Config.API_URL}/v1/payments/account`,
      {
        type: this.selectedType,
        name: this.name,
        iban: this.selectedType == 'bank' ? this.iban : null
      },
      { withCredentials: true }
    ).subscribe((data) => {
      this.closeModal()
    })
  }
}
