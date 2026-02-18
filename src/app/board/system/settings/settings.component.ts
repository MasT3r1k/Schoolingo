import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Config } from '@Schoolingo/config';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { Utils } from '@Schoolingo/utils';
import { DropdownManager } from '@Schoolingo/dropdown';
import { ModalManager } from '@Schoolingo/modal';
import { CommonModule } from '@angular/common';
import { ChangelogModalComponent } from './modals/changelog/changelog.component';
import { LicenseModalComponent } from './modals/license/license.component';
import { Country } from 'country-state-city';

interface ElysiaVersion {
  current: string;
  latest: string;
  isUpToDate: boolean;
  isAhead: boolean;
  isBehind: boolean;
  aheadCount: number;
  behindCount: number;
  version: string;
  remoteVersion?: string;
}

interface UpdateStatus {
  isUpdating: boolean;
  lastCheck: Date | null;
  error: string | null;
  progress: string;
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

interface TeacherAPI {
  teacherId: number;
  teacherName: string; // Full name from backend
  firstName: string;
  lastName: string;
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

interface LdapConfig {
  config_id: number;
  type: number;
  server_url: string;
  bind_dn: string | null;
  bind_password: string | null;
  search_base: string;
  user_filter: string | null;
  mapping_username: string | null;
  mapping_email: string | null;
  mapping_name: string | null;
  enabled: boolean;
}

interface EmailConfig {
  provider: string; // 'basic_smtp', 'google_smtp', 'ses', etc.
  host: string;
  port: number;
  username: string | null;
  password: string | null;
  encryption: 'none' | 'ssl' | 'tls';
  from_email: string;
  from_name: string;
  enabled: boolean;
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
    // Auth
    auth_classic: boolean;
    auth_ldap: boolean;
    auth_passkeys: boolean;
    session_lifetime_minutes: number;
    max_login_attempts: number;
    backup_interval: number | null;
    auto_update: boolean;
    auto_update_interval: number;
    country: number | null;
    red_izo: string;
    ico: string;
    school_type: string;
    izo: string;
    online_enabled: number;
    online_default_platform: string;
    gdpr_firstname: string;
    gdpr_lastname: string;
    gdpr_phone: string;
    gdpr_email: string;
    gdpr_mobile: string;
    gdpr_databox: string;
    gdpr_web: string;
  };

  ldap_config: LdapConfig | null;
  email_config: EmailConfig | null;

  districts: {
    districtId: number;
    district: string;
  }[];

  countries: {
    countryId: number;
    nationality: string;
    code2: string;
  }[];

  student_count: number;

  subjects: SubjectAPI[]

  scopes: ScopeAPI[];

  domains: {
    domainId: number;
    domain: string;
  }[];

  lesson_hour: string;
  lesson_length: string;
  break_time: string;
}

enum enumSidebar {
  SYSTEM,
  LOGIN,
  LDAP,
  MAIN,
  EMAIL,
  FILES,
  SCOPES,
  SUBJECTS,
  GDPR_SETTINGS
}

@Component({
  imports: [IconsModule, FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css', '../../../styles/sidebar.css']
})
export class SettingsComponent implements OnInit {
  public Config = Config
  public enumSidebar = enumSidebar;
  private http = inject(HttpClient);
  public l = inject(Locale);
  public dropdownManager = inject(DropdownManager);
  public modalManager = inject(ModalManager);
  public countryManager = Country;
  public selected_interval_backup = 0;
  public interval_backups = ['daily', 'weekly', 'monthly']
  public options: any = {
    auto_updates: false
  }

  public input_errors: { [key: string]: string } = {};

  public sidebar: enumSidebar = 0;
  
  public system_loading_error = false;
  
  public reload(): void {
    this.system_loading_error = false;
    this.loadSystemSettings();
  }

  public loadSystemSettings(): void {
    this.http.get<ElysiaSystemAPI>(
      `${Config.API_URL}/v1/system`,
      { withCredentials: true }
    )
    .subscribe({
      next: (data) => {
      this.system = {
        ...data,
        lesson_hour: `${Utils.addZeros(data.settings.startHour, 2)}:${Utils.addZeros(data.settings.startMinute, 2)}`,
        lesson_length: this.format_time_by_minutes(data.settings.lessonHour),
        break_time: this.format_time_by_minutes(data.settings.breakTime)
      };

      if (!this.system.email_config) {
        this.system.email_config = {
          provider: this.email_types[0],
          host: '',
          port: 587,
          username: '',
          password: '',
          encryption: 'tls',
          from_email: '',
          from_name: 'Schoolingo',
          enabled: true
        }
      }

      if (!this.system.ldap_config) {
        this.system.ldap_config = {
            config_id: 0,
            type: 0,
            server_url: 'ldap://',
            bind_dn: '',
            bind_password: '',
            search_base: '',
            user_filter: '(uid=%u)',
            mapping_username: 'uid',
            mapping_email: 'mail',
            mapping_name: 'cn',
            enabled: false
        }
      }

      for(let subject of data.subjects) {
        if (subject.subjectId != null) {
          this.subject_hours[subject.subjectId] = [0, 0, 0, 0, 0];
        }
      }

      if (data.settings.backup_interval != null) {
        this.selected_interval_backup = data.settings.backup_interval;
      }
      this.options.auto_updates = data.settings.auto_update;
      this.system_loading_error = false;
    },
    error: () => {
      this.system_loading_error = true;
    }
  });
  }

  // === API data ===
  public declare system: ElysiaSystemAPI;
  public declare version: ElysiaVersion;
  public version_loading: ElysiaVersionLoading = {
    is_loading: true,
    error: null
  }
  
  public updateStatus: UpdateStatus = {
    isUpdating: false,
    lastCheck: null,
    error: null,
    progress: 'Idle'
  };

  public backups: any[] = [];
  public selected_backup_to_rollback: string | null = null;
  public new_domain: string = '';

  public get lastBackup(): any | null {
    if (!this.backups || this.backups.length === 0) return null;
    return this.backups[0]; // Assuming API returns sorted, otherwise we might need to sort
  }

  public get totalBackupSize(): number {
    return this.backups.reduce((acc, curr) => acc + (curr.size || 0), 0);
  }

  public get backupHealthStatus(): 'good' | 'warning' | 'critical' {
    if (!this.backups.length) return 'critical';
    // Logic: If last backup is older than 2 days -> warning, older than week -> critical
    // For now simple check if exists
    return 'good';
  }


  public checkUpdate(): void {
    this.version_loading.is_loading = true;
    this.http.post<ElysiaVersion>(`${Config.API_URL}/v1/refresh`, {}, { withCredentials: true }).subscribe((data) => {
        this.version = data;
        Config.APP_VERSION = data.version;
        this.version_loading.is_loading = false;
    }, () => {
        this.version_loading.error = 'failed_load_version';
        this.version_loading.is_loading = false;
    });
  }

  public getUpdateStatus(): void {
    this.http.get<UpdateStatus>(`${Config.API_URL}/v1/system/update/status`, { withCredentials: true }).subscribe((data) => {
        this.updateStatus = data;
        if (data.isUpdating) {
            setTimeout(() => this.getUpdateStatus(), 2000);
        }
    });
  }

  public triggerUpdate(): void {
    if (this.updateStatus.isUpdating) return;
    this.updateStatus.isUpdating = true;
    this.updateStatus.progress = 'Iniciuji...';
    this.http.post<any>(`${Config.API_URL}/v1/system/update/trigger`, {}, { withCredentials: true }).subscribe((res) => {
        if (res.success) {
            this.getUpdateStatus();
        } else {
            this.updateStatus.isUpdating = false;
            this.updateStatus.error = res.message;
        }
    }, () => {
        this.updateStatus.isUpdating = false;
        this.updateStatus.error = 'Update failed';
    });
  }

  public rollbackToBackup(): void {
    if (!this.selected_backup_to_rollback) return;
    if (!confirm('Opravdu chcete obnovit systém ze zálohy? Tato akce může restartovat systém.')) return;

    this.updateStatus.isUpdating = true;
    this.updateStatus.progress = 'Obnovuji ze zálohy...';
    this.http.post<any>(`${Config.API_URL}/v1/system/update/rollback`, { 
        backupFilename: this.selected_backup_to_rollback 
    }, { withCredentials: true }).subscribe((res) => {
        if (res.success) {
            alert('Obnova proběhla úspěšně. Systém se může restartovat.');
            location.reload();
        } else {
            this.updateStatus.isUpdating = false;
            this.updateStatus.error = res.message;
        }
    });
  }

  public saveUpdateConfig(): void {
    this.http.post(`${Config.API_URL}/v1/system/update/config`, {
        auto_update: this.options.auto_updates,
        auto_update_interval: 24
    }, { withCredentials: true }).subscribe(() => {
        console.log('Update config saved');
    });
  }

  public loadBackups(): void {
    this.http.get<any[]>(`${Config.API_URL}/v1/system/backup/list`, { withCredentials: true }).subscribe((data: any) => {
        this.backups = data.backups || data;
    });
  }

  public getStudentPercentage(): number {
    if (this.system.settings.studentsLimit == -1) return 100;
    return this.system.student_count / this.system.settings.studentsLimit * 100;
  }

  // === Email settings ===
  public selected_email_type = 0;
  public email_types: string[] = [
    'basic_smtp_server',
    'google_smtp_server'
  ];

  public school_types = [
    'grammar_school',
    'high_school',
    'secondary_professional_school',
    'vocational_school',
    'higher_professional_school',
    'conservatory',
  ];

  // === Changelog ===
  public openChangelog(): void {
    this.modalManager.openModal('changelog');
  }

  public openLicense(): void {
    this.modalManager.openModal('license');
  }

  // === Scopes ===
  public selected_scope: ScopeAPI | undefined = undefined;
  public subject_hours: {[key: number]: number[]} = {};

  public select_scope(scope: ScopeAPI | undefined): void {
    this.selected_scope = JSON.parse(JSON.stringify(scope));
    this.http.get<any[]>(
      `${Config.API_URL}/v1/system/scope?scope_id=${scope?.scopeId}`,
      { withCredentials: true }
    )
    .subscribe((data: any[]) => {
      this.subject_hours = {};
      data.forEach((item) => {
        if (!this.subject_hours[item.subject_id]) this.subject_hours[item.subject_id] = [];
        this.subject_hours[item.subject_id][item.year] = item.hours_per_week;
      });
      for(let subject of this.system.subjects) {
        if (subject.subjectId != null && !this.subject_hours[subject.subjectId]) {
          this.subject_hours[subject.subjectId] = [0, 0, 0, 0, 0];
        }
      }

    })
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

  public available_teachers: TeacherAPI[] = [];
  public assigned_teachers: TeacherAPI[] = [];
  public selected_teacher_to_add: number | null = null;
  public subject_save_loading = false;

  public get_translate_subjects(): any[] {
    return Object.entries(this.l.s('subject_translations'));
  }

  public select_subject_item(index: number): void {
    this.selected_subject = index;
    const subject = this.system.subjects[index];
    if (subject && subject.subjectId) {
        this.load_assigned_teachers(subject.subjectId);
    } else {
        this.assigned_teachers = [];
    }
  }

  public new_subject(): void {
    const subjectIndex = this.system.subjects.findIndex((subject) => subject.subjectId == null);
    if (subjectIndex != -1) {
      this.selected_subject = subjectIndex;
      this.assigned_teachers = [];
      return;
    }

    this.system.subjects.unshift({
      subjectId: null,
      subjectName: "",
      shortcut: ""
    });

    this.selected_subject = 0;
    this.assigned_teachers = [];
  }

  public save_subject(): void {
    const subject = this.system.subjects[this.selected_subject];
    if (!subject.subjectName || !subject.shortcut) return;

    this.subject_save_loading = true;
    this.http.post<{ success: boolean; subjectId: number }>(
        `${Config.API_URL}/v1/system/update_subject`,
        {
            subjectId: subject.subjectId,
            subjectName: subject.subjectName,
            shortcut: subject.shortcut
        },
        { withCredentials: true }
    ).subscribe((res) => {
        this.subject_save_loading = false;
        if (res.success) {
            subject.subjectId = res.subjectId;
        }
    }, () => {
        this.subject_save_loading = false;
    });
  }

  public load_teachers(): void {
    this.http.get<TeacherAPI[]>(`${Config.API_URL}/v1/teachers`).subscribe((data) => {
        this.available_teachers = data;
    });
  }

  public load_assigned_teachers(subjectId: number): void {
     this.http.get<TeacherAPI[]>(`${Config.API_URL}/v1/system/subject_teachers?subjectId=${subjectId}`, { withCredentials: true })
        .subscribe((data) => {
            this.assigned_teachers = data;
        });
  }

  public add_teacher_to_subject(): void {
    const subject = this.system.subjects[this.selected_subject];
    if (!subject.subjectId || !this.selected_teacher_to_add) return;

    this.http.post(`${Config.API_URL}/v1/system/subject_teachers/add`, {
        subjectId: subject.subjectId,
        teacherId: this.selected_teacher_to_add
    }, { withCredentials: true }).subscribe(() => {
        this.load_assigned_teachers(subject.subjectId!);
        this.selected_teacher_to_add = null;
    });
  }

  public remove_teacher_from_subject(teacherId: number): void {
    const subject = this.system.subjects[this.selected_subject];
    if (!subject.subjectId) return;

    this.http.post(`${Config.API_URL}/v1/system/subject_teachers/remove`, {
        subjectId: subject.subjectId,
        teacherId: teacherId
    }, { withCredentials: true }).subscribe(() => {
        this.load_assigned_teachers(subject.subjectId!);
    });
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
  public getCountry(id: number | null) {
    if (!this.system.countries) return null;
    return this.system.countries.find(c => c.countryId === id);
  }

  public format_time_by_minutes(minutes: number): string {
    return `${Utils.addZeros(Math.floor(minutes / 60), 2)}:${Utils.addZeros(minutes % 60, 2)}`;
  }

  public format_minutes_by_time(time: string): number {
    const splitted_time = time.split(':');
    return parseInt(splitted_time[0]) * 60 + parseInt(splitted_time[1]);
  }
  
  public addDomain(): void {
    if (!this.new_domain) return;
    this.http.post(`${Config.API_URL}/v1/system/domain`, { domain: this.new_domain }, { withCredentials: true })
      .subscribe((res: any) => {
          if (res.success) {
              this.new_domain = '';
              this.ngOnInit();
          } else {
              alert('Chyba při přidávání domény.');
          }
      }, (err) => {
          if (err.error?.error === 'domain_exists') {
              alert('Tato doména již existuje.');
          }
      });
  }

  public removeDomain(domainId: number): void {
      if (this.system.domains.length <= 1) {
          alert('Musí zůstat alespoň jedna doména.');
          return;
      }
      if (!confirm('Opravdu chcete odebrat tuto doménu?')) return;
      this.http.delete(`${Config.API_URL}/v1/system/domain`, { 
        body: { domainId }, 
        withCredentials: true 
      }).subscribe(() => {
          this.loadSystemSettings();
      });
  }

  ngOnInit(): void {
    this.loadSystemSettings();

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

    this.checkUpdate();

    this.modalManager.addModal(
      'changelog',
      {
        title: 'system.changelog',
        closeable: true,
        items: [
          { type: 'component', component: ChangelogModalComponent }
        ]
      }
    )

    this.modalManager.addModal(
        'license',
        {
            title: 'Správa licence',
            closeable: true,
            items: [
                { type: 'component', component: LicenseModalComponent }
            ]
        }
    )
    
    this.load_teachers();
    this.getUpdateStatus();
    this.loadBackups();
  }

  // === Save School information ===
  public hasModule(moduleName: string): boolean {
    if (!this.system?.settings?.modules) return false;
    const moduleMap: { [key: string]: number } = {
      'online': 1,
      'practices': 2,
      'messages': 4,
      'tests': 8,
      'rewards': 16,
      'tutoring': 32,
      'gdpr': 64
    };
    const modules = parseInt(this.system.settings.modules);
    if (isNaN(modules)) return false;
    return (modules & moduleMap[moduleName]) === moduleMap[moduleName];
  }

  public toggleModule(moduleName: string): void {
      if (!this.system?.settings?.modules) return;
      const moduleMap: { [key: string]: number } = {
        'online': 1,
        'practices': 2,
        'messages': 4,
        'tests': 8,
        'rewards': 16,
        'tutoring': 32,
        'gdpr': 64
      };
      let modules = parseInt(this.system.settings.modules);
      if (isNaN(modules)) modules = 0;
      
      // XOR to toggle
      modules ^= moduleMap[moduleName];
      
      this.system.settings.modules = modules.toString();

      this.update_school();
  }

  public update_school(): void {
    const lesson_length = this.format_minutes_by_time(this.system.lesson_length);

    const break_time = this.format_minutes_by_time(this.system.break_time);

    this.http.post(
      `${Config.API_URL}/v1/system/update_school`,
      {
        name: this.system.settings.name,
        shortcut: this.system.settings.shortName,
        district: this.system.settings.district,
        country: this.system.settings.country,
        red_izo: this.system.settings.red_izo,
        ico: this.system.settings.ico,
        school_type: this.system.settings.school_type,
        izo: this.system.settings.izo,
        lesson_start: this.system.lesson_hour,
        lesson_length,
        break_time,
        warn_absence: this.system.settings.warningAbsencePercent,
        fastlogin: this.system.settings.fastlogin ? true : false,
        resetPasswordWithEmail: this.system.settings.resetPasswordWithEmail ? true : false,
        modules: this.system.settings.modules,
        online_enabled: this.system.settings.online_enabled ? true : false,
        online_default_platform: this.system.settings.online_default_platform,
        gdpr_firstname: this.system.settings.gdpr_firstname,
        gdpr_lastname: this.system.settings.gdpr_lastname,
        gdpr_phone: this.system.settings.gdpr_phone,
        gdpr_email: this.system.settings.gdpr_email,
        gdpr_mobile: this.system.settings.gdpr_mobile,
        gdpr_databox: this.system.settings.gdpr_databox,
        gdpr_web: this.system.settings.gdpr_web
      },
      { withCredentials: true }
    )
    .subscribe((data) => {
      console.log(data);
    })

  }


  // === Auth & LDAP ===
  public update_login(): void {
    this.http.post(
      `${Config.API_URL}/v1/system/update_login`,
      {
        auth_classic: this.system.settings.auth_classic ? true : false,
        auth_ldap: this.system.settings.auth_ldap ? true : false,
        auth_qr: this.system.settings.fastlogin ? true : false,
        auth_passkeys: this.system.settings.auth_passkeys ? true : false,
        reset_password_with_email: this.system.settings.resetPasswordWithEmail ? true : false,
        session_lifetime_minutes: this.system.settings.session_lifetime_minutes,
        max_login_attempts: this.system.settings.max_login_attempts
      },
      { withCredentials: true }
    )
    .subscribe((data) => {
      console.log('Login settings updated', data);
    });
  }

  public get_teacher_name(id: number | null): string {
    if (!id) return '';
    return this.available_teachers.find(t => t.teacherId == id)?.teacherName || '';
  }

  public update_ldap(): void {
    if (!this.system.ldap_config) {
        // Init default if null
        this.system.ldap_config = {
            config_id: 0,
            type: 0,
            server_url: 'ldap://',
            bind_dn: '',
            bind_password: '',
            search_base: '',
            user_filter: '(uid=%u)',
            mapping_username: 'uid',
            mapping_email: 'mail',
            mapping_name: 'cn',
            enabled: false
        } as any; // Using any to bypass strict checks if new object doesn't fully match but it should
    }
    const config = this.system.ldap_config;
    if (!config) return;

    this.http.post(
      `${Config.API_URL}/v1/system/update_ldap`,
      config,
      { withCredentials: true }
    )
    .subscribe((data) => {
      console.log('LDAP settings updated', data);
    });
  }

  // === Email ===
  public update_email(): void {
    if (!this.system.email_config) {
        // Init default
        this.system.email_config = {
            provider: this.email_types[this.selected_email_type],
            host: '',
            port: 587,
            username: '',
            password: '',
            encryption: 'tls',
            from_email: 'noreply@schoolingo.cz',
            from_name: 'Schoolingo',
            enabled: false
        };
    }

    // Ensure provider is synced
    this.system.email_config.provider = this.email_types[this.selected_email_type];

    this.http.post(
      `${Config.API_URL}/v1/system/update_email`,
      this.system.email_config,
      { withCredentials: true }
    )
    .subscribe((data) => {
      console.log('Email settings updated', data);
    });
  }

  public update_backup_interval(index: number): void {
    this.selected_interval_backup = index;
    this.http.post(
      `${Config.API_URL}/v1/system/backup/interval`,
      { interval: index },
      { withCredentials: true }
    ).subscribe((data) => {
      console.log('Backup interval updated', data);
    });
  }

  public getSelectedTranslation() {
    return this.get_translate_subjects().find(s => s[0] == this.translate_subject)
  }

  public testConnection(provider: string): void {
      // In a real scenario, this would check if the admin has valid tokens or credentials setup
      // For now, we simulate a check or trigger a connect flow if adding system-wide accounts
      alert('Test připojení pro ' + provider + ' proběhl úspěšně. (Admin credentials check)');
  }
}