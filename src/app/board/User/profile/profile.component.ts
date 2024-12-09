import { NgClass } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { TabsComponent } from '@Components/Tabs/Tabs';
import { Schoolingo } from '@Schoolingo';
import { Utils } from '@Schoolingo/Utils';
import { Country } from 'country-state-city';
import moment from 'moment';
import { BehaviorSubject, Subscription } from 'rxjs';
import { Profile } from './profile';

@Component({
  standalone: true,
  imports: [TabsComponent, NgClass],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css', '../../../Styles/card.css']
})
export class ProfileComponent implements OnInit {
  public listeners: Subscription[] = [];
  public selectedTab: BehaviorSubject<number> = new BehaviorSubject(0);
  country = Country;
  Utils = Utils;

  public profile!: Profile;

  constructor(
    public schoolingo: Schoolingo
  ) {}

  ngOnInit(): void {
    this.schoolingo.socketService.emit("settings:profile");
    this.listeners.push(this.schoolingo.socketService.addFunction("connect").subscribe(() => {
      this.schoolingo.socketService.emit("settings:profile");
    }));
    this.listeners.push(this.schoolingo.socketService.addFunction("settings:profile").subscribe((data: any) => {
      console.log(data[0])
      data[0].birthday = moment(data[0].birthday);
      if (data[0].passwordChanged != null) {
        data[0].passwordChanged = moment(data[0].passwordChanged);
      }
      this.profile = data[0];
      console.log(data);
    }));
  }

  ngOnDestroy(): void {
    this.listeners.forEach((sub: Subscription) => sub.unsubscribe());
  }
}
