import { NgClass, NgStyle } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Authentication } from '@Schoolingo/authentication';
import { Config } from '@Schoolingo/config';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { permType } from '@Schoolingo/permission';
import { School } from '@Schoolingo/school';
import { Sidebar } from '@Schoolingo/sidebar';

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
  imports: [IconsModule, RouterLink, RouterLinkActive, NgStyle, NgClass, RouterOutlet],
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css', '../styles/sidebar.css']
})
export class BoardComponent implements OnInit {
  App = Config
  sidebarToggled = false;
  private router = inject(Router);
  public sidebar = inject(Sidebar);
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
      icon: 'category-plus',
      item: 'dropdown.add.request'
    },
    {
      icon: 'building-plus',
      item: 'dropdown.add.company'
    }
  ];

  childDropdown: SidebarItem[] = [
    {
      item: this.l.s('dropdown.child.son') + ' Josef Kosík',
      icon: 'male'
    },
    {
      item: this.l.s('dropdown.child.daughter') + ' Ivana Kosíková',
      icon: 'female'
    }
  ]

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
    })
  }

}
