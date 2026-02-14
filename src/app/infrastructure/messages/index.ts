import { permType } from '@Schoolingo/permission';
import { UploadFile } from '@Schoolingo/upload';
import { BehaviorSubject } from 'rxjs';
export interface MessageConfig {
  supported_files: string[];
  files_limit: number;
  file_max_size_in_mb: number;
  title_max_length: number;
  title_min_length: number;
  content_max_length: number;
  content_min_length: number;
}

export interface MessageType {
  label: string;
  icon?: string;
  color?: string;
  perms: permType[];
}

export interface MessageTag {
  label: string;
}

export type MessageOptions =
  | 'asPrincipal'
  | 'requireConfirmation'
  | 'copyToClassTeacher'
  | 'copyToParents'
  | 'toAll';

export enum MessageSendSecondTab {
  RECEIVERS,
  ATTACHMENTS,
}

export enum messageTypes {
  MESSAGE,
  HOMEWORK,
  EXCUSESTUDENT,
  RATESTUDENT,
  SYSTEM,
}


export type messageReceiver = {
  person_id: number;
  full_name: string;
  first_name: string;
  last_name: string;
  role: string;
  class?: string;
  classTeacher?: messageReceiver[];
  parents?: messageReceiver[];
  child: string;
  type?: 'parent';
};

export class MessageManager {
  private config!: MessageConfig;
  public setConfig(config: typeof this.config): void {
    this.config = config;
  }

  public getConfig(): typeof this.config {
    return this.config;
  }

  public types: MessageType[] = [
    {
      // 0
      label: 'message',
      icon: 'mail',
      perms: ['all'],
    },
    {
      // 1
      label: 'homework',
      icon: 'briefcase-2',
      color: 'hsl(197, 42%, 49%)',
      perms: ['student'],
    },
    {
      // 2
      label: 'excusestudent',
      icon: 'file-report',
      color: 'hsl(356, 87%, 41%)',
      perms: ['parent', ['older:18', 'student']],
    },
    {
      // 3
      label: 'ratestudent',
      icon: 'thumb-up',
      color: 'hsl(94, 54%, 38%)',
      perms: ['teacher', 'principal'],
    },
    {
      // 4
      label: 'system',
      icon: 'shield',
      color: '#608796',
      perms: ['system'],
    },
  ];

  public tags: MessageTag[] = [
    {
      label: 'messages/tags/requireConfirmation',
    },
    {
      label: 'messages/tags/important',
    },
  ];

  public options: Record<MessageOptions, boolean> = {
    asPrincipal: false,
    requireConfirmation: false,
    copyToClassTeacher: false,
    copyToParents: false,
    toAll: false,
  };

  public unreadMessage = new BehaviorSubject(12);
  public selectedChild: number | null = null;
  public messageType = new BehaviorSubject<messageTypes>(messageTypes.MESSAGE);
  public message = '';
  public topic = '';

  // Homeworks
  public selectedHomework = new BehaviorSubject(null);

  // Rate student
  public messageRating: 'positive' | 'negative' = 'positive';

  // Receivers
  public receivers: number[] = [];
  public selectedReceivers$ = new BehaviorSubject<messageReceiver[]>([]);

  // Files
  public files: UploadFile[] = [];
}
