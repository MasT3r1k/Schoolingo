import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Config } from '@Schoolingo/config';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { ModalManager } from '@Schoolingo/modal';

@Component({
  selector: 'app-delete-confirm',
  imports: [IconsModule, FormsModule, ReactiveFormsModule],
  templateUrl: './delete-confirm.component.html',
  styleUrl: './delete-confirm.component.css'
})
export class DeleteConfirmComponent implements OnInit {
  private http = inject(HttpClient);
  public l = inject(Locale);
  private modalManager = inject(ModalManager);
  public loading = false;
  public exportLoading = false;
  public deleteAccountLoading = false;
  public deleteConfirmText = '';
  public require_word = '';

  ngOnInit(): void {
    this.require_word = this.l.s('gdpr.consents.remove_user.verify_text');
    if (this.require_word == '[gdpr.consents.remove_user.verify_text]' || this.require_word == '') {
      this.require_word = 'delete account';
    }
  }

  public requestAccountDeletion(): void {
    if (this.deleteConfirmText.toLowerCase() !== this.require_word) return;
    this.deleteAccountLoading = true;
    this.http.delete(
      `${Config.API_URL}/v1/gdpr/account`,
      { withCredentials: true }
    ).subscribe({
      next: () => window.location.href = '/login',
      error: () => this.deleteAccountLoading = false
    });
  }

  public closeModal(): void {
    this.modalManager.closeModal('gdpr_delete-user')
  }
}
