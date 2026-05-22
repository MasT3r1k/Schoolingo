import { Component, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DropdownManager } from '@Schoolingo/dropdown';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { ModalManager } from '@Schoolingo/modal';
import { Config } from '@Schoolingo/config';
import { Authentication } from '@Schoolingo/authentication';
import { Country } from 'country-state-city';

@Component({
  imports: [IconsModule, FormsModule, ReactiveFormsModule],
  templateUrl: './add-phone.component.html',
  styleUrl: './add-phone.component.css'
})
export class AddPhoneComponent implements OnInit {
  public l = inject(Locale);
  public dropdownManager = inject(DropdownManager);
  public modalManager = inject(ModalManager);
  private http = inject(HttpClient);
  private auth = inject(Authentication);

  public code = 420;
  public number = '';
  public originalNumber: string | null = null;
  public isEdit = false;

  public token = '';
  public verificationCode = '';
  public active_action = '';
  public page: 'main' | '2fa' | 'verify' = 'main';
  public error = '';

  public countrySearchQuery = '';
  private allCountries = Country.getAllCountries()
    .filter(c => c.phonecode)
    .sort((a, b) => {
        if (a.isoCode === 'CZ') return -1;
        if (b.isoCode === 'CZ') return 1;
        if (a.isoCode === 'SK') return -1;
        if (b.isoCode === 'SK') return 1;
        return a.name.localeCompare(b.name);
    })
    .map(c => ({
        iso: c.isoCode.toLowerCase(),
        name: c.name,
        code: parseInt(c.phonecode.replace('+', '').split(' ')[0]),
        flag: c.flag
    }));

  public get countries() {
    if (!this.countrySearchQuery) return this.allCountries;
    const query = this.countrySearchQuery.toLowerCase().trim();
    return this.allCountries.filter(c => 
        c.name.toLowerCase().includes(query) || 
        c.code.toString().includes(query) ||
        c.iso.includes(query)
    );
  }

  public get selectedCountry() {
    return this.allCountries.find(c => c.code === this.code) || { iso: 'unknown', name: 'Neznámý', code: this.code, flag: '' };
  }

  public selectCountry(country: any): void {
    this.code = country.code;
    this.dropdownManager.selected_dropdown = '';
  }

  public getFlag(iso: string): string {
    return this.countries.find(c => c.iso === iso)?.flag || '';
  }

  ngOnInit(): void {
    const data = this.modalManager.getModalData('add_phone');
    if (data && data.number) {
      this.code = data.code || 420;
      this.number = data.number;
      this.originalNumber = data.number;

      if (data.mode === 'verify') {
        this.page = 'verify';
      } else {
        this.isEdit = true;
      }
    }
  }

  public savePhone(): void {
    if (this.number == '') {
      return;
    }

    const payload: any = {
      code: this.code,
      number: this.number,
      token: this.token
    };

    let request;
    if (this.isEdit) {
      payload.originalNumber = this.originalNumber;
      request = this.http.put(`${Config.API_URL}/v1/user/phone`, payload, { withCredentials: true });
    } else {
      request = this.http.post(`${Config.API_URL}/v1/user/phone`, payload, { withCredentials: true });
    }

    request.subscribe({
      next: (response: any) => {
        if (response.success) {
          this.page = 'verify';
          this.error = '';
          this.auth.loadState();
        } else if (response.error && response.error.includes('required_2fa')) {
          this.page = '2fa';
        } else if (response.error && response.error.includes('phone_exists')) {
            this.error = 'Toto telefonní číslo je již přiřazeno k jinému účtu.';
        }
      },
      error: (error) => {
        if (error.status === 400) {
            if (error.error?.error?.includes('required_2fa')) {
                this.page = '2fa';
            } else if (error.error?.error?.includes('phone_exists')) {
                this.error = 'Toto telefonní číslo je již přiřazeno k jinému účtu.';
            } else if (error.error?.error?.includes('invalid_2fa')) {
                this.error = 'Neplatný 2FA kód.';
            }
        }
        console.error('Error saving phone', error);
      }
    });
  }

  public verifyPhone(): void {
    if (this.verificationCode.length < 4) return;

    this.http.post(`${Config.API_URL}/v1/user/phone/verify/confirm`, {
      number: this.number,
      code: this.verificationCode
    }, { withCredentials: true }).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.modalManager.closeModal('add_phone');
          this.auth.loadState();
          this.resetForm();
        } else if (response.error) {
            this.error = 'Neplatný ověřovací kód.';
        }
      },
      error: (error) => {
          this.error = 'Chyba při ověřování. Zkontrolujte kód a zkuste to znovu.';
          console.error('Error verifying phone', error);
      }
    });
  }

  public resendCode(): void {
    this.http.post(`${Config.API_URL}/v1/user/phone/verify/send`, {
      number: this.number
    }, { withCredentials: true }).subscribe({
      next: (response: any) => {
        if (response.success) {
          alert('Kód byl znovu odeslán.');
          this.auth.loadState();
        }
      },
      error: (error) => console.error('Error resending code', error)
    });
  }

  private resetForm() {
    this.code = 420;
    this.number = '';
    this.isEdit = false;
    this.originalNumber = null;
    this.token = '';
    this.verificationCode = '';
    this.page = 'main';
    this.error = '';
  }
}
