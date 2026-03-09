import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalManager } from '@Schoolingo/modal';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { HttpClient } from '@angular/common/http';
import { Config } from '@Schoolingo/config';

@Component({
  selector: 'app-delete-draft',
  standalone: true,
  imports: [CommonModule, IconsModule],
  templateUrl: './delete-draft.component.html',
  styleUrl: './delete-draft.component.css'
})
export class DeleteDraftComponent implements OnInit {
  private modalManager = inject(ModalManager);
  private http = inject(HttpClient);
  public l = inject(Locale);
  
  public draft: any;

  ngOnInit(): void {
    const data = this.modalManager.getModalData('delete_draft');
    this.draft = data.draft;
  }

  public closeModal(): void {
    this.modalManager.closeModal('delete_draft');
  }

  public confirmDelete(): void {
    if (!this.draft) return;

    this.http.delete(
      `${Config.API_URL}/v1/messages/draft/${this.draft.draft_id}`,
      { withCredentials: true }
    )
    .subscribe((res: any) => {
      if (res.success) {
        const data = this.modalManager.getModalData('delete_draft');
        if (data.onDeleted) {
          data.onDeleted(this.draft.draft_id);
        }
        this.closeModal();
      }
    });
  }
}
