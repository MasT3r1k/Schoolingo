import { NgClass, NgStyle } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Authentication } from '@Schoolingo/authentication';
import { Config } from '@Schoolingo/config';
import { ContextMenu } from '@Schoolingo/context-menu';
import { DropdownManager } from '@Schoolingo/dropdown';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { MarkConfig } from '@Schoolingo/marks';
import { MarksManager } from '@Schoolingo/marks';
import { MessageConfig, MessageManager } from '@Schoolingo/messages';
import { Permission, permType } from '@Schoolingo/permission';
import { School } from '@Schoolingo/school';
import { Sidebar } from '@Schoolingo/sidebar';
import { DiaryWeek, Traineeship } from '@Schoolingo/traineeship';
import { Utils } from '@Schoolingo/utils';
import moment from 'moment';

export interface SidebarItem {
    item: string;
    type?: 'default' | 'danger';
    icon?: string;
    url?: string;
    permission?: permType[];
    children?: SidebarItem[];
    badge?: any;
    modules?: string[];
    action?: Function;
}

const notification_types: Record<string, any> = {
  message: {
    color: "#4aa3ff",
    icon: "message",
    title: "Nová zpráva",
    url: "/messages/received",
    close_after_action: true,
    description: "Dostal jste novou zprávu od %name%."
  },
  login: {
    color: "#ff5757",
    icon: "lock",
    title: "Neznámé přihlášení",
    description: "Zaznamenali jsme nové přihlášení z neznámého zařízení."
  },
  homework: {
    color: "#7cd67c",
    icon: "book-2",
    title: "Nový domácí úkol",
    description: "Byl přidán nový úkol z předmětu %subject%."
  },
  reward: {
    color: "#f5d142",
    icon: "trophy",
    title: "Nová odměna",
    description: "Za splněné aktivity máš novou odměnu."
  }
}

interface Notification {
  type: string;
  data: any;
  action: any;
  is_read: boolean;
  created_at: Date;
}

@Component({
  standalone: true,
  imports: [IconsModule, RouterLink, RouterLinkActive, NgStyle, NgClass, RouterOutlet],
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css', '../styles/sidebar.css']
})
export class BoardComponent implements OnInit {
  public dropdownManager = inject(DropdownManager);
  App = Config
  Utils = Utils;
  sidebarToggled = false;
  public notification_count = 0;
  public cookies_visibled = true;
  private router = inject(Router);
  public sidebar = inject(Sidebar);
  public sidebarClickHandler(item: SidebarItem, index: number): void {
    if (item.url) {
      this.sidebar.sidebarToggled = false;
      this.dropdownManager.selected_dropdown = '';
      this.sidebar.toggleDropdown(index)
    }
  }
  private marks = inject(MarksManager);
  private messages = inject(MessageManager);
  private http = inject(HttpClient);
  private perm = inject(Permission);
  private traineeship = inject(Traineeship);
  public context_menu = inject(ContextMenu);
  school = inject(School);
  
  l = inject(Locale);
  u = inject(Authentication);

  public notifications_types = notification_types;
  public notifications: Notification[] = [
    {
      type: 'message',
      data: {
        name: "MgA. Jakub Pizinger"
      },
      action: {
        id: "5"
      },
      is_read: false,
      created_at: new Date()
    },
    {
      type: 'login',
      data: {},
      action: {},
      is_read: true,
      created_at: new Date()
    },
    {
      type: 'homework',
      data: {
        subject: "Matematika"
      },
      action: {
        id: ""
      },
      is_read: true,
      created_at: new Date()
    },
    {
      type: 'reward',
      data: {},
      action: {},
      is_read: true,
      created_at: new Date()
    }
  ];

  public getNotificationText(notification: Notification): string {
    let text = this.notifications_types[notification.type].description;
    Object.entries(notification.data).forEach((data) => {
      text = text.replaceAll(`%${data[0]}%`, data[1]);
    })

    return text;
  }

  // dropdown: 'add' | 'notification' | 'child' | 'user' | '' = '';

  private addDropdownConfig: SidebarItem[] = [
    {
      icon: 'mail',
      item: 'dropdown.add.message',
      url: "/messages/send",
      permission: ['all']
    },
    {
      icon: 'home-plus',
      item: 'dropdown.add.homework',
      permission: ['teacher']
    },
    {
      icon: 'calendar-week',
      item: 'dropdown.add.event',
      permission: ['teacher']
    },
    {
      icon: 'note',
      item: 'dropdown.add.note',
      permission: ['all']
    },
    {
      icon: 'clipboard-plus',
      item: 'dropdown.add.anketa',
      permission: ['teacher']
    },
    {
      icon: 'number-1',
      item: 'dropdown.add.mark',
      permission: ['teacher']
    },
    {
      icon: 'ambulance',
      item: 'dropdown.add.excuse',
      permission: ['parent', 'older:18']
    },
    {
      icon: 'category-plus',
      item: 'dropdown.add.request',
      permission: ['manager:admin']
    },
    {
      icon: 'building-plus',
      item: 'dropdown.add.company',
      permission: ['manager:traineeship:manage']
    }
  ];

  public addDropdown: SidebarItem[] = [];
  public buildAddDropdown(): void {
    this.addDropdownConfig.forEach((item) => {
      if (this.perm.checkPermission(item.permission)) {
        this.addDropdown.push(item);
      }
    })
  }

  userDropdown: SidebarItem[] = [
    {
      item: 'sidebar.account',
      icon: 'user',
      action: () => {
        this.router.navigate(['', 'user'])
      }
    },
    {
      item: 'sidebar.settings',
      icon: 'settings-2',
      action: () => {
        this.router.navigate(['', 'user', 'settings'])
      }
    },
    {
      item: 'user.logout',
      type: 'danger',
      icon: 'logout',
      action: () => {
        this.u.logout()
      }
    }
  ];

  ngOnInit(): void {
    this.u.getAuthState().subscribe((data) => {
      this.sidebar.build();    
      if (data) {
        // === Update add dropdown ===
        this.buildAddDropdown();

        // === Get traineeship weeks ===
        this.http.get(
          `${Config.API_URL}/v1/traineeship/diary_weeks`,
          { withCredentials: true }
        )
        .subscribe((data) => {
          if ('error' in data) {
            return;
          }

          if (!Array.isArray(data)) return;

          this.traineeship.diaryWeeks.next(
            data.map((_) => ({
              ..._,
              start: moment(_.start),
              end: moment(_.end)
            })) as DiaryWeek[]
          );
        });

        this.http.get(
          `${Config.API_URL}/v1/marks/config`,
          { withCredentials: true }
        )
        .subscribe((data) => {
          if ('error' in data) {
            return;
          }

          this.marks.setConfig(data as MarkConfig);
        })

        this.http.get(
          `${Config.API_URL}/v1/messages/config`,
          { withCredentials: true }
        )
        .subscribe((data) => {
          if ('error' in data) {
            return;
          }

          this.messages.setConfig(data as MessageConfig);
        })
      }
    })
  }

  public getUserRole(): string {
    let roles = [this.l.s('roles.' + this.u.getRole())];
    if (this.u.getUser().manager == -1) {
      roles.push(this.l.s('roles.manager'))
    }

    return roles.join(', ');
  }

}
