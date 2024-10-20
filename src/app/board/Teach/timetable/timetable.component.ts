import { NgClass } from '@angular/common';
import { Component, Renderer2, RendererFactory2 } from '@angular/core';
import { Schoolingo } from '@Schoolingo';
import { TabsComponent } from '@Components/Tabs/Tabs';
import { BehaviorSubject } from 'rxjs';
import * as utils from '@Schoolingo/Utils';
import { Dropdown } from '@Components/Dropdowns/Dropdown';
import moment from 'moment';

@Component({
  standalone: true,
  imports: [NgClass, TabsComponent],
  templateUrl: './timetable.component.html',
  styleUrls: ['./timetable.component.css', '../../../Styles/card.css', '../../../Styles/item.css', '../../../Styles/absence.css']
})
export class TimetableComponent {
  private renderer: Renderer2;
  constructor(
    public schoolingo: Schoolingo,
    public dropdown: Dropdown,
    private factory: RendererFactory2
    ) {
        this.renderer = this.factory.createRenderer(window, null);
    }

  // Imports
  utils = utils;

  // Select Week Tab
  public selectedTab: BehaviorSubject<number> = new BehaviorSubject(0);
  
  // Calendar
  public selectedDate: BehaviorSubject<moment.Moment> = new BehaviorSubject(moment());

  // Dropdown Timetable Options
  public timetableOptionsName: string = 'timetableOptions';
  public options: Record<string, BehaviorSubject<boolean>> = {
    teachers: new BehaviorSubject(true),
    groups: new BehaviorSubject(true),
    rooms: new BehaviorSubject(true)
  };


  // Printer
  public printSelectedTab: number = this.selectedTab.getValue();

  public beforePrint(): void {
    this.printSelectedTab = this.selectedTab.getValue();
    this.selectedTab.next(2);
  }

  ngOnInit(): void {

    // If is weekend, select next week as default
    if (moment().isoWeekday() >= 6) {
      this.selectedTab.next(1);
    }

    // Select Week Tab
    this.selectedTab.subscribe((id: number) => {
      let arrayWeek: number[] = [this.schoolingo.todayWeek, this.schoolingo.todayWeek + 1, -1, this.schoolingo.todayWeek];
      this.schoolingo.timetableSelectedWeek.next(arrayWeek[id]);
    })

    this.dropdown.create(this.timetableOptionsName, { title: '', isOpen: false, items: [
      {
        label: 'timetable/print',
        type: 'function',
        func: () => {
          this.dropdown.close(this.timetableOptionsName);
          this.beforePrint();
          setTimeout(() => window.print())
        },
        rightText: '[key:CTRL] [key:P]',
        isActive: true
      }, {
        type: 'line',
        isActive: true
      }, {
        label: 'timetable/showTeachers',
        type: 'toggle',
        value: this.options.teachers,
        isActive: true
      }, {
        label: 'timetable/showGroups',
        type: 'toggle',
        value: this.options.groups,
        isActive: true
      }, {
        label: 'timetable/showRooms',
        type: 'toggle',
        value: this.options.rooms,
        isActive: true
      }]
    });


    this.renderer.listen(window, "afterprint", () => {
      this.selectedTab.next(this.printSelectedTab);
    })
  }

  public isClassbook(day: number, hour: number): boolean {
    return this.schoolingo.classbookLessons?.[utils.getDayOfWeek(this.schoolingo.timetableSelectedWeek.getValue(), day).format('YYYY-MM-DD').toString()]?.[hour] === undefined ? false : true;
  }

  public getAbsence(day: number, hour: number): number {
    let absence: number = this.schoolingo.classbookAbsence[utils.getDayOfWeek(this.schoolingo.timetableSelectedWeek.getValue(), day).format('YYYY-MM-DD').toString()]?.[hour];
    console.log(absence);
    if (absence === undefined || absence == -1) {
      return -1;
    }
    return absence;
  }

}
