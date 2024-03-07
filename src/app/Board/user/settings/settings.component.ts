import { Tabs } from '@Components/Tabs/Tabs';
import { Modals } from '@Components/modals/modals';
import { Schoolingo } from '@Schoolingo';
import { FormError } from '@Schoolingo/FormManager';
import { Locale, languages } from '@Schoolingo/Locale';
import { SocketService } from '@Schoolingo/Socket';
import { Theme } from '@Schoolingo/Theme';
import { UserMain, UserService } from '@Schoolingo/User';
import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css', '../../board.css', '../../../input.css']
})
export class SettingsComponent {
  public tabName: string = 'Settings';

  public changedPassword: boolean = false;
  private isChangingPassword: boolean = false;
  public old_password = new FormControl('');
  public password = new FormControl('');
  public password2 = new FormControl('');

  public formErrors: FormError[] = [];
  public errorFilter(name: string): string | false {
      let filter = this.formErrors.filter((err) => err.input == name);
      return (filter.length == 0) ? false : filter[0].locale;
  }

  constructor(
    public locale: Locale,
    private userService: UserService,
    public tabs: Tabs,
    public theme: Theme,
    public socketService: SocketService,
    public modals: Modals,
    public schoolingo: Schoolingo
  ) {

    this.socketService.addFunction("updateUser", (data: any) => {
      this.isChangingPassword = false;
      console.log(data);
      if (!data.message) return;

      if (data.status === 0) {
        switch(data.message) {
          case "wrong_password":
            this.formErrors.push({ input: 'old_password', locale: 'wrong_password' });
            break;
        }
        return;
      }
      if (data.status === 1) {
        switch(data.message) {
          case "password_changed":
            this.changedPassword = true;
            break;
          case "locale_changed":
            if (data.lng === undefined) return;
            this.locale.setUserLocale(data.lng);
            this.tabs.setTabValue(this.tabName, this.tabs.getTabValue(this.tabName));
            break;
        }
      }
    });

  }

  public getUser(): UserMain {
    return this.userService.getUser() as UserMain;
  }

/**
 * CHANGE PASSWORD
 */

  public changePassword(): void {
    this.formErrors = [];
    if (this.schoolingo.getOfflineMode()) { return }
    this.isChangingPassword = true;
    if (this.old_password.value == '') {
      this.formErrors.push({ input: 'old_password', locale: 'required' });
    }

    if (this.password.value == '') {
      this.formErrors.push({ input: 'password', locale: 'required' });
    }

    if (this.password2.value == '') {
      this.formErrors.push({ input: 'password2', locale: 'required' });
    }

    if (this.old_password.value == this.password.value) {
      this.formErrors.push({ input: 'password', locale: 'is_same' });
      this.formErrors.push({ input: 'password2', locale: 'is_same' });
    }

    if (this.password.value != this.password2.value) {
      this.formErrors.push({ input: 'password', locale: 'not_same' });
      this.formErrors.push({ input: 'password2', locale: 'not_same' });
    }

    if (this.formErrors.length > 0) {this.isChangingPassword = false;return;}
    this.socketService.getSocket().Socket?.emit('updateUser', { type: 'password', old: this.old_password.value, new: this.password.value });
  }

  public getChangingPasswordText(): string {
    return (this.isChangingPassword === true) ? '<div class=\'btn-loader mr\'></div> ' + this.locale.getLocale('changingpassword') : this.locale.getLocale('changepassword');
  }


/**
 * CHANGE LANGUAGE
 */

  public selectLanguage(lng: languages): void {
    if (this.locale.getUserLocale() == lng) {return;}
    if (this.schoolingo.getOfflineMode()) {
      this.locale.setUserLocale(lng);
      this.tabs.setTabValue(this.tabName, this.tabs.getTabValue(this.tabName));
      return;
    }
    this.socketService.getSocket().Socket?.emit('updateUser', { type: 'locale', lng })
  }

}
