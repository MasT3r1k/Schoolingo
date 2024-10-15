import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { Schoolingo } from '@Schoolingo';
import { TabsComponent } from '@Components/Tabs/Tabs';
import { BehaviorSubject } from 'rxjs';

@Component({
  standalone: true,
  imports: [NgClass, TabsComponent],
  templateUrl: './timetable.component.html',
  styleUrls: ['./timetable.component.css', '../../../Styles/card.css', '../../../Styles/item.css']
})
export class TimetableComponent {

  public selectedTab: BehaviorSubject<number> = new BehaviorSubject(0);

  constructor(public schoolingo: Schoolingo) {}

  ngOnInit(): void {
    this.selectedTab.subscribe((id: number) => {
      let arrayWeek: number[] = [this.schoolingo.todayWeek, this.schoolingo.todayWeek + 1, -1];
      this.schoolingo.timetableSelectedWeek.next(arrayWeek[id]);
    })
  }

}
