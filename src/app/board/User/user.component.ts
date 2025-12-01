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
export class UserComponent {}
