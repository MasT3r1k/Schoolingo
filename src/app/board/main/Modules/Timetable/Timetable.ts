import { NgClass } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Schoolingo, TimetableLesson } from '@Schoolingo';
import moment from 'moment';
import { BehaviorSubject, Subscription } from 'rxjs';
import { IconsModule } from '../../../../Modules/Icons.module';

@Component({
  host: {'module': 'timetable'},
  standalone: true,
  imports: [NgClass, IconsModule],
  templateUrl: './Timetable.html',
  styleUrls: ['./Timetable.css', '../Modules.css']
})
export class TimetableComponent implements OnInit {
  constructor(
    public schoolingo: Schoolingo
  ) {}

  private listeners: Subscription[] = [];
  public day = new BehaviorSubject(moment());

  ngOnInit(): void {


    // this.listeners.push(
    //   this.schoolingo.timetableSelectedWeek.subscribe((week: moment.Moment): void => {
    //     // this.day.getValue().set('isoWeeks', week.isoWeek())
    //     this.schoolingo.refreshTimetableLessons();
    //   })
    // );
  }

  ngOnDestroy(): void {
    this.listeners.forEach((sub: Subscription) => sub.unsubscribe());
  }

  public getHours(): TimetableLesson[][] {
    let lessons = this.schoolingo.getTimetableLessons()[this.day.getValue().isoWeekday() - 1];
    if (!lessons) {
      return [];
    }

    if (lessons.length === 0 || lessons[lessons.length - 1].length === 0) {
      return [];
    }

    while (lessons[lessons.length - 1]?.[0]?.empty) {
      lessons.splice(lessons.length - 1, 1);
    }

    return lessons;
  }

}
