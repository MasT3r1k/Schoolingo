import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { Authentication } from '@Schoolingo/authentication';
import { AvatarService, Utils } from '@Schoolingo/utils';
import { HttpClient } from '@angular/common/http';
import { Config } from '@Schoolingo/config';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageManager } from '@Schoolingo/messages';
import { ModalManager } from '@Schoolingo/modal';
import { DropdownManager } from '@Schoolingo/dropdown';
import { Message, MessageTemplateSettings, TemplateComponent } from '../template/template.component';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule, TemplateComponent],
  templateUrl: './drafts.component.html',
  styleUrls: ['./drafts.component.css', '../messages.css', '../../../Styles/sidebar.css']
})
export class DraftsComponent implements OnInit {
  Utils = Utils;

  public auth = inject(Authentication);
  private router = inject(Router);
  private messageManager = inject(MessageManager);
  private modalManager = inject(ModalManager);

  public settings: MessageTemplateSettings = {
    no_items: 'messages.no_drafts',
    list_message_header: 'draft',
    select_item_title: 'messages.select_message',
    select_item_description: 'messages.select_message_desc',
    show_receivers: true,
    show_receivers_detailed: false,
    show_files: false,
    add_header_padding: true
  }

  public actions = [
    {
      label: 'messages.drafts_confirm.delete_btn',
      icon: 'trash',
      type: 'danger',
      isVisible: (message: Message, self: TemplateComponent) => { return true },
      run: (message: Message, event: any, self: TemplateComponent) => { 
        this.modalManager.updateModal('delete_message', 'title', 'messages.drafts_confirm.delete_title');
        this.modalManager.updateModal('delete_message', 'description', 'messages.drafts_confirm.delete_desc');
        self.deleteMessage(message);
      }
    },
    {
      label: 'messages.continue_writing',
      icon: 'player-play',
      type: 'primary',
      isVisible: (message: Message) => { return true },
      run: (message: Message, event: any, self: TemplateComponent) => { self.continueMessage(message, 'draft') }
    }
  ];

  public multi_actions = [
    {
      label: 'messages.delete_drafts',
      icon: 'trash',
      type: 'danger',
      isVisible: (messages: Message[]) => { return true },
      run: (messages: Message[], event: any, self: TemplateComponent) => { self.deleteMessage(messages); }
    }
  ]

  ngOnInit(): void {}
}
