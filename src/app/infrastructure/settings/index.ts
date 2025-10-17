import { inject } from '@angular/core';
import { SecurityAPI } from './security';
import { HttpClient } from '@angular/common/http';
import { Config } from '@Schoolingo/config';
import moment from 'moment';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';

export class Settings {
  private http = inject(HttpClient);
  private router = inject(Router);
  private security: SecurityAPI | null = null;
  private formBuilder = inject(FormBuilder);
  public passkeyName = this.formBuilder.control('');
  public TFAControl = this.formBuilder.control('');

    public checkValidTFA(): boolean {
        return this.TFAControl.valid && this.TFAControl.value != "";
    }

  public init(): void {
    this.refreshSecurityAPI();
  }

  public refreshSecurityAPI(): void {
    this.http
      .get<SecurityAPI | { error: string }>(Config.API_URL + '/v1/security', {
        withCredentials: true,
      })
      .subscribe((data) => {
        if ('error' in data) {
          if (data.error == 'no_user') {
            this.router.navigate(['/login']);
            return;
          }
          console.error(data.error);
        } else {
          this.security = data;
          this.security['2fa_activated'] = moment(data['2fa_activated']);
          this.TFAControl.setValue("");
        }
      });
  }

  public getSecurity(): typeof this.security {
    if (this.security == null) {
      this.refreshSecurityAPI();
      return null;
    }
    return this.security;
  }

  public getBackupCodes(): string[] {
    console.log('TFA:', this.TFAControl.value);
    this.http
      .post(
        Config.API_URL + '/v1/security',
        { method: 'GET_BACKUP_CODES', TFA: this.TFAControl.value },
        { withCredentials: true }
      )
      .subscribe((data) => {
        console.log(data);
      });
    return [];
  }
}
