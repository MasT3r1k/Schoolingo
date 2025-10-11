import { NgClass } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Schoolingo } from '@Schoolingo';
import { AbsenceType } from '@Schoolingo/Absence';
import { Alert } from '@Schoolingo/Alert';
import { Permission } from '@Schoolingo/Permissions';
import moment from 'moment';

@Component({
  standalone: true,
  imports: [NgClass, FormsModule, ReactiveFormsModule],
  templateUrl: './absence.component.html',
  styleUrl: './absence.component.css'
})
export class ClassbookAbsenceComponent {
  public schoolingo = inject(Schoolingo);
  public perms = inject(Permission);

  public AbsenceType = AbsenceType;

  public lesson = this.schoolingo.timetableSelectedLesson.getValue();
  public errors: { [key: string]: Alert } = {};
  public showSelect: null | 'reason' = null;

  ngOnInit(): void {
    this.schoolingo.timetableSelectedLesson.subscribe((lesson) => {
      this.lesson = lesson;
    });
    this.schoolingo.classbook.absenceReason = '';
    this.schoolingo.classbook.absenceMinutes = 0;
    this.schoolingo.classbook.absenceNote = '';
  }

  public getTime(type: 'arrival' | 'departure'): moment.Moment {
    let hour = this.schoolingo.getTimetableHours()[this.schoolingo.classbook.selectedHour.getValue()!];
    let time = moment();
    if (type == 'arrival') {
      time = hour.startMoment.clone().add(this.schoolingo.classbook.absenceMinutes, 'minutes')
    }

    if (type == 'departure') {
      time = hour.endMoment.clone().subtract(this.schoolingo.classbook.absenceMinutes, 'minutes');
    }
    
    return time;
  }

  public getAbsenceReasons(): string[] {
    let arr = JSON.parse(JSON.stringify(this.schoolingo.absenceConfig[this.schoolingo.classbook.selectedAbsence.getValue()!].reasons));
    arr.push('other')
    return arr;
  }

  public submitAbsence(): void {
    this.errors = {};
    if ([AbsenceType.EARLY, AbsenceType.LATE].includes(this.schoolingo.classbook.selectedAbsence.getValue())) {
      if (this.schoolingo.classbook.absenceMinutes < 1) {
        this.errors.minutes = new Alert('error', 'classbook/absence/minutesCantBeSmallerThan1');
      } else if (this.schoolingo.classbook.absenceMinutes >= this.schoolingo.school.schoolInfo.lessonHour) {
        this.errors.minutes = new Alert('error', 'classbook/absence/minutesCantBeGraterThanLesson');
      }
    }

    if (!this.schoolingo.classbook.absenceReason) {
      this.errors.reason = new Alert('error', 'required');
    }

    if (this.schoolingo.classbook.absenceReason == 'other' && !this.schoolingo.classbook.absenceNote) {
      this.errors.note = new Alert('error', 'required');
    }

    if (Object.keys(this.errors).length) {
      return;
    }

    this.schoolingo.classbook.applyAbsence.next(true);
  }
}
