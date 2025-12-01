import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { Authentication } from '@Schoolingo/authentication';
import { Utils } from '@Schoolingo/utils';
import { HttpClient } from '@angular/common/http';
import { Config } from '@Schoolingo/config';
import { ActivatedRoute } from '@angular/router';

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
  require_conform: boolean;
  read_at: Date | null;
  confirmed_at: Date | null;
}

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule],
  templateUrl: './received.component.html',
  styleUrls: ['./received.component.css', '../messages.css']
})
export class ReceivedComponent implements OnInit {
  Utils = Utils;

  public l = inject(Locale);
  public auth = inject(Authentication);
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);

  public messages: Message[] = [];
  public selectedMessage: Message | null = null;
  public searchText = '';

  ngOnInit(): void {
    this.http.get(
      `${Config.API_URL}/v1/messages/received`,
      { withCredentials: true }
    )
    .subscribe((data: any) => {
      this.messages = data.messages;
      console.log(this.route.snapshot.queryParams)
      const message_id = this.route.snapshot.queryParams['id'];
      if (message_id) {
        this.selectedMessage = this.messages.find((message) => message.message_id == message_id) ?? null;
      }
      console.log(data);
    })

    this.route.queryParams.subscribe((data) => {
      const message_id = data['id'];
      this.selectMessage(this.messages.find((message) => message.message_id == message_id) ?? null);
    })
  }

  public selectMessage(message: Message | null): void {
    this.selectedMessage = message;
    if (message != null && !message.read_at) {
      message.read_at = new Date();
      this.http.post(
        `${Config.API_URL}/v1/messages/update`,
        { message_id: message.message_id, read: true },
        { withCredentials: true }
      )
      .subscribe((data) => console.log(data));
    }
  }

  public get filteredMessages(): Message[] {
    return this.messages.filter((m: Message) => 
      m.topic?.toLowerCase().includes(this.searchText.toLowerCase()) ||
      m.author.full_name.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }
}
