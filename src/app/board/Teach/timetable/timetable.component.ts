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
import { SharedTimetableComponent } from '../../../Components/timetable/timetable.component';
import { Timetable } from '../../../infrastructure/timetable/timetable';

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
  working_modes?: { start_date: Date, end_date: Date, type: string }[];
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
  absence?: number;
  working_mode?: number;
}

export interface TimetableHours {
  startMoment: moment.Moment;
  start: string;
  endMoment: moment.Moment;
  end: string;
}

@Component({
  imports: [TabsComponent, NgClass, IconsModule, SharedTimetableComponent],
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
  public workingModeConfig = working_mode;
  private school = inject(School);
  private timetableService = inject(Timetable);

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
  public all_classes: any[] = [];



  public getTimetableType(): 'teacher' | 'student' | 'class' | 'room' | 'supervision' {
    if (!this.perms.checkPermission(['teacher', 'admin', 'principal'])) {
      return 'student';
    }
    switch(this.selectedTimetable.getValue()) {
      case this.teacherOptions.indexOf('dropdown.select_timetable.my_timetable'):
        return 'teacher';
      case this.teacherOptions.indexOf('dropdown.select_timetable.class_timetable'):
        return 'class';
      case this.teacherOptions.indexOf('dropdown.select_timetable.supervision'):
        return 'supervision';
      default:
        return 'student';
    }
  }

  public getClassName(class_id: number): string {
    if (this.perms.checkPermission(['admin', 'principal']) && this.all_classes.length > 0) {
      return this.all_classes.find((item: any) => item.id == class_id)?.name ?? '';
    }
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
      if (val === 0) {
        if (!this.timetableSelectedWeek.getValue()) {
            this.timetableSelectedWeek.next(moment());
        }
      } else {
        this.timetableSelectedWeek.next(null);
      }
      this.refreshData();
    });

    this.selectedTimetable
    .pipe(distinctUntilChanged())
    .subscribe(() => {
      if (this.selectedClass.getValue() === 0) {
        if (this.perms.checkPermission(['admin', 'principal']) && this.all_classes.length > 0) {
          this.selectedClass.next(this.all_classes[0].id);
        } else if (this.u.getUser().classes.length) {
          this.selectedClass.next(this.u.getUser().classes[0].class_id);
        }
      }
      this.refreshData()
    });

    this.selectedClass
    .pipe(distinctUntilChanged())
    .subscribe(() => {
      this.refreshData()
    })

    if (this.perms.checkPermission(['teacher', 'admin', 'principal'])) {
      if (this.perms.checkPermission(['teacher'])) {
        this.teacherOptions.push('dropdown.select_timetable.my_timetable', 'dropdown.select_timetable.supervision');
      }
      if (this.perms.checkPermission(['classTeacher', 'admin', 'principal'])) {
        this.teacherOptions.push('dropdown.select_timetable.class_timetable')
      }

      if (this.perms.checkPermission(['admin', 'principal'])) {
        this.http.get<any>(`${Config.API_URL}/v1/school/classes`, { withCredentials: true })
        .subscribe({
          next: (response) => {
            this.all_classes = response.data || response;
            if (this.selectedClass.getValue() === 0 && this.all_classes.length > 0) {
              this.selectedClass.next(this.all_classes[0].id);
            }
          }
        });
      }
    }

  }

  public refreshData(): void {
    if (this.isLoadingTimetable) { return; }
    
    let targetType: 'person' | 'class' | 'room' | 'supervision' = 'person';
    let targetId: number | null = this.u.getId();

    switch(this.selectedTimetable.getValue()) {
      case this.teacherOptions.indexOf('dropdown.select_timetable.class_timetable'):
        targetType = 'class';
        targetId = this.selectedClass.getValue();
        break;
      case this.teacherOptions.indexOf('dropdown.select_timetable.supervision'):
        targetType = 'supervision';
        targetId = this.u.getId();
        break;
    }

    const { timetable, timetableHours, isLoading } = this.timetableService.getTimetable(
        targetType, 
        targetId, 
        this.timetableSelectedWeek.getValue(),
        this.selectedTab.getValue()
    );

    isLoading.subscribe(loading => this.isLoadingTimetable = loading);
    timetable.subscribe(data => this.timetable = data);
    timetableHours.subscribe(data => this.timetableHours = data);
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

  public previousWeek(): void {
    const week = this.timetableSelectedWeek.getValue() || moment();
    this.timetableSelectedWeek.next(week.clone().subtract(1, 'week'));
    this.refreshData();
  }

  public nextWeek(): void {
    const week = this.timetableSelectedWeek.getValue() || moment();
    this.timetableSelectedWeek.next(week.clone().add(1, 'week'));
    this.refreshData();
  }

  public formatDateDisplay(): string {
    const week = this.timetableSelectedWeek.getValue();
    if (!week) return '';
    return week.clone().startOf('isoWeek').format('D. M.') + ' - ' + week.clone().endOf('isoWeek').format('D. M. YYYY');
  }

}
