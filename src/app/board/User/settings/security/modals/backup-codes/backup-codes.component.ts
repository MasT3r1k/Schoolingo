import { Component, inject } from '@angular/core';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { ModalManager } from '@Schoolingo/modal';
import { Settings } from '@Schoolingo/settings';
import { Utils } from '@Schoolingo/utils';

@Component({
  imports: [IconsModule],
  templateUrl: './backup-codes.component.html',
  styleUrl: './backup-codes.component.css'
})
export class BackupCodesComponent {
  public l = inject(Locale);
  public settings = inject(Settings);
  public modalManager = inject(ModalManager);
  public Utils = Utils;

    public getRemainingCodes(): number {
    return this.settings.codes.filter((code) => code.used == false).length;
  }

  public getAllCodes(): number {
    return this.settings.codes.length;
  }

  public downloadBackupCodes(): void {
    const blob = new Blob(
      [
        `${this.l.s('settings.2fa.backup_codes.file_header')}\n\n${this.settings.codes
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

  public refreshBackupCodes(): void {
    this.modalManager.closeModal('backup_codes');
    this.modalManager.openModal('verify_code');
    this.settings.action = 'refresh_backup_codes';
  }
}
