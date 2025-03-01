import { Component } from '@angular/core';
import { TabsComponent } from '@Components/Tabs/Tabs';
import { Schoolingo } from '@Schoolingo';
import { BehaviorSubject } from 'rxjs';

@Component({
  standalone: true,
  imports: [TabsComponent],
  templateUrl: './homeworks.component.html',
  styleUrls: ['./homeworks.component.css', '../../../Styles/card.css']
})
export class HomeworksComponent {
  public selectedTab = new BehaviorSubject<number>(0);
  constructor(
    public schoolingo: Schoolingo
  ) {}
}
