import { Component, inject } from '@angular/core';
import { Config } from '@Schoolingo/config';
import { Locale } from '@Schoolingo/locale';
import { MessageManager, MessageSendSecondTab, MessageType, messageTypes } from '@Schoolingo/messages';
import { Permission } from '@Schoolingo/permission';
import { BehaviorSubject, Subscription } from 'rxjs';
import { Alert } from '../../../infrastructure/alert/alert';
import { Homeworks } from '@Schoolingo/homeworks';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { IconsModule } from '@Schoolingo/icons';
import { Authentication } from '@Schoolingo/authentication';
import { TabsComponent } from '../../../Components/Tabs';
import { AlertComponent } from '@Components/Alert';

@Component({
  imports: [FormsModule, NgClass, IconsModule, TabsComponent, AlertComponent],
  templateUrl: './send.component.html',
  styleUrl: './send.component.css'
})
export class SendComponent {
  AppConfig = Config;
  messageTypes = messageTypes;
  MessageSendSecondTab = MessageSendSecondTab;
  subscribers: Subscription[] = [];
  // Imports
  public auth = inject(Authentication);
  public l = inject(Locale);
  public perms = inject(Permission);
  public messageManager = inject(MessageManager);
  public homeworks = inject(Homeworks);

  // Alerts
  public alerts: any = {};

  // Tab
  public selectedTab = new BehaviorSubject<number>(0);
  public selectedOptionTab = new BehaviorSubject<number>(0);

  // Selecting options
  public showSelect: 'messagetype' | 'homework' | 'children' | 'rating' | null = null;

  // Options
  public excuseAllDay = false;

  // Receivers
  public selectedReceivers: number[] = [];
  public receivers: { id: number, name: string, tag: string }[] = [{
    id: 1,
    name: 'John Doe',
    tag: 'Žák 1.B'
  }, {
    id: 2,
    name: 'Jane Smith',
    tag: 'Rodič John Doe'
  }, {
    id: 3,
    name: 'Alice Johnson',
    tag: 'Učitel'
  }];

  public toggleReceiverSelection(receiverId: number): void {
    const index = this.selectedReceivers.indexOf(receiverId);
    if (index > -1) {
      this.selectedReceivers.splice(index, 1);
    } else {
      this.selectedReceivers.push(receiverId);
    }
  }

  public isReceiverSelected(receiverId: number): boolean {
    return this.selectedReceivers.includes(receiverId);
  }

  // Modals
  ngOnInit(): void {
    this.subscribers.push(
      this.selectedTab.subscribe((tab: number) => {
        this.alerts = {};
      })
    );

    this.subscribers.push(
      this.messageManager.messageType.subscribe((tab: number) => {
        setTimeout(() => this.selectedOptionTab.next(0), 300)
      })
    )
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
        if (!this.homeworks.list.length) {
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
    // this.selectReceiversModal.open();
  }
}
