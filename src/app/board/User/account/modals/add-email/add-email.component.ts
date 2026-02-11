import { Component, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DropdownManager } from '@Schoolingo/dropdown';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { ModalManager } from '@Schoolingo/modal';
import { Config } from '@Schoolingo/config';
import { Authentication } from '@Schoolingo/authentication';
import { AuthConfig } from '../../../../../infrastructure/authentication/config';

@Component({
  imports: [IconsModule, FormsModule, ReactiveFormsModule],
  templateUrl: './add-email.component.html',
  styleUrl: './add-email.component.css'
})
export class AddEmailComponent implements OnInit {
  public l = inject(Locale);
  public dropdownManager = inject(DropdownManager);
  private modalManager = inject(ModalManager);
  private http = inject(HttpClient);
  private auth = inject(Authentication);
  public AuthConfig = AuthConfig;

  public showSelect: null | 'type' = null;
  public email_types = ['personal', 'school', 'work', 'other'];
  public email_selected = 0;

  public token = '';
  public email = '';
  public originalEmail: string | null = null;
  public isEdit = false;

  public active_action = '';

  public page: 'main' | '2fa' = '2fa';

  ngOnInit(): void {
    const data = this.modalManager.getModalData('add_email');
    if (data && data.email) {
      this.isEdit = true;
      this.email = data.email;
      this.originalEmail = data.email;
      const typeIndex = this.email_types.indexOf(data.type);
      if (typeIndex !== -1) {
        this.email_selected = typeIndex;
      }
    }
    if (data == null) {
      this.resetForm();
    }
  }

  public saveEmail(): void {
    if (this.email == '') {
      return;
    }

    if (this.isEdit) {
      this.http.put(`${Config.API_URL}/v1/user/email`, {
        originalEmail: this.originalEmail,
        email: this.email,
        type: this.email_types[this.email_selected],
        token: this.token
      }, { withCredentials: true }).subscribe({
        next: (response: any) => {
          if (response.success) {
            this.modalManager.closeModal('add_email');
            this.auth.loadState();
            this.resetForm();
          }
        },
        error: (error) => console.error('Error updating email', error)
      });
    } else {
      this.http.post(`${Config.API_URL}/v1/user/email`, {
        email: this.email,
        type: this.email_types[this.email_selected],
        token: this.token
      }, { withCredentials: true }).subscribe({
        next: (response: any) => {
          if (response.success) {
            this.modalManager.closeModal('add_email');
            this.auth.loadState();
            this.resetForm();
          }
        },
        error: (error) => console.error('Error adding email', error)
      });
    }
  }

  private resetForm() {
    this.token = '';
    this.active_action = '';
    this.email = '';
    this.email_selected = 0;
    this.isEdit = false;
    this.originalEmail = null;
  }
}
