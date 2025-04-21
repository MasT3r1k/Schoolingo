import { NgClass, NgStyle } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { TabsComponent } from '@Components/Tabs/Tabs';
import { Schoolingo } from '@Schoolingo';
import { Utils } from '@Schoolingo/Utils';
import { Country } from 'country-state-city';
import { BehaviorSubject, Subscription } from 'rxjs';
import { Profile, SidebarItem } from './profile';
import { Permission } from '@Schoolingo/Permissions';
import { IconsModule } from '../../../Modules/Icons.module';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  imports: [TabsComponent, NgClass, IconsModule, NgStyle, RouterLink],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css', '../../../Styles/card.css', '../../../Styles/input.css', '../../../Styles/sidebar.css']
})
export class ProfileComponent implements OnInit {
  public listeners: Subscription[] = [];
  public sidebar = new BehaviorSubject<number>(0);
  public sidebarItems: SidebarItem[] = [
    { label: "user/tabs/profile/myAccount", perms: ['all'] },
    { label: "user/personalInformation", perms: ['all'] },
    { label: "user/tabs/profile/parents", perms: ['student'] },
    { label: "user/notifications", perms: ['all'] },
    { label: "user/connections", perms: ['all'] },
    { label: "sidebar/gdpr", perms: ['all'] }
  ];
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
      this.schoolingo.socketService
      .addFunction("connect")
      .subscribe(() => {
        this.schoolingo.socketService.emit("settings:profile");
      })
    );
    this.listeners.push(
      this.schoolingo.socketService
      .addFunction("settings:profile")
      .subscribe((data: any) => {
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
