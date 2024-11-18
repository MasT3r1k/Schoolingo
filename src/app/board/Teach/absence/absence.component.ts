import { NgClass, NgStyle } from '@angular/common';
import { Component, OnInit, Renderer2 } from '@angular/core';
import { TabsComponent } from '@Components/Tabs/Tabs';
import { Absence, Schoolingo } from '@Schoolingo';
import { BehaviorSubject, Subscription } from 'rxjs';
import * as AbsenceConfig from "@Schoolingo/Absence";

type AbsenceAPI = {
  subject: string;
  absence_count: number;
  total_lessons: number;
}

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

  public absence: Record<string, { absence: number, lessons: number }> = {};
  public absenceConfig = AbsenceConfig.absence;
  public selectedTab: BehaviorSubject<number> = new BehaviorSubject(0);
  private listeners: Subscription[] = [];
  public monthStatus: boolean[] = [];

  public tableHeader: { active: boolean;top: number;width: number } = { active: false, top: 0, width: 0 };

  ngOnInit(): void {
    let userId = this.schoolingo.userService.getUser()?.person.personId;
    if (this.schoolingo.userService.getUser()?.type == 'parent') {
      userId = this.schoolingo.userService.children[this.schoolingo.userService.selectedChild].personId;
    }

    this.listeners.push(this.schoolingo.socketService.addFunction("connect").subscribe(() => {
      this.schoolingo.socketService.emit('absence:getAbsence', { userId });
    }));

    this.listeners.push(this.schoolingo.socketService.addFunction("absence:getAbsence").subscribe((data: AbsenceAPI[]) => {
      data.forEach((data: AbsenceAPI) => {
        this.absence[data.subject] = { absence: data.absence_count, lessons: data.total_lessons };
      });
    }));

    this.schoolingo.socketService.emit('absence:getAbsence', { userId });

    this.renderer.listen(document.querySelector(".main-content"), "scroll", (ev: any) => {
      let el = ev.target as HTMLElement;
      if (el.scrollTop > 160) {
        this.tableHeader["active"] = true;
      } else {
        this.tableHeader["active"] = false
      }
      let oldEl = document.querySelector("thead.table-row") as any;
      if (!oldEl) return;
      this.tableHeader["width"] = oldEl.clientWidth;
      this.tableHeader["top"] = el.scrollTop;
    })

    this.renderer.listen("window", "resize", () => {
      this.tableHeader["width"] = document.querySelector("thead.table-row")?.clientWidth as number;
      setTimeout(() => this.tableHeader["width"] = document.querySelector("thead.table-row")?.clientWidth as number, 300)
    })
  }

  ngOnDestroy(): void {
    this.listeners.forEach((subscribe: Subscription) => subscribe.unsubscribe());
    this.renderer.destroy();
  }

  public getMonths(): number {
    let count: number = 0;
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

  public getCountMonthInDay(month: number, day: number): number[] {
    let date = this.schoolingo.school.schoolYear.start.clone().add(month, 'month').startOf('month').add(day, 'day');
    let countAbsence: number[] = [];
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
    let date = startMonth.clone();
    let countAbsence: number[] = [];
    for(let i = 0;i < daysInMonth;i++) {
      date.add(1, 'day');
      if (!this.schoolingo.absence?.[date.format('YYYY-MM-DD')]) {
        continue;
      }
      this.schoolingo.absence[date.format('YYYY-MM-DD')].forEach((absence: Absence) => {
        if (!countAbsence[absence.type]) {
          countAbsence[absence.type] = 0;
        }
        countAbsence[absence.type] += 1;
      });
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
