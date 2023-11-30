import { Tabs } from '@Components/Tabs/Tabs';
import { Locale } from '@Schoolingo/Locale';
import { UserMain, UserService } from '@Schoolingo/User';
import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css', '../../board.css', '../../../login/login.component.css']
})
export class SettingsComponent {
  public tabName: string = 'Settings';

  old_password = new FormControl('');
  password = new FormControl('');
  password2 = new FormControl('');

  public errorFilter(name: string): boolean {
    return false;
  }

  constructor(
    public locale: Locale,
    private userService: UserService,
    public tabs: Tabs
  ) {}

  public getUser(): UserMain {
    return this.userService.getUser() as UserMain;
  }

}
