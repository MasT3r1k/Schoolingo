import { Component, OnInit } from '@angular/core';
import { TimetableLesson } from '@Schoolingo';
import { Schoolingo } from '@Schoolingo';
import moment from 'moment';
import { BehaviorSubject, Subscription } from 'rxjs';

@Component({
  host: {'module': 'Backpack'},
  standalone: true,
  imports: [],
  templateUrl: './Backpack.html',
  styleUrls: ['./Backpack.css', '../Modules.css']
})
export class BackpackComponent implements OnInit {

  constructor(
    public schoolingo: Schoolingo
  ) {}

  private listeners: Subscription[] = [];
  public day: BehaviorSubject<moment.Moment> = new BehaviorSubject<moment.Moment>(moment());

  ngOnInit(): void {
    this.listeners.push(this.day.subscribe((val: moment.Moment) => {
      this.schoolingo.timetableSelectedWeek.next(val.isoWeek());
    }));
  }

  ngOnDestroy(): void {
    this.listeners.forEach((sub: Subscription) => sub.unsubscribe());
  }

  public compareSubjects(type: 'takeout' | 'give'): string[] {
    /*TODO: Skip empty daaays */
    let listSubjects: string[][] = [[], []];
    let lessons = this.schoolingo.getTimetableLessons()[this.day.getValue().clone().subtract(1, 'day').weekday()];
    let lessonsNextDay = this.schoolingo.getTimetableLessons()[this.day.getValue().clone().weekday()];
    if (lessons) {
      lessons.forEach((lesson: TimetableLesson[]) => {
        if (lesson[0].subjectName == "") return;
        listSubjects[0].push(lesson[0].subjectName);
      });
    }
    if (lessonsNextDay) {
      lessonsNextDay.forEach((lesson: TimetableLesson[]) => {
        if (lesson[0].subjectName == "") return;
        listSubjects[1].push(lesson[0].subjectName);
      });
    }
  
    let subjects: string[] = [];
    let id: number = type == 'takeout' ? 0 : 1;
    for(let i = 0;i < listSubjects[id].length;i++) {
      if (!subjects.includes(listSubjects[id][i]) && !listSubjects[id ? 0 : 1].includes(listSubjects[id][i])) {
        subjects.push(listSubjects[id][i]);
      }
    }

    return subjects;
  }

}
