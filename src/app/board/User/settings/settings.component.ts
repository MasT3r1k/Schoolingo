import { Component, inject, OnInit } from '@angular/core';
import { TabsComponent } from '@Components/tabs/tabs';
import { Locale } from '@Schoolingo/locale';
import { BehaviorSubject } from 'rxjs';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { LanguageComponent } from './language/language.component';
import { ThemeComponent } from './theme/theme.component';
import { SecurityComponent } from './security/security.component';
import { Settings } from '@Schoolingo/settings';

@Component({
  imports: [TabsComponent, ChangePasswordComponent, LanguageComponent, ThemeComponent, SecurityComponent],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent implements OnInit {
  public selectedTab = new BehaviorSubject<number>(0);
  public options = ['settings.change_password', 'settings.language', 'settings.theme', 'settings.security'];
  public l = inject(Locale);
  public alert: '2FAEnabled' | '' = '';
  public settings = inject(Settings);

  constructor() {}
  ngOnInit(): void {

    this.settings.init();

  }
  ngOnDestroy(): void {}
}
