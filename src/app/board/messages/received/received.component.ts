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
  public auth = inject(Authentication);

  Utils = Utils;

  public settings: MessageTemplateSettings = {
    no_items: 'messages.no_messages',
    list_message_header: 'author',
    select_item_title: 'messages.select_message',
    select_item_description: 'messages.select_message_desc',
    show_receivers: false,
    show_files: true,
    add_header_padding: true
  }

  public actions = [
    {
      label: 'messages.reply',
      icon: 'arrow-back-up',
      type: 'secondary',
      isVisible: (message: Message) => { return true },
      run: (message: Message, event: any, self: TemplateComponent) => { self.continueMessage(message, 'reply') }
    },
    {
      label: 'messages.suppress',
      icon: 'ban',
      type: 'secondary',
      isVisible: (message: Message, self: TemplateComponent) => { return message && message.receivers[self.findIndexReceiverOfMessage(message, this.auth.getUser().person_id)].suppress_at == null },
      run: (message: Message, event: any, self: TemplateComponent) => { self.updateMessage(message, { suppress: true }) }
    },
    {
      label: 'messages.unsuppress',
      icon: 'ban',
      type: 'secondary',
      isVisible: (message: Message, self: TemplateComponent) => { return message && message.receivers[self.findIndexReceiverOfMessage(message, this.auth.getUser().person_id)].suppress_at !== null },
      run: (message: Message, event: any, self: TemplateComponent) => { self.updateMessage(message, { suppress: false }) }
    },
    {
      label: 'messages.confirm_read',
      icon: 'check',
      type: 'primary',
      isVisible: (message: Message, self: TemplateComponent) => { return message && message.require_confirm && message.receivers[self.findIndexReceiverOfMessage(message, this.auth.getUser().person_id)].confirm_at == null },
      run: (message: Message, event: any, self: TemplateComponent) => { self.updateMessage(message, { confirm: true }) }
    },
    {
      label: 'messages.forward',
      icon: 'arrow-forward-up',
      type: 'secondary',
      isVisible: (message: Message) => { return true },
      run: (message: Message, event: any, self: TemplateComponent) => { self.continueMessage(message, 'forward') }
    }
  ];

  public multi_actions = [
    {
      label: 'messages.suppress',
      icon: 'ban',
      type: 'secondary',
      isVisible: (messages: Message[], self: TemplateComponent) => { return messages && messages.filter((msg) => msg.receivers[self.findIndexReceiverOfMessage(msg, this.auth.getUser().person_id)].suppress_at == null).length },
      run: (messages: Message[], event: any, self: TemplateComponent) => {
        for(let i = 0;i < messages.length;i++) {
          self.updateMessage(messages[i], { suppress: true });
        }
      }
    },
    {
      label: 'messages.unsuppress',
      icon: 'ban',
      type: 'secondary',
      isVisible: (messages: Message[], self: TemplateComponent) => { return messages && messages.filter((msg) => msg.receivers[self.findIndexReceiverOfMessage(msg, this.auth.getUser().person_id)].suppress_at !== null).length },
      run: (messages: Message[], event: any, self: TemplateComponent) => {
        for(let i = 0;i < messages.length;i++) {
          self.updateMessage(messages[i], { suppress: false });
        }
      }
    },
    {
      label: 'messages.mark_read_confirm',
      icon: 'check',
      type: 'success',
      isVisible: (messages: Message[]) => { return messages },
      run: (messages: Message[], event: any, self: TemplateComponent) => {
        for(let i = 0;i < messages.length;i++) {
          self.updateMessage(messages[i], { read: true, confirm: true })
        }
      }
    },
    {
      label: 'messages.mark_read',
      icon: 'inbox',
      type: 'primary',
      isVisible: (messages: Message[]) => { return messages },
      run: (messages: Message[], event: any, self: TemplateComponent) => {
        for(let i = 0;i < messages.length;i++) {
          self.updateMessage(messages[i], { read: true })
        }
      }
    }
  ]


  ngOnInit(): void {
  }
}
