import { NgClass } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DropdownManager } from '@Schoolingo/dropdown';
import { IconsModule } from '@Schoolingo/icons';
import { absence, AbsenceType } from '@Schoolingo/absence';
import { Classbook } from '@Schoolingo/classbook';
import { Locale } from '@Schoolingo/locale';
import { Permission } from '@Schoolingo/permission';
import { School } from '@Schoolingo/school';
import moment from 'moment';

@Component({
  standalone: true,
  imports: [NgClass, FormsModule, ReactiveFormsModule, IconsModule],
  templateUrl: './absence.component.html',
  styleUrl: './absence.component.css'
})
export class ClassbookAbsenceComponent {
  public school = inject(School);
  public perms = inject(Permission);
  public l = inject(Locale);

  public AbsenceType = AbsenceType;
  public classbook = inject(Classbook);
  public absenceConfig = absence;
  public dropdownManager = inject(DropdownManager);

  public lesson = this.classbook.classbook;
  public errors: { [key: string]: string } = {};
  public showSelect: null | 'reason' = null;

  ngOnInit(): void {
    this.classbook.reason = '';
    this.classbook.minutes = 0;
    this.classbook.note = '';
  }

  public getTime(type: 'arrival' | 'departure'): moment.Moment {
    // let hour = this.getTimetableHours()[this.classbook.selectedHour.getValue()!];
    let time = moment();
    // if (type == 'arrival') {
    //   time = hour.startMoment.clone().add(this.classbook.minutes, 'minutes')
    // }

    // if (type == 'departure') {
    //   time = hour.endMoment.clone().subtract(this.classbook.minutes, 'minutes');
    // }
    
    return time;
  }

  public getAbsenceReasons(): string[] {
    let arr = JSON.parse(JSON.stringify(this.absenceConfig[this.classbook.selectedAbsence].reasons));
    arr.push('other')
    return arr;
  }

  public submitAbsence(): void {
    this.errors = {};
    if ([AbsenceType.EARLY, AbsenceType.LATE].includes(this.classbook.selectedAbsence)) {
      if (this.classbook.minutes < 1) {
        this.errors['minutes'] = 'classbook.add_absence.minutes_cant_be_smaller_than_1';
      } else if (this.classbook.minutes >= this.school.config.getValue()!.lessonHour) {
        this.errors['minutes'] = 'classbook.add_absence.minutes_cant_be_grater_than_lesson';
      }
    }

    if (!this.classbook.reason) {
      this.errors['reason'] = 'form.required';
    }

    if (this.classbook.reason == 'other' && !this.classbook.note) {
      this.errors['note'] = 'form.required';
    }

    if (Object.keys(this.errors).length) {
      return;
    }

    this.classbook.applyAbsence();
  }
}
