import { NgClass, NgStyle } from '@angular/common';
import { Component, Renderer2, RendererFactory2 } from '@angular/core';
import { Schoolingo, TimetableLesson } from '@Schoolingo';
import { TabsComponent } from '@Components/Tabs/Tabs';
import { BehaviorSubject } from 'rxjs';
import { Utils } from '@Schoolingo/Utils';
import { Dropdown } from '@Components/Dropdowns/Dropdown';
import moment from 'moment';
import { ContextButton } from '@Components/Dropdowns/Dropdown';
import { absence } from '@Schoolingo/Absence';
import { Modal } from '@Components/Modal/Modal';
import { IconsModule } from '../../../Modules/Icons.module';
import { ShowLessonComponent } from './show-lesson/show-lesson.component';
import { Permission } from '@Schoolingo/Permissions';

@Component({
  standalone: true,
  imports: [NgClass, TabsComponent, IconsModule, NgStyle],
  templateUrl: './timetable.component.html',
  styleUrls: ['./timetable.component.css', '../../../Styles/card.css', '../../../Styles/item.css']
})
export class TimetableComponent {
  private renderer: Renderer2;
  constructor(
    public schoolingo: Schoolingo,
    public dropdown: Dropdown,
    private factory: RendererFactory2,
    public perms: Permission
    ) {
      this.renderer = this.factory.createRenderer(window, null);
    }

  // Imports
  Utils = Utils;
  

  public modal: Modal = new Modal({
    closeable: true,
    title: {
      icon: "school",
      text: "timetable/dropdown/showLesson/title"
    },
    size: 'size-1',
    items: [
      {
        type: 'component',
        component: ShowLessonComponent,
        data: {}
      }
    ]
  });

  // Is active mass excuse option
  public massExcuse = false;

  // Select Week Tab
  public selectedTab = new BehaviorSubject<number>(0);
  
  // Calendar
  public selectedDate = new BehaviorSubject<moment.Moment>(moment());

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
      let arrayWeek: (moment.Moment)[] = [
        moment(),                     // current week
        moment().add(1, 'week'),      // next week
        moment("fake date"),          // Permanent
        this.selectedDate.getValue()  // Calendar
      ];

      this.schoolingo.timetableSelectedWeek.next(arrayWeek[id]);

      if (this.selectedDate.getValue().format("DD-MM-YYYY") !== moment().format("DD-MM-YYYY")) {

        // this.schoolingo.socketService.emit('timetable:getLessons', {
        //   userId,
        //   week,
        //   year: this.selectedDate.getValue().year()
        // });

        // this.schoolingo.socketService.emit('classes:getClassService',
        //   {
        //     week,
        //     year: this.selectedDate.getValue().year()
        //   })

        // this.schoolingo.timetableSelectedWeek.next(this.selectedDate.getValue());

      }

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
//       let userId = this.schoolingo.getStudentId();
// ;
//       this.schoolingo.socketService.emit('timetable:getLessons', {
//         userId,
//         week: date.isoWeek(),
//         year: date.year()
//       });
      this.schoolingo.timetableSelectedWeek.next(date);
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
    this.selectedDate.next(moment());

    this.dropdown.remove(this.timetableAbsenceName);
    this.dropdown.remove(this.timetableOptionsName);
    this.dropdown.remove(this.timetableCalendarName);
    this.renderer.destroy();
  }

  public openLesson(lesson: { lesson: TimetableLesson, day: number, hour: number, sub: number }): void {
    if (lesson.lesson.empty) return;
    if (!this.modal) {
      console.error('NO MODAL')
    }
    this.schoolingo.timetableSelectedLesson.next(lesson);
    this.modal?.open();
    // this.schoolingo.modal = 'timetable:showLesson';
  }

  public getLessonClasses(index: number, index2: number, lesson: TimetableLesson): string[] {
    let classes = ['sub-lesson-hour', 'lesson-count-' + this.schoolingo.getTimetableLessons()[index][index2].length];
    if (lesson.empty) {
      classes.push('empty');
    }

    if (this.schoolingo.isClassbook(index - 1, index2)) {
      classes.push('classbook');
    }

    let day = this.schoolingo.substitution[Utils.getDayOfWeek(this.schoolingo.timetableSelectedWeek.getValue(), index - 1).format('YYYY-MM-DD')];

    if (day && day[index2]) {
      classes.push('substitution');
    }

    return classes;
  }
}
