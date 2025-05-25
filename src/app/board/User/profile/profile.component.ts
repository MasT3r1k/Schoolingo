import { NgClass, NgStyle } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { TabsComponent } from '@Components/Tabs/Tabs';
import { Schoolingo } from '@Schoolingo';
import { Utils } from '@Schoolingo/Utils';
import { Country } from 'country-state-city';
import { BehaviorSubject, Subscription } from 'rxjs';
import { Profile, SidebarItem } from './profile.d';
import { Permission } from '@Schoolingo/Permissions';
import { IconsModule } from '../../../Modules/Icons.module';
import { RouterLink } from '@angular/router';

export enum SidebarContent {
  "myAccount",
  "settings",
  "personalInfo",
  "parents",
  "loginHistory",
  "devices",
  "notifications",
  "connections",
  "gdpr"
}

@Component({
  standalone: true,
  imports: [TabsComponent, NgClass, IconsModule, NgStyle, RouterLink],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css', '../../../Styles/card.css', '../../../Styles/input.css', '../../../Styles/sidebar.css']
})
export class ProfileComponent implements OnInit {
  SidebarContent = SidebarContent;

  public listeners: Subscription[] = [];
  public sidebar = new BehaviorSubject<SidebarContent>(0);
  public sidebarItems: SidebarItem[] = [
    { label: "user/tabs/profile/myAccount", perms: ['all'],     content: SidebarContent.myAccount },
    { label: "userSettings/title",          perms: ['all'],     content: SidebarContent.settings },
    { label: "user/personalInformation",    perms: ['all'],     content: SidebarContent.personalInfo },
    { label: "user/tabs/profile/parents",   perms: ['student'], content: SidebarContent.parents },
    { label: "sidebar/user/devices",        perms: ['all'],     content: SidebarContent.devices },
    { label: "sidebar/user/loginHistory",   perms: ['all'],     content: SidebarContent.loginHistory },
    { label: "user/notifications",          perms: ['all'],     content: SidebarContent.notifications },
    { label: "user/connections",            perms: ['all'],     content: SidebarContent.connections },
    { label: "sidebar/gdpr",                perms: ['all'],     content: SidebarContent.gdpr }
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
