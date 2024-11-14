import { NgClass } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormButton, FormInput, FormManager } from '@Components/Forms/FormManager';
import { TabsComponent } from '@Components/Tabs/Tabs';
import { Schoolingo } from '@Schoolingo';
import { BehaviorSubject, Subscription } from 'rxjs';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [TabsComponent, NgClass, FormManager],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css', '../../../Styles/card.css']
})
export class SettingsComponent implements OnInit {

  public listeners: Subscription[] = [];
  public selectedTab: BehaviorSubject<number> = new BehaviorSubject(0);
  public options: string[] = ['changepassword', 'language', 'theme'];

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

  constructor(
    public schoolingo: Schoolingo,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.listeners.push(this.route.queryParamMap.subscribe((param: Params) => {
      // Show page
      if (param['params']['page'] != undefined) {
        let id = this.options.indexOf(param['params']['page']);
        if (id != -1) {
          this.selectedTab.next(id)
        }
      }
    }));

    this.listeners.push(this.selectedTab.subscribe((value: number) => {
      this.router.navigate(["", "user", "settings"], { queryParams: { page: this.options[value] } })
    }));
  }

  ngOnDestroy(): void {
    this.listeners.forEach((subscribe: Subscription) => subscribe.unsubscribe());
  }

}
