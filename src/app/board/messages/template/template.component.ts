import { NgClass } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CheckboxComponent } from '@Components/Checkbox';
import { Authentication } from '@Schoolingo/authentication';
import { Config } from '@Schoolingo/config';
import { DropdownManager } from '@Schoolingo/dropdown';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { AvatarService, Utils } from '@Schoolingo/utils';

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
    show_files: true
  }
  @Input() filters = {};
  @Input() message_actions: MessageAction[] = [];

  public internal_filters = {
    order: 'newest_to_oldest',
    show_suppress: false,
  };

  // ---===--- Imports
  public math = Math;
  public l = inject(Locale);
  public Utils = Utils;
  public dropdownManager = inject(DropdownManager);
  public avatarService = inject(AvatarService);
  public auth = inject(Authentication);
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  
  // ---===--- Local Variables
  public isMultiSelect = false;
  public multiSelected: Message[] = [];
  public searchText = '';
  public selectedMessage: Message | null = null;
  public messages: Message[] = [];

  // ---===--- Functions
  public toggleMultiSelect(): void {
    this.isMultiSelect = !this.isMultiSelect;
    this.multiSelected = [];
    this.selectedMessage = null;
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
      this.http.post(
        `${Config.API_URL}/v1/messages/update`,
        { message_id: message.message_id, read: true },
        { withCredentials: true }
      )
      .subscribe((data) => console.log(data));
    }
  }

  public buildUrl(endpoint: string, params: any) {
    const url = new URL(endpoint); // Vytvoří objekt URL
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    url.searchParams.append('filters', JSON.stringify(this.internal_filters));
    return url.toString();
  }

  public loadMessages(): void {
    const url = this.buildUrl(`${Config.API_URL}/v1/messages/list`,
      this.filters
    );
    this.http.get(
      url,
      { withCredentials: true }
    )
    .subscribe((data: any) => {
      this.messages = data.messages;
      const message_id = this.route.snapshot.queryParams['id'];
      if (message_id) {
        this.selectedMessage = this.messages.find((message) => message.message_id == message_id) ?? null;
      }
      console.log(data);
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
        return names.map((name) => (name.full_name)).join(', ')
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
        return `${this.l.s("messages.draft_hint")} &ndash; ${this.l.s('messages.draft_last_save')}: ${Utils.formatDate(message.sent_at)}`;
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

  // ---===--- Runtime
  public ngOnInit(): void {
    this.loadMessages()
  }
}
