import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router'; // ✅ přidat Router
import { TabsComponent } from '../../../Components/Tabs';
import { Locale } from '@Schoolingo/locale';
import { BehaviorSubject } from 'rxjs';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { LanguageComponent } from './language/language.component';
import { ThemeComponent } from './theme/theme.component';
import { SecurityComponent } from './security/security.component';
import { Settings } from '@Schoolingo/settings';

@Component({
  standalone: true,
  imports: [
    TabsComponent,
    ChangePasswordComponent,
    LanguageComponent,
    ThemeComponent,
    SecurityComponent,
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css',
})
export class SettingsComponent implements OnInit {
  public selectedTab = new BehaviorSubject<number>(0);
  public options = [
    'settings.change_password',
    'settings.language',
    'settings.theme',
    'settings.security',
  ];
  public l = inject(Locale);
  public alert: '2FAEnabled' | '' = '';
  public settings = inject(Settings);

  private route = inject(ActivatedRoute);
  private router = inject(Router); // ✅

  ngOnInit(): void {
    this.settings.init();

    // ✅ Když uživatel přepne tab → změní URL (page=...)
    this.selectedTab.subscribe((index) => {
      const option = this.options[index]; // např. 'settings.security'
      const page = option.replace('settings.', ''); // → 'security'

      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { page },
        queryParamsHandling: 'merge', // nezruší ostatní parametry v URL
      });
    });

    // ✅ Při načtení URL → nastavit správný tab
    this.route.queryParamMap.subscribe((params) => {
      const page = params.get('page'); // např. ?page=security
      if (page) {
        const index = this.options.findIndex((x) => x === `settings.${page}`);
        if (index !== -1) {
          this.selectedTab.next(index);
        }
      }
    });
  }
}
