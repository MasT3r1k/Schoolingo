import { NgClass, NgStyle } from '@angular/common';
import { Component, OnInit, Renderer2 } from '@angular/core';
import { TabsComponent } from '@Components/Tabs/Tabs';
import { Absence, Schoolingo } from '@Schoolingo';
import { BehaviorSubject, Subscription } from 'rxjs';
import * as AbsenceConfig from "@Schoolingo/Absence";

@Component({
  standalone: true,
  imports: [TabsComponent, NgClass, NgStyle],
  templateUrl: './absence.component.html',
  styleUrls: ['./absence.component.css', '../../../Styles/card.css']
})
export class AbsenceComponent implements OnInit {
  constructor(
    public schoolingo: Schoolingo,
    private renderer: Renderer2
  ) {}

  public absenceConfig = AbsenceConfig.absence;
  public selectedTab: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  private listeners: Subscription[] = [];
  public monthStatus: boolean[] = [];
  public ignoredAbsence: AbsenceConfig.AbsenceType[] = [AbsenceConfig.AbsenceType.NON_COUNT];

  public tableHeader: { active: boolean;top: number;width: number } = { active: false, top: 0, width: 0 };

  ngOnInit(): void {
    this.renderer.listen(document.querySelector(".main-content"), "scroll", (ev: any) => {
      let el: HTMLElement = ev.target!;
      if (el.scrollTop > 160) {
        this.tableHeader.active = true;
      } else {
        this.tableHeader.active = false
      }
      let oldEl = document.querySelector("thead.table-row") as any;
      if (!oldEl) return;
      this.tableHeader.width = oldEl.clientWidth;
      this.tableHeader.top = el.scrollTop;
    })

    this.renderer.listen("window", "resize", () => {
      this.tableHeader.width = document.querySelector("thead.table-row")?.clientWidth!;
      setTimeout(() => this.tableHeader.width = document.querySelector("thead.table-row")?.clientWidth!, 300)
    })
  }

  ngOnDestroy(): void {
    this.listeners.forEach((subscribe: Subscription) => subscribe.unsubscribe());
    this.renderer.destroy();
  }

  public getMonths(): number {
    let count = 0;
    let date = this.schoolingo.school.schoolYear.start.clone();
    let end = this.schoolingo.school.schoolYear.end;

    do {
      count++;
      date.add(1, 'month');
    } while (date.isBefore(end))
    return count;
  }

  public daysInMonth(month: number): number {
    let startMonth = this.schoolingo.school.schoolYear.start.clone().add(month, 'month').startOf('month');
    let daysInMonth = startMonth.daysInMonth();
    return daysInMonth;
  }

  public getCountMonthInDay(month: number, day: number, countAbsence: number[] = []): number[] {
    let date = this.schoolingo.school.schoolYear.start.clone().add(month, 'month').startOf('month').add(day, 'day');
    if (!this.schoolingo.absence?.[date.format('YYYY-MM-DD')]) {
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
    let startMonth = this.schoolingo.school.schoolYear.start.clone().add(month, 'month').startOf('month');
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
}
