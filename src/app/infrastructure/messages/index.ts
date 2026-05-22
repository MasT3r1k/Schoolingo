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
  value: number;
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
  | 'copyToStudents'
  | 'toAll';

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
  members?: number[];
  child: string;
  type?: 'parent';
};

export interface RatingType {
  label: string;
  value: string;
  type: 'positive' | 'negative';
}

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
      label: 'messages.types.message',
      value: messageTypes.MESSAGE,
      perms: ['all'],
    },
    {
      // 1
      label: 'messages.types.homework',
      value: messageTypes.HOMEWORK,
      perms: ['student'],
    },
    {
      // 2
      label: 'messages.types.excusestudent',
      value: messageTypes.EXCUSESTUDENT,
      perms: ['parent', ['older:18', 'student']],
    },
    {
      // 3
      label: 'messages.types.ratestudent',
      value: messageTypes.RATESTUDENT,
      perms: ['teacher', 'principal'],
    },
    {
      // 4
      label: 'messages.types.system',
      value: messageTypes.SYSTEM,
      perms: ['system'],
    },
  ];

  public ratingTypes: RatingType[] = [
    { label: 'messages.ratings.activity', value: 'activity', type: 'positive' },
    { label: 'messages.ratings.homework', value: 'homework', type: 'positive' },
    { label: 'messages.ratings.disturbing', value: 'disturbing', type: 'negative' },
    { label: 'messages.ratings.supplies', value: 'supplies', type: 'negative' },
    { label: 'messages.ratings.mobile', value: 'mobile', type: 'negative' },
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
    copyToStudents: false,
    toAll: false,
  };

  public unreadMessage = new BehaviorSubject(12);
  public selectedChild: number | null = null;
  public message_type: messageTypes = messageTypes.MESSAGE;
  public message = '';
  public topic = '';
  public draft_id: number | null = null;
  public reply_to: number | null = null;

  // Homeworks
  public selectedHomework = new BehaviorSubject(null);

  // Rate student
  public selected_rating_type = 0;

  // Receivers
  public receivers: number[] = [];
  public selectedReceivers$ = new BehaviorSubject<messageReceiver[]>([]);
  public activeCategory$ = new BehaviorSubject<string | null>(null);

  // Files
  public files: UploadFile[] = [];
}
