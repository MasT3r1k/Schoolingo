import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Config } from '@Schoolingo/config';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { Utils } from '@Schoolingo/utils';
import { IconEyeglassFilled, IconRectangleRoundedBottom } from 'angular-tabler-icons/icons';

interface ElysiaVersion {
  current: string;
  latest: string;
  isUpToDate: boolean;
}

interface ElysiaVersionLoading {
  is_loading: boolean;
  error: string | null;
}

interface SubjectAPI {
  subjectId: number | null;
  subjectName: string;
  shortcut: string;
}

interface ScopeAPI {
  scopeId: number | null;
  name: string;
  code: string;
  shortcut: string;
  years: number;
  number_of_classes: number;
  students_per_class: number;
}

type ElysiaSystemAPI = {
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

  subjects: SubjectAPI[]

  scopes: ScopeAPI[];

  lesson_hour: string;
  lesson_length: string;
  break_time: string;
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

  public input_errors: { [key: string]: string } = {};

  public sidebar: enumSidebar = 0;
  // === API data ===
  public declare system: ElysiaSystemAPI;
  public declare version: ElysiaVersion;
  public version_loading: ElysiaVersionLoading = {
    is_loading: true,
    error: null
  }

  // === Scopes ===
  public selected_scope: ScopeAPI | undefined = undefined;
  public subject_hours: {[key: number]: number[]} = {};

  public select_scope(scope: ScopeAPI | undefined): void {
    this.selected_scope = JSON.parse(JSON.stringify(scope));
    this.input_errors = {};
  }

  public get_selected_scope_index(): number {
    return this.system.scopes.findIndex((scope) => scope.scopeId == this.selected_scope?.scopeId);
  }

  public new_scope(): void {
    const scope = this.system.scopes.find((scope) => scope.scopeId == null);
    if (scope) {
      this.selected_scope = scope;
      return;
    }

    this.system.scopes.unshift({
      scopeId: null,
      name: "",
      code: "",
      shortcut: "",
      years: 3,
      number_of_classes: 1,
      students_per_class: 20
    });

    this.select_scope(this.system.scopes[0]);
  }

  public remove_scope(scopeId: number | null): void {
    const scopeIndex = this.system.scopes.findIndex((scope) => scope.scopeId == scopeId);
    if (scopeIndex == -1) return;
    this.system.scopes.splice(scopeIndex, 1);
    this.selected_scope = undefined;
  }

  // === Update Scope ===
  public update_scope(): void {
    this.input_errors = {};
    if (!this.selected_scope) return;
    if (this.selected_scope.name == "") {
      this.input_errors['scope_name'] = this.l.s('form.required');
    }

    if (this.selected_scope.code == "") {
      this.input_errors['scope_code'] = this.l.s('form.required');
    }

    if (this.selected_scope.shortcut == "") {
      this.input_errors['scope_shortcut'] = this.l.s('form.required');
    }

    if (Object.keys(this.input_errors).length) {
      return;
    }
    const scope = this.selected_scope;
    if (scope == undefined) return;
    console.log(scope);
    console.log(this.subject_hours);
    this.http.post(
      `${Config.API_URL}/v1/system/update_scope`,
      {
        scopeId: scope.scopeId,
        name: scope.name,
        shortcut: scope.shortcut,
        code: scope.code,
        years: scope.years,
        students_per_class: scope.students_per_class,
        number_of_classes: scope.number_of_classes,
        subjects: this.subject_hours
      },
      { withCredentials: true }
    )
    .subscribe((data) => {
      const scope = this.selected_scope;
      if (scope == undefined) return;
      if ('scopeId' in data) {
        if (scope.scopeId == null) {
          scope.scopeId = data.scopeId as number;
        }
      }
      console.log(data)
    });
  }

  // === Subjects ===
  public selected_subject = 0;
  public translate_subject = '';
  public get_translate_subjects(): any[] {
    return Object.entries(this.l.s('subject_translations'));
  }

  public new_subject(): void {
    const subjectIndex = this.system.subjects.findIndex((subject) => subject.subjectId == null);
    if (subjectIndex != -1) {
      this.selected_subject = subjectIndex;
      return;
    }

    this.system.subjects.unshift({
      subjectId: null,
      subjectName: "",
      shortcut: ""
    });

    this.selected_subject = 0;
  }

  public onInputSubjectName(): void {
    const translation = this.get_translate_subjects().find((sub) => sub[1].toLowerCase() == this.system.subjects[this.selected_subject].subjectName.toLowerCase());
    if (translation) {
      this.translate_subject = translation[0];
    }
  }

  public checkCollisionSubject(): boolean {
    const currentSubject = this.system.subjects[this.selected_subject];
    const subjects = this.system.subjects.filter((subject) => (subject.subjectName.toLowerCase() == currentSubject.subjectName.toLowerCase() || subject.shortcut.toLowerCase() == currentSubject.shortcut.toLowerCase()) && subject.subjectId != currentSubject.subjectId);
    return !!subjects.length;
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
        if (subject.subjectId != null) {
          this.subject_hours[subject.subjectId] = [0, 0, 0, 0, 0];
        }
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
}
