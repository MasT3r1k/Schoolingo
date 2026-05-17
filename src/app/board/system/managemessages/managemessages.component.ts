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
import { AvatarService } from '../../../infrastructure/utils/avatar.service';
import { MessageTemplateSettings, TemplateComponent } from '../../messages/template/template.component';

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
    avatar: string | any;
  };
  sent_at: Date;
  deleted: boolean;
  require_conform: boolean;
  read_at: Date | null;
  confirmed_at: Date | null;
  files: {
    file_id: number;
    file_uuid: string;
    name: string;
    file_format: string;
    file_size: number;
    mime_type: string;
  }[];
}

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule, TemplateComponent],
  templateUrl: './managemessages.component.html',
  styleUrls: ['./managemessages.component.css', '../../messages/messages.css']
})
export class ManagemessagesComponent {
  public actions = [];
  public settings: MessageTemplateSettings = {
    no_items: 'messages.no_messages',
    list_message_header: 'author',
    select_item_title: 'messages.select_message',
    select_item_description: 'messages.select_message_desc',
    show_receivers: true,
    show_receivers_detailed: true,
    show_files: true
  };
}
