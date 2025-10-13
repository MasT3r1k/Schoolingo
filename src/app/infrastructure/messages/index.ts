import { permType } from '@Schoolingo/permission';
import { BehaviorSubject } from 'rxjs';
export interface MessageType {
    label: string;
    icon?: string;
    color?: string;
    perms: permType[];
};
  
export interface MessageTag {
    label: string;
}

export type MessageOptions = 'asPrincipal' | 'requireConfirmation' | 'copyToClassTeacher' | 'copyToParents' | 'toAll';

export enum MessageSendSecondTab {
  RECEIVERS,
  ATTACHMENTS
}

export enum messageTypes {
  MESSAGE,
  HOMEWORK,
  EXCUSESTUDENT,
  RATESTUDENT,
  SYSTEM
}

export class MessageManager {

  public types: MessageType[] = [
    {       // 0
      label: 'message',
      icon: 'mail',
      perms: ['all']
    }, {    // 1
      label: 'homework',
      icon: 'briefcase-2',
      color: 'hsl(197, 42%, 49%)',
      perms: ['student']
    }, {    // 2
      label: 'excusestudent',
      icon: 'file-report',
      color: 'hsl(356, 87%, 41%)',
      perms: ['parent', ['older:18', 'student']]
    }, {    // 3
      label: 'ratestudent',
      icon: 'thumb-up',
      color: 'hsl(94, 54%, 38%)',
      perms: ['teacher', 'principal']
    }, {    // 4
      label: 'system',
      icon: 'shield',
      color: '#608796',
      perms: ['system']
    }
  ];

  public tags: MessageTag[] = [
    {
      label: "messages/tags/requireConfirmation"
    },
    {
      label: "messages/tags/important"
    }
  ];

  public options: Record<MessageOptions, boolean> = {
    asPrincipal: false,
    requireConfirmation: false,
    copyToClassTeacher: false,
    copyToParents: false,
    toAll: false
  };

  public unreadMessage = new BehaviorSubject(12);
  public selectedChild: number | null = null;
  public messageType = new BehaviorSubject<messageTypes>(messageTypes.MESSAGE);
  public message = "";
  public topic = "";
  
  // Homeworks
  public selectedHomework = new BehaviorSubject(null);

  // Rate student
  public messageRating: 'positive' | 'negative' = 'positive';

  // Receivers
  public receivers: number[] = [];
}