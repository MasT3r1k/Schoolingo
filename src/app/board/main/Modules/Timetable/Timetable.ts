import { NgClass } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Schoolingo, TimetableLesson } from '@Schoolingo';
import { user } from '@Schoolingo/User';
import moment from 'moment';
import { BehaviorSubject, Subscription } from 'rxjs';

@Component({
  host: {'module': 'timetable'},
  standalone: true,
  imports: [NgClass],
  templateUrl: './Timetable.html',
  styleUrls: ['./Timetable.css', '../Modules.css']
})
export class TimetableComponent implements OnInit {
  constructor(
    public schoolingo: Schoolingo
  ) {}

  private listeners: Subscription[] = [];
  public day: BehaviorSubject<moment.Moment> = new BehaviorSubject<moment.Moment>(moment());

  ngOnInit(): void {

    this.listeners.push(this.day.subscribe((val: moment.Moment) => {
      if (this.schoolingo.timetableSelectedWeek.getValue() === val.isoWeek()) return;
      this.schoolingo.timetableSelectedWeek.next(val.isoWeek());
    }));

    this.listeners.push(this.schoolingo.timetableSelectedWeek.subscribe((week: number): void => {
      this.day.next(this.day.getValue().set('isoWeeks', week));
    }));
  }

  ngOnDestroy(): void {
    this.listeners.forEach((sub: Subscription) => sub.unsubscribe());
  }

  public getHours(): TimetableLesson[][] {
    let lessons = this.schoolingo.getTimetableLessons()[this.day.getValue().isoWeekday() - 1];
    if (!lessons) {
      return [];
    }
    while (lessons[lessons.length - 1][0].empty) {
      lessons.splice(lessons.length - 1, 1);
    }

    return lessons;
  }

}
