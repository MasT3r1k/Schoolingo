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

  public compareSubjects(from: TimetableLesson[][] = [], to: TimetableLesson[][] = []): string[] {
    let fromSubjects: string[] = [];
    let subjects: string[] = [];
    from.forEach((lesson: TimetableLesson[]) => {
      if (!fromSubjects.includes(lesson[0].subjectName)) {
        fromSubjects.push(lesson[0].subjectName);
      }
    });
    to.forEach((lesson: TimetableLesson[]) => {
      if (!subjects.includes(lesson[0].subjectName) && !fromSubjects.includes(lesson[0].subjectName) && lesson[0].subjectName != '') {
        subjects.push(lesson[0].subjectName);
      }
    });
    fromSubjects = [];
    return subjects;
  }

}
