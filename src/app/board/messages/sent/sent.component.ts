import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Authentication } from '@Schoolingo/authentication';
import { Locale } from '@Schoolingo/locale';
import { Utils } from '@Schoolingo/utils';
import { SentMessagesService, SentMessage, Pagination } from '../../../infrastructure/messages/sent-messages.service';
import { NgClass } from '@angular/common';
import { IconsModule } from '@Schoolingo/icons';

@Component({
  imports: [NgClass, IconsModule],
  templateUrl: './sent.component.html',
  styleUrls: ['./sent.component.css', '../messages.css']
})
export class SentComponent implements OnInit {
  Utils = Utils;
  
  public l = inject(Locale);
  public auth = inject(Authentication);
  public messagesService = inject(SentMessagesService);
  private route = inject(ActivatedRoute);
  
  public messages: SentMessage[] = [];
  public selectedMessage: SentMessage | null = null;
  public searchText = '';
  public loading = true;
  public pagination: Pagination = { page: 1, limit: 20, total: 0, pages: 0 };

  ngOnInit(): void {
    this.loadMessages();
  }

  private loadMessages(): void {
    this.loading = true;
    this.messagesService.loadMessages().subscribe({
      next: (data) => {
        this.messages = data;
        this.pagination = this.messagesService.pagination();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  public selectMessage(message: SentMessage): void {
    this.messagesService.getMessage(message.message_id).subscribe({
      next: (data) => {
        if (data) {
          this.selectedMessage = data.message;
        }
      }
    });
  }

  public deleteMessage(message: SentMessage): void {
    if (!confirm('Opravdu chcete smazat tuto zprávu?')) return;
    
    this.messagesService.deleteMessage(message.message_id).subscribe({
      next: (response) => {
        if (response.success) {
          this.messages = this.messages.filter(m => m.message_id !== message.message_id);
          if (this.selectedMessage?.message_id === message.message_id) {
            this.selectedMessage = null;
          }
        }
      }
    });
  }

  public nextPage(): void {
    if (this.pagination.page < this.pagination.pages) {
      this.messagesService.loadMessages(this.pagination.page + 1).subscribe({
        next: (data) => {
          this.messages = data;
          this.pagination = this.messagesService.pagination();
        }
      });
    }
  }

  public previousPage(): void {
    if (this.pagination.page > 1) {
      this.messagesService.loadMessages(this.pagination.page - 1).subscribe({
        next: (data) => {
          this.messages = data;
          this.pagination = this.messagesService.pagination();
        }
      });
    }
  }

  public get filteredMessages(): SentMessage[] {
    if (!this.searchText) return this.messages;
    const query = this.searchText.toLowerCase();
    return this.messages.filter(m => 
      m.subject.toLowerCase().includes(query) ||
      m.content.toLowerCase().includes(query)
    );
  }
}

