import { NgClass } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CheckboxComponent } from '@Components/Checkbox';
import { Authentication } from '@Schoolingo/authentication';
import { Config } from '@Schoolingo/config';
import { DropdownManager } from '@Schoolingo/dropdown';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { ModalManager } from '@Schoolingo/modal';
import { AvatarService, Utils } from '@Schoolingo/utils';
import { DeleteMessageComponent } from '../modals/delete-message/delete-message.component';
import { ContextMenu, ContextMenuItem } from '@Schoolingo/context-menu';
import { MessageManager } from '@Schoolingo/messages';

export interface Message {
  message_id: number;
  topic: string | null;
  message: string;
  author_id: number;
  author: {
    full_name: string;
    first_name: string;
    last_name: string;
    role: string;
    avatar: string | null;
  };
  sent_at: Date;
  is_draft: boolean;
  deleted: boolean;
  require_confirm: boolean;
  files: {
    file_id: number;
    file_uuid: string;
    file_name: string;
    file_format: string;
    file_size: number;
    mime_type: string;
  }[];
  receivers: {
    person_id: number;
    full_name: string;
    avatar: string;
    read_at: Date | null;
    confirm_at: Date | null;
    suppress_at: Date | null;
  }[]
}

export interface MessageAction {
  label: string;
  icon: string;
  type: string;
  isVisible?: Function | any;
  run: Function | any;
}

export type MessageTemplateSettings = {
  no_items: string,
  list_message_header: 'author' | 'draft' | 'receivers',
  select_item_title: string,
  select_item_description: string,
  show_files: boolean
  add_header_padding: boolean
} & ({
    show_receivers: true,
    show_receivers_detailed: boolean
} | {
    show_receivers: false
})

@Component({
  selector: 'messages-template',
  imports: [IconsModule, FormsModule, NgClass, CheckboxComponent],
  templateUrl: './template.component.html',
  styleUrls: ['./template.component.css', '../messages.css', '../../../Styles/sidebar.css']
})
export class TemplateComponent implements OnInit {
  // ---===--- Inputs
  @Input() title = '';
  @Input() settings: MessageTemplateSettings = {
    no_items: 'messages.no_messages',
    list_message_header: 'author',
    select_item_title: 'messages.select_message',
    select_item_description: 'messages.select_message_desc',
    show_receivers: true,
    show_receivers_detailed: false,
    show_files: true,
    add_header_padding: true
  }
  @Input() filters = {};
  @Input() message_actions: MessageAction[] = [];
  @Input() multi_actions: MessageAction[] = [];

  public internal_filters = {
    order: 'newest_to_oldest',
    show_suppress: false,
  };

  // ---===--- Imports
  public math = Math;
  public l = inject(Locale);
  public Utils = Utils;
  private modalManager = inject(ModalManager);
  public context_menu = inject(ContextMenu);
  public dropdownManager = inject(DropdownManager);
  public avatarService = inject(AvatarService);
  private messageManager = inject(MessageManager);
  public auth = inject(Authentication);
  private http = inject(HttpClient);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  
  // ---===--- Local Variables
  public isMultiSelect = false;
  public multiSelected: Message[] = [];
  public searchText = '';
  public selectedMessage: Message | null = null;
  public messages: Message[] = [];

  // ---===--- Functions
  public rightClickOnMessage(event: MouseEvent, message: Message): void {
    event.preventDefault();
    let items: ContextMenuItem[] = [];

    items.push(
      {
        icon: 'click',
        text: 'messages.select',
        action: () => { this.context_menu.hideContextMenu();this.selectMessage(message); }
      }
    )

    for(let i = 0;i < this.message_actions.length;i++) {
      if (this.message_actions[i]?.isVisible && !this.message_actions[i]?.isVisible(message, this) || !this.message_actions[i]?.isVisible) continue;
      items.push(
        {
          color: this.message_actions[i].type == 'danger' ? 'danger' : undefined,
          icon: this.message_actions[i].icon,
          text: this.message_actions[i].label ?? 'unknown',
          action: () => { this.context_menu.hideContextMenu();this.message_actions[i].run(message, event, this); }
        }
      )
    }
    
    items.push(
      {
        type: 'split'
      }
    )

    items.push(
      {
        icon: 'x',
        text: 'close',
        action: () => { this.context_menu.hideContextMenu(); }
      }
    )

    this.context_menu.setItems(items);
    this.context_menu.showContextMenu(event.x, event.y);
  }

  public toggleMultiSelect(): void {
    this.isMultiSelect = !this.isMultiSelect;
    this.multiSelected = [];
    this.selectedMessage = null;
  }
  
  public selectAll(): void {
    const all = this.filteredMessages();
    all.forEach((msg) => {
      if (!this.multiSelected.includes(msg)) {
        this.multiSelected.push(msg);
      }
    });
  }

  public isMessageActive(message: Message): boolean {
    return message.message_id == this.selectedMessage?.message_id && !this.isMultiSelect || this.isMultiSelect && this.multiSelected.includes(message);
  }

  public clearFilters(): void {
    this.internal_filters = {
      order: 'newest_to_oldest',
      show_suppress: false,
    };
  }

  public getMainContent(): 'default' | 'detail' | 'multi_select' {
    if (this.isMultiSelect) return 'multi_select';
    if (this.selectedMessage) return 'detail';
    return 'default';
  }

  public findIndexReceiverOfMessage(message: typeof this.selectedMessage = this.selectedMessage, person_id: number): number {
    return message?.receivers.findIndex((receiver) => receiver.person_id == person_id) ?? -1;
  }

  public updateMessage(message: typeof this.selectedMessage, options: { read?: boolean;confirm?: boolean;suppress?: boolean; }): void {
    if (!message) return;

    this.http.post(
      `${Config.API_URL}/v1/messages/update`,
      {
        message_id: message.message_id,
        read: options.read ?? false,
        confirm: options.confirm ?? false,
        suppress: options.suppress ?? null
      },
      { withCredentials: true }
    )
    .subscribe((data: any) => {
      if (data.success == false) return;
      this.loadMessages();
    });
  }

  public deleteMessage(messages: (typeof this.selectedMessage)[] | (typeof this.selectedMessage)): void {
    if (!messages) return;

    const message = !Array.isArray(messages) ? [messages] : messages;

    this.modalManager.openModal('delete_message', {
      message,
      onDelete: () => {
        this.http.delete(
          `${Config.API_URL}/v1/messages/delete?message_ids=${message.map((m) => (m?.message_id)).join(',')}`,
          { withCredentials: true }
        )
        .subscribe((data: any) => {
          if (data.success == false) return;
          this.loadMessages();
        });
      }
    });
  }

  public selectMessage(message: typeof this.selectedMessage): void {
    if (this.isMultiSelect && message) {
      if (this.multiSelected.includes(message)) {
        this.multiSelected.splice(this.multiSelected.indexOf(message), 1);
      } else {
        this.multiSelected.push(message);
      }
      return;
    }

    const person_index = this.findIndexReceiverOfMessage(message, this.auth.getUser().person_id);
    this.selectedMessage = message;

    if (message != null && person_index != -1 && !message.receivers[person_index].read_at) {
      message.receivers[person_index].read_at = new Date();
      this.updateMessage(message, { read: true })
    }
  }

  public buildUrl(endpoint: string, params: any) {
    const url = new URL(endpoint); // Vytvoří objekt URL
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    url.searchParams.append('filters', JSON.stringify(this.internal_filters));
    return url.toString();
  }

  public loadMessages(): void {
    const url = this.buildUrl(`${Config.API_URL}/v1/messages/list`, this.filters);

    this.http.get(
      url,
      { withCredentials: true }
    )
    .subscribe((data: any) => {
      this.messages = data.messages;
      const message_id = this.route.snapshot.queryParams['id'];
      if (this.selectedMessage) {
        const index = this.messages.findIndex((msg) => msg.message_id == this.selectedMessage?.message_id);
        this.selectMessage(index == -1 ? null : this.messages[index]);
      }
      if (message_id) {
        this.selectMessage(this.messages.find((message) => message.message_id == message_id) ?? null);
      }
    })
  }

  public getMessageHeader(message: typeof this.selectedMessage): string {
    if (!message) return '';
    switch(this.settings.list_message_header) {
      case "author":
        return message.author.full_name;
      case "draft":
        return this.l.s("messages.draft");
      case 'receivers':
        let names = message.receivers.slice(0,2);
        return names.map((name) => (name.full_name)).join(', ') + (message.receivers.length > 2 ? ` a ${message.receivers.length - 2} další příjemci` : '')
      default:
        return '';
    }
  }

  public getMessageHint(message: typeof this.selectedMessage): string {
    if (!message) return '';
    switch(this.settings.list_message_header) {
      case "author":
      case "receivers":
        return `${this.l.s('messages.sent_at')}${Utils.formatDate(message.sent_at)}`;
      case "draft":
        return `${this.l.s("messages.draft_hint")} – ${this.l.s('messages.draft_last_save')}: ${Utils.formatDate(message.sent_at)}`;
      default:
        return '';
    }
  }

  public getSeenCount(message: Message = this.selectedMessage!): number {
    return message.receivers.filter((m) => m.read_at).length ?? 0;
  }

  public getConfirmedCount(message: Message = this.selectedMessage!): number {
    return message.receivers.filter((m) => m.confirm_at).length ?? 0;
  }

  public filteredMessages(): Message[] {
    return this.messages.filter((m: Message) => 
      m.topic?.toLowerCase().includes(this.searchText.toLowerCase()) ||
      m.author.full_name.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  public continueMessage(message: Message, type: 'draft' | 'forward' | 'reply'): void {
    switch(type) {
      case "draft":
        this.messageManager.topic = message.topic || '';
        this.messageManager.message = message.message || '';
        this.messageManager.draft_id = message.message_id;
        this.messageManager.receivers = message.receivers?.length ? message.receivers?.map((receiver) => (receiver.person_id)) : [];
        this.messageManager.reply_to = null;
        break;
      case "reply":
        this.messageManager.topic = `Re: ${message.topic || ''}`;

        this.messageManager.message = `

--- ${Utils.formatDate(message.sent_at)} - ${message.author.full_name}
${message.message || ''}`
        this.messageManager.draft_id = null;
        this.messageManager.receivers = [message.author_id];
        this.messageManager.reply_to = message.message_id;
        break;
      case "forward":
        this.messageManager.topic = `Fwd: ${message.topic || ''}`;
        this.messageManager.message = `

---------- Forwarded message ---------
From: ${message.author.full_name}
Date: ${Utils.formatDate(message.sent_at)}

${message.message || ''}`
        this.messageManager.draft_id = null;
        this.messageManager.receivers = [];
        this.messageManager.reply_to = null;
        break;
    }
    
    this.router.navigate(['/messages/send']);
  }

  // ---===--- Runtime
  public ngOnInit(): void {
    this.loadMessages();

    this.modalManager.addModal(
      'delete_message',
      {
        icon: 'trash-x',
        title: 'messages.message_confirm.delete_title',
        description: 'messages.message_confirm.delete_desc',
        type: 'danger',
        closeable: true,
        width: 600,
        items: [{
          type: 'component',
          component: DeleteMessageComponent
        }]
      }
    )
  }
}
