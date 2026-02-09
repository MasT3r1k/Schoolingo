import { Component, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DropdownManager } from '@Schoolingo/dropdown';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { ModalManager } from '@Schoolingo/modal';
import { Config } from '@Schoolingo/config';
import { Authentication } from '@Schoolingo/authentication';

@Component({
  imports: [IconsModule, FormsModule, ReactiveFormsModule],
  templateUrl: './add-phone.component.html',
  styleUrl: './add-phone.component.css'
})
export class AddPhoneComponent implements OnInit {
  public l = inject(Locale);
  public dropdownManager = inject(DropdownManager);
  private modalManager = inject(ModalManager);
  private http = inject(HttpClient);
  private auth = inject(Authentication);

  public code = 420;
  public number = '';
  public originalNumber: string | null = null;
  public isEdit = false;

  ngOnInit(): void {
    const data = this.modalManager.getModalData('add_phone');
    if (data && data.number) {
      this.isEdit = true;
      this.code = data.code || 420;
      this.number = data.number;
      this.originalNumber = data.number;
    }
  }

  public savePhone(): void {
    if (this.number == '') {
      return;
    }

    if (this.isEdit) {
      this.http.put(`${Config.API_URL}/v1/user/phone`, {
        originalNumber: this.originalNumber,
        code: this.code,
        number: this.number
      }, { withCredentials: true }).subscribe({
        next: (response: any) => {
          if (response.success) {
            this.modalManager.closeModal('add_phone');
            this.auth.loadState();
            this.resetForm();
          }
        },
        error: (error) => console.error('Error updating phone', error)
      });
    } else {
      this.http.post(`${Config.API_URL}/v1/user/phone`, {
        code: this.code,
        number: this.number
      }, { withCredentials: true }).subscribe({
        next: (response: any) => {
          if (response.success) {
            this.modalManager.closeModal('add_phone');
            this.auth.loadState();
            this.resetForm();
          }
        },
        error: (error) => console.error('Error adding phone', error)
      });
    }
  }

  private resetForm() {
    this.code = 420;
    this.number = '';
    this.isEdit = false;
    this.originalNumber = null;
  }
}
