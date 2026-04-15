import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Config } from '@Schoolingo/config';
import { Locale } from '@Schoolingo/locale';
import { ModalManager } from '@Schoolingo/modal';
import { Settings } from '@Schoolingo/settings';
import { BoardAlertManager } from '../../../../../../infrastructure/alert/board.alert.manager';

import { IconsModule } from '@Schoolingo/icons';

@Component({
  imports: [FormsModule, ReactiveFormsModule, IconsModule],
  templateUrl: './update-passkey.component.html',
  styleUrls: ['./update-passkey.component.css']
})
export class UpdatePasskeyComponent {
  private http = inject(HttpClient);
  public modalManager = inject(ModalManager);
  public settings = inject(Settings);
  public l = inject(Locale);
  public a = inject(BoardAlertManager);

  public updatePasskey(): void {
    if (!this.settings.selectedPasskey) return;
    this.http
      .post<{
        updated: boolean;
        newName?: string;
        id?: number;
        error?: string;
      }>(
        Config.ELYSIA_URL + '/update-passkey',
        { keyId: this.settings.selectedPasskey, name: this.settings.passkeyName.value },
        { withCredentials: true }
      )
      .subscribe((data: any) => {
        if (data.updated && data.newName) {
          this.settings.refreshSecurityAPI();
          this.modalManager.closeModal('update_passkey');
          this.settings.selectedPasskey = -1;
          this.a.alert('success', 'settings.passkeys.edit.success_description', [], undefined, { passkey: data.newName }).closeable(true);
        }
      });
  }

  public getPasskeyName(keyId: number): string {
    return this.settings.getSecurity()?.passkeys.filter((_) => _.id == keyId)[0].device_name;
  }
}
