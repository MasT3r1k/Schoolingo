import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Config } from '../infrastructure/config';
import { NgClass, NgStyle } from '@angular/common';
import { QRCodeComponent } from 'angularx-qrcode';
import { Locale } from '@Schoolingo/locale';
import { School } from '@Schoolingo/school';
import { Theme } from '@Schoolingo/theme';
import { AuthAlertManager } from '../infrastructure/alert/auth.alert.manager';
import { AlertComponent } from '@Components/Alert';
import { BehaviorSubject } from 'rxjs';
import { AuthConfig } from '../infrastructure/authentication/config';
import { HttpClient } from '@angular/common/http';
import { Authentication } from '@Schoolingo/authentication';
import { ActivatedRoute, Router } from '@angular/router';
import { IconsModule } from '@Schoolingo/icons';
import {
  PublicKeyCredentialRequestOptionsJSON,
  startAuthentication
} from '@simplewebauthn/browser';
import { InstallAppModalComponent } from '@Components/InstallAppModal/install-app-modal.component';

export function isoBase64URLBuffer(buffer: Uint8Array): string {
  return btoa(String.fromCharCode(...buffer))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}
import { base64urlToBuffer, Passkey } from '@Schoolingo/passkey';

@Component({
  standalone: true,
  imports: [NgStyle, NgClass, QRCodeComponent, AlertComponent, ReactiveFormsModule, IconsModule, InstallAppModalComponent],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit {
  public App = Config
  public AuthConfig = AuthConfig;
  l = inject(Locale);
  t = inject(Theme);
  a = inject(AuthAlertManager);
  private auth = inject(Authentication);
  private http = inject(HttpClient);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  public passkey = inject(Passkey);
  public isPasskeySupport = false;
    
  public qrcode = new BehaviorSubject('');
  public showInstallModal = false;

  public school = inject(School);
  public page: 'login' | '2fa' = 'login';
  public isLoading = true;
  public errors: { [key: string]: string } = {};
  formSubmitted = false;
  public dropdown: 'language' | 'theme' | '' = '';

  private formBuilder = inject(FormBuilder);
  loginForm = this.formBuilder.group({
    username: ['',
      [
        Validators.required,
        Validators.minLength(AuthConfig.username_min),
        Validators.maxLength(AuthConfig.username_max),
        Validators.pattern(AuthConfig.username_regex)
      ]
    ],
    password: ['',
      [
        Validators.required,
        Validators.minLength(AuthConfig.password_min),
        Validators.maxLength(AuthConfig.password_max)
      ]
    ],
    token: ['',
      [
        Validators.minLength(AuthConfig.token_length),
        Validators.maxLength(AuthConfig.token_length)
      ]
    ]
  })

  async ngOnInit(): Promise<void> {
    this.isPasskeySupport = await this.passkey.isSupported();

    const encodedReturnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    const returnUrl = encodedReturnUrl ? decodeURIComponent(encodedReturnUrl) : null;

    this.school.config.subscribe((data) => {
      if (data == null) return;
      this.isLoading = false;
    });

    this.auth.getAuthState().subscribe((data) => {
      if (data === true) {
        if (returnUrl) {
          this.router.navigateByUrl(returnUrl);
        } else {
          this.router.navigate(['', 'main']);
        }
      }
    })


    // Error while too long loading
    setTimeout(() => {
      if (this.qrcode.getValue() == '' && !this.isLoading) {
        let alert = this.a.alert("error", "auth.errors.longLoadingQR");
        alert.closeable(true);
        this.qrcode.subscribe((data) => {
          if (data != "") {
            alert.close();
          }
        })
      }
    }, 5000);

    setTimeout(() => this.qrcode.next("QR kód data"), 10000)
  }

  public async loginPasskey(): Promise<void> {
    this.http.get<PublicKeyCredentialRequestOptionsJSON>(Config.ELYSIA_URL + '/auth-passkey')
    .subscribe( async(options: PublicKeyCredentialRequestOptionsJSON) => {
      try {
        const authResponse = await startAuthentication({optionsJSON: options});
        this.http.post(Config.ELYSIA_URL + '/verify-authentication', {
          response: authResponse,
          challenge: options.challenge
        }, {
          withCredentials: true
        })
        .subscribe((data) => {
          if ('username' in data) {
            this.auth.loadState();
            return;
          }
        });

      } catch (err: unknown) {
        const error = err as Error;
        const msg = error?.message || '';

        if (msg.includes('The operation either timed out or was not allowed')) {
          console.error('🟡 Uživatelsky zrušené přihlášení nebo timeout.');
        }

        else if (msg.includes('not supported') || msg.includes('not allowed')) {
          console.error('❌ Prohlížeč nepodporuje WebAuthn nebo Passkeys.');
        }

        else {
          console.error('❗ Neočekávaná chyba:', err);
        }
      }
    }, (err) => {
      this.a.alert("error", "auth.errors.429");
      console.error('❌ Nepodařilo se komunikovat se serverem ')
    })
  }

  public login(): void {
    this.errors = {};
    this.formSubmitted = true;
    if (this.loginForm.invalid) return;

    this.http.post(Config.ELYSIA_URL + "/auth", {
      username: this.loginForm.value.username,
      password: this.loginForm.value.password,
      TFA: this.loginForm.value.token
    }, { withCredentials: true }).subscribe(
      (data) => {
        if ('username' in data) {
          this.auth.loadState();
          return;
        }
        if ('error' in data && data.error instanceof Array) {
          if (data.error?.includes("Invalid username")) {
            this.errors['username'] = this.l.s('auth.errors.invalid_username');
            if (this.page === '2fa') { this.page = 'login' }
          }
          if (data.error?.includes("Invalid password")) {
            this.errors['password'] = this.l.s('auth.errors.invalid_password');
            if (this.page === '2fa') { this.page = 'login' }
          }
          if (data.error?.includes("Missing username")) {
            this.errors['username'] = this.l.s('form.required');
            if (this.page === '2fa') { this.page = 'login' }
          }
          if (data.error?.includes("Missing password")) {
            this.errors['password'] = this.l.s('form.required');
            if (this.page === '2fa') { this.page = 'login' }
          }

          if (data.error?.includes("Missing 2FA")) {
            this.page = '2fa';
          }
          
          if (data.error?.includes("Invalid 2FA")) {
            this.errors['token'] = this.l.s('auth.errors.invalid_tfa');
          }
        }
      },
      (err) => this.a.alert("error", "auth.errors.429")
    );
  }

  public getTokenPlaceholder(): string {
    let text = this.loginForm.value.token?.toString()!;
    for(const _ of [].constructor(AuthConfig.token_length - this.loginForm.value.token!.length)) {
      text += "X";
    }
    return text;
  }

  public getInputError(input: string): string {
    if (this.errors[input]) {
      return this.errors[input];
    }

    const control = this.loginForm.get(input);
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

  public openInstallModal() {
    this.showInstallModal = true;
  }

  public closeInstallModal() {
    this.showInstallModal = false;
  }
}
