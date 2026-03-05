import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { Config } from '@Schoolingo/config';
import { Locale } from '@Schoolingo/locale';
import { Settings } from '@Schoolingo/settings';
import { AuthConfig } from '../../../../../../infrastructure/authentication/config';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalManager } from '@Schoolingo/modal';
import { QRCodeComponent } from 'angularx-qrcode';
import { BaseAlertManager } from '../../../../../../infrastructure/alert/alert.manager';
import { Theme } from '@Schoolingo/theme';
import { IconsModule } from '@Schoolingo/icons';

@Component({
  imports: [FormsModule, ReactiveFormsModule, QRCodeComponent, IconsModule],
  templateUrl: './add-tfa.component.html',
  styleUrl: './add-tfa.component.css'
})
export class AddTFAComponent implements OnInit {
  public AuthConfig = AuthConfig
  public a = inject(BaseAlertManager);
  public l = inject(Locale);
  public t = inject(Theme);
  private http = inject(HttpClient);
  public settings = inject(Settings);
  public modalManager = inject(ModalManager);
  public qrcode = '';
  public active_action = '';
  public errors: any = {};

  ngOnInit(): void {
    this.http
      .post<{ qrcode: string }>(
        `${Config.API_URL}/v1/security`,
        { method: 'GET_QRCODE_FOR_TFA' },
        { withCredentials: true }
      )
      .subscribe((data: { qrcode: string }): void => {
        this.qrcode = data.qrcode;
      });
  }

  public verifyActivation2FA(): void {
    this.active_action = 'activating_2fa';
    this.errors = {};

    if (!this.settings.checkValidTFA()) {
      this.errors['token'] = this.l.s('auth.errors.invalid_tfa');
      this.active_action = '';
      return;
    }

    this.http
      .post(
        `${Config.API_URL}/v1/security`,
        { method: 'ACTIVATE_2FA', TFA: this.settings.TFAControl.value },
        { withCredentials: true }
      )
      .subscribe((data) => {
        this.active_action = '';
        if ('error' in data && data.error instanceof Array) {
          if (data.error.includes('Already activated 2FA')) {
            this.settings.refreshSecurityAPI();
            this.qrcode = '';
            this.modalManager.closeModal('add_2FA')
            this.a.alert('error', 'settings.2fa.already_activated');
            return;
          }

          if (data.error.includes('Invalid TFA')) {
            this.errors['token'] = this.l.s('auth.errors.invalid_tfa');
            return;
          }
        }

        if ('status' in data && data.status == true) {
          this.settings.refreshSecurityAPI();
          this.qrcode = '';
          this.modalManager.closeModal('add_2FA');
          this.a.alert('success', 'settings.2fa.successful_activated');
          return;
        }
      });
  }

  public closeModal(): void {
    this.modalManager.closeModal('add_2FA')
  }
}
