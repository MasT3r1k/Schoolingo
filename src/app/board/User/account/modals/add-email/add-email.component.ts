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

@Component({
  imports: [IconsModule, FormsModule, ReactiveFormsModule],
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
  public email_selected = 0;

  public token = '';
  public email = '';
  public originalEmail: string | null = null;
  public isEdit = false;

  public active_action = '';
  public verificationCode = '';

  public page: 'main' | '2fa' | 'verify' = 'main';
  public error = '';

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
          this.page = 'verify';
          this.error = '';
          this.auth.loadState();
        } else if (response.error && response.error.includes('required_2fa')) {
          this.page = '2fa';
        } else if (response.error && response.error.includes('email_exists')) {
            this.error = 'Tento e-mail je již přiřazen k jinému účtu.';
        }
      },
      error: (error) => {
        if (error.status === 400) {
            if (error.error?.error?.includes('required_2fa')) {
                this.page = '2fa';
            } else if (error.error?.error?.includes('email_exists')) {
                this.error = 'Tento e-mail je již přiřazen k jinému účtu.';
            } else if (error.error?.error?.includes('invalid_2fa')) {
                this.error = 'Neplatný 2FA kód.';
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
      code: this.verificationCode
    }, { withCredentials: true }).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.modalManager.closeModal('add_email');
          this.auth.loadState();
          this.resetForm();
        } else if (response.error) {
            this.error = 'Neplatný ověřovací kód.';
        }
      },
      error: (error) => {
          this.error = 'Chyba při ověřování. Zkontrolujte kód a zkuste to znovu.';
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
          alert('Kód byl znovu odeslán.');
          this.auth.loadState();
        }
      },
      error: (error) => console.error('Error resending code', error)
    });
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
    this.error = '';
  }
}
