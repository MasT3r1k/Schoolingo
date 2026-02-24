import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Locale } from '@Schoolingo/locale';
import { AuthConfig } from '../../../../infrastructure/authentication/config';
import { Config } from '@Schoolingo/config';
import { HttpClient } from '@angular/common/http';
import { BoardAlertManager } from '../../../../infrastructure/alert/board.alert.manager';
import { IconsModule } from '@Schoolingo/icons';
import { Authentication } from '@Schoolingo/authentication';
import { ModalManager } from '@Schoolingo/modal';
import { GeneratePasswordComponent } from './modals/generate-password/generate-password';
import { Settings } from '@Schoolingo/settings';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, IconsModule],
  selector: 'settings-change-password',
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.css'
})
export class ChangePasswordComponent implements OnInit {
  public AuthConfig = AuthConfig;
  private settings = inject(Settings);
  public l = inject(Locale);
  private http = inject(HttpClient);
  public a = inject(BoardAlertManager);
  public u = inject(Authentication);
  private modalManager = inject(ModalManager);

  public errors: { [key: string]: string } = {};
  formSubmitted = false;
  public page: 'main' | '2fa' = 'main';
  
  private formBuilder = inject(FormBuilder);
  changePasswordForm = this.formBuilder.group({
    oldpassword: [''],
    password: ['',
      [
        Validators.required,
        Validators.minLength(this.settings.getSecurity()?.config.min_length || AuthConfig.password_min),
        Validators.maxLength(this.settings.getSecurity()?.config.max_length ||AuthConfig.password_max)
      ]
    ],
    password2: ['',
      [
        Validators.required,
        Validators.minLength(this.settings.getSecurity()?.config.min_length || AuthConfig.password_min),
        Validators.maxLength(this.settings.getSecurity()?.config.max_length ||AuthConfig.password_max)
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

  public getSecurityConfig(): any {
    return this.settings.getSecurity()?.config;
  }

  ngOnInit(): void {
    this.settings.password.subscribe((password) => {
      if (password == '') return;

      this.changePasswordForm.get('password')?.setValue(password);
      this.changePasswordForm.get('password2')?.setValue(password);
      this.settings.password.next('');
    })

    this.modalManager.addModal(
      'generate_password',
      {
        title: 'user.generator_password.title',
        closeable: true,
        items: [
          {
            type: 'component',
            component: GeneratePasswordComponent
          }
        ]
      }
    )
  }

  public openGeneratePasswordModal(): void {
    this.modalManager.openModal('generate_password');
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
      return this.l.s('form.minLength', {min: minLengthError.requiredLength});
    }

    const maxLengthError = control.getError('maxlength');
    if (maxLengthError) {
      return this.l.s('form.maxLength', {max: maxLengthError.requiredLength});
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

  public passwordStrength: number = 0;
  public showPassword = false;

  public passwordRequirements = {
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  };

  public calculateStrength(password: string): void {
    let score = 0;
    if (!password) {
      this.passwordStrength = 0;
      this.passwordRequirements = { length: false, uppercase: false, lowercase: false, number: false, special: false };
      return;
    }

    this.passwordRequirements.length = password.length > 8;
    this.passwordRequirements.uppercase = /[A-Z]/.test(password);
    this.passwordRequirements.lowercase = /[a-z]/.test(password);
    this.passwordRequirements.number = /[0-9]/.test(password);
    this.passwordRequirements.special = /[^A-Za-z0-9]/.test(password);

    if (this.passwordRequirements.length) score++;
    if (this.passwordRequirements.uppercase) score++;
    if (this.passwordRequirements.lowercase) score++;
    if (this.passwordRequirements.number) score++;
    if (this.passwordRequirements.special) score++;

    this.passwordStrength = score;
  }

  public toggleVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  // Hook into value changes
  constructor() {
    this.changePasswordForm.get('password')?.valueChanges.subscribe(val => {
      this.calculateStrength(val || '');
    });
  }
}
