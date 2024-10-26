import { NgClass } from '@angular/common';
import { Component, Renderer2, RendererFactory2 } from '@angular/core';
import { Schoolingo } from '@Schoolingo';
import { TabsComponent } from '@Components/Tabs/Tabs';
import { BehaviorSubject } from 'rxjs';
import * as utils from '@Schoolingo/Utils';
import { Dropdown } from '@Components/Dropdowns/Dropdown';
import moment from 'moment';
import { ContextButton } from '@Components/Dropdowns/Dropdown';
import { absence } from '@Schoolingo/Absence';
import { user } from '@Schoolingo/User';

@Component({
  standalone: true,
  imports: [NgClass, TabsComponent],
  templateUrl: './timetable.component.html',
  styleUrls: ['./timetable.component.css', '../../../Styles/card.css', '../../../Styles/item.css']
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

  // Dropdowns
  public timetableAbsenceName: string = 'timetableAbsence';
  public timetableOptionsName: string = 'timetableOptions';
  public timetableCalendarName: string = 'timetableCalendar';
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
      let arrayWeek: number[] = [moment().isoWeek(), moment().isoWeek() + 1, -1, this.schoolingo.todayWeek];
      let user: user | null = this.schoolingo.userService.getUser();
      let userId = user?.id;

      if (user && user.type == 'parent') {
        userId = this.schoolingo.userService.children[this.schoolingo.userService.selectedChild].personId;
      }
      if (this.selectedDate.getValue().format("DD-MM-YYYY") !== moment().format("DD-MM-YYYY")) {
        if (id !== 3) {
          this.selectedDate.next(moment())
        }
        this.schoolingo.socketService.emit('timetable:getLessons', { userId, week: (arrayWeek[id] == -1) ? moment().isoWeek() : arrayWeek[id], year: moment().year() });
      }
      this.schoolingo.timetableSelectedWeek.next(arrayWeek[id]);
    })

    let dropdownAbsence: ContextButton[] = [];
    for(let i = 0;i < absence.length;i++) {
      dropdownAbsence.push({ 
        type: 'custom',
        html: '<div class="flex align-items-center absence-item"><div class="absence ab-' + absence[i].locale + '"></div> [l:absence/' + absence[i].locale + ']' + ' </div>',
        isActive: true
      });
    }

    this.dropdown.create(this.timetableAbsenceName, { title: '', isOpen: false, items: dropdownAbsence})

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

    // Calendar
    this.dropdown.create(this.timetableCalendarName, { title: '', isOpen: false, items: [{
      type: 'calendar',
      date: this.selectedDate,
      selectedMonth: this.selectedDate.getValue().clone(),
      isActive: true
    }] });

    this.selectedDate.subscribe((date: moment.Moment) => {
      let user: user | null = this.schoolingo.userService.getUser();
      let userId = user?.id;

      if (user && user.type == 'parent') {
        userId = this.schoolingo.userService.children[this.schoolingo.userService.selectedChild].personId;
      }
      this.schoolingo.socketService.emit('timetable:getLessons', { userId, week: date.isoWeek(), year: date.year() });
      this.schoolingo.timetableSelectedWeek.next(date.isoWeek());
    })


    this.renderer.listen(window, "afterprint", () => {
      this.selectedTab.next(this.printSelectedTab);
    })
  }

  public isClassbook(day: number, hour: number): boolean {
    return this.schoolingo.classbookLessons?.[utils.getDayOfWeek(this.schoolingo.timetableSelectedWeek.getValue(), day).format('YYYY-MM-DD').toString()]?.[hour] === undefined ? false : true;
  }

  public getAbsence(day: number, hour: number): number {
    let absence: number = this.schoolingo.classbookAbsence[utils.getDayOfWeek(this.schoolingo.timetableSelectedWeek.getValue(), day).format('YYYY-MM-DD').toString()]?.[hour];
    if (absence === undefined || absence == -1) {
      return -1;
    }
    return absence;
  }

}
