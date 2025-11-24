import { NgClass, NgStyle } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Authentication } from '@Schoolingo/authentication';
import { Config } from '@Schoolingo/config';
import { ContextMenu } from '@Schoolingo/context-menu';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { MarkConfig } from '@Schoolingo/marks';
import { MarksManager } from '@Schoolingo/marks';
import { MessageConfig, MessageManager } from '@Schoolingo/messages';
import { permType } from '@Schoolingo/permission';
import { School } from '@Schoolingo/school';
import { Sidebar } from '@Schoolingo/sidebar';
import { DiaryWeek, Traineeship } from '@Schoolingo/traineeship';
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

@Component({
  standalone: true,
  imports: [IconsModule, RouterLink, RouterLinkActive, NgStyle, NgClass, RouterOutlet],
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css', '../styles/sidebar.css']
})
export class BoardComponent implements OnInit {
  App = Config
  sidebarToggled = false;
  private router = inject(Router);
  public sidebar = inject(Sidebar);
  private marks = inject(MarksManager);
  private messages = inject(MessageManager);
  private http = inject(HttpClient);
  private traineeship = inject(Traineeship);
  public context_menu = inject(ContextMenu);
  school = inject(School);
  
  l = inject(Locale);
  u = inject(Authentication);

  dropdown: 'add' | 'child' | 'user' | '' = '';

  addDropdown: SidebarItem[] = [
    {
      icon: 'mail',
      item: 'dropdown.add.message',
      url: "/messages/send"
    },
    {
      icon: 'home-plus',
      item: 'dropdown.add.homework'
    },
    {
      icon: 'calendar-week',
      item: 'dropdown.add.event'
    },
    {
      icon: 'note',
      item: 'dropdown.add.note'
    },
    {
      icon: 'clipboard-plus',
      item: 'dropdown.add.anketa'
    },
    {
      icon: 'number-1',
      item: 'dropdown.add.mark'
    },
    {
      icon: 'ambulance',
      item: 'dropdown.add.excuse'
    },
    {
      icon: 'category-plus',
      item: 'dropdown.add.request'
    },
    {
      icon: 'building-plus',
      item: 'dropdown.add.company'
    }
  ];

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
