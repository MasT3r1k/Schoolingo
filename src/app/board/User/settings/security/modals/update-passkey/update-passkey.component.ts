import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Config } from '@Schoolingo/config';
import { Locale } from '@Schoolingo/locale';
import { ModalManager } from '@Schoolingo/modal';
import { Settings } from '@Schoolingo/settings';
import Swal from 'sweetalert2';

@Component({
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './update-passkey.component.html',
  styleUrl: './update-passkey.component.css'
})
export class UpdatePasskeyComponent {
  private http = inject(HttpClient);
  public modalManager = inject(ModalManager);
  public settings = inject(Settings);
  public l = inject(Locale);

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

  public getPasskeyName(keyId: number): string {
    return this.settings.getSecurity()?.passkeys.filter((_) => _.id == keyId)[0].device_name;
  }
}
