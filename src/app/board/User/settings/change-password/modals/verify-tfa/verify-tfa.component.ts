import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { Config } from '@Schoolingo/config';
import { Locale } from '@Schoolingo/locale';
import { AuthConfig } from '../../../../../../infrastructure/authentication/config';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalManager } from '@Schoolingo/modal';
import { BoardAlertManager } from '../../../../../../infrastructure/alert/board.alert.manager';
import { IconsModule } from '@Schoolingo/icons';

@Component({
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, IconsModule],
  templateUrl: './verify-tfa.component.html',
  styleUrls: ['../../change-password.component.css']
})
export class VerifyTfaComponent implements OnInit {
  public AuthConfig = AuthConfig;
  public l = inject(Locale);
  private http = inject(HttpClient);
  public a = inject(BoardAlertManager);
  public modalManager = inject(ModalManager);

  public tokenControl = new FormControl('', [
    Validators.required,
    Validators.minLength(AuthConfig.token_length),
    Validators.maxLength(AuthConfig.token_length)
  ]);

  public errors: { [key: string]: string } = {};
  public loading = false;

  ngOnInit(): void {}

  public verify(): void {
    if (this.tokenControl.invalid) return;
    this.loading = true;
    this.errors = {};

    const data = this.modalManager.getModalData('verify_tfa');

    this.http.post(Config.ELYSIA_URL + "/changepassword", {
      oldpassword: data.oldpassword,
      password: data.password,
      TFA: this.tokenControl.value
    }, { withCredentials: true }).subscribe(
      (res: any) => {
        this.loading = false;
        if ('error' in res && res.error instanceof Array) {
          if (res.error?.includes("Invalid 2FA")) {
            this.errors['token'] = this.l.s('auth.errors.invalid_tfa');
          } else {
             // Handle other errors if they somehow appear here
             this.a.alert('error', 'settings.passwords.429').closeable(true);
             this.modalManager.closeModal('verify_tfa');
          }
          return;
        }

        if ('success' in res && res.success) {
          this.modalManager.closeModal('verify_tfa');
          this.a.alert('success', 'settings.passwords.success_changed').closeable(true);
          if (data.parent) {
            data.parent.changePasswordForm.reset();
            data.parent.formSubmitted = false;
          }
        }
      },
      (err) => {
        this.loading = false;
        this.a.alert("error", "settings.passwords.429").closeable(true);
      }
    );
  }

  public getTokenPlaceholder(): string {
    let text = this.tokenControl.value?.toString() || '';
    for(let i = 0; i < (AuthConfig.token_length - (this.tokenControl.value?.length || 0)); i++) {
      text += "X";
    }
    return text;
  }
}
