import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { FormsModule } from '@angular/forms';

interface Group {
  id: number;
  name: string;
  icon?: string;
  type: 'class' | 'custom';
  channels: Channel[];
}

interface Channel {
  id: number;
  name: string;
  type: 'text' | 'voice';
  unread?: number;
}

interface Message {
  id: number;
  sender: {
    name: string;
    avatar?: string;
    role: string;
  };
  content: string;
  date: Date;
  attachments?: any[];
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
  public groups: Group[] = [];
  public selectedGroup: Group | null = null;
  public selectedChannel: Channel | null = null;
  public messages: Message[] = [];
  public messageInput: string = '';

  ngOnInit(): void {
    this.groups = [
      {
        id: 1,
        name: '4.B',
        type: 'class',
        channels: [
          { id: 1, name: 'obecné', type: 'text' },
          { id: 2, name: 'úkoly', type: 'text', unread: 3 },
          { id: 3, name: 'materiály', type: 'text' }
        ]
      },
      {
        id: 2,
        name: 'Školní parlament',
        type: 'custom',
        icon: 'users',
        channels: [
          { id: 4, name: 'diskuse', type: 'text' },
          { id: 5, name: 'plánování', type: 'text' }
        ]
      }
    ];

    this.selectGroup(this.groups[0]);
  }

  public selectGroup(group: Group): void {
    this.selectedGroup = group;
    if (group.channels.length > 0) {
      this.selectChannel(group.channels[0]);
    }
  }

  public selectChannel(channel: Channel): void {
    this.selectedChannel = channel;
    // Mock messages
    this.messages = [
      {
        id: 1,
        sender: { name: 'Petr Novák', role: 'student' },
        content: 'Ahoj, máte někdo zápisky z dnešní matiky?',
        date: new Date(Date.now() - 3600000)
      },
      {
        id: 2,
        sender: { name: 'Jana Dvořáková', role: 'student' },
        content: 'Jo, pošlu ti to.',
        date: new Date(Date.now() - 1800000)
      }
    ];
  }

  public getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  public sendMessage(): void {
    if (!this.messageInput.trim()) return;
    
    this.messages.push({
      id: Date.now(),
      sender: { name: 'Já', role: 'student' },
      content: this.messageInput,
      date: new Date()
    });
    this.messageInput = '';
  }
}
