import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { Schoolingo } from '@Schoolingo';
import { MessageManager, MessageType, messageTypes } from '@Schoolingo/Messages';
import { Permission } from '@Schoolingo/Permissions';
import { BehaviorSubject, Subscription } from 'rxjs';
import { ModalSelectReceivers } from '../modals/selectReceivers/selectReceivers';
import { Modal } from '@Components/Modal/Modal';
import { TabsComponent } from '@Components/Tabs/Tabs';
import { AppConfig } from '@Schoolingo/App';
import { IconsModule } from '../../../Modules/Icons.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Alert } from '@Schoolingo/Alert';
import { AlertComponent } from '@Components/Alert/Alert';

@Component({
  standalone: true,
  imports: [NgClass, TabsComponent, IconsModule, FormsModule, ReactiveFormsModule, AlertComponent],
  templateUrl: './send.component.html',
  styleUrls: ['./send.component.css', '../../../Styles/card.css', '../../../Styles/input.css']
})
export class SendComponent {

  AppConfig = AppConfig;
  messageTypes = messageTypes;
  subscribers: Subscription[] = [];

  public alerts: { [key: string]: Alert } = {};

  // Tab
  public selectedTab = new BehaviorSubject<number>(0);

  // Selecting options
  public showSelect: 'messagetype' | 'homework' | 'children' | 'rating' | null = null;

  // Options
  public excuseAllDay = false;

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
    public perms: Permission,
    public messageManager: MessageManager
  ){}

  ngOnInit(): void {
    this.subscribers.push(this.selectedTab.subscribe((tab: number) => {
      this.alerts = {};
    }));
  }

  public sendMessage(): void {
    this.alerts = {};
    let type = this.messageManager.messageType.getValue();
    if (!this.perms.checkPermission(this.messageManager.types[type].perms)) {
      this.alerts.main = new Alert('error', 'messages/noTypeAccess');

      return;
    }
    let message = this.messageManager.message;
    if (message == '') {
      this.alerts.message = new Alert('error', 'required');
    }
    switch(type) {
      case messageTypes.MESSAGE:
        if (this.messageManager.topic == '') {
          this.alerts.topic = new Alert('error', 'required');
        }
        break;
      case messageTypes.HOMEWORK:
        if (!this.schoolingo.homeworks.list.length) {
          this.alerts.main = new Alert('error', 'messages/homeworks/empty');
        }
        if (this.messageManager.selectedHomework.getValue() == null) {
          this.alerts.homework = new Alert('error', 'required');
        }
        break;
      case messageTypes.EXCUSESTUDENT:
        break;
      case messageTypes.RATESTUDENT:
        break;
      case messageTypes.SYSTEM:
        break;
    }
    if (Object.keys(this.alerts).length > 0) return;
  }

  public getMessageTypes(): MessageType[] {
    return this.messageManager.types.filter((type: MessageType) => this.perms.checkPermission(type.perms));
  }

  public checkMessageType(types: messageTypes[]): boolean {
    return types.includes(this.messageManager.messageType.getValue());
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
