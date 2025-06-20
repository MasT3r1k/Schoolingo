import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Locale } from '@Schoolingo/locale';
import { AuthConfig } from '../../../../infrastructure/authentication/config';
import { Config } from '@Schoolingo/config';
import { HttpClient } from '@angular/common/http';
import { BoardAlertManager } from '../../../../infrastructure/alert/board.alert.manager';
import { NgClass } from '@angular/common';
import { AlertComponent } from '@Components/Alert';

@Component({
  imports: [ReactiveFormsModule, NgClass, AlertComponent],
  selector: 'settings-change-password',
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.css'
})
export class ChangePasswordComponent {
  public AuthConfig = AuthConfig;
  public l = inject(Locale);
  private http = inject(HttpClient);
  public a = inject(BoardAlertManager);

  public errors: { [key: string]: string } = {};
  formSubmitted = false;
  public page: 'main' | '2fa' = 'main';
  
  private formBuilder = inject(FormBuilder);
  changePasswordForm = this.formBuilder.group({
    oldpassword: [''],
    password: ['',
      [
        Validators.required,
        Validators.minLength(AuthConfig.password_min),
        Validators.maxLength(AuthConfig.password_max)
      ]
    ],
    password2: ['',
      [
        Validators.required,
        Validators.minLength(AuthConfig.password_min),
        Validators.maxLength(AuthConfig.password_max),
      ]
    ],
    token: ['']
  })

  public changepassword(): void {
    this.errors = {};
    this.formSubmitted = true;
    if (this.changePasswordForm.get("password")?.value !== this.changePasswordForm.get("password2")?.value) {
      this.errors['password'] = this.l.s('form.passwords_not_same');
      this.errors['password2'] = this.l.s('form.passwords_not_same');
      return;
    }

    if (this.changePasswordForm.get("password")?.value === this.changePasswordForm.get("oldpassword")?.value) {
      this.errors['oldpassword'] = this.l.s('form.passwords_is_same');
      this.errors['password'] = this.l.s('form.passwords_is_same');
      return;
    }

    if (this.changePasswordForm.invalid) return;
    this.http.post(Config.ELYSIA_URL + "/changepassword", {
      oldpassword: this.changePasswordForm.value.oldpassword,
      password: this.changePasswordForm.value.password,
      TFA: this.changePasswordForm.value.token
    }, { withCredentials: true }).subscribe(
      (data) => {
        if ('error' in data && data.error instanceof Array) {
          if (data.error?.includes("Invalid old password")) {
            this.errors['oldpassword'] = this.l.s('auth.errors.invalid_password');
          }

          if (data.error?.includes("Invalid password")) {
            this.errors['password'] = this.l.s('auth.errors.invalid_password');
          }
          if (data.error?.includes("Missing old password")) {
            this.errors['oldpassword'] = this.l.s('form.required');
          }
          if (data.error?.includes("Missing password")) {
            this.errors['password'] = this.l.s('form.required');
          }
          if (data.error?.includes("Old and new passwords are same")) {
            this.errors['password'] = this.l.s('form.passwords_is_same');
          }
          if (data.error?.includes("Invalid 2FA")) {
            this.errors['token'] = this.l.s('auth.errors.invalid_tfa');
          }

          if (data.error?.includes("Missing 2FA")) {
            this.page = '2fa';
          }
        }

        if ('success' in data && data.success) {
          this.changePasswordForm.setValue({
            oldpassword: "",
            password: "",
            password2: "",
            token: ""
          });
          this.page = 'main';
          this.errors = {};
          this.a.alert('success', 'settings.passwords.success_changed').closeable(true);
        }
      },
      (err) => this.a.alert("error", "settings.passwords.429").closeable(true)
    );
  }

  public getInputError(input: string): string {
    if (this.errors[input]) {
      return this.errors[input];
    }

    const control = this.changePasswordForm.get(input);
    if (!control) return '';

    const shouldShowError = this.formSubmitted || (control.dirty && control.touched);
    if (!shouldShowError || control.valid) return ''; 

    if (control.hasError('required')) {
      return this.l.s('form.required');
    }

    const minLengthError = control.getError('minlength');
    if (minLengthError) {
      return this.l.s('form.minLength').replaceAll('%min%', minLengthError.requiredLength);
    }

    const maxLengthError = control.getError('maxlength');
    if (maxLengthError) {
      return this.l.s('form.maxLength').replaceAll('%max%', maxLengthError.requiredLength);
    }

    return '';
  }

    public getTokenPlaceholder(): string {
    let text = this.changePasswordForm.value.token?.toString()!;
    for(const _ of [].constructor(AuthConfig.token_length - this.changePasswordForm.value.token!.length)) {
      text += "X";
    }
    return text;
  }

}
