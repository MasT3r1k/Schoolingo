import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { Authentication } from '@Schoolingo/authentication';
import { Utils } from '@Schoolingo/utils';
import { HttpClient } from '@angular/common/http';
import { Config } from '@Schoolingo/config';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageManager } from '@Schoolingo/messages';
import { ModalManager } from '@Schoolingo/modal';
import { DeleteDraftComponent } from './modals/delete-draft/delete-draft.component';


interface Draft {
  draft_id: number;
  type: number;
  topic: string | null;
  message: string;
  receivers: string | null;
  require_confirm: boolean;
  updated_at: Date;
}

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule],
  templateUrl: './drafts.component.html',
  styleUrls: ['./drafts.component.css', '../messages.css']
})
export class DraftsComponent implements OnInit {
  Utils = Utils;

  public l = inject(Locale);
  public auth = inject(Authentication);
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private messageManager = inject(MessageManager);
  private modalManager = inject(ModalManager);


  public drafts: Draft[] = [];
  public selectedDraft: Draft | null = null;
  public searchText = '';

  ngOnInit(): void {
    this.loadDrafts();

    this.route.queryParams.subscribe((data) => {
      const draft_id = data['id'];
      if (draft_id) {
         this.selectedDraft = this.drafts.find((d) => d.draft_id == draft_id) ?? null;
      }
    });

    this.modalManager.addModal(
      'delete_draft',
      {
        title: '',
        closeable: true,
        width: 600,
        items: [{
          type: 'component',
          component: DeleteDraftComponent
        }]
      }
    );
  }


  public loadDrafts(): void {
    this.http.get<{ success: boolean, drafts: Draft[] }>(
      `${Config.API_URL}/v1/messages/drafts`,
      { withCredentials: true }
    )
    .subscribe((data) => {
      if (data.success) {
        this.drafts = data.drafts;
        const draft_id = this.route.snapshot.queryParams['id'];
        if (draft_id) {
          this.selectedDraft = this.drafts.find((d) => d.draft_id == draft_id) ?? null;
        }
      }
    });
  }

  public selectDraft(draft: Draft | null): void {
    this.selectedDraft = draft;
  }

  public continueDraft(draft: Draft): void {
    // Set data in message manager
    this.messageManager.message = draft.message || '';
    this.messageManager.topic = draft.topic || '';
    this.messageManager.messageType.next(draft.type);
    this.messageManager.draft_id = draft.draft_id;
    
    // In a real scenario we'd also handle receivers if they are stored in draft
    // For now we just redirect to send page
    this.router.navigate(['/messages/send']);
  }

  public deleteDraft(draft: Draft, event: MouseEvent): void {
    event.stopPropagation();
    this.modalManager.openModal('delete_draft', {
      draft,
      onDeleted: (draft_id: number) => {
        this.drafts = this.drafts.filter(d => d.draft_id !== draft_id);
        if (this.selectedDraft?.draft_id === draft_id) {
          this.selectedDraft = null;
        }
      }
    });
  }

  public get filteredDrafts(): Draft[] {
    return this.drafts.filter((d: Draft) => 
      (d.topic?.toLowerCase().includes(this.searchText.toLowerCase()) || 
       d.message?.toLowerCase().includes(this.searchText.toLowerCase()))
    );
  }
}
