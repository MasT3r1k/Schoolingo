import { Component, inject, OnInit } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '@Schoolingo/icons';
import { Authentication } from '@Schoolingo/authentication';
import { Utils } from '@Schoolingo/utils';
import { Message, MessageTemplateSettings, TemplateComponent } from '../template/template.component';
import { ModalManager } from '@Schoolingo/modal';
import { DeleteMessageComponent } from './modals/delete-message/delete-message.component';

@Component({
  imports: [FormsModule, IconsModule, NgClass, TemplateComponent],
  templateUrl: './sent.component.html',
  styleUrls: ['./sent.component.css', '../messages.css']
})

export class SentComponent implements OnInit {
  private modalManager = inject(ModalManager);
  public auth = inject(Authentication);

  Utils = Utils;
  
  public settings: MessageTemplateSettings = {
    no_items: 'messages.no_messages',
    list_message_header: 'receivers',
    select_item_title: 'messages.select_message',
    select_item_description: 'messages.select_message_desc',
    show_receivers: true,
    show_receivers_detailed: true,
    show_files: true
  }

  public actions = [
    {
      label: 'messages.delete',
      icon: 'trash-x',
      type: 'danger',
      isVisible: (message: Message, self: TemplateComponent) => { return self.getSeenCount(message) == 0 },
      run: (message: Message, event: any) => { this.deleteMessage(message, event) }
    },
    {
      label: 'messages.forward',
      icon: 'arrow-forward-up',
      type: 'secondary',
      isVisible: (message: Message) => { return true },
      run: (message: Message, event: any) => { console.log('CLICKED primary button') }
    }
  ];


  public deleteMessage(message: Message, event: MouseEvent): void {
    event.stopPropagation();
    this.modalManager.openModal('delete_message', {
      message,
      onDeleted: (message_id: number) => {
      }
    });
  }

  ngOnInit(): void {
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
    );
  }
}
