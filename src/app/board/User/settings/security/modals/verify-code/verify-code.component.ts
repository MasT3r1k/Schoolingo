import { Component, inject } from '@angular/core';
import { Locale } from '@Schoolingo/locale';
import { Settings } from '@Schoolingo/settings';
import { AuthConfig } from '../../../../../../infrastructure/authentication/config';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalManager } from '@Schoolingo/modal';
import { HttpClient } from '@angular/common/http';
import { Config } from '@Schoolingo/config';
import { BaseAlertManager } from '../../../../../../infrastructure/alert/alert.manager';

import { IconsModule } from '@Schoolingo/icons';

@Component({
  imports: [FormsModule, ReactiveFormsModule, IconsModule],
  templateUrl: './verify-code.component.html',
  styleUrl: './verify-code.component.css'
})
export class VerifyCodeComponent {
  public a = inject(BaseAlertManager);
  public l = inject(Locale);
  private http = inject(HttpClient);
  public settings = inject(Settings);
  public AuthConfig = AuthConfig;
  public active_action = '';
  public modalManager = inject(ModalManager);
  public errors: any = {};

  public runAction2FA(): void {
    if (this.settings.action == '') return;
    if (!this.settings.checkValidTFA()) {
      this.errors['token'] = this.l.s('auth.errors.invalid_tfa');
      return;
    }

    this.active_action = 'activating_2fa';
    switch (this.settings.action) {
      // === SHOW BACKUP CODES ===
      case 'show_backup_codes':
        this.http
          .post(
            `${Config.API_URL}/v1/security`,
            { method: 'GET_BACKUP_CODES', TFA: this.settings.TFAControl.value },
            { withCredentials: true }
          )
          .subscribe((data) => {
            this.active_action = '';
            if ('codes' in data && data.codes instanceof Array) {
              this.settings.TFAControl.setValue('');
              this.settings.codes = data.codes;
              this.modalManager.closeModal('verify_code')
              this.modalManager.openModal("backup_codes");
            }

            if ('error' in data && data.error instanceof Array) {
              if (data.error.includes('Not activated TFA')) {
                this.settings.refreshSecurityAPI();
                this.modalManager.closeModal('verify_code');
                this.settings.action = '';
                return;
              }

              if (data.error.includes('Invalid TFA')) {
                this.errors['token'] = this.l.s('auth.errors.invalid_tfa');
                return;
              }
            }
          });
        break;

      // === GENERATE NEW BACKUP CODES ===
      case 'refresh_backup_codes':
        this.http
          .post(
            `${Config.API_URL}/v1/security`,
            {
              method: 'GENERATE_BACKUP_CODES',
              TFA: this.settings.TFAControl.value,
            },
            { withCredentials: true }
          )
          .subscribe((data) => {
            this.active_action = '';
            if ('codes' in data && data.codes instanceof Array) {
              this.settings.TFAControl.setValue('');
              this.settings.codes = data.codes.map((code: string) => ({ code, used: false }));
              this.modalManager.closeModal('verify_code')
              this.modalManager.openModal("backup_codes");
            }

            if ('error' in data && data.error instanceof Array) {
              if (data.error.includes('Not activated TFA')) {
                this.settings.refreshSecurityAPI();
                this.modalManager.closeModal('verify_code');
                this.settings.action = '';
                return;
              }

              if (data.error.includes('Invalid TFA')) {
                this.errors['token'] = this.l.s('auth.errors.invalid_tfa');
                return;
              }
            }
          });
        break;

      // === DEACTIVATION 2FA ===
      case 'deactivate2FA':
        this.http
          .post(
            `${Config.API_URL}/v1/security`,
            { method: 'DEACTIVATE_2FA', TFA: this.settings.TFAControl.value },
            { withCredentials: true }
          )
          .subscribe((data) => {
            this.active_action = '';
            if ('status' in data && data.status == true) {
              this.a.alert('success', 'settings.2fa.successful_deactivated');
              this.settings.refreshSecurityAPI();
              this.modalManager.closeModal('verify_code');
              this.settings.action = '';
            }

            if ('error' in data && data.error instanceof Array) {
              if (data.error.includes('Already deactivated 2FA')) {
                this.settings.refreshSecurityAPI();
                this.modalManager.closeModal('');
                this.settings.action = '';

                return;
              }

              if (data.error.includes('Invalid TFA')) {
                this.errors['token'] = this.l.s('auth.errors.invalid_tfa');
                return;
              }
            }
          });
        break;
    }
  }

  public closeModal(): void {
    this.modalManager.closeModal('verify_code');
  }
}
