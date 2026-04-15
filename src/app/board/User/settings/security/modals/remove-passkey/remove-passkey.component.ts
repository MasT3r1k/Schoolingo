import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { Config } from '@Schoolingo/config';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { ModalManager } from '@Schoolingo/modal';
import { Settings } from '@Schoolingo/settings';
import { BoardAlertManager } from '../../../../../../infrastructure/alert/board.alert.manager';

@Component({
  selector: 'app-remove-passkey',
  standalone: true,
  imports: [IconsModule],
  templateUrl: './remove-passkey.component.html',
  styleUrls: ['./remove-passkey.component.css']
})
export class RemovePasskeyComponent implements OnInit {
  private modalManager = inject(ModalManager);
  private http = inject(HttpClient);
  public settings = inject(Settings);
  public l = inject(Locale);
  public a = inject(BoardAlertManager);

  public passkey: any;

  ngOnInit(): void {
    const data = this.modalManager.getModalData('remove_passkey');
    this.passkey = data.passkey;
  }

  public removePasskey(): void {
    if (!this.passkey) return;

    this.http
      .post<{ deleted: boolean; error?: string; id?: number }>(
        Config.ELYSIA_URL + '/remove-passkey',
        { keyId: this.passkey.id },
        { withCredentials: true }
      )
      .subscribe((data) => {
        if (data.deleted && data.id == this.passkey.id) {
          this.a.alert('success', 'settings.passkeys.remove.success_description', [], undefined, { passkey: this.passkey.device_name }).closeable(true);
          this.settings.refreshSecurityAPI();
          this.modalManager.closeModal('remove_passkey');
        }
      });
  }

  public closeModal(): void {
    this.modalManager.closeModal('remove_passkey');
  }
}
