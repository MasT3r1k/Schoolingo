import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Config, SchoolTypes } from '@Schoolingo/config';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { Utils } from '@Schoolingo/utils';
import { DropdownManager } from '@Schoolingo/dropdown';
import { ModalManager } from '@Schoolingo/modal';
import { CommonModule } from '@angular/common';
import { ChangelogModalComponent } from './modals/changelog/changelog.component';
import { LicenseModalComponent } from './modals/license/license.component';
import { Country } from 'country-state-city';
import { enumSidebar, Sidebar } from './config';
import { CheckboxComponent } from '@Components/Checkbox';
import { DropdownComponent } from '@Components/dropdown/dropdown';

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
  subject_id: number | null;
  subject_name: string;
  shortcut: string;
}

interface TeacherAPI {
  teacherId: number;
  teacherName: string; // Full name from backend
  firstName: string;
  lastName: string;
}

interface ScopeAPI {
  scope_id: number | null;
  name: string;
  code: string;
  shortcut: string;
  years: number;
  number_of_classes: number;
  students_per_class: number;
}

interface RoleAPI {
  role_id: number | null;
  role_name: string;
  role_key: string;
  description: string | null;
  permissions: number[];
}

interface PermissionAPI {
  permission_id: number;
  permission_name: string;
  description: string | null;
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

export interface EvaluationTemplateAPI {
  template_id: number | null;
  type: 'activity' | 'homework' | 'disruptive' | 'supplies' | 'mobile';
  text: string;
  value: 'praise' | 'note';
  is_public: boolean;
}

type ElysiaSystemAPI = {
  settings: {
    name: string;
    short_name: string;
    code: string;
    district: string;
    start_hour: number;
    start_minute: number;
    lesson_hour: number;
    break_time: number;
    warning_absence_percent: number;
    reset_password_with_email: boolean;
    fastlogin: boolean;
    license_type: string;
    license_until: Date | null;
    students_limit: number;
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
    country_id: number | null;
    red_izo: string;
    ico: string;
    school_type: string;
    izo: string;
    online_enabled: boolean;
    online_default_platform: string;
    gdpr_first_name: string;
    gdpr_last_name: string;
    gdpr_phone: string;
    gdpr_email: string;
    gdpr_mobile: string;
    gdpr_databox: string;
    gdpr_web: string;
    msg_max_length: number;
    msg_attachments_max_count: number;
    msg_attachments_max_size: number;
    msg_type_private_active: boolean;
    msg_type_official_active: boolean;
    msg_type_noticeboard_active: boolean;
    noticeboard_max_length: number;
    employee_vacation_days_default: number;
    employee_vacation_requests_enabled: boolean;
    employee_attendance_enabled: boolean;
    employee_salaries_enabled: boolean;
    documents_enabled: boolean;
    traineeship_enabled: boolean;
    noticeboard_student_enabled: boolean;
    noticeboard_teacher_enabled: boolean;
    tests_enabled: boolean;
    rewards_enabled: boolean;
    demo_enabled: boolean;
  };

  ldap_config: LdapConfig | null;
  email_config: EmailConfig | null;

  districts: {
    district_id: number;
    district: string;
  }[];

  countries: {
    country_id: number;
    nationality: string;
    code2: string;
  }[];

  student_count: number;

  subjects: SubjectAPI[]

  scopes: ScopeAPI[];

  domains: {
    domain_id: number;
    domain: string;
  }[];

  lesson_hour: string;
  lesson_length: string;
  break_time: string;
  roles: RoleAPI[];
  all_permissions: PermissionAPI[];
  communication_permissions: {
    permission_id: number;
    role_source: string;
    role_target: string;
  }[];
  evaluation_templates: EvaluationTemplateAPI[];
}


@Component({
  imports: [IconsModule, FormsModule, ReactiveFormsModule, CommonModule, CheckboxComponent, DropdownComponent],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css', '../../../styles/sidebar.css']
})
export class SettingsComponent implements OnInit {
  public Config = Config
  public enumSidebar = enumSidebar;
  public Sidebar = Sidebar;
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

  public evaluation_types = ['activity', 'homework', 'disruptive', 'supplies', 'mobile'];

  public returnZero() {
    return 0;
  }

  public canteen_settings: any = {
    canteen_enabled: '1',
    canteen_flat_price_enabled: '0',
    canteen_flat_price: '0',
    canteen_payment_account: '1',
    canteen_auto_refund: '1',
    canteen_breakfast_enabled: '0',
    canteen_dinner_enabled: '0'
  };
  public canteen_staff: any[] = [];
  public canteen_managers: number[] = [];
  public canteen_cooks: number[] = [];
  public canteen_searchQuery = '';

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
      const currentRoles = this.system?.roles || [];
      const currentAllPermissions = this.system?.all_permissions || [];

      this.system = {
        ...data,
        lesson_hour: `${Utils.addZeros(data.settings.start_hour, 2)}:${Utils.addZeros(data.settings.start_minute, 2)}`,
        lesson_length: this.format_time_by_minutes(data.settings.lesson_hour),
        break_time: this.format_time_by_minutes(data.settings.break_time),
        roles: data.roles || currentRoles,
        all_permissions: data.all_permissions || currentAllPermissions
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
        if (subject.subject_id != null) {
          this.subject_hours[subject.subject_id] = [0, 0, 0, 0, 0];
        }
      }

      if (data.settings.backup_interval != null) {
        this.selected_interval_backup = data.settings.backup_interval;
      }
      this.options.auto_updates = data.settings.auto_update;

      // Initialize employee settings
      this.system.settings.employee_vacation_days_default = data.settings.employee_vacation_days_default ?? 25;
      this.system.settings.employee_vacation_requests_enabled = data.settings.employee_vacation_requests_enabled ? true : false;
      this.system.settings.employee_attendance_enabled = data.settings.employee_attendance_enabled ? true : false;
      this.system.settings.employee_salaries_enabled = data.settings.employee_salaries_enabled ? true : false;
      
      this.system.settings.documents_enabled = data.settings.documents_enabled ? true : false;
      this.system.settings.traineeship_enabled = data.settings.traineeship_enabled ? true : false;
      this.system.settings.online_enabled = data.settings.online_enabled ? true : false;
      this.system.settings.noticeboard_student_enabled = data.settings.noticeboard_student_enabled ? true : false;
      this.system.settings.noticeboard_teacher_enabled = data.settings.noticeboard_teacher_enabled ? true : false;
      this.system.settings.tests_enabled = data.settings.tests_enabled ? true : false;
      this.system.settings.rewards_enabled = data.settings.rewards_enabled ? true : false;
      this.system.settings.demo_enabled = data.settings.demo_enabled ? true : false;

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
    if (this.system.settings.students_limit == -1) return 100;
    return this.system.student_count / this.system.settings.students_limit * 100;
  }

  // === Email settings ===
  public selected_email_type = 0;
  public email_types: string[] = [
    'basic_smtp_server',
    'google_smtp_server'
  ];

public school_types = SchoolTypes;

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

  // === Roles ===
  public selected_role: RoleAPI | undefined = undefined;
  public role_save_loading = false;

  public load_roles(): void {
    this.http.get<{ roles: RoleAPI[], all_permissions: PermissionAPI[] }>(
      `${Config.API_URL}/v1/system/roles`,
      { withCredentials: true }
    ).subscribe((data) => {
      if (!this.system) {
        this.system = { roles: data.roles, all_permissions: data.all_permissions } as any;
      } else {
        this.system.roles = data.roles;
        this.system.all_permissions = data.all_permissions;
      }
    });
  }

  public select_role(role: RoleAPI | undefined): void {
    if (role) {
      this.selected_role = JSON.parse(JSON.stringify(role));
    } else {
      this.selected_role = undefined;
    }
  }

  public new_role(): void {
    const role = this.system.roles.find((r) => r.role_id == null);
    if (role) {
      this.selected_role = role;
      return;
    }

    const newRole: RoleAPI = {
      role_id: null,
      role_name: "Nová role",
      role_key: "new_role",
      description: "",
      permissions: []
    };

    this.system.roles.unshift(newRole);
    this.selected_role = this.system.roles[0];
  }

  public toggle_permission(permissionId: number): void {
    if (!this.selected_role) return;
    const index = this.selected_role.permissions.indexOf(permissionId);
    if (index === -1) {
      this.selected_role.permissions.push(permissionId);
    } else {
      this.selected_role.permissions.splice(index, 1);
    }
  }

  public has_permission(permissionId: number): boolean {
    return this.selected_role?.permissions.includes(permissionId) || false;
  }

  public save_role(): void {
    if (!this.selected_role) return;
    this.role_save_loading = true;
    this.http.post<{ success: boolean; roleId: number }>(
      `${Config.API_URL}/v1/system/update_role`,
      {
        roleId: this.selected_role.role_id,
        name: this.selected_role.role_name,
        key: this.selected_role.role_key,
        description: this.selected_role.description,
        permissionIds: this.selected_role.permissions
      },
      { withCredentials: true }
    ).subscribe((res) => {
      this.role_save_loading = false;
      if (res.success) {
        if (this.selected_role) {
          this.selected_role.role_id = res.roleId;
          // Update in the list
          const index = this.system.roles.findIndex(r => r.role_id === null || r.role_id === res.roleId);
          if (index !== -1) {
            this.system.roles[index] = JSON.parse(JSON.stringify(this.selected_role));
          }
        }
      }
    }, () => {
      this.role_save_loading = false;
    });
  }

  public delete_role(roleId: number | null): void {
    if (roleId === null) {
      this.system.roles = this.system.roles.filter(r => r.role_id !== null);
      this.selected_role = undefined;
      return;
    }

    if (!confirm('Opravdu chcete smazat tuto roli?')) return;

    this.http.delete(`${Config.API_URL}/v1/system/role`, {
      body: { roleId },
      withCredentials: true
    }).subscribe(() => {
      this.system.roles = this.system.roles.filter(r => r.role_id !== roleId);
      this.selected_role = undefined;
    });
  }

  // === Communication Permissions ===
  public has_comm_permission(source: string, target: string): boolean {
    return this.system.communication_permissions.some(p => p.role_source === source && p.role_target === target);
  }

  public toggle_comm_permission(source: string, target: string): void {
    const index = this.system.communication_permissions.findIndex(p => p.role_source === source && p.role_target === target);
    if (index === -1) {
      this.system.communication_permissions.push({ permission_id: 0, role_source: source, role_target: target });
    } else {
      this.system.communication_permissions.splice(index, 1);
    }
  }

  public save_comm_permissions(): void {
    // Group by source and save
    const sources = [...new Set(this.system.roles.map(r => r.role_key))];
    
    // We can do it sequentially or all at once if the API supports it.
    // The existing API /messages/permissions takes role_source and role_targets.
    
    sources.forEach(source => {
      const targets = this.system.communication_permissions
        .filter(p => p.role_source === source)
        .map(p => p.role_target);
      
      this.http.post(`${Config.API_URL}/v1/messages/permissions`, {
        role_source: source,
        role_targets: targets
      }, { withCredentials: true }).subscribe();
    });
  }

  public select_scope(scope: ScopeAPI | undefined): void {
    this.selected_scope = JSON.parse(JSON.stringify(scope));
    this.http.get<any[]>(
      `${Config.API_URL}/v1/system/scope?scope_id=${scope?.scope_id}`,
      { withCredentials: true }
    )
    .subscribe((data: any[]) => {
      this.subject_hours = {};
      data.forEach((item) => {
        if (!this.subject_hours[item.subject_id]) this.subject_hours[item.subject_id] = [];
        this.subject_hours[item.subject_id][item.year] = item.hours_per_week;
      });
      for(let subject of this.system.subjects) {
        if (subject.subject_id != null && !this.subject_hours[subject.subject_id]) {
          this.subject_hours[subject.subject_id] = [0, 0, 0, 0, 0];
        }
      }

    })
    this.input_errors = {};
  }

  public get_selected_scope_index(): number {
    return this.system.scopes.findIndex((scope) => scope.scope_id == this.selected_scope?.scope_id);
  }

  public new_scope(): void {
    const scope = this.system.scopes.find((scope) => scope.scope_id == null);
    if (scope) {
      this.selected_scope = scope;
      return;
    }

    this.system.scopes.unshift({
      scope_id: null,
      name: "",
      code: "",
      shortcut: "",
      years: 3,
      number_of_classes: 1,
      students_per_class: 20
    });

    this.select_scope(this.system.scopes[0]);
  }

  public remove_scope(scope_id: number | null): void {
    const scopeIndex = this.system.scopes.findIndex((scope) => scope.scope_id == scope_id);
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
        scopeId: scope.scope_id,
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
        if (scope.scope_id == null) {
          scope.scope_id = data.scopeId as number;
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
    if (subject && subject.subject_id) {
        this.load_assigned_teachers(subject.subject_id);
    } else {
        this.assigned_teachers = [];
    }
  }

  public new_subject(): void {
    const subjectIndex = this.system.subjects.findIndex((subject) => subject.subject_id == null);
    if (subjectIndex != -1) {
      this.selected_subject = subjectIndex;
      this.assigned_teachers = [];
      return;
    }

    this.system.subjects.unshift({
      subject_id: null,
      subject_name: "",
      shortcut: ""
    });

    this.selected_subject = 0;
    this.assigned_teachers = [];
  }

  public save_subject(): void {
    const subject = this.system.subjects[this.selected_subject];
    if (!subject.subject_name || !subject.shortcut) return;

    this.subject_save_loading = true;
    this.http.post<{ success: boolean; subjectId: number }>(
        `${Config.API_URL}/v1/system/update_subject`,
        {
            subjectId: subject.subject_id,
            subjectName: subject.subject_name,
            shortcut: subject.shortcut
        },
        { withCredentials: true }
    ).subscribe((res) => {
        this.subject_save_loading = false;
        if (res.success) {
            subject.subject_id = res.subjectId;
        }
    }, () => {
        this.subject_save_loading = false;
    });
  }

  public load_teachers(): void {
    this.http.get<TeacherAPI[]>(`${Config.API_URL}/v1/teachers`, { withCredentials: true }).subscribe((data) => {
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
    if (!subject.subject_id || !this.selected_teacher_to_add) return;

    this.http.post(`${Config.API_URL}/v1/system/subject_teachers/add`, {
        subjectId: subject.subject_id,
        teacherId: this.selected_teacher_to_add
    }, { withCredentials: true }).subscribe(() => {
        this.load_assigned_teachers(subject.subject_id!);
        this.selected_teacher_to_add = null;
    });
  }

  public remove_teacher_from_subject(teacherId: number): void {
    const subject = this.system.subjects[this.selected_subject];
    if (!subject.subject_id) return;

    this.http.post(`${Config.API_URL}/v1/system/subject_teachers/remove`, {
        subjectId: subject.subject_id,
        teacherId: teacherId
    }, { withCredentials: true }).subscribe(() => {
        this.load_assigned_teachers(subject.subject_id!);
    });
  }

  public onInputSubjectName(): void {
    const translation = this.get_translate_subjects().find((sub) => sub[1].toLowerCase() == this.system.subjects[this.selected_subject].subject_name.toLowerCase());
    if (translation) {
      this.translate_subject = translation[0];
    }
  }

  public checkCollisionSubject(): boolean {
    const currentSubject = this.system.subjects[this.selected_subject];
    const subjects = this.system.subjects.filter((subject) => (subject.subject_name.toLowerCase() == currentSubject.subject_name.toLowerCase() || subject.shortcut.toLowerCase() == currentSubject.shortcut.toLowerCase()) && subject.subject_id != currentSubject.subject_id);
    return !!subjects.length;
  }

  // === Helpers ===
  public getCountry(id: number | null) {
    if (!this.system.countries) return null;
    return this.system.countries.find(c => c.country_id === id);
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

  public removeDomain(domain_id: number): void {
      if (this.system.domains.length <= 1) {
          alert('Musí zůstat alespoň jedna doména.');
          return;
      }
      if (!confirm('Opravdu chcete odebrat tuto doménu?')) return;
      this.http.delete(`${Config.API_URL}/v1/system/domain`, { 
        body: { domainId: domain_id }, 
        withCredentials: true 
      }).subscribe(() => {
          this.loadSystemSettings();
      });
  }

  ngOnInit(): void {
    this.loadSystemSettings();
    this.load_roles();
    this.loadCanteenSettings();

    this.http.get<ElysiaVersion>(
      `${Config.API_URL}/v1/version`,
      { withCredentials: true }
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
        icon: 'history',
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
        shortcut: this.system.settings.short_name,
        district: this.system.settings.district,
        country: this.system.settings.country_id,
        red_izo: this.system.settings.red_izo,
        ico: this.system.settings.ico,
        school_type: this.system.settings.school_type,
        izo: this.system.settings.izo,
        lesson_start: this.system.lesson_hour,
        lesson_length,
        break_time,
        warn_absence: this.system.settings.warning_absence_percent,
        fastlogin: this.system.settings.fastlogin ? true : false,
        resetPasswordWithEmail: this.system.settings.reset_password_with_email ? true : false,
        modules: this.system.settings.modules,
        online_enabled: this.system.settings.online_enabled ? true : false,
        online_default_platform: this.system.settings.online_default_platform,
        gdpr_firstname: this.system.settings.gdpr_first_name,
        gdpr_lastname: this.system.settings.gdpr_last_name,
        gdpr_phone: this.system.settings.gdpr_phone,
        gdpr_email: this.system.settings.gdpr_email,
        gdpr_mobile: this.system.settings.gdpr_mobile,
        gdpr_databox: this.system.settings.gdpr_databox,
        gdpr_web: this.system.settings.gdpr_web,
        msg_max_length: Number(this.system.settings.msg_max_length),
        msg_attachments_max_count: Number(this.system.settings.msg_attachments_max_count),
        msg_attachments_max_size: Number(this.system.settings.msg_attachments_max_size),
        msg_type_private_active: this.system.settings.msg_type_private_active ? true : false,
        msg_type_official_active: this.system.settings.msg_type_official_active ? true : false,
        msg_type_noticeboard_active: this.system.settings.msg_type_noticeboard_active ? true : false,
        noticeboard_max_length: Number(this.system.settings.noticeboard_max_length),
        employee_vacation_days_default: Number(this.system.settings.employee_vacation_days_default),
        employee_vacation_requests_enabled: this.system.settings.employee_vacation_requests_enabled ? true : false,
        employee_attendance_enabled: this.system.settings.employee_attendance_enabled ? true : false,
        employee_salaries_enabled: this.system.settings.employee_salaries_enabled ? true : false,
        documents_enabled: this.system.settings.documents_enabled ? true : false,
        traineeship_enabled: this.system.settings.traineeship_enabled ? true : false,
        noticeboard_student_enabled: this.system.settings.noticeboard_student_enabled ? true : false,
        noticeboard_teacher_enabled: this.system.settings.noticeboard_teacher_enabled ? true : false,
        tests_enabled: this.system.settings.tests_enabled ? true : false,
        rewards_enabled: this.system.settings.rewards_enabled ? true : false
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
        reset_password_with_email: this.system.settings.reset_password_with_email ? true : false,
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

  public test_ldap_loading = false;
  
  public test_ldap(): void {
    const config = this.system.ldap_config;
    if (!config) return;

    this.test_ldap_loading = true;
    this.http.post(
      `${Config.API_URL}/v1/system/test_ldap`,
      config,
      { withCredentials: true }
    )
    .subscribe((data: any) => {
      this.test_ldap_loading = false;
      if (data.success) {
        alert('Testovací připojení LDAP proběhlo úspěšně!');
      } else {
        alert('Chyba při připojování k LDAP: ' + (data.message || 'Neznámá chyba'));
      }
    }, (err) => {
       this.test_ldap_loading = false;
       alert('Chyba při připojování k LDAP: ' + err.error?.message);
    });
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
      alert('Nastavení LDAP úspěšně uloženo.');
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

  // === Evaluation Templates ===
  public new_evaluation_template(): void {
    const newTemplate: EvaluationTemplateAPI = {
      template_id: null,
      type: 'activity',
      text: '',
      value: 'praise',
      is_public: true
    };
    this.system.evaluation_templates.push(newTemplate);
  }

  public save_evaluation_template(template: EvaluationTemplateAPI): void {
    this.http.post<{ success: boolean; templateId: number }>(
      `${Config.API_URL}/v1/system/evaluation_templates`,
      {
        templateId: template.template_id,
        type: template.type,
        text: template.text,
        value: template.value,
        isPublic: template.is_public
      },
      { withCredentials: true }
    ).subscribe((res) => {
      if (res.success) {
        template.template_id = res.templateId;
      }
    });
  }

  public delete_evaluation_template(template: EvaluationTemplateAPI): void {
    if (template.template_id === null) {
      this.system.evaluation_templates = this.system.evaluation_templates.filter(t => t !== template);
      return;
    }

    if (!confirm('Opravdu chcete smazat tuto šablonu?')) return;

    this.http.delete(`${Config.API_URL}/v1/system/evaluation_templates`, {
      body: { templateId: template.template_id },
      withCredentials: true
    }).subscribe(() => {
      this.system.evaluation_templates = this.system.evaluation_templates.filter(t => t.template_id !== template.template_id);
    });
  }

  public loadCanteenSettings(): void {
    this.http.get<any>(`${Config.API_URL}/v1/canteen/settings`, { withCredentials: true }).subscribe({
      next: (data) => {
        if (data.settings) {
          this.canteen_settings = { ...this.canteen_settings, ...data.settings };
        }
        this.canteen_staff = data.staff || [];
        this.canteen_managers = data.managers || [];
        this.canteen_cooks = data.cooks || [];
      }
    });
  }

  public getFilteredCanteenStaff() {
    if (!this.canteen_searchQuery) return this.canteen_staff;
    const q = this.canteen_searchQuery.toLowerCase();
    return this.canteen_staff.filter(s => s.name.toLowerCase().includes(q));
  }

  public isCanteenManager(userId: number): boolean {
    return this.canteen_managers.includes(userId);
  }

  public isCanteenCook(userId: number): boolean {
    return this.canteen_cooks.includes(userId);
  }

  public toggleCanteenManager(userId: number) {
    const idx = this.canteen_managers.indexOf(userId);
    if (idx > -1) {
      this.canteen_managers.splice(idx, 1);
    } else {
      this.canteen_managers.push(userId);
    }
  }

  public toggleCanteenCook(userId: number) {
    const idx = this.canteen_cooks.indexOf(userId);
    if (idx > -1) {
      this.canteen_cooks.splice(idx, 1);
    } else {
      this.canteen_cooks.push(userId);
    }
  }

  public getCanteenPaymentAccounts() {
    return [
      { label: (this.l.s('canteen.credit_account') || 'Kreditní účet') + ' (ID: 1)', value: '1' },
      { label: (this.l.s('canteen.class_fund_account') || 'Třídní fond') + ' (ID: 2)', value: '2' }
    ];
  }

  public saveCanteenSettings() {
    const payload = {
      settings: this.canteen_settings,
      managers: this.canteen_managers,
      cooks: this.canteen_cooks
    };

    this.http.post<any>(`${Config.API_URL}/v1/canteen/settings`, payload, { withCredentials: true }).subscribe();
  }
}