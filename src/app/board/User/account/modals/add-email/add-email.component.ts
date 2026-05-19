import { Component, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DropdownManager } from '@Schoolingo/dropdown';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { ModalManager } from '@Schoolingo/modal';
import { Config } from '@Schoolingo/config';
import { Authentication } from '@Schoolingo/authentication';
import { AuthConfig } from '../../../../../infrastructure/authentication/config';
import { DropdownComponent, DropdownOption } from '@Components/dropdown/dropdown';

@Component({
  imports: [IconsModule, FormsModule, ReactiveFormsModule, DropdownComponent],
  templateUrl: './add-email.component.html',
  styleUrl: './add-email.component.css'
})
export class AddEmailComponent implements OnInit {
  public l = inject(Locale);
  public dropdownManager = inject(DropdownManager);
  public modalManager = inject(ModalManager);
  private http = inject(HttpClient);
  private auth = inject(Authentication);
  public AuthConfig = AuthConfig;

  public showSelect: null | 'type' = null;
  public email_types = ['personal', 'school', 'work', 'other'];
  public dropdown_types: DropdownOption[] = [
    {
      label: 'user.add_email.types.personal',
      value: 'personal'
    },
    {
      label: 'user.add_email.types.school',
      value: 'school'
    },
    {
      label: 'user.add_email.types.work',
      value: 'work'
    },
    {
      label: 'user.add_email.types.other',
      value: 'other'
    }
  ]
  public email_selected = 0;

  public token = '';
  public email = '';
  public originalEmail: string | null = null;
  public isEdit = false;

  public active_action = '';
  public verificationCode = '';

  public page: 'main' | '2fa' | 'verify' = 'main';
  public alert: { type: 'success' | 'danger' | 'info', message: string } | null = null;

  ngOnInit(): void {
    const data = this.modalManager.getModalData('add_email');
    if (data && data.email) {
      this.email = data.email;
      this.originalEmail = data.email;
      
      if (data.mode === 'verify') {
        this.page = 'verify';
      } else {
        this.isEdit = true;
        const typeIndex = this.email_types.indexOf(data.type);
        if (typeIndex !== -1) {
          this.email_selected = typeIndex;
        }
      }
    }
    if (data == null) {
      this.resetForm();
    }
  }

  public saveEmail(): void {
    if (this.email == '') {
      return;
    }

    const payload: any = {
      email: this.email,
      type: this.email_types[this.email_selected],
      token: this.token
    };

    let request;
    if (this.isEdit) {
      payload.originalEmail = this.originalEmail;
      request = this.http.put(`${Config.API_URL}/v1/user/email`, payload, { withCredentials: true });
    } else {
      request = this.http.post(`${Config.API_URL}/v1/user/email`, payload, { withCredentials: true });
    }

    request.subscribe({
      next: (response: any) => {
        if (response.success) {
          if (response.verified || response.skip_verification) {
            this.modalManager.closeModal('add_email');
          } else {
            this.page = 'verify';
          }
          this.alert = null;
          this.auth.loadState();
        } else if (response.error && response.error.includes('required_2fa')) {
          this.page = '2fa';
        } else if (response.error && response.error.includes('email_exists')) {
            this.alert = { type: 'danger', message: 'Tento e-mail je již přiřazen k jinému účtu.' };
        }
      },
      error: (error) => {
        if (error.status === 400) {
            if (error.error?.error?.includes('required_2fa')) {
                this.page = '2fa';
            } else if (error.error?.error?.includes('email_exists')) {
                this.alert = { type: 'danger', message: 'Tento e-mail je již přiřazen k jinému účtu.' };
            } else if (error.error?.error?.includes('invalid_2fa')) {
                this.alert = { type: 'danger', message: 'Neplatný 2FA kód.' };
            }
        }
        console.error('Error saving email', error);
      }
    });
  }

  public verifyEmail(): void {
    if (this.verificationCode.length < 4) return;

    this.http.post(`${Config.API_URL}/v1/user/email/verify/confirm`, {
      email: this.email,
      code: this.verificationCode.toUpperCase()
    }, { withCredentials: true }).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.modalManager.closeModal('add_email');
          this.auth.loadState();
          this.resetForm();
        } else if (response.error) {
            this.alert = { type: 'danger', message: 'Neplatný ověřovací kód.' };
        }
      },
      error: (error) => {
          if (error.error?.error === 'invalid_code') {
              this.alert = { type: 'danger', message: 'Neplatný ověřovací kód.' };
          } else if (error.error?.error === 'code_expired') {
              this.alert = { type: 'danger', message: 'Platnost kódu vypršela. Nechte si zaslat nový.' };
          } else {
              this.alert = { type: 'danger', message: 'Chyba při ověřování. Zkontrolujte kód a zkuste to znovu.' };
          }
          console.error('Error verifying email', error);
      }
    });
  }

  public resendCode(): void {
    this.http.post(`${Config.API_URL}/v1/user/email/verify/send`, {
      email: this.email
    }, { withCredentials: true }).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.alert = { type: 'success', message: 'Kód byl znovu odeslán.' };
          this.auth.loadState();
        }
      },
      error: (error) => {
          this.alert = { type: 'danger', message: 'Nepodařilo se znovu odeslat kód.' };
          console.error('Error resending code', error);
      }
    });
  }
  
  public removeEmail(): void {
    this.modalManager.closeModal('add_email');
    this.modalManager.openModal('delete_email', this.email);
  }

  private resetForm() {
    this.token = '';
    this.active_action = '';
    this.email = '';
    this.email_selected = 0;
    this.isEdit = false;
    this.originalEmail = null;
    this.verificationCode = '';
    this.page = 'main';
    this.alert = null;
  }
}
