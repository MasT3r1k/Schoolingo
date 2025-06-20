import { NgClass, NgStyle } from '@angular/common';
import { Component, inject } from '@angular/core';
import { TabsComponent } from '@Components/tabs/tabs';
import { absence, AbsenceType } from '@Schoolingo/absence';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { School } from '@Schoolingo/school';
import moment from 'moment';
import { BehaviorSubject, Subscription } from 'rxjs';

@Component({
  imports: [NgClass, NgStyle, IconsModule, TabsComponent],
  templateUrl: './absence.component.html',
  styleUrl: './absence.component.css'
})
export class AbsenceComponent {
  public l = inject(Locale);
  public s = inject(School);

  public absenceConfig = absence;
  public selectedPeriod = new BehaviorSubject<number>(0);
  public selectedTab = new BehaviorSubject<number>(0);
  private listeners: Subscription[] = [];
  public monthStatus: boolean[] = [];
  public ignoredAbsence: AbsenceType[] = [AbsenceType.NON_COUNT];

    public getMonths(): number {
    let count = 0;
      let school_config = this.s.config.getValue();
    if (school_config == null) return 0;
    let date = moment(school_config.year.start).clone();
    let end = moment(school_config.year.end);

    do {
      count++;
      date.add(1, 'month');
    } while (date.isBefore(end) && date.isSameOrBefore(moment()))
    return count;
  }

  public daysInMonth(month: number): number {
    let school_config = this.s.config.getValue();
    if (school_config == null) return 0;
    let startMonth = moment(school_config.year.start).clone().add(month, 'month').startOf('month');
    let daysInMonth = startMonth.daysInMonth();
    return daysInMonth;
  }

  public getCountMonthInDay(month: number, day: number, countAbsence: number[] = []): number[] {
      let school_config = this.s.config.getValue();
    if (school_config == null) return [];
    let date = moment(school_config.year.start).clone().add(month, 'month').startOf('month').add(day, 'day');

    if (!this.schoolingo.absence[date.format('YYYY-MM-DD')]) {
      return countAbsence;
    }
    
    this.schoolingo.absence[date.format('YYYY-MM-DD')].forEach((absence: Absence) => {
      if (!countAbsence[absence.type]) {
        countAbsence[absence.type] = 0;
      }
      countAbsence[absence.type] += 1;
    });
    return countAbsence;
  }

  public getCountAbsenceInMonthInDay(month: number, day: number): number {
    let absence = this.getCountMonthInDay(month, day);
    let count = 0;
    absence.forEach((ab: number) => {
      count += ab;
    });
    return count;
  }

  public getCountMonth(month: number): number[] {
    let school_config = this.s.config.getValue();
    if (school_config == null) return [];
    let startMonth = moment(school_config.year.start).add(month, 'month').startOf('month');
    let daysInMonth = startMonth.daysInMonth();
    let countAbsence: number[] = [];
    for(let i = 0;i < daysInMonth;i++) {
      countAbsence = this.getCountMonthInDay(month, i, countAbsence);
    }
    return countAbsence;
  }

  public getCountAbsenceInMonth(month: number): number {
    let absence = this.getCountMonth(month);
    let count = 0;
    absence.forEach((ab: number) => {
      count += ab;
    });
    return count;
  }

  public getMonthText(month: number): string {
    let school_config = this.s.config.getValue();
    if (school_config == null) return "";
    let date = moment(school_config.year.start).clone().add(month, 'month')
    return this.l.s('months/' + date.month()) + ' ' + date.year();
  }
}
