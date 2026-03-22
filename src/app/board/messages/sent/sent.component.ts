import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { Authentication } from '@Schoolingo/authentication';
import { Utils } from '@Schoolingo/utils';
import { HttpClient } from '@angular/common/http';
import { Config } from '@Schoolingo/config';
import { ActivatedRoute } from '@angular/router';
import { AvatarService } from '../../../infrastructure/utils/avatar.service';


interface Receiver {
  person_id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  groupName?: string;
  read_at?: string | null;
  confirmed_at?: string | null;
  avatar?: string | null;
}

interface Message {
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
  read_at: Date | null;
  confirmed_at: Date | null;
  receivers?: Receiver[];
  target_groups?: string[];
  attachments?: any[];
}

@Component({
  imports: [FormsModule, IconsModule, NgClass],
  templateUrl: './sent.component.html',
  styleUrls: ['./sent.component.css', '../messages.css']
})

export class SentComponent implements OnInit {
  Utils = Utils;
  
  public l = inject(Locale);
  public auth = inject(Authentication);
  public avatarService = inject(AvatarService);
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);

  public messages: Message[] = [];
  public selectedMessage: Message | null = null;
  public searchText = '';
  public loading = true;
  public Config = Config;
  public showAttachments = false;

  ngOnInit(): void {
    this.http.get(
      `${Config.API_URL}/v1/messages/list?author_ids=${this.auth.getUser().person_id}`,
      { withCredentials: true }
    )
    .subscribe((data: any) => {
      this.messages = data.messages;
      console.log(this.route.snapshot.queryParams)
      const message_id = this.route.snapshot.queryParams['id'];
      if (message_id) {
        const msg = this.messages.find((message) => message.message_id == message_id) ?? null;
        if (msg) this.selectMessage(msg);
      }
      console.log(data);
    })

    this.route.queryParams.subscribe((data) => {
      const message_id = data['id'];
      const msg = this.messages.find((message) => message.message_id == message_id) ?? null;
      if (msg) this.selectMessage(msg);
    })
  }

  public selectMessage(message: Message | null): void {
    this.selectedMessage = message;
    this.showAttachments = false;
    if (message && (!message.target_groups)) {
      this.http.get(`${Config.API_URL}/v1/messages/details/${message.message_id}`, { withCredentials: true })
        .subscribe((data: any) => {
          if (data && this.selectedMessage?.message_id === message.message_id) {
            // Mychame to s detailem API
            Object.assign(this.selectedMessage, { target_groups: data.target_groups });
          }
        });
    }
  }

  public getReadCount(): number {
    return this.selectedMessage?.receivers?.filter(r => r.read_at).length ?? 0;
  }

  public getConfirmedCount(): number {
    return this.selectedMessage?.receivers?.filter(r => r.confirmed_at).length ?? 0;
  }

  public get filteredMessages(): Message[] {
    return this.messages.filter((m: Message) => {
      const topicMatch = m.topic?.toLowerCase().includes(this.searchText.toLowerCase());
      const receiverMatch = m.receivers?.some(r => r.full_name?.toLowerCase().includes(this.searchText.toLowerCase()));
      return topicMatch || receiverMatch;
    });
  }

  public getReceiversText(message: Message | null): string {
    if (!message || !message.receivers || message.receivers.length === 0) return '';
    if (message.receivers.length === 1) return message.receivers[0].full_name;
    if (message.receivers.length <= 2) return message.receivers.map(r => r.full_name).join(', ');
    const extraCount = message.receivers.length - 1;
    let extraText = 'dalších';
    if (extraCount === 1) extraText = 'další';
    if (extraCount >= 2 && extraCount <= 4) extraText = 'další';
    return `${message.receivers[0].full_name} a ${extraCount} ${extraText}`;
  }

  public getReceiverAvatar(message: Message | null): string {
    if (!message || !message.receivers || message.receivers.length === 0) return this.avatarService.getAvatar(null, '?');
    return this.avatarService.getAvatar(message.receivers[0].avatar || null, message.receivers[0].full_name);
  }
}
