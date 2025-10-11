import { NgClass } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormButton, FormInput, FormManager } from '@Components/Forms/FormManager';
import { TabsComponent } from '@Components/Tabs/Tabs';
import { Schoolingo } from '@Schoolingo';
import { BehaviorSubject, Subscription } from 'rxjs';
import { ThemeSelector } from './theme/theme';
import { languages } from '@Schoolingo/Locale';
import { Modal } from '@Components/Modal/Modal';
import { TFAComponent } from './2fa/2fa.component';

@Component({
    selector: 'app-settings',
    standalone: true,
    imports: [TabsComponent, NgClass, FormManager, ThemeSelector],
    templateUrl: './settings.component.html',
    styleUrls: [
      './settings.component.css',
      '../../../Styles/card.css',
      '../../../Styles/toast.css',
      '../../../Styles/input.css'
    ]
})
export class SettingsComponent implements OnInit {
  public schoolingo = inject(Schoolingo)
  public route = inject(ActivatedRoute);
  public router = inject(Router);
  
  public listeners: Subscription[] = [];
  public selectedTab = new BehaviorSubject<number>(0);
  public options = [
    'changepassword',
    'language',
    'theme',
    'security',
    'other'
  ];

  public alert: '2FAEnabled' | '' = '';

  public TFAModal = new Modal({
    closeable: true,
    title: {
      text: 'userSettings/2faVerify'
    },
    size: 'size-1',
      items: [
        {
          type: 'component',
          component: TFAComponent,
          data: []
        }
      ]
    });

  public inputs: FormInput[] = [
      {
        type: 'password',
        name: 'oldpassword',
        placeholder: 'oldpassword',
        label: 'oldpassword',
        notes: []
      },
      {
        type: 'password',
        name: 'newpassword',
        placeholder: 'newpassword',
        label: 'newpassword',
        notes: []
      },
      {
        type: 'password',
        name: 'againNewpassword',
        placeholder: 'againNewpassword',
        label: 'againNewpassword',
        notes: []
      }
  ];
  
  public buttons: FormButton[] = [
    {
      label: 'changepassword',
      executed: 'changingpassword',
      func: () => {  }
    }
  ]

  constructor() {}

  ngOnInit(): void {
    this.listeners.push(
      this.route.queryParamMap.subscribe(
        (param: Params) => {
          // Show page
          if (param.params['page'] != undefined) {
            let id = this.options.indexOf(param.params.page);
            if (id != -1) {
              this.selectedTab.next(id)
            }
          }
        }
      )
    );

    this.listeners.push(
      this.selectedTab.subscribe((value: number) => {
        this.router.navigate([], { queryParams: { page: this.options[value] } })
      })
    );

    this.listeners.push(
      this.schoolingo.socketService.addFunction("main:update2fa").subscribe(
        (data: any) => {
          console.log(data);
          if ('error' in data) {
            switch(data.error) {
              case "no_2fa_set":
                break;
            }
          }
          if ('secret' in data && 'qr' in data) {
            this.schoolingo.userService.set2fa(data.secret, data.qr);
            this.TFAModal.open();
          }

          if ('status' in data) {
            switch(data.status) {
              case("success"):
                this.TFAModal.close();
                this.alert = '2FAEnabled';
                break;
              case("failed"):
                break;
            }
          }
        }
      )
    );
  }

  ngOnDestroy(): void {
    this.listeners.forEach((subscribe: Subscription) => subscribe.unsubscribe());
  }

  public selectLanguage(lng: languages): void {
    if (this.schoolingo.locale.getUserLocale() == lng) {return;}
    if (this.schoolingo.getOfflineMode()) {
      this.schoolingo.locale.setUserLocale(lng);
      return;
    }
    this.schoolingo.socketService.emit(
      'main:updateUser',
      {
        type: 'locale',
        lng
      }
    )
  }

  public allow2FA(): void {
    if (this.schoolingo.getOfflineMode()) {
      return;
    }
    this.schoolingo.socketService.emit(
      'main:updateUser',
      {
        type: '2fa',
        enabled: true
      }
    );
  }

  public updateSettings(name: string, value: boolean): void {
    this.schoolingo.socketService.emit(
      'main:updateUser',
      {
        type: name,
        value
      }
    );

    this.schoolingo.socketService.socket?.once(
      'user:updateSettings',
      (data) => {
        console.log(data)
      }
    )

  }

}
