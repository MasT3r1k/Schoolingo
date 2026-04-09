import { NgClass, NgStyle } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { TabsComponent } from '../../../Components/Tabs';
import { absence, AbsenceConfig, AbsenceType } from '@Schoolingo/absence';
import { removeDiacritics } from '@Schoolingo/diacritics';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { School } from '@Schoolingo/school';
import moment from 'moment';
import { BehaviorSubject, distinctUntilChanged, Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Config } from '@Schoolingo/config';
import { Authentication } from '@Schoolingo/authentication';

export interface Absence {
  type: number;
  subject: number;
  reason: string;
  minutes: number;
}

interface AbsenceSubjectAPI {
  subjectId: number;
  subject: string;
  absence: number;
  total_lessons: number;
}

@Component({
  imports: [NgClass, IconsModule, TabsComponent],
  templateUrl: './absence.component.html',
  styleUrl: './absence.component.css'
})
export class AbsenceComponent implements OnInit {
  public l = inject(Locale);
  public s = inject(School);
  private http = inject(HttpClient);
  private u = inject(Authentication);

  public absenceConfig: AbsenceConfig[] = absence;
  public absenceSubjects: Record<string, { absence: number, lessons: number }> = {};
  public absenceDate: { start: moment.Moment, end: moment.Moment } = { start: moment(), end: moment() };
  public absence: Record<string, Absence[]> = {};
  public selectedPeriod = new BehaviorSubject<number>(0);
  public selectedTab = new BehaviorSubject<number>(0);
  private listeners: Subscription[] = [];
  public monthStatus: boolean[] = [];
  public ignoredAbsence: AbsenceType[] = [AbsenceType.NON_COUNT, AbsenceType.EARLY, AbsenceType.LATE];

  public getSubjects(): string[] {
    return Object.keys(this.absenceSubjects).sort((a: string, b: string) => 
      removeDiacritics(a).localeCompare(removeDiacritics(b))
    );
  }

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

    if (countAbsence.length === 0) {
      countAbsence = this.absenceConfig.map(() => 0);
    }
    if (!this.absence[date.format('YYYY-MM-DD')]) {
      return countAbsence;
    }
    
    this.absence[date.format('YYYY-MM-DD')].forEach((absence: Absence) => {
      countAbsence[absence.type] += 1;
    });
    return countAbsence;
  }

  public getCountAbsenceInMonthInDay(month: number, day: number): number {
    let absence = this.getCountMonthInDay(month, day);
    let count = 0;
    absence.forEach((ab: number, type: number) => {
      if (!this.ignoredAbsence.includes(type)) {
        count += ab;
      }
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
    absence.forEach((ab: number, type: number) => {
      if (!this.ignoredAbsence.includes(type)) {
        count += ab;
      }
    });
    return count;
  }

  public getMonthText(month: number): string {
    let school_config = this.s.config.getValue();
    if (school_config == null) return "";
    let date = moment(school_config.year.start).clone().add(month, 'month')
    return this.l.s('months.' + date.month()) + ' ' + date.year();
  }

  ngOnInit(): void {
    this.listeners.push(
      this.selectedTab
      .pipe(distinctUntilChanged())
      .subscribe((tab: number) => {
        if (tab === 0) {
          this.absenceSubjects = {};
          this.absence = {};
          this.selectedPeriod.next(0);
          this.loadAbsence()
        }
        if (tab === 1) {
          this.absence = {};
          this.loadAbsences();
        }
      })
    );

    this.listeners.push(
      this.selectedPeriod
      .pipe(distinctUntilChanged())
      .subscribe((period: number) => {
        if (this.selectedTab.getValue() === 0) {
          this.loadAbsence();
        } else {
          this.loadAbsences();
        }
      })
    ); 

    this.listeners.push(
      this.u.getAuthState()
      .subscribe((data) => {
        if (data) {
          this.loadAbsence()
        }
      })
    )

    this.listeners.push(
      this.s.config
      .subscribe((school) => {
        this.loadAbsence();
      })
    )
  }

  public loadAbsence(): void {
    let school_config = this.s.config.getValue();
    if (!school_config) return;

    let start = moment(school_config.year.start).clone();
    let midterm = moment(school_config.year.midterm).clone();
    let end = moment(school_config.year.end).clone();

    switch (this.selectedPeriod.getValue()) {
      case 0:
        this.absenceDate.start = start.clone().startOf('day');
        this.absenceDate.end = moment().endOf('day');
        break;
      case 1:
        this.absenceDate.start = start.clone().startOf('day');
        this.absenceDate.end = midterm.clone().endOf('day');
        break;
      case 2:
        this.absenceDate.start = midterm.clone().startOf('day');
        this.absenceDate.end = end.clone().endOf('day');
        break;
      case 3:
        this.absenceDate.start = start.clone().startOf('day');
        this.absenceDate.end = end.clone().endOf('day');
        break;
      default:
        this.absenceDate.start = start.clone().startOf('day');
        this.absenceDate.end = moment().endOf('day');
        break;
    }

    this.http.get(
      `${Config.API_URL}/v1/absence/${this.u.getId()}?start=${this.absenceDate.start.format('YYYY-MM-DD')}&end=${this.absenceDate.end.format('YYYY-MM-DD')}`,
      { withCredentials: true }
    )
    .subscribe((data) => {
        if ('lessons' in data) {
        Object.values(data.lessons as any[]).forEach((absenceSubject: AbsenceSubjectAPI) => {
          this.absenceSubjects[absenceSubject.subject] = {
            absence: absenceSubject.absence,
            lessons: absenceSubject.total_lessons
          };
        });
      }  
    })
  }

  public loadAbsences(): void {
    let school_config = this.s.config.getValue();
    if (!school_config) return;

    let start = moment(school_config.year.start).clone();
    let midterm = moment(school_config.year.midterm).clone();
    let end = moment(school_config.year.end).clone();

    switch (this.selectedPeriod.getValue()) {
      case 0:
        this.absenceDate.start = start.clone().startOf('day');
        this.absenceDate.end = moment().endOf('day');
        break;
      case 1:
        this.absenceDate.start = start.clone().startOf('day');
        this.absenceDate.end = midterm.clone().endOf('day');
        break;
      case 2:
        this.absenceDate.start = midterm.clone().startOf('day');
        this.absenceDate.end = end.clone().endOf('day');
        break;
      case 3:
        this.absenceDate.start = start.clone().startOf('day');
        this.absenceDate.end = end.clone().endOf('day');
        break;
      default:
        this.absenceDate.start = start.clone().startOf('day');
        this.absenceDate.end = moment().endOf('day');
        break;
    }

    this.absence = {};
    this.http.get<any[]>(
      `${Config.API_URL}/v1/absences/${this.u.getId()}?start=${this.absenceDate.start.format('YYYY-MM-DD')}&end=${this.absenceDate.end.format('YYYY-MM-DD')}`,
      { withCredentials: true }
    )
    .subscribe((data: any[]) => {
      data.forEach(absence => {
        let date = moment(absence.date).format('YYYY-MM-DD');
        if (!this.absence[date]) {
          this.absence[date] = [];
        }
        this.absence[date].push(absence);
      })
    })
  }
}
