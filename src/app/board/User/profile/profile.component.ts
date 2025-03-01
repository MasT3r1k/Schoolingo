import { NgClass } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { TabsComponent } from '@Components/Tabs/Tabs';
import { Schoolingo } from '@Schoolingo';
import { Utils } from '@Schoolingo/Utils';
import { Country } from 'country-state-city';
import { BehaviorSubject, Subscription } from 'rxjs';
import { Profile } from './profile';
import { Permission } from '@Schoolingo/Permissions';
import { IconsModule } from '../../../Modules/Icons.module';

@Component({
  standalone: true,
  imports: [TabsComponent, NgClass, IconsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css', '../../../Styles/card.css']
})
export class ProfileComponent implements OnInit {
  public listeners: Subscription[] = [];
  public selectedTab = new BehaviorSubject<number>(0);
  country = Country;
  Utils = Utils;

  public profile!: Profile;

  constructor(
    public schoolingo: Schoolingo,
    public perms: Permission
  ) {}

  ngOnInit(): void {
    this.schoolingo.socketService.emit("settings:profile");
    this.listeners.push(
      this.schoolingo.socketService.addFunction("connect").subscribe(() => {
        this.schoolingo.socketService.emit("settings:profile");
      })
    );
    this.listeners.push(
      this.schoolingo.socketService.addFunction("settings:profile").subscribe((data: any) => {
        if (data.length == 0) return;
        data[0].birthday = Utils.makeMoment(data[0].birthday);
        if (data[0].passwordChanged != null) {
          data[0].passwordChanged = Utils.makeMoment(data[0].passwordChanged);
        }
        this.profile = data[0];
      })
    );
  }

  public getOptions(): string[] {
    let arr = ["user/tabs/profile/main"];
    if (this.perms.checkPermission(["student"])) {
      arr.push("user/tabs/profile/parents");
    }
    return arr;
  }

  ngOnDestroy(): void {
    this.listeners.forEach((sub: Subscription) => sub.unsubscribe());
  }
}
