import { NgClass } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { TabsComponent } from '@Components/Tabs/Tabs';
import { Schoolingo } from '@Schoolingo';
import { BehaviorSubject, Subscription } from 'rxjs';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [TabsComponent, NgClass],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css', '../../../Styles/card.css']
})
export class SettingsComponent implements OnInit {
  public selectedTab: BehaviorSubject<number> = new BehaviorSubject(0);
  public options: string[] = ['changepassword', 'language', 'theme'];

  constructor(
    public schoolingo: Schoolingo
  ) {}

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
  }

}
