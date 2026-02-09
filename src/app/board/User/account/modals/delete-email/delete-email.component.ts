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
  templateUrl: './delete-email.component.html',
  styleUrl: './delete-email.component.css'
})
export class DeleteEmailComponent implements OnInit {
  public l = inject(Locale);
  private u = inject(Authentication);
  public dropdownManager = inject(DropdownManager);
  private modalManager = inject(ModalManager);
  private http = inject(HttpClient);
  private auth = inject(Authentication);

  public showSelect: null | 'type' = null;

  public email = '';
  public text_email = '';

  ngOnInit(): void {
    const data = this.modalManager.getModalData('delete_email');
    this.email = data;
  }

  public deleteEmail(): void {
    if (this.email == '' || this.text_email == '' || this.email != this.text_email) {
      return;
    }

    this.http.delete(`${Config.API_URL}/v1/user/email`, { 
      body: { email: this.email },
      withCredentials: true 
    }).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.u.loadState();
        }
      },
      error: (error) => console.error('Error removing email', error)
    });
  }

  private resetForm() {
    this.email = '';
    this.text_email = '';
  }
}
