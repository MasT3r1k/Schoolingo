import { NgClass } from '@angular/common';
import { Component, Renderer2, RendererFactory2 } from '@angular/core';
import { Schoolingo, TimetableLesson } from '@Schoolingo';
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
  public selectedTab: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  
  // Calendar
  public selectedDate: BehaviorSubject<moment.Moment> = new BehaviorSubject<moment.Moment>(moment());

  // Dropdowns
  public timetableAbsenceName: string = 'timetableAbsence';
  public timetableOptionsName: string = 'timetableOptions';
  public timetableCalendarName: string = 'timetableCalendar';
  public options: Record<string, BehaviorSubject<boolean>> = {
    teachers: new BehaviorSubject<boolean>(true),
    groups: new BehaviorSubject<boolean>(true),
    rooms: new BehaviorSubject<boolean>(true)
  };


  // Printer
  public printSelectedTab: number = this.selectedTab.getValue();

  public beforePrint(): void {
    this.printSelectedTab = this.selectedTab.getValue();
    this.selectedTab.next(2);
  }

  ngOnInit(): void {

    // Select Week Tab
    this.selectedTab.subscribe((id: number) => {
      let arrayWeek: number[] = [moment().isoWeek(), moment().isoWeek() + 1, -1, this.schoolingo.todayWeek];
      let userId = this.schoolingo.getStudentId();

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
      let userId = this.schoolingo.getStudentId();
;
      this.schoolingo.socketService.emit('timetable:getLessons', { userId, week: date.isoWeek(), year: date.year() });
      this.schoolingo.timetableSelectedWeek.next(date.isoWeek());
    })


    this.renderer.listen(window, "afterprint", () => {
      this.selectedTab.next(this.printSelectedTab);
    })

    // If is weekend, select next week as default
    if (moment().isoWeekday() >= 6) {
      this.selectedTab.next(1);
    }
  }

  ngOnDestroy(): void {
    this.dropdown.remove(this.timetableAbsenceName);
    this.dropdown.remove(this.timetableOptionsName);
    this.dropdown.remove(this.timetableCalendarName);
    this.renderer.destroy();
  }

  public openLesson(lesson: { lesson: TimetableLesson, day: number, hour: number, sub: number }): void {
    if (lesson.lesson.empty) return;
    this.schoolingo.modal = 'timetable:showLesson';
  }
}
