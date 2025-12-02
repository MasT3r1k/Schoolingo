import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
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

@Component({
  selector: 'system-system',
  imports: [IconsModule],
  templateUrl: './system.component.html',
  styleUrl: './system.component.css'
})
export class SystemComponent implements OnInit {
  private http = inject(HttpClient);
  public declare system: ElysiaSystemAPI;
  public declare version: ElysiaVersion;
  public version_loading: ElysiaVersionLoading = {
    is_loading: true,
    error: null
  }
  public showSelect: null | 'intervalBackup' = null;
  public selected_interval_backup = 0;
  public interval_backups = ['daily', 'weekly', 'monthly']

  public options: any = {
    auto_updates: false
  }

  public l = inject(Locale);
  public Config = Config;

  ngOnInit(): void {
    this.http.get<ElysiaSystemAPI>(
      `${Config.API_URL}/v1/system`,
      { withCredentials: true }
    )
    .subscribe((data) => {
      this.system = {
        ...data
      };
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

  public getStudentPercentage(): number {
    if (this.system.settings.studentsLimit == -1) return 100;
    return this.system.student_count / this.system.settings.studentsLimit * 100;
  }
}
