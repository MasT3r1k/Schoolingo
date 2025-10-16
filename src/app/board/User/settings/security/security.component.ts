import { NgClass } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Config } from '@Schoolingo/config';
import { Locale } from '@Schoolingo/locale';
import { Settings } from '@Schoolingo/settings';
import moment from 'moment';
import { AuthConfig } from '../../../../infrastructure/authentication/config';
import { IconsModule } from '@Schoolingo/icons';
import { Passkey } from '@Schoolingo/passkey';
import Swal from 'sweetalert2';
import { startRegistration } from '@simplewebauthn/browser';
import { QRCodeComponent } from 'angularx-qrcode';
import { Theme } from '@Schoolingo/theme';
import { BaseAlertManager } from '../../../../infrastructure/alert/alert.manager';
import { BackupCode } from '../../../../infrastructure/settings/security';
import { Utils } from '@Schoolingo/utils';

@Component({
  selector: 'settings-security',
  standalone: true,
  imports: [NgClass, ReactiveFormsModule, IconsModule, QRCodeComponent],
  templateUrl: './security.component.html',
  styleUrls: ['./security.component.css', '../settings.component.css'],
})
export class SecurityComponent implements OnInit {
  public AuthConfig = AuthConfig;
  public moment = moment;

  public a = inject(BaseAlertManager);
  public l = inject(Locale);
  public t = inject(Theme);
  public collapses: boolean[] = [];
  public settings = inject(Settings);
  public passkey = inject(Passkey);
  private http = inject(HttpClient);

  public utils = Utils;

  public isPasskeySupported: boolean | null = null;
  public codes: BackupCode[] = [
    // {
    //   code: 'AAAA-BBBB',
    //   used: true,
    //   used_at: new Date(),
    // },
    // {
    //   code: 'BBBB-CCCC',
    //   used: false,
    // },
    // {
    //   code: 'AAAA-BBB5',
    //   used: false,
    // },
    // {
    //   code: 'AAAA-BBB2',
    //   used: true,
    //   used_at: new Date(),
    // },
    // {
    //   code: 'BBBB-CCC3',
    //   used: true,
    //   used_at: new Date(),
    // },
    // {
    //   code: 'AAAA-BBB4',
    //   used: false,
    // },
  ];

  public getRemainingCodes(): number {
    return this.codes.filter((code) => code.used == false).length;
  }

  public getAllCodes(): number {
    return this.codes.length;
  }

  public downloadBackupCodes(): void {
    const blob = new Blob(
      [
        `${this.l.s('settings.2fa.backup_codes.file_header')}\n\n${this.codes
          .filter((code) => !code.used)
          .map((code) => code.code)
          .join('\n')}`,
      ],
      { type: 'text/plain' }
    );
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'codes-schoolingo.txt';
    link.click();
  }

  public selectedPasskey: number = -1;
  public TFA_qrcode?: string;
  public errors: { [key: string]: string } = {};
  public active_action: 'activating_2fa' | '' = '';

  public modal:
    | 'verify_code'
    | 'passkey'
    | 'update_passkey'
    | 'add_2fa'
    | 'backup_codes'
    | '' = '';
  public action:
    | 'refresh_backup_codes'
    | 'not_supported'
    | 'show_backup_codes'
    | 'deactivate2FA'
    | 'add_to_phone'
    | '' = '';

  public activate2FA(): void {
    this.errors = {};
    delete this.TFA_qrcode;
    this.modal = 'add_2fa';
    this.action = 'add_to_phone';
    this.http
      .post<{ qrcode: string }>(
        `${Config.API_URL}/v1/security`,
        { method: 'GET_QRCODE_FOR_TFA' },
        { withCredentials: true }
      )
      .subscribe((data: { qrcode: string }): void => {
        this.TFA_qrcode = data.qrcode;
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
            this.TFA_qrcode = '';
            this.action = '';
            this.modal = '';
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
          this.TFA_qrcode = '';
          this.action = '';
          this.modal = '';
          this.a.alert('success', 'settings.2fa.successful_activated');
          return;
        }
      });
  }

  public openDeactivate2FA(): void {
    this.modal = 'verify_code';
    this.action = 'deactivate2FA';
  }

  public openBackupCodes(): void {
    this.modal = 'verify_code';
    this.action = 'show_backup_codes';
  }

  public runAction2FA(): void {
    if (this.modal !== 'verify_code') return;
    if (!this.settings.checkValidTFA()) {
      this.errors['token'] = this.l.s('auth.errors.invalid_tfa');
      return;
    }
    this.active_action = 'activating_2fa';
    switch (this.action) {
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
            if ('codes' in data) {
              this.settings.TFAControl.setValue('');
              console.log(data.codes);
            }

            if ('error' in data && data.error instanceof Array) {
              if (data.error.includes('Not activated TFA')) {
                this.settings.refreshSecurityAPI();
                this.modal = '';
                this.action = '';
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
            if ('codes' in data) {
              this.settings.TFAControl.setValue('');
              console.log(data.codes);
            }

            if ('error' in data && data.error instanceof Array) {
              if (data.error.includes('Not activated TFA')) {
                this.settings.refreshSecurityAPI();
                this.modal = '';
                this.action = '';
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
              this.modal = '';
              this.action = '';
            }

            if ('error' in data && data.error instanceof Array) {
              if (data.error.includes('Already deactivated 2FA')) {
                this.settings.refreshSecurityAPI();
                this.modal = '';
                this.action = '';

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

  public refreshBackupCodes(): void {
    this.modal = 'verify_code';
    this.action = 'refresh_backup_codes';
  }

  public async addPasskey(): Promise<void> {
    if (this.isPasskeySupported == false) {
      Swal.fire({
        title: this.l.s('settings.passkeys.title'),
        text: this.l.s('settings.passkeys.alerts.not_supported'),
        icon: 'error',
        timer: 2500,
        timerProgressBar: true,
        showCloseButton: false,
        showConfirmButton: false,
      });
      return;
    }

    this.http
      .get<PublicKeyCredentialCreationOptionsJSON>(
        Config.ELYSIA_URL + '/generate-register-options',
        { withCredentials: true }
      )
      .subscribe(async (options: any) => {
        try {
          let attResp = await startRegistration({ optionsJSON: options });
          this.http
            .post(
              Config.ELYSIA_URL + '/verify-registration',
              JSON.stringify(attResp),
              {
                withCredentials: true,
                headers: { 'Content-Type': 'application/json' },
              }
            )
            .subscribe((verificationRes: any) => {
              this.settings.refreshSecurityAPI();
            });
        } catch (err: any) {
          if (err.name === 'NotAllowedError') {
            // uživatel zrušil, vypršel čas, zavřel okno
            console.warn('Uživatel zrušil registraci');
          } else if (err.name === 'InvalidStateError') {
            console.warn('Passkey už existuje nebo není povolený');
          } else {
            console.error('Neznámá chyba při registraci:', err);
          }
          return;
        }
      });
  }

  // Open modal to change information about passkey
  public editPasskey(keyId: number): void {
    this.selectedPasskey = keyId;
    this.settings.passkeyName.setValue(this.getPasskeyName(keyId));
    this.modal = 'update_passkey';
  }

  // Save information about passkey to database
  public updatePasskey(): void {
    if (!this.selectedPasskey) return;
    this.http
      .post<{
        updated: boolean;
        newName?: string;
        id?: number;
        error?: string;
      }>(
        Config.ELYSIA_URL + '/update-passkey',
        { keyId: this.selectedPasskey, name: this.settings.passkeyName.value },
        { withCredentials: true }
      )
      .subscribe((data) => {
        if (data.updated && data.newName) {
          this.settings.refreshSecurityAPI();
          this.modal = '';
          this.selectedPasskey = -1;
          Swal.fire({
            title: this.l.s('settings.passkeys.edit.success_title'),
            text: this.l
              .s('settings.passkeys.edit.success_description')
              .replaceAll('%passkey%', data.newName),
            icon: 'success',
            timer: 2500,
            timerProgressBar: true,
            showCloseButton: false,
            showConfirmButton: false,
          });
        }
      });
  }

  public removePasskey(keyId: number): void {
    const passkey = this.settings
      .getSecurity()
      ?.passkeys.filter((_) => _.id == keyId);
    if (!passkey?.length) return;

    Swal.fire({
      title: this.l
        .s('settings.passkeys.remove.title')
        .replaceAll('%passkey%', passkey[0].device_name),
      text: this.l.s('settings.passkeys.remove.description'),
      icon: 'error',
      showCloseButton: false,
      showCancelButton: true,
      showConfirmButton: true,
      customClass: {
        confirmButton: 'danger',
      },
      reverseButtons: true,
      cancelButtonText: this.l.s('cancel'),
      confirmButtonText: this.l.s('delete'),
    }).then((result) => {
      if (result.isDismissed) return;
      this.http
        .post<{ deleted: boolean; error?: string }>(
          Config.ELYSIA_URL + '/remove-passkey',
          { keyId },
          { withCredentials: true }
        )
        .subscribe(
          (data: { deleted: boolean; error?: string; id?: number }) => {
            if (data.deleted && data.id == keyId) {
              Swal.fire({
                title: this.l.s('settings.passkeys.remove.success_title'),
                text: this.l
                  .s('settings.passkeys.remove.success_description')
                  .replaceAll('%passkey%', passkey[0].device_name),
                icon: 'success',
                timer: 2500,
                timerProgressBar: true,
                showCloseButton: false,
                showConfirmButton: false,
              });

              this.settings.refreshSecurityAPI();
            }
          }
        );
    });
  }

  public getPasskeyName(keyId: number): string {
    return this.settings.getSecurity()?.passkeys.filter((_) => _.id == keyId)[0]
      .device_name;
  }

  public closeModal(): void {
    this.modal = '';
    this.action = '';
    this.settings.TFAControl.setValue('');
  }

  async ngOnInit(): Promise<void> {
    this.isPasskeySupported = await this.passkey.isSupported();
  }
}
