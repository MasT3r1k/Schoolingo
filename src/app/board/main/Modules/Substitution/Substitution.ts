import { NgClass } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Schoolingo, Substitution, TimetableLesson } from '@Schoolingo';
import moment from 'moment';
import { BehaviorSubject } from 'rxjs';

@Component({
  host: {'module': 'Substitution'},
  standalone: true,
  imports: [NgClass],
  templateUrl: './Substitution.html',
  styleUrls: ['./Substitution.css', '../Modules.css']
})
export class SubstitutionComponent implements OnInit {

  constructor(
    public schoolingo: Schoolingo
  ) {}

  public date: BehaviorSubject<moment.Moment> = new BehaviorSubject(moment().set('isoWeeks', this.schoolingo.timetableSelectedWeek.getValue()).startOf('isoWeek'));

  public getDescription(substitution: Substitution): string {
    let date: moment.Moment = substitution.date;

    if (substitution.subjectId && this.schoolingo.subjects[substitution.subjectId]) {
      let teacher = this.schoolingo.getPerson(substitution.teacherId);
      return `${this.schoolingo.locale.getLocale('sidebar/teach/substitution')}: ${this.schoolingo.subjects[substitution.subjectId][0]} (${teacher?.lastName} ${teacher?.firstName})`;
    } else if (!substitution.subjectId) {
      let lesson: TimetableLesson = this.schoolingo.getTimetableLessons()?.[date.get('isoWeekday') - 1]?.[substitution.hour - 1]?.[0];
      if (lesson) {
        let teacher = this.schoolingo.getPerson(lesson?.oldTeacher)
        return `${this.schoolingo.locale.getLocale('timetable/cancelled')} (${lesson?.oldSubject?.[1]}, ${teacher?.lastName} ${teacher?.firstName})`;
      }
    }
    return '';
  }

  ngOnInit(): void {
  }
}
