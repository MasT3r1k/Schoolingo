import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '@Schoolingo/icons';
import { Authentication } from '@Schoolingo/authentication';
import { Utils } from '@Schoolingo/utils';
import { Message, MessageTemplateSettings, TemplateComponent } from '../template/template.component';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule, TemplateComponent],
  templateUrl: './received.component.html',
  styleUrls: ['./received.component.css', '../messages.css']
})

export class ReceivedComponent implements OnInit {
  Utils = Utils;

  public settings: MessageTemplateSettings = {
    no_items: 'messages.no_messages',
    list_message_header: 'author',
    select_item_title: 'messages.select_message',
    select_item_description: 'messages.select_message_desc',
    show_receivers: false,
    show_files: true
  }

  public actions = [
    {
      label: 'messages.reply',
      icon: 'arrow-back-up',
      type: 'secondary',
      isVisible: (message: Message) => { return true },
      run: (message: Message, event: any) => { console.log('CLICKED danger button') }
    },
    {
      label: 'messages.suppress',
      icon: 'circle-off',
      type: 'secondary',
      isVisible: (message: Message) => { return true },
      run: (message: Message, event: any) => { console.log('CLICKED danger button') }
    },
    {
      label: 'messages.confirm_read',
      icon: 'check',
      type: 'primary',
      isVisible: (message: any) => { return message && message.require_confirm && message.confirmed_at == null },
      run: (message: any, event: any) => { console.log('CLICKED danger button') }
    },
    {
      label: 'messages.forward',
      icon: 'arrow-forward-up',
      type: 'secondary',
      isVisible: (message: any) => { return true },
      run: (message: any, event: any) => { console.log('CLICKED primary button') }
    }
  ];

  public auth = inject(Authentication);

  ngOnInit(): void {
  }
}
