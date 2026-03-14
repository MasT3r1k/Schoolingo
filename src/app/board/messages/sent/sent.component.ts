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

interface Receiver {
  personId: number;
  first_name: string;
  lastName: string;
  full_name: string;
  groupName: string;
  read_at: string | null;
  confirmed_at: string | null;
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
  };
  sent_at: Date;
  deleted: boolean;
  require_confirm: boolean;
  read_at: Date | null;
  confirmed_at: Date | null;
  receivers?: Receiver[];
  target_groups?: string[];
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
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);

  public messages: Message[] = [];
  public selectedMessage: Message | null = null;
  public searchText = '';
  public loading = true;

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
    if (message && !message.receivers) {
      this.http.get(`${Config.API_URL}/v1/messages/details/${message.message_id}`, { withCredentials: true })
        .subscribe((data: any) => {
          if (data && this.selectedMessage?.message_id === message.message_id) {
            this.selectedMessage.receivers = data.receivers;
            this.selectedMessage.target_groups = data.target_groups;
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
    return this.messages.filter((m: Message) => 
      m.topic?.toLowerCase().includes(this.searchText.toLowerCase()) ||
      m.author.full_name.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }
}
