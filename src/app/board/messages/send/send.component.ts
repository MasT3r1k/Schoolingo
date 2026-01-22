import { Component, inject, OnInit } from '@angular/core';
import { Config } from '@Schoolingo/config';
import { Locale } from '@Schoolingo/locale';
import {
  MessageManager,
  messageReceiver,
  MessageSendSecondTab,
  MessageType,
  messageTypes,
} from '@Schoolingo/messages';
import { Permission } from '@Schoolingo/permission';
import { BehaviorSubject, Subscription } from 'rxjs';
import { Alert } from '../../../infrastructure/alert/alert';
import { Homeworks } from '@Schoolingo/homeworks';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '@Schoolingo/icons';
import { Authentication } from '@Schoolingo/authentication';
import { HttpClient } from '@angular/common/http';
import { DropdownManager } from '@Schoolingo/dropdown';
import { Utils } from '@Schoolingo/utils';
import { ModalManager } from '@Schoolingo/modal';
import { UploadFilesComponent } from './modals/upload-files/upload-files.component';

@Component({
  imports: [
    FormsModule,
    IconsModule
  ],
  templateUrl: './send.component.html',
  styleUrl: './send.component.css',
})
export class SendComponent implements OnInit {
  AppConfig = Config;
  messageTypes = messageTypes;
  MessageSendSecondTab = MessageSendSecondTab;
  subscribers: Subscription[] = [];

  // === Injections ===
  public auth = inject(Authentication);
  public l = inject(Locale);
  public perms = inject(Permission);
  public messageManager = inject(MessageManager);
  public dropdownManager = inject(DropdownManager);
  private modalManager = inject(ModalManager);
  public homeworks = inject(Homeworks);
  private http = inject(HttpClient);
  public Utils = Utils;


  // === Alerts ===
  public alerts: Record<string, Alert> = {};

  // === Tabs ===
  public selectedOptionTab = new BehaviorSubject<number>(0);

  // === UI ===
  public isHiddenRightCard = false;

  // === Options ===
  public excuseAllDay = false;
  public config: any = {};

  // === Receivers ===
  public selectedReceivers: messageReceiver[] = [];
  public showSelectedReceivers = false;
  public receiverFilter = '';
  public receivers: messageReceiver[] = [];

  // === Files ===
  public files: File[] = [];

  // === Receiver handling ===
  public toggleReceiverSelection(receiver: messageReceiver): void {
    const index = this.selectedReceivers.findIndex((r) => r.person_id === receiver.person_id);
    if (index > -1) {
      this.selectedReceivers.splice(index, 1);
    } else {
      this.selectedReceivers.push(receiver);
    }
  }

  public getSelectedReceivers(): messageReceiver[] {
    const receiversMap: Map<number, messageReceiver> = new Map();

    this.selectedReceivers.forEach((receiver: messageReceiver) => {
      // přidáme třídní učitele
      if (
        this.messageManager.options.copyToClassTeacher &&
        receiver.classTeacher
      ) {
        for (let classteacher of receiver.classTeacher) {
          if (!receiversMap.has(classteacher.person_id) && this.auth.getUser().personId != classteacher.person_id) {
            receiversMap.set(classteacher.person_id, {
              ...classteacher,
              role: 'teacher'
            });
          }
        }
      }

      // přidáme hlavního příjemce
      receiversMap.set(receiver.person_id, receiver);

      // přidáme rodiče
      if (this.messageManager.options.copyToParents && receiver.parents) {
        for (let parent of receiver.parents) {
          if (!receiversMap.has(parent.person_id)) {
            receiversMap.set(
              parent.person_id,
              {
                ...parent,
                child: receiver.full_name,
                role: 'parent',
                type: 'parent'
              });
          }
        }
      }
    });

    return Array.from(receiversMap.values());
  }

  public isReceiverSelected(receiver: messageReceiver): boolean {
    return this.getSelectedReceivers().some((r) => r.person_id === receiver.person_id);
  }

  public removeSelectedReceiver(id: number): void {
    const idx = this.selectedReceivers.findIndex((r) => r.person_id === id);
    if (idx > -1) this.selectedReceivers.splice(idx, 1);
  }

  public getReceiverById(id: number): messageReceiver | undefined {
    return this.receivers.find((r) => r.person_id === id);
  }

  public getCountOfReceiverType(type: string): number {
    return this.selectedReceivers.filter((r) => r.role === type).length;
  }

  // === Lifecycle ===
  ngOnInit(): void {
    this.subscribers.push(
      this.messageManager.messageType.subscribe(() => {
        setTimeout(() => this.selectedOptionTab.next(0), 300);
      })
    );

    // Load recipients
    this.http
      .post<messageReceiver[]>(
        `${Config.API_URL}/v1/messages/recipients`,
        { message_type: this.messageManager.messageType.getValue() },
        { withCredentials: true }
      )
      .subscribe((rows) => (this.receivers = rows));

    // Load message config
    this.http
      .get<any>(`${Config.API_URL}/v1/messages/config`, {
        withCredentials: true,
      })
      .subscribe((data) => {
        if (!('error' in data)) this.config = data;
      });

    this.modalManager.addModal(
      'sendMessage_files',
      {
        title: 'messages.attachments',
        closeable: true,
        items: [
          { type: 'component', component: UploadFilesComponent }
        ]
      }
    )
  }

  // === Sending message ===
  public sendMessage(): void {
    this.alerts = {};

    const type = this.messageManager.messageType.getValue();
    if (!this.perms.checkPermission(this.messageManager.types[type].perms)) {
      this.alerts['main'] = new Alert('error', 'messages/noTypeAccess');
      return;
    }

    const message = this.messageManager.message;
    if (!message.trim().length) {
      this.alerts['message'] = new Alert('error', 'form.required');
    }

    switch (type) {
      case messageTypes.MESSAGE:
        if (!this.messageManager.topic.trim().length) {
          this.alerts['topic'] = new Alert('error', 'form.required');
        }
        break;
      case messageTypes.HOMEWORK:
        if (!this.homeworks.list.length) {
          this.alerts['main'] = new Alert('error', 'messages/homeworks/empty');
        }
        if (this.messageManager.selectedHomework.getValue() == null) {
          this.alerts['homework'] = new Alert('error', 'form.required');
        }
        break;
    }

    if (Object.keys(this.alerts).length > 0) return;

    const payload = {
      content: message,
      receivers: this.selectedReceivers.map((r) => r.person_id),
      attachments: this.messageManager.attachments,
    };

    this.http
      .post<{ status: boolean; messageId?: number; error?: string }>(
        `${Config.API_URL}/v1/messages/messages/send`,
        payload,
        { withCredentials: true }
      )
      .subscribe({
        next: (res) => {
          if (res?.status) {
            this.messageManager.message = '';
            this.messageManager.topic = '';
            this.messageManager.attachments = [];
            this.selectedReceivers = [];
            this.alerts['main'] = new Alert('success', 'messages/sent');
          } else {
            this.alerts['main'] = new Alert(
              'error',
              res?.error || 'unknown_error'
            );
          }
        },
        error: () => {
          this.alerts['main'] = new Alert('error', 'network_error');
        },
      });
  }

  // === Helpers ===
  public getMessageTypes(): MessageType[] {
    return this.messageManager.types.filter((type) =>
      this.perms.checkPermission(type.perms)
    );
  }

  public checkMessageType(types: messageTypes[]): boolean {
    return types.includes(this.messageManager.messageType.getValue());
  }

  public openFiles(): void {
    this.modalManager.openModal('sendMessage_files')
  }
}
