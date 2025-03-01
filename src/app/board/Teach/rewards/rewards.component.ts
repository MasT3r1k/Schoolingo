import { Component } from '@angular/core';
import { TabsComponent } from '@Components/Tabs/Tabs';
import { Schoolingo } from '@Schoolingo';
import { BehaviorSubject } from 'rxjs';

@Component({
  standalone: true,
  imports: [TabsComponent],
  templateUrl: './rewards.component.html',
  styleUrl: './rewards.component.css'
})
export class RewardsComponent {
  public selectedTab = new BehaviorSubject<number>(0);

  constructor(
    public schoolingo: Schoolingo
  ){}
}
