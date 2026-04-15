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
import { PublicKeyCredentialCreationOptionsJSON, startRegistration } from '@simplewebauthn/browser';

import { Theme } from '@Schoolingo/theme';
import { BoardAlertManager } from '../../../../infrastructure/alert/board.alert.manager';
import { BackupCode } from '../../../../infrastructure/settings/security';
import { Utils } from '@Schoolingo/utils';
import { ModalManager } from '@Schoolingo/modal';
import { AddTFAComponent } from './modals/add-tfa/add-tfa.component';
import { VerifyCodeComponent } from './modals/verify-code/verify-code.component';
import { BackupCodesComponent } from './modals/backup-codes/backup-codes.component';
import { UpdatePasskeyComponent } from './modals/update-passkey/update-passkey.component';
import { RemovePasskeyComponent } from './modals/remove-passkey/remove-passkey.component';

@Component({
  selector: 'settings-security',
  standalone: true,
  imports: [NgClass, ReactiveFormsModule, IconsModule],
  templateUrl: './security.component.html',
  styleUrls: ['./security.component.css', '../settings.component.css'],
})
export class SecurityComponent implements OnInit {
  public AuthConfig = AuthConfig;
  public moment = moment;
  public modalManager = inject(ModalManager);

  public a = inject(BoardAlertManager);
  public l = inject(Locale);
  public t = inject(Theme);
  public collapses: boolean[] = [];
  public settings = inject(Settings);
  public passkey = inject(Passkey);
  private http = inject(HttpClient);

  public utils = Utils;

  public isPasskeySupported: boolean | null = null;
  public codes: BackupCode[] = [];


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

    this.modalManager.openModal('add_2FA');
  }

  public openDeactivate2FA(): void {
    this.modalManager.openModal('verify_code');
    this.settings.action = 'deactivate2FA';
  }

  public openBackupCodes(): void {
    this.modalManager.openModal('verify_code');
    this.settings.action = 'show_backup_codes';
  }

  public refreshBackupCodes(): void {
    this.modalManager.openModal('verify_code');
    this.settings.action = 'refresh_backup_codes';
  }

  public async addPasskey(): Promise<void> {
    if (this.isPasskeySupported == false) {
      this.a.alert('error', 'settings.passkeys.alerts.not_supported').closeable(true);
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
    this.settings.selectedPasskey = keyId;
    this.settings.passkeyName.setValue(this.getPasskeyName(keyId));
    this.modalManager.openModal('update_passkey');
  }

  public removePasskey(keyId: number): void {
    const passkey = this.settings
      .getSecurity()
      ?.passkeys.filter((_) => _.id == keyId);
    if (!passkey?.length) return;

    this.modalManager.openModal('remove_passkey', { passkey: passkey[0] });
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

    this.modalManager.addModal(
      'add_2FA',
      {
        title: 'settings.2fa.title',
        icon: 'shield-lock',
        closeable: true,
        items: [{
          type: 'component',
          component: AddTFAComponent
        }]
      }
    )

    this.modalManager.addModal(
      'verify_code',
      {
        title: 'settings.2fa.title',
        icon: 'lock-check',
        closeable: true,
        items: [
          {
            type: 'component',
            component: VerifyCodeComponent
          }
        ]
      }
    )

    this.modalManager.addModal(
      'backup_codes',
      {
        title: 'settings.2fa.backup_codes.title',
        icon: 'key',
        closeable: true,
        items: [
          {
            type: 'component',
            component: BackupCodesComponent
          }
        ]
      }
    )

    this.modalManager.addModal(
      'update_passkey',
      {
        title: 'settings.passkeys.edit.title',
        description: 'settings.passkeys.edit.description',
        icon: 'fingerprint',
        closeable: true,
        items: [
          {
            type: 'component',
            component: UpdatePasskeyComponent
          }
        ]
      }
    )

    this.modalManager.addModal(
      'remove_passkey',
      {
        title: 'settings.passkeys.remove.modal_title',
        icon: 'fingerprint',
        closeable: true,
        items: [
          {
            type: 'component',
            component: RemovePasskeyComponent
          }
        ]
      }
    )
  }
}
