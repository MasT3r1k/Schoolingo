import { Component, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { ModalManager } from '@Schoolingo/modal';
import { Config } from '@Schoolingo/config';
import { Authentication } from '@Schoolingo/authentication';
import { Utils } from '@Schoolingo/utils';

@Component({
  imports: [IconsModule, FormsModule, ReactiveFormsModule],
  templateUrl: './delete-phone.component.html',
  styleUrl: './delete-phone.component.css'
})
export class DeletePhoneComponent implements OnInit {
  public l = inject(Locale);
  private u = inject(Authentication);
  public modalManager = inject(ModalManager);
  private http = inject(HttpClient);
  public Utils = Utils;

  public phone = '';
  public text_phone = '';
  public token = '';
  public page: 'main' | '2fa' = 'main';

  ngOnInit(): void {
    const data = this.modalManager.getModalData('delete_phone');
    this.phone = data;
  }

  public deletePhone(): void {
    if (this.phone == '' || this.text_phone == '' || this.phone != this.text_phone) {
      return;
    }

    this.http.delete(`${Config.API_URL}/v1/user/phone`, { 
      body: { number: this.phone, token: this.token },
      withCredentials: true 
    }).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.u.loadState();
          this.modalManager.closeModal('delete_phone');
        } else if (response.error && response.error.includes('required_2fa')) {
          this.page = '2fa';
        }
      },
      error: (error) => {
        if (error.status === 400 && error.error?.error?.includes('required_2fa')) {
          this.page = '2fa';
        }
        console.error('Error removing phone', error);
      }
    });
  }
}
