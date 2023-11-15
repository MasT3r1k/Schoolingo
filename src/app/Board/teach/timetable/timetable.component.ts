import { Component, OnInit, Renderer2 } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Schoolingo } from '@Schoolingo';
import { Locale } from '@Schoolingo/Locale';
import { Dropdowns } from '@Components/Dropdown/Dropdown';
import { FormControl } from '@angular/forms';
import { Tabs } from '@Components/Tabs/Tabs';
import { Router } from '@angular/router';

@Component({
  templateUrl: './timetable.component.html',
  styleUrls: ['./timetable.component.css', '../../board.css', '../../../Components/Dropdown/dropdown.css', '../../../Components/Tabs/tabs.component.css']
})
export class TimetableComponent implements OnInit {
  constructor(
    public schoolingo: Schoolingo,
    public locale: Locale,
    public dropdown: Dropdowns,
    public tabs: Tabs,
    private DatePipe: DatePipe,
    private renderer: Renderer2,
    private router: Router
  ) {

    this.dropdown.addDropdown('absence');


  }

  // Default values
  public tabName: string = 'timeTable';
  calendar = new FormControl('');
  private declare calendarEvent;
  private declare renderBeforePrint: Function;
  private declare renderAfterPrint: Function;
  private declare routerSub;

  // Timetable tabs
  private selectedTimeTableReasonPrint: number = 0;

  public beforePrint(): void {
    this.selectedTimeTableReasonPrint = this.tabs.getTabValue(this.tabName);
    this.tabs.setTabValue(this.tabName, 2);
  }

  public afterPrint(): void {
    this.tabs.setTabValue(this.tabName, this.selectedTimeTableReasonPrint);
    this.selectedTimeTableReasonPrint = 0;
  }

  ngOnInit(): void {


    // Setup page 
    this.schoolingo.selectWeek(this.schoolingo.getThisWeek());
    this.schoolingo.refreshTimetable();


    this.calendar.setValue(this.DatePipe.transform(this.schoolingo.getToday(), 'yyyy-MM-dd'));
    if (this.schoolingo.isDayWeekend(this.schoolingo.getToday())) {
      this.tabs.setTabValue(this.tabName, 1);
      this.schoolingo.selectWeek(this.schoolingo.getThisWeek() + 1);
    }else{
      this.tabs.setTabValue(this.tabName, 0);
      this.schoolingo.selectWeek(this.schoolingo.getThisWeek());
    }

    // Register subscribe of calendar
    this.calendarEvent = this.calendar.valueChanges.subscribe((date: string | null) => {
      if (date == null) return this.schoolingo.selectWeek(this.schoolingo.getThisWeek());
      if (date == '') return this.tabs.setTabValue(this.tabName, 2);
      this.tabs.setTabValue(this.tabName, 3);
      return this.schoolingo.selectWeek(new Date(date).getWeek());
    })


    this.registerOnChangeFunc();
    this.routerSub = this.router.events.subscribe((url: any) => {

      if (!url.url) { return ; }

      this.registerOnChangeFunc();

    });

    this.renderBeforePrint = this.renderer.listen(window, 'beforeprint', () => this.beforePrint());
    this.renderAfterPrint = this.renderer.listen(window, 'afterprint', () => this.afterPrint());
  }

  public registerOnChangeFunc(): void {
    setTimeout(() => {
      this.tabs.setOnChangeFunc(this.tabName, (id: number) => {
        switch(id) {
          case 0:
            this.schoolingo.selectWeek(this.schoolingo.getThisWeek());
            break;
          case 1:
            this.schoolingo.selectWeek(this.schoolingo.getThisWeek() + 1);
            break;
          case 2:
            this.schoolingo.selectWeek(null);
            break;
          case 3:
            this.schoolingo.selectWeek(new Date((this.calendar as FormControl)?.value).getWeek());
            break;
        }

        this.schoolingo.refreshTimetable();
      })
    });
  }

  ngOnDestroy(): void {
    this.renderBeforePrint();
    this.renderAfterPrint();
    this.routerSub.unsubscribe();
  }

}
