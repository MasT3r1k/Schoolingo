import { Tabs } from '@Components/Tabs/Tabs';
import { Modals } from '@Components/modals/modals';
import { Locale } from '@Schoolingo/Locale';
import { SocketService } from '@Schoolingo/Socket';
import { Theme } from '@Schoolingo/Theme';
import { UserMain, UserService } from '@Schoolingo/User';
import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { formError } from 'src/app/login/login.component';

@Component({
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css', '../../board.css', '../../../input.css']
})
export class SettingsComponent {
  public tabName: string = 'Settings';

  old_password = new FormControl('');
  password = new FormControl('');
  password2 = new FormControl('');

  public formErrors: formError[] = [];
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
    public modals: Modals
  ) {

    this.socketService.addFunction("updateUser", (data: any) => {
      console.log(data);
    });

  }

  public getUser(): UserMain {
    return this.userService.getUser() as UserMain;
  }

  public changePassword(): void {
    this.formErrors = [];
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
    }

    if (this.password.value != this.password2.value) {
      this.formErrors.push({ input: 'password2', locale: 'not_same' });
    }

    if (this.formErrors.length > 0) return;
    this.socketService.getSocket().Socket?.emit('updateUser', { type: 'password', old: this.old_password.value, new: this.password.value });
  }

}
