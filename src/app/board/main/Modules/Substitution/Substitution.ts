import { NgClass } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Schoolingo, Substitution, TimetableLesson } from '@Schoolingo';
import moment from 'moment';
import { BehaviorSubject, Subscription } from 'rxjs';
import { IconsModule } from '../../../../Modules/Icons.module';

@Component({
  host: {'module': 'Substitution'},
  standalone: true,
  imports: [NgClass, IconsModule],
  templateUrl: './Substitution.html',
  styleUrls: ['./Substitution.css', '../Modules.css']
})
export class SubstitutionComponent implements OnInit {
  public listeners: Subscription[] = [];

  constructor(
    public schoolingo: Schoolingo
  ) {}

  public date = new BehaviorSubject(moment().startOf('isoWeek'));

  public getDescription(substitution: Substitution): string {
    let date: moment.Moment = substitution.date;

    if (substitution.subjectId && this.schoolingo.subjects[substitution.subjectId]) {
      let teacher = this.schoolingo.getPerson(substitution.teacherId);
      return `${this.schoolingo.locale.getLocale('sidebar/teach/substitution')}: ${this.schoolingo.subjects[substitution.subjectId][0]} (${teacher?.lastName} ${teacher?.firstName})`;
    } else if (!substitution.subjectId) {
      let lesson = this.schoolingo.getTimetableLessons()?.[date.get('isoWeekday') - 1]?.[substitution.hour - 1]?.[0];
      if (lesson) {
        let teacher = this.schoolingo.getPerson(lesson?.oldTeacher)
        return `${this.schoolingo.locale.getLocale('timetable/cancelled')} (${lesson?.oldSubject?.[1]}, ${teacher?.lastName} ${teacher?.firstName})`;
      }
    }
    return '';
  }

  ngOnInit(): void {
    this.listeners.push(
      this.schoolingo.timetableSelectedWeek.subscribe((week: moment.Moment) => {
        this.date.next(week.clone().startOf('isoWeek'));
      })
    );
  }

  ngOnDestroy(): void {
    this.listeners.forEach((sub: Subscription) => sub.unsubscribe());
  }
}
