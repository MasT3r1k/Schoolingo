import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Authentication } from '@Schoolingo/authentication';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';

export interface SidebarItem {
  label: string;
  perms: string[];
  href: string[] | string;
}

@Component({
  imports: [RouterOutlet, IconsModule],
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css', '../../styles/sidebar.css']
})
export class UserComponent {

  l = inject(Locale);
  u = inject(Authentication);

  public sidebarItems: SidebarItem[] = [
    { label: "sidebar.account",             perms: ['all'],     href: '/user' },
    { label: "sidebar.settings",            perms: ['all'],     href: '/user/settings' },
    { label: "user.personal_information",   perms: ['all'],     href: '/user/personal' },
    { label: "user.parents",                perms: ['student'], href: '/user/parents' },
    { label: "user.devices",                perms: ['all'],     href: '/user/devices' },
    { label: "user.login_history",          perms: ['all'],     href: '/user/logins' },
    { label: "user.notifications",          perms: ['all'],     href: '/user/notifications' },
    { label: "user.connections",            perms: ['all'],     href: '/user/connections' },
    { label: "user.gdpr",                   perms: ['all'],     href: '/user/gdpr' }
  ];

}
