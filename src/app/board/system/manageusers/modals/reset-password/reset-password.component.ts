import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@Schoolingo/icons';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Config } from '@Schoolingo/config';
import { ModalManager } from '@Schoolingo/modal';
import { DropdownManager } from '@Schoolingo/dropdown';
import { AvatarService } from '../../../../../infrastructure/utils/avatar.service';
import { UserDetail } from '../../manageusers.component';
import { Utils } from '@Schoolingo/utils';
import { Locale } from '@Schoolingo/locale';
import { DropdownComponent } from '@Components/dropdown/dropdown';

@Component({
  standalone: true,
  imports: [CommonModule, IconsModule, FormsModule, IconsModule, DropdownComponent],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordManageUsersComponent implements OnInit {
  public l = inject(Locale);
  public Utils = Utils;
  private http = inject(HttpClient);
  public modalManager = inject(ModalManager);
  public dropdownManager = inject(DropdownManager);
  public avatarService = inject(AvatarService);

  public selectedUser: UserDetail | null = null;

  // Reset Password
  public selectedOption = 0;
  options = ['email', 'show'];

  public isOptionVisible(index: number): boolean {
    if (this.options.indexOf('email') == index) {
      return this.selectedUser?.emails.length ? true : false;
    }
    return true;
  }

  public isOptionActive(name: string): boolean {
    return this.options.indexOf(name) == this.selectedOption;
  }

  public selectedEmail = 0;
  public getEmails(): any[] {
    if (!this.selectedUser) return [];
    return this.selectedUser.emails.map((email, index) => ({
      label: email.email,
      value: index
    }))
  }

 
  isResettingPassword = false;
  resetPasswordSuccess = false;
  resetPasswordError: string | null = null;


submitResetPassword() {
    if (!this.selectedUser) return;
    this.resetPasswordError = null;
    this.resetPasswordSuccess = false;

    this.isResettingPassword = true;

    this.http.post<any>(
      `${Config.API_URL}/v1/system/users/${this.selectedUser.id}/reset-password`,
      {},
      { withCredentials: true }
    ).subscribe({
      next: () => {
        this.isResettingPassword = false;
        this.resetPasswordSuccess = true;
      },
      error: (err) => {
        console.error('Error resetting password:', err);
        this.isResettingPassword = false;
        this.resetPasswordError = 'Nepodařilo se resetovat heslo';
      }
    });
  }

  public closeModal(): void {
    this.modalManager.closeModal('manageusers_resetpassword');
  }

  public getVisibleCount(): number {
    return this.options.filter((option, index) => this.isOptionVisible(index)).length;
  }

  ngOnInit() {
    const data = this.modalManager.getModalData('manageusers_resetpassword');
    if ('user' in data) {
      this.selectedUser = data.user;

      for(let i = 0;i < this.options.length;i++) {
        if (this.isOptionVisible(i)) {
          this.selectedOption = i;
          return;
        }
      }
    }
  }
}
