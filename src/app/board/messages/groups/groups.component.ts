import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { FormsModule } from '@angular/forms';
import { Utils } from '@Schoolingo/utils';
import { HttpClient } from '@angular/common/http';
import { Config } from '@Schoolingo/config';
import { AvatarService } from '../../../infrastructure/utils/avatar.service';


interface Group {
  id: number;
  name: string;
  icon?: string;
  color?: string;
  type: 'class' | 'custom' | 'dm';
  channels: Channel[];
  unread?: number;
}

interface Channel {
  id: number;
  name: string;
  type: 'text' | 'voice';
  unread?: number;
  description?: string;
}

interface Message {
  id: number;
  sender: {
    id: number;
    name: string;
    avatar?: string;
    role: 'teacher' | 'student';
  };
  content: string;
  type: 'text' | 'homework' | 'poll' | 'file' | 'document';
  date: Date;
  attachments?: Attachment[];
  homework?: HomeworkReference;
  poll?: Poll;
  document?: DocumentReference;
  reactions?: Reaction[];
  replyTo?: number;
  edited?: boolean;
}

interface Attachment {
  id: number;
  name: string;
  size: number;
  type: string;
  url: string;
}

interface HomeworkReference {
  id: number;
  title: string;
  subject: string;
  dueDate: Date;
  status: 'pending' | 'completed';
}

interface Poll {
  id: number;
  question: string;
  options: PollOption[];
  anonymous: boolean;
  allowMultiple: boolean;
  allowText: boolean;
  endsAt?: Date;
}

interface PollOption {
  id: number;
  text: string;
  votes: number;
  voters?: number[];
}

interface DocumentReference {
  id: number;
  name: string;
  path: string;
  type: string;
}

interface Reaction {
  emoji: string;
  count: number;
  users: number[];
}

interface Member {
  id: number;
  name: string;
  avatar: string | null;
  role: 'teacher' | 'student';
  status: 'online' | 'offline' | 'away';
  statusText?: string;
}

@Component({
  selector: 'app-groups',
  standalone: true,
  imports: [CommonModule, IconsModule, FormsModule],
  templateUrl: './groups.component.html',
  styleUrl: './groups.component.css'
})
export class GroupsComponent implements OnInit {
  public l = inject(Locale);
  private http = inject(HttpClient);
  public avatarService = inject(AvatarService);
  Utils = Utils;

  // State
  public groups: Group[] = [];
  public selectedGroup: Group | null = null;
  public selectedChannel: Channel | null = null;
  public messages: Message[] = [];
  public members: Member[] = [];
  public messageInput: string = '';
  public showEmojiPicker: boolean = false;
  public showMembersSidebar: boolean = true;
  public replyingTo: Message | null = null;

  // UI State
  public showPollCreator: boolean = false;
  public showFileUpload: boolean = false;

  public showHome: boolean = false;

  get classes(): Group[] {
    return this.groups.filter(g => g.type === 'class');
  }

  get customGroups(): Group[] {
    return this.groups.filter(g => g.type !== 'class');
  }

  get teachers(): Member[] {
    return this.members.filter(m => m.role === 'teacher');
  }

  get onlineStudents(): Member[] {
    return this.members.filter(m => m.role === 'student' && m.status === 'online');
  }

  get offlineMembers(): Member[] {
    return this.members.filter(m => m.status !== 'online');
  }

  get offlineStudents(): Member[] {
    return this.members.filter(m => m.role === 'student' && m.status !== 'online');
  }

  ngOnInit(): void {
    this.loadGroups();
    // Default to Home or first group
    // this.selectHome(); 
  }

  private loadGroups(): void {
    // Mock data - replace with API call
    this.groups = [
      {
        id: 1,
        name: '4.B',
        type: 'class',
        color: '#4a9eff',
        unread: 5,
        channels: [
          { id: 1, name: 'obecné', type: 'text', description: 'Obecná diskuse třídy' },
          { id: 2, name: 'úkoly', type: 'text', unread: 3, description: 'Domácí úkoly a projekty' },
          { id: 3, name: 'materiály', type: 'text', description: 'Sdílené materiály a poznámky' },
          { id: 4, name: 'oznámení', type: 'text', description: 'Důležitá oznámení' }
        ]
      },
      {
        id: 2,
        name: 'Školní parlament',
        type: 'custom',
        icon: 'users',
        color: '#7cd67c',
        channels: [
          { id: 5, name: 'diskuse', type: 'text' },
          { id: 6, name: 'plánování', type: 'text', unread: 1 }
        ]
      },
      {
        id: 3,
        name: 'Matematika',
        type: 'custom',
        icon: 'calculator',
        color: '#ffc107',
        channels: [
          { id: 7, name: 'dotazy', type: 'text' },
          { id: 8, name: 'cvičení', type: 'text' }
        ]
      }
    ];

    if (this.groups.length > 0) {
      this.selectGroup(this.groups[0]);
    }
  }

  public selectHome(): void {
    this.selectedGroup = null;
    this.showHome = true;
    this.selectedChannel = null;
    // Load DMs logic here
  }

  public selectGroup(group: Group): void {
    this.selectedGroup = group;
    this.showHome = false;
    if (group.channels.length > 0) {
      this.selectChannel(group.channels[0]);
    }
  }

  public selectChannel(channel: Channel): void {
    this.selectedChannel = channel;
    this.loadMessages();
    this.loadMembers();
  }

  private loadMessages(): void {
    // Mock messages - replace with API call
    this.messages = [
      {
        id: 1,
        sender: { id: 1, name: 'Mgr. Jana Nováková', role: 'teacher' },
        content: 'Dobrý den, připomínám že zítra máme test z matematiky. Nezapomeňte se připravit!',
        type: 'text',
        date: new Date(Date.now() - 7200000)
      },
      {
        id: 2,
        sender: { id: 2, name: 'Petr Dvořák', role: 'student' },
        content: 'Paní učitelko, z kterých kapitol bude test?',
        type: 'text',
        date: new Date(Date.now() - 3600000),
        replyTo: 1
      },
      {
        id: 3,
        sender: { id: 1, name: 'Mgr. Jana Nováková', role: 'teacher' },
        content: 'Kapitoly 5-7, jak jsme probírali minulý týden.',
        type: 'text',
        date: new Date(Date.now() - 3000000),
        replyTo: 2
      },
      {
        id: 4,
        sender: { id: 3, name: 'Marie Svobodová', role: 'student' },
        content: 'Má někdo zápisky z páteční hodiny? Byl jsem nemocný.',
        type: 'text',
        date: new Date(Date.now() - 1800000),
        reactions: [
          { emoji: '👍', count: 2, users: [4, 5] }
        ]
      }
    ];
  }

  private loadMembers(): void {
    // Mock members - replace with API call
    this.members = [
      { id: 1, name: 'Mgr. Jana Nováková', role: 'teacher', status: 'online', statusText: 'Učím', avatar: null },
      { id: 2, name: 'Petr Dvořák', role: 'student', status: 'online', avatar: null },
      { id: 3, name: 'Marie Svobodová', role: 'student', status: 'away', statusText: 'Oběd', avatar: null },
      { id: 4, name: 'Jan Novák', role: 'student', status: 'offline', avatar: null },
      { id: 5, name: 'Eva Procházková', role: 'student', status: 'online', statusText: 'Studuji', avatar: null }
    ];
  }

  public sendMessage(): void {
    if (!this.messageInput.trim()) return;

    const newMessage: Message = {
      id: Date.now(),
      sender: { id: 999, name: 'Já', role: 'student' },
      content: this.messageInput,
      type: 'text',
      date: new Date(),
      replyTo: this.replyingTo?.id
    };

    this.messages.push(newMessage);
    this.messageInput = '';
    this.replyingTo = null;

    // TODO: Send to API
  }

  public replyToMessage(message: Message): void {
    this.replyingTo = message;
  }

  public cancelReply(): void {
    this.replyingTo = null;
  }

  public addReaction(message: Message, emoji: string): void {
    if (!message.reactions) {
      message.reactions = [];
    }

    const existing = message.reactions.find(r => r.emoji === emoji);
    if (existing) {
      existing.count++;
      existing.users.push(999); // Current user ID
    } else {
      message.reactions.push({
        emoji,
        count: 1,
        users: [999]
      });
    }

    // TODO: Send to API
  }

  public toggleMembersSidebar(): void {
    this.showMembersSidebar = !this.showMembersSidebar;
  }

  public getOnlineMembers(): Member[] {
    return this.members.filter(m => m.status === 'online');
  }

  public getOfflineMembers(): Member[] {
    return this.members.filter(m => m.status === 'offline' || m.status === 'away');
  }

  public getMessageById(id: number): Message | undefined {
    return this.messages.find(m => m.id === id);
  }

  public formatTime(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);

    if (hours < 1) {
      const minutes = Math.floor(diff / 60000);
      return `před ${minutes} min`;
    } else if (hours < 24) {
      return `před ${hours} h`;
    } else {
      return date.toLocaleDateString('cs-CZ');
    }
  }
}
