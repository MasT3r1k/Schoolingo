import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { Schoolingo } from '@Schoolingo';
import { MessageType, messageTypes } from '@Schoolingo/Messages';
import { Permission } from '@Schoolingo/Permissions';
import { BehaviorSubject } from 'rxjs';
import { ModalSelectReceivers } from '../modals/selectReceivers/selectReceivers';
import { Modal } from '@Components/Modal/Modal';
import { TabsComponent } from '@Components/Tabs/Tabs';
import { AppConfig } from '@Schoolingo/App';

@Component({
  standalone: true,
  imports: [NgClass, TabsComponent],
  templateUrl: './send.component.html',
  styleUrls: ['./send.component.css', '../../../Styles/card.css', '../../../Styles/input.css']
})
export class SendComponent {

  AppConfig = AppConfig;

  // Tab
  public selectedTab = new BehaviorSubject(0);

  // Selecting options
  public showSelect: 'messagetype' | 'homework' | null = null;

  // MESSAGE TYPE
  public messageType = new BehaviorSubject(0);

  // HOMEWORKS
  public selectedHomework = new BehaviorSubject(0);

  // Options
  public excuseAllDay = false;
  public asPrincipal = false;
  public requireConfirmation = false;
  public copyToClassTeacher = false;
  public copyToParents = false;

  // Modals
  public selectReceiversModal = new Modal({
    closeable: true,
    title: {
      text: "messages/receiver"
    },
    size: 'size-1',
    items: [
      {
        type: 'component',
        component: ModalSelectReceivers,
        data: []
      }
    ]
  });

  constructor(
    public schoolingo: Schoolingo,
    public perms: Permission
  ){}

  public getMessageTypes(): MessageType[] {
    return this.schoolingo.messages.types.filter((type: MessageType) => this.perms.checkPermission(type.perms));
  }

  public checkMessageType(types: messageTypes[]): boolean {
    return types.includes(this.messageType.getValue());
  }

  public selectReceivers(): void {
    this.selectReceiversModal.open();
  }

  public selectTags(): void {
    console.log("SELECT TAAAGS");
  }

  public selectAttachments(): void {
    console.log("SELECT ATTACHMEEENTS")
  }

}
