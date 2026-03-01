import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Config } from '../infrastructure/config';
import { NgClass } from '@angular/common';
import { QRCodeComponent } from 'angularx-qrcode';
import { Locale } from '@Schoolingo/locale';
import { School } from '@Schoolingo/school';
import { Theme } from '@Schoolingo/theme';
import { AuthAlertManager } from '../infrastructure/alert/auth.alert.manager';
import { BehaviorSubject, interval } from 'rxjs';
import { AuthConfig } from '../infrastructure/authentication/config';
import { HttpClient } from '@angular/common/http';
import { Authentication } from '@Schoolingo/authentication';
import { ActivatedRoute, Router } from '@angular/router';
import { IconsModule } from '@Schoolingo/icons';
import {
  PublicKeyCredentialRequestOptionsJSON,
  startAuthentication,
} from '@simplewebauthn/browser';
import { InstallAppModalComponent } from '@Components/InstallAppModal/install-app-modal.component';
import { Passkey } from '@Schoolingo/passkey';
import { DropdownManager } from '@Schoolingo/dropdown';
import { SessionExpiredService } from '../infrastructure/session/session-expired.service';
import { WsService } from '@Schoolingo/websocket';
import { Title } from '@angular/platform-browser';

export function isoBase64URLBuffer(buffer: Uint8Array): string {
  return btoa(String.fromCharCode(...buffer))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

@Component({
  standalone: true,
  imports: [
    NgClass,
    QRCodeComponent,
    ReactiveFormsModule,
    FormsModule,
    IconsModule,
    InstallAppModalComponent,
  ],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css'],
})
export class AuthComponent implements OnInit {
  public dropdownManager = inject(DropdownManager)
  public App = Config;
  public AuthConfig = AuthConfig;
  l = inject(Locale);
  t = inject(Theme);
  a = inject(AuthAlertManager);
  private auth = inject(Authentication);
  private http = inject(HttpClient);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private title = inject(Title);
  private ws = inject(WsService)
  public passkey = inject(Passkey);
  private sessionExpiredService = inject(SessionExpiredService);
  public isPasskeySupport = false;
  public isPasskeyLoading = false;
  public isLoggingIn = false;
  public isLoginSuccess = false;
  public isForgotPasswordLoading = false;
  public logoutReason: string | null = null;

  public qrcode = new BehaviorSubject('');
  public declare qrcodeErrorHandle: any;
  public showInstallModal = false;

  public school = inject(School);
  public page: 'login' | '2fa' | 'forgotpass_email' | 'forgotpass_code' | 'forgotpass_password' | 'forgotpass_2fa' = 'login';
  public isLoading = true;
  public errors: { [key: string]: string } = {};
  formSubmitted = false;

  // Login form
  private formBuilder = inject(FormBuilder);
  loginForm = this.formBuilder.group({
    username: [
      '',
      [
        Validators.required,
        Validators.minLength(AuthConfig.username_min),
        Validators.maxLength(AuthConfig.username_max),
        Validators.pattern(AuthConfig.username_regex),
      ],
    ],
    password: [
      '',
      [
        Validators.required,
        Validators.minLength(AuthConfig.password_min),
        Validators.maxLength(AuthConfig.password_max),
      ],
    ],
    token: [
      '',
      [
        Validators.minLength(AuthConfig.token_length),
        Validators.maxLength(AuthConfig.token_length),
      ],
    ],
  });
  public login(): void {
    this.errors = {};
    this.formSubmitted = true;
    if (this.loginForm.invalid) return;

    this.isLoggingIn = true;

    this.http
      .post(
        Config.ELYSIA_URL + '/auth',
        {
          username: this.loginForm.value.username,
          password: this.loginForm.value.password,
          TFA: this.loginForm.value.token,
        },
        { withCredentials: true }
      )
      .subscribe(
        (data) => {
          if ('username' in data) {
            // Show success state
            this.isLoggingIn = false;
            this.isLoginSuccess = true;

            // Load user state
            this.auth.loadState();
            this.a.getAlerts().forEach((alert) => this.a.removeAlert(alert));
            return;
          }

          // Handle errors
          this.isLoggingIn = false;

          if ('error' in data && data.error instanceof Array) {
            if (data.error?.includes('Invalid username')) {
              this.errors['username'] = this.l.s(
                'auth.errors.invalid_username'
              );
              if (this.page === '2fa') {
                this.page = 'login';
              }
            }
            if (data.error?.includes('Invalid password')) {
              this.errors['password'] = this.l.s(
                'auth.errors.invalid_password'
              );
              if (this.page === '2fa') {
                this.page = 'login';
              }
            }
            if (data.error?.includes('Missing username')) {
              this.errors['username'] = this.l.s('form.required');
              if (this.page === '2fa') {
                this.page = 'login';
              }
            }
            if (data.error?.includes('Missing password')) {
              this.errors['password'] = this.l.s('form.required');
              if (this.page === '2fa') {
                this.page = 'login';
              }
            }

            if (data.error?.includes('Missing 2FA')) {
              this.page = '2fa';
            }

            if (data.error?.includes('Invalid 2FA')) {
              this.errors['token'] = this.l.s('auth.errors.invalid_tfa');
            }
          }
        },
        (err) => {
          this.isLoggingIn = false;
          this.a.alert('error', 'auth.errors.429');
        }
      );
  }

  // Forgot password form
  public forgotpass_token?: string;
  public emails: string[] = [];
  public selectedEmail?: number;
  public emailCode?: string;
  public newPassword?: string;
  public newAgainPassword?: string;
  public emailTFA?: string;

  // 🚀 Hlavní metoda pro zapomenuté heslo
  public forgotPassword(): void {
    this.errors = {};
    this.a.getAlerts().forEach((alert) => this.a.removeAlert(alert));

    if (!this.school.config.getValue()?.reset_password_with_email) {
      this.a.alert('info', 'auth.forgotpass.not_available');
      return;
    }

    const username = this.loginForm.value.username?.trim();
    if (!username) {
      this.errors['username'] = this.l.s('form.required');
      return;
    }

    // kontrola podle aktuálního kroku
    if (this.page === 'forgotpass_email' && this.selectedEmail == null) {
      this.a.alert('error', 'auth.forgotpass.missing_selected_email');
      return;
    }

    if (this.page === 'forgotpass_code' && !this.emailCode) {
      this.errors['email_code'] = this.l.s('form.required');
      return;
    }

    if (this.page === 'forgotpass_password' && this.newPassword !== this.newAgainPassword) {
      this.errors['new_password'] = this.l.s('form.passwords_not_same');
      return;
    }

    // Start loading
    this.isForgotPasswordLoading = true;

    // 🔹 Odeslání požadavku na server
    this.http
      .post(
        Config.ELYSIA_URL + '/forgot-pass',
        {
          username,
          selectedEmail: this.selectedEmail,
          token: this.forgotpass_token,
          emailCode: this.emailCode,
          newPassword: this.newPassword,
          TFA: this.emailTFA
        },
        { withCredentials: true }
      )
      .subscribe(
        (data: any) => {
          // Stop loading on any response
          this.isForgotPasswordLoading = false;

          if ('error' in data && data.error instanceof Array) {
            const errors = data.error as string[];

            if (errors.includes('No verified email found for this user')) {
              this.a.alert('error', 'auth.forgotpass.no_emails')
              return;
            }

            // === STAGE: výběr e-mailu ===
            if (errors.includes('Multiple verified emails found, please select one') &&
              Array.isArray(data.emails) && data.token) {
              this.page = 'forgotpass_email';
              this.emails = data.emails;
              this.forgotpass_token = data.token;
              return;
            }

            // === STAGE: ověření kódu ===
            if (data.stage === 'verify_code') {
              this.page = 'forgotpass_code';
              return;
            }

            // === STAGE: chybné OTP ===
            if (errors.includes('Invalid verification code')) {
              this.errors['email_code'] = this.l.s('auth.forgotpass.invalid_code');
              return;
            }

            if (errors.includes('Invalid TFA code')) {
              this.errors['emailTFA'] = this.l.s('auth.errors.invalid_tfa');
              return;
            }

            // === TOKEN EXPIRED ===
            if (errors.includes('Reset token expired')) {
              this.a.alert('error', 'auth.forgotpass.token_expired');
              this.resetForgotPassword();
              return;
            }

            // === Invalid username ===
            if (errors.includes('Invalid username')) {
              this.errors['username'] = this.l.s('auth.errors.invalid_username');
              this.resetForgotPassword();
              return;
            }

            // === Invalid password ===
            if (errors.includes('Invalid password')) {
              this.errors['new_password'] = this.l.s('settings.passwords.invalid_new_password');
              return;
            }

            // === STAGE: 2FA ===
            if (data.stage === 'tfa_required') {
              this.page = 'forgotpass_2fa';
              return;
            }

            // === Úspěch ===
            if (data.stage === 'done' && data.success) {
              this.a.alert('success', 'auth.forgotpass.done');
              this.resetForgotPassword();
              return;
            }
          }

          // === STAGE: verify_code přímo ===
          if (data.stage === 'verify_code' && data.token) {
            this.page = 'forgotpass_code';
            this.forgotpass_token = data.token;
            return;
          }

          // === STAGE: new_password
          if (data.stage === 'new_password') {
            this.page = 'forgotpass_password';
          }

          // === STAGE: done ===
          if (data.stage === 'done' && data.success) {
            this.a.alert('success', 'auth.forgotpass.done');
            this.resetForgotPassword();
            return;
          }
        },
        (err) => {
          this.isForgotPasswordLoading = false;
          console.error(err);
          this.a.alert('error', 'auth.forgotpass.http_error');
        }
      );
  }

  // 🔁 Reset všeho po dokončení nebo přerušení
  public resetForgotPassword(): void {
    this.page = 'login';
    this.forgotpass_token = undefined;
    this.emails = [];
    this.selectedEmail = undefined;
    this.emailCode = undefined;
    this.newPassword = undefined;
    this.emailTFA = undefined;
  }

  async ngOnInit(): Promise<void> {
    // Update page title
    this.title.setTitle(Config.APP_NAME);

    // Reset errors
    this.errors = {};

    this.isPasskeySupport = await this.passkey.isSupported();
    const encodedReturnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    const returnUrl = encodedReturnUrl
      ? decodeURIComponent(encodedReturnUrl)
      : null;

    this.school.config.subscribe((data) => {
      if (data == null) return;
      this.isLoading = false;

      // Check for session expiration alert ONLY when school config is loaded
      // and clear it immediately to prevent showing on refresh
      const logoutReason = this.sessionExpiredService.getLogoutReason();
      if (logoutReason === 'session_expired' || logoutReason === 'user_logout') {
        this.sessionExpiredService.clearLogoutReason();
        this.logoutReason = logoutReason;
      }
    });

    this.auth.getAuthState().subscribe((data) => {
      if (data == true) {
        if (returnUrl && !AuthConfig.ignored_redirect.includes(returnUrl) && !returnUrl.startsWith('/login')) {
          this.router.navigateByUrl(returnUrl);
        } else {
          this.router.navigate(['', 'main']);
        }
      }
    });

    this.ws.close();
    this.ws.connect();
    this.ws.connected$.subscribe(connected => {
      if (connected) {
        // třeba hned po připojení pošli QR request
        this.ws.send({ type: 'qrcode_request' });
      }

      if (!connected) {
        this.qrcode.next('');
      }
    });

    this.ws.onMessage('qrcode_result').subscribe(res => {
      this.qrcode.next(res.payload)
    });

    interval(15000).subscribe(() => {
      this.ws.send({ type: 'qrcode_request' });
    })

    // Error when qrcode taking too long to load
    if (this.school.config.getValue()?.fastlogin) {
      this.qrcodeErrorHandle = setTimeout(() => {
        if (this.qrcode.getValue() == '' && !this.isLoading) {
          let alert = this.a.alert('error', 'auth.errors.longLoadingQR');
          alert.closeable(true);
          this.qrcode.subscribe((data) => {
            if (data != '') {
              alert.close();
            }
          });
        }
      }, 5000);
    }
  }

  public ngOnDestroy(): void {
    this.ws.close();
    clearTimeout(this.qrcodeErrorHandle);
  }

  public async loginPasskey(): Promise<void> {
    this.isPasskeyLoading = true;
    this.http
      .get<PublicKeyCredentialRequestOptionsJSON>(
        Config.ELYSIA_URL + '/auth-passkey'
      )
      .subscribe(
        async (options: PublicKeyCredentialRequestOptionsJSON) => {
          try {
            const authResponse = await startAuthentication({
              optionsJSON: options,
            });
            this.http
              .post(
                Config.ELYSIA_URL + '/verify-authentication',
                {
                  response: authResponse,
                  challenge: options.challenge,
                },
                {
                  withCredentials: true,
                }
              )
              .subscribe((data) => {
                if ('username' in data) {
                  this.auth.loadState();
                  return;
                }
                if ('error' in data) {
                  switch(data.error) {
                    case "no_credential":
                      this.a.alert('error', 'auth.passkey.no_account')
                      break;
                    default:
                      this.a.alert('error', 'auth.passkey.error')
                      break;
                  }
                }
                this.isPasskeyLoading = false;
              });
          } catch (err: unknown) {
            this.isPasskeyLoading = false;
            const error = err as Error;
            const msg = error?.message || '';
            console.log(err);

            if (
              msg.includes('The operation either timed out or was not allowed')
            ) {
              console.error('🟡 Uživatelsky zrušené přihlášení nebo timeout.');
              this.a.alert('info', 'auth.passkey.cancelled').closeable(true)
            } else if (
              msg.includes('not supported') ||
              msg.includes('not allowed')
            ) {
              console.error('❌ Prohlížeč nepodporuje WebAuthn nebo Passkeys.');
              this.a.alert('error', 'settings.passkeys.alerts.not_supported').closeable(true)
            } else {
              console.error('❗ Neočekávaná chyba:', err);
              this.a.alert('error', 'auth.passkey.error').closeable(true)
            }
          }
        },
        (err) => {
          this.isPasskeyLoading = false;
          this.a.alert('error', 'auth.errors.429');
          console.error('❌ Nepodařilo se komunikovat se serverem');
        }
      );
  }

  public getTokenPlaceholder(text: string = this.loginForm.value.token?.toString()!, length: number = AuthConfig.token_length): string {
    for (const _ of [].constructor(
      length - text.length
    )) {
      text += 'X';
    }
    return text;
  }

  public getInputError(input: string): string {
    if (this.errors[input]) {
      return this.errors[input];
    }

    const control = this.loginForm.get(input);
    if (!control) return '';

    const shouldShowError =
      this.formSubmitted || (control.dirty && control.touched);
    if (!shouldShowError || control.valid) return '';

    if (control.hasError('required')) {
      return this.l.s('form.required');
    }

    const minLengthError = control.getError('minlength');
    if (minLengthError) {
      return this.l.s('form.minLength', { min: minLengthError.requiredLength });
    }

    const maxLengthError = control.getError('maxlength');
    if (maxLengthError) {
      return this.l.s('form.maxLength', { max: maxLengthError.requiredLength });
    }

    return '';
  }

  public openInstallModal() {
    this.showInstallModal = true;
  }

  public closeInstallModal() {
    this.showInstallModal = false;
  }
}
