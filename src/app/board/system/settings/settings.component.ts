import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Config } from '@Schoolingo/config';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { Utils } from '@Schoolingo/utils';

interface ElysiaVersion {
  current: string;
  latest: string;
  isUpToDate: boolean;
}

interface ElysiaVersionLoading {
  is_loading: boolean;
  error: string | null;
}

interface ElysiaSystemAPI {
  settings: {
    name: string;
    shortName: string;
    code: string;
    district: string;
    startHour: number;
    startMinute: number;
    lessonHour: number;
    breakTime: number;
    warningAbsencePercent: number;
    resetPasswordWithEmail: boolean;
    fastlogin: boolean;
    license_type: string;
    license_until: Date | null;
    studentsLimit: number;
    modules: string;
  };

  districts: {
    districtId: number;
    district: string;
  }[];

  student_count: number;

  subjects: {
    subjectId: number;
    subjectName: string;
    shortcut: string;
  }[]

  scopes: {
    scopeId: number;
    name: string;
    code: string;
    shortcut: string;
    years: number;
    number_of_classes: number;
    students_per_class: number;
  }[]
}

enum enumSidebar {
  MAIN,
  SCOPES,
  SUBJECTS
}

@Component({
  imports: [IconsModule, FormsModule, ReactiveFormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent implements OnInit {
  public enumSidebar = enumSidebar;
  private http = inject(HttpClient);
  public l = inject(Locale);

  public sidebar: enumSidebar = 0;
  // === API data ===
  public system: any;
  public declare version: ElysiaVersion;
  public version_loading: ElysiaVersionLoading = {
    is_loading: true,
    error: null
  }

  // === Scopes ===
  public selected_scope = 0;
  public subject_hours: {[key: number]: number[]} = {};

  // === Subjects ===
  public selected_subject = 0;
  public get_translate_subjects(): any[] {
    return Object.entries(this.l.s('subject_translations'));
  }

  // === Helpers ===
  public format_time_by_minutes(minutes: number): string {
    return `${Utils.addZeros(Math.floor(minutes / 60), 2)}:${Utils.addZeros(minutes % 60, 2)}`;
  }

  public format_minutes_by_time(time: string): number {
    const splitted_time = time.split(':');
    return parseInt(splitted_time[0]) * 60 + parseInt(splitted_time[1]);
  }

  ngOnInit(): void {
    this.http.get<ElysiaSystemAPI>(
      `${Config.API_URL}/v1/system`,
      { withCredentials: true }
    )
    .subscribe((data) => {
      this.system = {
        ...data,
        lesson_hour: `${Utils.addZeros(data.settings.startHour, 2)}:${Utils.addZeros(data.settings.startMinute, 2)}`,
        lesson_length: this.format_time_by_minutes(data.settings.lessonHour),
        break_time: this.format_time_by_minutes(data.settings.breakTime)
      };

      for(let subject of data.subjects) {
        this.subject_hours[subject.subjectId] = [0, 0, 0, 0, 0];
      }
    });

    this.http.get<ElysiaVersion>(
      `${Config.API_URL}/v1/version`
    )
    .subscribe((version) => {
      this.version = version
      this.version_loading.is_loading = false;
      this.version_loading.error = null;
    }, () => {
      this.version_loading.is_loading = false;
      this.version_loading.error = 'failed_load_version';
    })
  }

  // === Save School information ===
  public update_school(): void {
    const lesson_length = this.format_minutes_by_time(this.system.lesson_length);

    const break_time = this.format_minutes_by_time(this.system.break_time);

    this.http.post(
      `${Config.API_URL}/v1/system/update_school`,
      {
        name: this.system.settings.name,
        shortcut: this.system.settings.shortName,
        district: this.system.settings.district,
        lesson_start: this.system.lesson_hour,
        lesson_length,
        break_time,
        warn_absence: this.system.settings.warningAbsencePercent,
        fastlogin: this.system.settings.fastlogin ? true : false,
        resetPasswordWithEmail: this.system.settings.resetPasswordWithEmail ? true : false
      },
      { withCredentials: true }
    )
    .subscribe((data) => {
      console.log(data);
    })

  }

  // === Update Scope ===
  public update_scope(): void {
    const scope = this.system.scopes[this.selected_scope];
    console.log(scope);
    console.log(this.subject_hours);
  }
}
