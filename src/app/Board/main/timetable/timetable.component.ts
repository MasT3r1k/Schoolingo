import { Tabs } from '@Components/Tabs/Tabs';
import { Schoolingo } from '@Schoolingo';
import { Locale } from '@Schoolingo/Locale';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'module-timetable',
  templateUrl: './timetable.component.html',
  styleUrls: ['./timetable.component.css', '../module.css', '../../board.css']
})
export class TimetableComponent implements OnInit {

  constructor(
    public locale: Locale,
    public schoolingo: Schoolingo,
    public tabs: Tabs,
    private router: Router
  ) {}

  private declare routerSub;

  public tabName: string = 'Main_Module_Timetable';
  public selectedDay = this.schoolingo.getToday();

  ngOnInit(): void {

    this.registerOnChangeFunc();
    this.routerSub = this.router.events.subscribe((url: any) => {
      if ((!url?.routerEvent?.urlAfterRedirects && !url?.url) || (url?.routerEvent?.urlAfterRedirects == '/login' || url?.url == '/login')) { return; }


      setTimeout(() => {
        this.registerOnChangeFunc();
      })

    });
  }

  public registerOnChangeFunc(): void {
    setTimeout(() => {
      if (this.router.url != '/main') return;
      this.tabs.setOnChangeFunc(this.tabName, (id: number) => {
        document.querySelectorAll(".module[name='" + this.tabName + "'] .tab-content").forEach((_: Element) => {
          (_ as HTMLElement).style.transform = `translateX(calc(-100% * ${id})`;
        });
      })
    });
  }


  public selectLastDay(): void {
    if (this.selectedDay.getHours() != 4) {
      this.selectedDay.setHours(4);
    }
    let last = this.schoolingo.getLastStudyDay(this.selectedDay);
    last.setHours(4);
    this.selectedDay = last;
    this.schoolingo.selectWeek(this.selectedDay.getWeek())
    this.schoolingo.refreshTimetable();
  }

  public selectNextDay(): void {
    if (this.selectedDay.getHours() != 20) {
      this.selectedDay.setHours(20);
    }
    let next = this.schoolingo.getNextStudyDay(this.selectedDay);
    next.setHours(20);
    this.selectedDay = next;
    this.schoolingo.selectWeek(this.selectedDay.getWeek())
    this.schoolingo.refreshTimetable();
  }

}
