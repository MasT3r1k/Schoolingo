import { NgClass, NgStyle } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { TabsComponent } from '../../../Components/Tabs';
import { absence } from '@Schoolingo/absence';
import { Authentication } from '@Schoolingo/authentication';
import { Config } from '@Schoolingo/config';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { Permission, permType } from '@Schoolingo/permission';
import { School } from '@Schoolingo/school';
import { Utils } from '@Schoolingo/utils';
import moment from 'moment';
import { BehaviorSubject, distinctUntilChanged } from 'rxjs';
import { Theme } from '@Schoolingo/theme';
import { DropdownManager } from '@Schoolingo/dropdown';

export interface SidebarItem {
  item: string;
  type?: 'default' | 'danger';
  icon?: string;
  url?: string;
  permission?: permType[];
  children?: SidebarItem[];
  badge?: any;
  modules?: string[];
  action?: Function;
}

export interface TimetableLesson {
  groupName: string;
  groupNum: number;
  type: number;
  teacher: number;
  room: string;
  subject: number;
  subjectName: string;
  subjectShortcut: string;
  oldTeacher: number;
  oldSubject: string[];
  className: string;
  group: { id: number, text: string, num: string };
  empty: boolean;
}

export interface TimetableHours {
  startMoment: moment.Moment;
  start: string;
  endMoment: moment.Moment;
  end: string;
}

@Component({
  imports: [TabsComponent, NgClass, IconsModule],
  templateUrl: './timetable.component.html',
  styleUrl: './timetable.component.css'
})
export class TimetableComponent implements OnInit {
  public l = inject(Locale);
  public t = inject(Theme);
  public perms = inject(Permission);
  private http = inject(HttpClient);
  public u = inject(Authentication);
  public Utils = Utils;
  public absenceConfig = absence;
  private school = inject(School);

  private declare refreshDataTimeout;
  public dropdownManager = inject(DropdownManager)
  public isLoadingTimetable = false;
  public selectedTimetable = new BehaviorSubject<number>(0);
  public selectedTab = new BehaviorSubject<number>(0);
  public selectedClass = new BehaviorSubject(0);
  public timetableSelectedWeek = new BehaviorSubject<moment.Moment | null>(moment());
  public timetable: any[] = [];
  public isClassService = false;
  public timetableHours: TimetableHours[] = [];
  public options: Record<string, BehaviorSubject<boolean>> = {
    teachers: new BehaviorSubject<boolean>(true),
    groups: new BehaviorSubject<boolean>(true),
    rooms: new BehaviorSubject<boolean>(true)
  };

  public timetable_types: any = {
    teaching: {
      name: 'Výuka',
      color: '#3498db'
    },
    substitution: {
      name: 'Suplování',
      color: '#9b59b6'
    },
    cancelled_hour: {
      name: 'Zrušená hodina',
      color: '#e74c3c'
    },
    trip: {
      name: 'Výlet',
      color: '#2ecc71'
    },
    holiday: {
      name: 'Prázdniny',
      color: '#61B0FF'
    },
    tutoring: {
      name: 'Doučování',
      color: '#8e44ad'
    },
    advice: {
      name: 'Porada',
      color: '#1abc9c'
    },
    school_event: {
      name: 'Školní akce',
      color: '#f39c12'
    },
    class_meeting: {
      name: 'Třídní schůzka',
      color: '#d35400'
    },
    class_lesson: {
      name: 'Třídní hodina',
      color: '#4A90E2'
    },
    exam: {
      name: 'Zkouška',
      color: '#c0392b'
    }
  }

  public getClassName(class_id: number): string {
    return this.u.getUser().classes.find((item) => item.classId == class_id)?.className ?? '';
  }

  ngOnInit(): void {
    this.refreshData();

    // Při změně dítěte, aktualizovat rozvrh
    this.u.selectedChild
    .pipe(distinctUntilChanged())  // Kontrola zda není hodnota stejná
    .subscribe(() => {
      this.refreshData();
    });

    this.selectedTab
    .pipe(distinctUntilChanged()) // Kontrola zda není hodnota stejná
    .subscribe((val: number) => {
      switch(val) {
        case 0:
          this.timetableSelectedWeek.next(moment());
          break;
        case 1:
          this.timetableSelectedWeek.next(moment().add(1, 'week'));
          break;
        case 2:
          this.timetableSelectedWeek.next(null);
          break;
        case 3:
          if (this.timetableSelectedWeek.getValue() == null) {
            this.timetableSelectedWeek.next(moment());
          }
          break;
      }
      this.refreshData();
    });

    this.selectedTimetable
    .pipe(distinctUntilChanged())
    .subscribe(() => {
      if (this.selectedClass.getValue() === 0 && this.u.getUser().classes.length) {
        this.selectedClass.next(this.u.getUser().classes[0].classId)
      }
      this.refreshData()}
    );

    this.selectedClass
    .pipe(distinctUntilChanged())
    .subscribe(() => {
      this.refreshData()
    })

  }

  public refreshData(): void {
    this.isLoadingTimetable = true;
    let timetableBuild: any[] = [];
    clearTimeout(this.refreshDataTimeout)

    let timetableData = {
      type: "person",
      id: this.u.getId()
    }
    switch(this.selectedTimetable.getValue()) {
      case 0:
        timetableData = {
          type: "person",
          id: this.u.getId()
        }
        break;
      case 1:
        timetableData = {
          type: "class",
          id: this.selectedClass.getValue()
        }
    }

    this.http.post(
      Config.API_URL + '/v1/timetable',
      {...timetableData, time: (this.timetableSelectedWeek.getValue() ?? moment()).format("YYYY-MM-DD")},
      { withCredentials: true })
    .subscribe((data: any) => {
      console.log(data)
      let maxHours = 0;

      if (data.timetable.length == 0 && data.substitution.length == 0) {
        this.timetable = [];
        this.timetableHours = [];
        this.isLoadingTimetable = false
        return;
      }

      Object.values(data.timetable).forEach((item: any) => {
        item.color = "";
        item.all_day = false;
        if (item.hour + 1 > maxHours) {
          maxHours = item.hour + 1;
        }

        if (!timetableBuild[item.day]) {
          timetableBuild[item.day] = [];
        }

        if (!timetableBuild[item.day][item.hour - 1]) {
          timetableBuild[item.day][item.hour - 1] = [];
        }

        let substitution = data.substitution.find((sub: any) => {
          return moment(Utils.getDayOfWeek(this.timetableSelectedWeek.getValue() ?? moment(), item.day)).isBetween(sub.start_date, sub.end_date, 'day', '[]');
        })

        if (substitution && this.timetableSelectedWeek.getValue() != null) {
          timetableBuild[item.day][item.hour - 1].push({
            ...item,
            type: substitution.type,
            subjectName: substitution.event_name,
            subjectShortcut: substitution.subject_shortcut,
            all_day: (substitution.start_hour == -1 || substitution.end_hour == -1) ? true : false,
            color: this.timetable_types[substitution.type]?.color ??  "",
            teacher: substitution.teacher_id,
            room: substitution.room,
            oldTeacher: substitution.old_teacher_id,
            oldSubject: substitution.old_subjects || [],
            className: substitution.class_name,
            group: substitution.group || { id: 0, text: '', num: '' },
            hour: item.hour - 1,
            empty: false
          });
        } else if (item.type == 0 || this.selectedTab.getValue() == 2 || this.selectedTab.getValue() !== 2 && item.type > 0
        && (this.Utils.isOdd(this.timetableSelectedWeek.getValue()?.isoWeek()!) && item.type === 1 ||
            !this.Utils.isOdd(this.timetableSelectedWeek.getValue()?.isoWeek()!) && item.type === 2)
        ) {
          timetableBuild[item.day][item.hour - 1].push({
            ...item,
            hour: item.hour - 1,
            subjectName: item.subjectName,
            subjectShortcut: item.subjectShortcut,
            empty: false
          });
        }
      });

      this.timetable = timetableBuild;


      let schoolConfig = this.school.config.getValue();

      let hours: TimetableHours[] = [];
      let time = moment()
      .set('hours', schoolConfig?.startHour!)
      .set('minutes', schoolConfig?.startMinute!);

      for(let i = 1;i <= maxHours;i++) {
          let startHour = time.clone();
          time.add(schoolConfig?.lessonHour, 'minutes');
          hours.push(
              {
                  startMoment: startHour.clone(),
                  start: startHour.format('HH:mm'),
                  endMoment: time.clone(),
                  end: time.format('HH:mm')
              }
          );
          let customBreak = schoolConfig?.breaks.filter((_) => _.hour == i + 1)[0]?.minutes;
          time.add(customBreak || schoolConfig?.breakTime, 'minutes');
      }

      this.timetableHours = hours;
      this.isLoadingTimetable = false;
    }, (err) => {
      this.isLoadingTimetable = true;
      this.timetable = [];
      clearTimeout(this.refreshDataTimeout);
      this.refreshDataTimeout = setTimeout(() => {
        this.refreshData();
      }, 2500);
      this.isLoadingTimetable = false;
    });
  }


    public getLessonClasses(index: number, index2: number, lesson: TimetableLesson): string[] {
    let classes = ['sub-lesson-hour', 'lesson-count-' + this.timetable?.[index]?.[index2]?.length];
    if (lesson.empty) {
      classes.push('empty');
    }

    // if (this.schoolingo.isClassbook(index - 1, index2)) {
    //   classes.push('classbook');
    // }

    // let day = thissubstitution[Utils.getDayOfWeek(this.timetableSelectedWeek.getValue()!, index - 1).format('YYYY-MM-DD')];

    // if (day && day[index2]) {
    //   classes.push('substitution');
    // }

    return classes;
  }

}
