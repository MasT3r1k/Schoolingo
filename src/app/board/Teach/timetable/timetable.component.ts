import { NgClass, NgStyle } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { TabsComponent } from '../../../Components/Tabs';
import { absence, working_mode } from '@Schoolingo/absence';
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

export interface TimetableAPI {
  timetable: TimetableLessonAPI[];
  substitution:TimetableSubstitutionAPI[];
  absences: TimetableAbsence[];
}

export interface TimetableLessonAPI {
  lesson_id: number;
  group_id: number;
  group_name: string | null;
  group_num: number  | null;
  day: number;
  hour: number;
  type: number;
  room: string;
  subject_id: number;
  subject_name: string;
  subject_shortcut: string;
  teacher_id: number;
  teacher: string;
  class_name: string;
}

export interface TimetableSubstitutionAPI {
  group_id: number;
  group_name: string | null;
  group_num: number  | null;
  start_date: Date;
  end_date: Date;
  start_hour: number;
  end_hour: number;
  type: number;
  event_name: string | null;
  event_description: string | null;
  room: string;
  subject_name: string;
  subject_shortcut: string;
  teacher_id: number;
  teacher: string;
  last_name: string;
  class_name: string; 
}

export interface TimetableAbsence {
  date: Date;
  hour: number;
  type: number;
}

export interface TimetableLesson {
  group_id: number;
  group_name: string;
  group_num: number;
  type: number;
  teacher: number;
  room: string;
  subject: number;
  subject_name: string;
  subject_shortcut: string;
  oldTeacher: number;
  oldSubject: string[];
  class_name: string;
  group: { id: number, text: string, num: string };
  empty: boolean;
  isSubstitution?: boolean;
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
  public workingModeConfig = working_mode
  private school = inject(School);

  private declare refreshDataTimeout;
  public dropdownManager = inject(DropdownManager)
  public isLoadingTimetable = false;
  public generatingPdf = false;
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
  public teacherOptions: string[] = [];

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
    },
    supervision: {
      name: 'Dozor',
      color: '#e67e22'
    }
  }

  public getClassName(class_id: number): string {
    return this.u.getUser().classes.find((item) => item.class_id == class_id)?.class_name ?? '';
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
        this.selectedClass.next(this.u.getUser().classes[0].class_id)
      }
      this.refreshData()
    });

    this.selectedClass
    .pipe(distinctUntilChanged())
    .subscribe(() => {
      this.refreshData()
    })

    if (this.perms.checkPermission(['teacher'])) {
      this.teacherOptions.push('dropdown.select_timetable.my_timetable', 'dropdown.select_timetable.supervision');
      if (this.perms.checkPermission(['classTeacher'])) {
        this.teacherOptions.push('dropdown.select_timetable.class_timetable')
      }
    }

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
      case this.teacherOptions.indexOf('dropdown.select_timetable.my_timetable'):
        timetableData = {
          type: "person",
          id: this.u.getId()
        }
        break;
      case this.teacherOptions.indexOf('dropdown.select_timetable.class_timetable'):
        timetableData = {
          type: "class",
          id: this.selectedClass.getValue()
        }
        break;
      case this.teacherOptions.indexOf('dropdown.select_timetable.supervision'):
        timetableData = {
          type: "supervision",
          id: this.u.getId()
        }
        break;
    }

    this.http.post<TimetableAPI>(
      Config.API_URL + '/v1/timetable',
      {...timetableData, time: (this.timetableSelectedWeek.getValue() ?? moment()).format("YYYY-MM-DD")},
      { withCredentials: true })
    .subscribe((data: TimetableAPI) => {
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

        const currentDay = moment(Utils.getDayOfWeek(this.timetableSelectedWeek.getValue() ?? moment(), item.day));

        if (data.absences) {
          data.absences.forEach((absence: any) => {
            if (currentDay.format('YYYY-MM-DD') == moment(absence.date).format('YYYY-MM-DD') && item.hour == absence.hour + 1) {
              item.absence = absence.type;
            }
          });
        }

        let substitution = data.substitution.find((sub: any) => {
            const isCorrectDay = currentDay.isBetween(sub.start_date, sub.end_date, 'day', '[]') || currentDay.format('YYYY-MM-DD') == moment(sub.start_date).format('YYYY-MM-DD') || currentDay.format('YYYY-MM-DD') == moment(sub.end_date).format('YYYY-MM-DD');

            const isCorrectHour = item.hour >= sub.start_hour && item.hour <= sub.end_hour;

            return isCorrectDay && isCorrectHour;
        });

        if (substitution && this.timetableSelectedWeek.getValue() != null) {
          timetableBuild[item.day][item.hour - 1].push({
            ...item,
            type: substitution.type,
            subjectName: substitution.subject_name || substitution.event_name,
            subjectShortcut: substitution.subject_shortcut,
            all_day: (substitution.start_hour == -1 || substitution.end_hour == -1) ? true : false,
            color: this.timetable_types[substitution.type]?.color ??  "",
            teacher: substitution.teacher_id,
            lastName: substitution.last_name,
            room: substitution.room,
            oldTeacher: item.last_name,
            oldSubject: item.subject_name || [],
            className: substitution.class_name,
            group: { id: substitution.group_id || 0, text: substitution.group_name || '', num: substitution.group_num || '' },
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
      .set('hours', schoolConfig?.start_hour!)
      .set('minutes', schoolConfig?.start_minute!);

      for(let i = 1;i <= maxHours;i++) {
          let startHour = time.clone();
          time.add(schoolConfig?.lesson_hour, 'minutes');
          hours.push(
              {
                  startMoment: startHour.clone(),
                  start: startHour.format('HH:mm'),
                  endMoment: time.clone(),
                  end: time.format('HH:mm')
              }
          );
          let customBreak = schoolConfig?.breaks.filter((_) => _.hour == i + 1)[0]?.minutes;
          time.add(customBreak || schoolConfig?.break_time, 'minutes');
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

    if (lesson.oldSubject && lesson.oldTeacher) {
      classes.push('substitution');
    }

    return classes;
  }

  public exportPdf(): void {
    this.generatingPdf = true;
    let targetType = 'person';
    let targetId = this.u.getId();

    if (this.perms.checkPermission(['teacher'])) {
      switch(this.selectedTimetable.getValue()) {
        case this.teacherOptions.indexOf('dropdown.select_timetable.class_timetable'):
          targetType = 'class';
          targetId = this.selectedClass.getValue();
          break;
        case this.teacherOptions.indexOf('dropdown.select_timetable.supervision'):
          targetType = 'supervision';
          break;
      }
    }

    const data = {
      type: 'rozvrh',
      timetableData: {
        timetable: this.timetable,
        timetableHours: this.timetableHours,
        selectedTab: this.selectedTab.getValue(),
        timetableSelectedWeek: this.timetableSelectedWeek.getValue() ? this.timetableSelectedWeek.getValue()!.format('YYYY-MM-DD') : null,
        targetType,
        targetId
      }
    };

    this.http.post(Config.API_URL + '/documents/generate', data, {
      withCredentials: true,
      responseType: 'blob'
    }).subscribe({
      next: (response: Blob) => {
        const url = window.URL.createObjectURL(response);
        window.open(url, '_blank');
        // Cleanup URL after opening (optional, might need slight delay if some browsers close it immediately)
        setTimeout(() => window.URL.revokeObjectURL(url), 100);
        this.generatingPdf = false;
      },
      error: () => {
        this.generatingPdf = false;
      }
    });
  }

}
