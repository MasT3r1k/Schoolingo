import { NgClass, NgStyle } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { TabsComponent } from '@Components/Tabs/Tabs';
import { Schoolingo } from '@Schoolingo';
import { BehaviorSubject, Subscription } from 'rxjs';

type AbsenceAPI = {
  subject: string;
  absence_count: number;
  total_lessons: number;
}

@Component({
  standalone: true,
  imports: [TabsComponent, NgClass, NgStyle],
  templateUrl: './absence.component.html',
  styleUrls: ['./absence.component.css', '../../../Styles/card.css']
})
export class AbsenceComponent implements OnInit {
  constructor(
    public schoolingo: Schoolingo
  ) {}

  public absence: Record<string, { absence: number, lessons: number }> = {};
  public selectedTab: BehaviorSubject<number> = new BehaviorSubject(0);
  private listeners: Subscription[] = [];

  ngOnInit(): void {

    let userId = this.schoolingo.userService.getUser()?.person.personId;
    if (this.schoolingo.userService.getUser()?.type == 'parent') {
      userId = this.schoolingo.userService.children[this.schoolingo.userService.selectedChild].personId;
    }

    this.listeners.push(this.schoolingo.socketService.addFunction("connect").subscribe(() => {
      this.schoolingo.socketService.emit('absence:getAbsence', { userId });
    }));

    this.listeners.push(this.schoolingo.socketService.addFunction("absence:getAbsence").subscribe((data: AbsenceAPI[]) => {
      data.forEach((data: AbsenceAPI) => {
        this.absence[data.subject] = { absence: data.absence_count, lessons: data.total_lessons };
      });
    }));

    this.schoolingo.socketService.emit('absence:getAbsence', { userId });

  }

  ngOnDestroy(): void {
    this.listeners.forEach((subscribe: Subscription) => subscribe.unsubscribe());
  }

}
