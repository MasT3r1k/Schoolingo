import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { IconsModule } from '@Schoolingo/icons';

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
