import { Component, OnInit, inject, ViewChild, ElementRef, AfterViewInit, HostListener } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { IconsModule } from '@Schoolingo/icons';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Config } from '@Schoolingo/config';
import { Utils } from '@Schoolingo/utils';
import { DropdownManager } from '@Schoolingo/dropdown';
import { Locale } from '@Schoolingo/locale';
import { CalendarComponent } from '@Components/calendar';
import moment from 'moment';
import { School } from '@Schoolingo/school';
import { ModalManager } from '@Schoolingo/modal';
import { ImportUserComponent } from './modals/import-user/import-user.component';
import { Router } from '@angular/router';
import { AvatarService } from '../../../infrastructure/utils/avatar.service';

// Interfaces
export interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  full_name: string;
  login_type: string;
  email: string;
  role: 'admin' | 'teacher' | 'student' | 'parent';
  status: 'active' | 'inactive' | 'suspended';
  photo_url?: string;
  avatar: string | null;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserDetail extends User {
  person_id: number | null;
  locale: string | null;
  theme: number | null;
  birthday: string | null;
  gender: string | null;
  '2fa': boolean;
  password_changed: string | null;
  emails: { email: string; is_verified: boolean; description: string | null }[];
  phones: { code: string; number: string; description: string | null; is_verified: boolean }[];
  login_history: { created: string; ip: string; user_agent: string; success: boolean }[];
  logins_7days: number;
  failed_logins_7days: number;
  student?: any;
  employee?: any;
  parent?: any;
}

export interface UserFilters {
  search: string;
  role: 'all' | 'admin' | 'teacher' | 'student' | 'parent';
  status: 'all' | 'active' | 'inactive' | 'suspended';
}

// Backend API response interface
interface UserAPIResponse {
  data: {
    user_id: number;
    username: string;
    first_name: string;
    last_name: string;
    full_name: string;
    login_type: string;
    email: string;
    role: string;
    status: string;
    photo_url?: string;
    avatar: string | null;
    last_login: string | null;
    last_login_ip: string | null;
    last_login_user_agent: string | null;
    created_at: string;
    updated_at: string;
  }[];
  meta: {
    total: number;
    page: number;
    limit: number;
  }
}

@Component({
  selector: 'app-manageusers',
  standalone: true,
  imports: [CommonModule, IconsModule, FormsModule, DatePipe, CalendarComponent],
  templateUrl: './manageusers.component.html',
  styleUrl: './manageusers.component.css'
})
export class ManageusersComponent implements OnInit, AfterViewInit {
  private http = inject(HttpClient);
  public l = inject(Locale);
  public Utils = Utils;
  public router = inject(Router);
  public modalManager = inject(ModalManager);
  public dropdownManager = inject(DropdownManager);
  public school = inject(School);
  public avatarService = inject(AvatarService);

  @ViewChild('tabsNav') tabsNav?: ElementRef;
  public showLeftScroll = false;
  public showRightScroll = false;

  ngAfterViewInit(): void {
    setTimeout(() => this.checkScroll(), 250);
  }

  @HostListener('window:resize')
  public onResize() {
    this.checkScroll();
  }

  public checkScroll() {
    const el = this.tabsNav?.nativeElement;
    if (!el) return;
    this.showLeftScroll = el.scrollLeft > 5;
    this.showRightScroll = el.scrollLeft < el.scrollWidth - el.clientWidth - 5;
  }

  public scrollTabs(dir: number) {
    const el = this.tabsNav?.nativeElement;
    if (el) el.scrollBy({ left: dir * 150, behavior: 'smooth' });
  }

  // Loading state
  isLoading = false;
  loadError: string | null = null;

  pageSize = 10

  // Filters
  filters: UserFilters = {
    search: '',
    role: 'all',
    status: 'all'
  };

  public getFilterLabel(type: 'role' | 'status', value: string): string {
    const options = this.getFilterOptions(type);
    return options.find(o => o.value === value)?.label || value;
  }

  public getFilterOptions(type: 'role' | 'status'): {value: string, label: string}[] {
    switch(type) {
      case 'role':
        return [
          {value: 'all', label: 'Všechny role'},
          {value: 'admin', label: 'Administrátoři'},
          {value: 'teacher', label: 'Učitelé'},
          {value: 'student', label: 'Studenti'},
          {value: 'parent', label: 'Rodiče'}
        ];
      case 'status':
        return [
          {value: 'all', label: 'Všechny stavy'},
          {value: 'active', label: 'Aktivní'},
          {value: 'inactive', label: 'Neaktivní'},
          {value: 'suspended', label: 'Pozastavení'}
        ];
      default: return [];
    }
  }

  // Pagination
  currentPage = 1;
  totalItems = 0;
  totalPages = 0;

  // Selected User
  selectedUser: UserDetail | null = null;
  isDetailLoading = false;
  activeTab: 'overview' | 'edit' | 'security' | 'activity' | 'student' | 'employee' = 'overview';

  // Edit form
  editForm = {
    username: '',
    first_name: '',
    last_name: '',
    role: '',
    birthday: moment(),
    gender: ''
  };
  editFormErrors: Record<string, string> = {};
  isSaving = false;
  saveSuccess = false;
  saveError: string | null = null;

  // Reset Password
  resetPasswordForm = {
    new_password: '',
    confirm_password: '',
    showPassword: false,
    generatedPassword: '' as string | null
  };
  isResettingPassword = false;
  resetPasswordSuccess = false;
  resetPasswordError: string | null = null;

  // Users data from API
  users: User[] = [];

  // Add User Modal
  showAddUserModal = false;
  newUser = {
    mode: 'new' as 'new' | 'import',
    person_id: null as number | null,
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    role: 'student' as 'admin' | 'teacher' | 'student' | 'parent' | 'management' | 'admin_staff' | 'personnel' | 'maintenance' | 'other',
    class_id: null as number | null,
    is_distance: false,
    cabinet_id: null as number | null,
    employee_number: '',
    contract_type: 'fulltime' as 'fulltime' | 'parttime' | 'dpp' | 'dpc' | null,
    hours_per_week: 40,
    password: ''
  };

  currentStep = 1;
  availableClasses: any[] = [];
  unlinkedPersons: any[] = [];
  availableRooms: any[] = [];


  
  formErrors: {
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
    password: string;
    general: string;
    [key: string]: string;
  } = {
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    role: '',
    password: '',
    general: ''
  };



  isSubmitting = false;

  // File Manager Modal
  selectedUserForFiles: User | null = null;

  ngOnInit() {
    this.loadUsers();

    this.modalManager.addModal('import_user', {
      icon: 'user-search',
      title: '',
      closeable: true,
      items: [
        { type: 'component', component: ImportUserComponent }
      ]
    })
  }

  public openImportModal(): void {
    this.modalManager.openModal('import_user');
  }

  // Load users from API
  loadUsers(page = this.currentPage) {
    this.currentPage = page;
    this.isLoading = true;
    this.loadError = null;

    // Build params
    let params: any = {
      limit: this.pageSize,
      offset: (page - 1) * this.pageSize,
      search: this.filters.search,
    };

    if (this.filters.role !== 'all') params.role = this.filters.role;
    if (this.filters.status !== 'all') params.status = this.filters.status;

    this.http.get<UserAPIResponse>(
      `${Config.API_URL}/v1/system/users`,
      {
        withCredentials: true,
        params: params
      }
    ).subscribe({
      next: (response) => {
        // Transform API response
        this.users = response.data.map(apiUser => this.transformUser(apiUser));
        
        // Update pagination
        this.totalItems = response.meta.total;
        this.totalPages = Math.ceil(this.totalItems / this.pageSize);

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.loadError = 'Nepodařilo se načíst seznam uživatelů';
        this.isLoading = false;
        this.users = [];
      }
    });
  }

  // Handle filter changes
  onFilterChange() {
    this.loadUsers(1); 
  }

  // Clear all filters
  clearFilters() {
    this.filters = {
      search: '',
      role: 'all',
      status: 'all'
    };
    this.loadUsers(1);
  }

  // Pagination controls
  getPageList(): number[] {
    let pages = [-4, -3, -2, -1, 0, 1, 2, 3, 4];
    let list: number[] = [];
    pages.forEach((page: number) => {
      list.push(page + this.currentPage);
    })

    let startSlice = 0;
    if (this.currentPage == 4 || this.currentPage == this.totalPages - 1) {
      startSlice = 1;
    } else if (this.currentPage > 3 && this.currentPage <= this.totalPages - 2) {
      startSlice = 2;
    }

    return list.filter((page) => page > 0 && page <= this.totalPages).slice(startSlice).slice(0, 5);
  }

  // Detail View
  selectUser(user: User) {
    this.activeTab = 'overview';
    this.saveSuccess = false;
    this.saveError = null;
    this.resetPasswordSuccess = false;
    this.resetPasswordError = null;
    this.isDetailLoading = true;
    this.selectedUser = null;

    this.http.get<any>(
      `${Config.API_URL}/v1/system/users/${user.id}`,
      { withCredentials: true }
    ).subscribe({
      next: (response) => {
        this.selectedUser = {
          id: response.user_id,
          username: response.username,
          first_name: response.first_name,
          last_name: response.last_name,
          full_name: response.full_name,
          email: response.emails?.[0]?.email || '',
          login_type: response.login_type,
          role: this.mapRole(response.role),
          status: this.mapStatus('active'),
          photo_url: response.photo_url,
          avatar: response.avatar,
          last_login: response.last_login,
          created_at: response.created_at,
          updated_at: response.updated_at,
          person_id: response.person_id,
          locale: response.locale,
          theme: response.theme,
          birthday: response.birthday,
          gender: response.gender,
          '2fa': response['2fa'],
          password_changed: response.password_changed,
          emails: response.emails || [],
          phones: response.phones || [],
          login_history: response.login_history || [],
          logins_7days: response.logins_7days || 0,
          failed_logins_7days: response.failed_logins_7days || 0
        };
        this.fillEditForm();
        this.loadSpecificData();
        this.isDetailLoading = false;
      },
      error: (err) => {
        console.error('Error loading user detail:', err);
        this.isDetailLoading = false;
      }
    });
  }

  loadSpecificData() {
    if (!this.selectedUser || !this.selectedUser.person_id) return;

    const { role, person_id } = this.selectedUser;

    if (role === 'student') {
      this.http.get<any>(`${Config.API_URL}/v1/student/${person_id}`, { withCredentials: true }).subscribe({
        next: (data) => this.selectedUser!.student = data
      });
    } else if (role === 'teacher') {
      this.http.get<any>(`${Config.API_URL}/v1/employees/${person_id}`, { withCredentials: true }).subscribe({
        next: (data) => this.selectedUser!.employee = data
      });
    } else if (role === 'parent') {
      this.http.post<any>(`${Config.API_URL}/v1/parents/search`, { 
        search: this.selectedUser.full_name,
        limit: 10,
        offset: 0
      }, { withCredentials: true }).subscribe({
        next: (res) => {
          if (res.data && res.data.length > 0) {
            this.selectedUser!.parent = res.data.find((p: any) => p.parent_id === person_id) || res.data[0];
          }
        }
      });
    }
  }

  fillEditForm() {
    if (!this.selectedUser) return;
    this.editForm = {
      username: this.selectedUser.username,
      first_name: this.selectedUser.first_name,
      last_name: this.selectedUser.last_name,
      role: this.selectedUser.role,
      birthday: this.selectedUser.birthday ? moment(this.selectedUser.birthday) : moment(),
      gender: this.selectedUser.gender || ''
    };
  }

  closeDetail() {
    this.selectedUser = null;
  }

  setActiveTab(tab: 'overview' | 'edit' | 'security' | 'activity' | 'student' | 'employee') {
    this.activeTab = tab;
    this.saveSuccess = false;
    this.saveError = null;
    this.resetPasswordSuccess = false;
    this.resetPasswordError = null;
    this.resetPasswordForm.generatedPassword = null;
    setTimeout(() => this.checkScroll(), 100);
  }

  // Save User
  saveUser() {
    if (!this.selectedUser) return;
    this.isSaving = true;
    this.saveSuccess = false;
    this.saveError = null;

    this.http.patch<any>(
      `${Config.API_URL}/v1/system/users/${this.selectedUser.id}`,
      {
        ...this.editForm,
        birthday: this.editForm.birthday.format('YYYY-MM-DD')
      },
      { withCredentials: true }
    ).subscribe({
      next: () => {
        this.isSaving = false;
        this.saveSuccess = true;
        // Refresh detail
        const userId = this.selectedUser!.id;
        const fakeUser: User = { ...this.selectedUser!, id: userId };
        this.selectUser(fakeUser);
        // Also refresh list
        this.loadUsers(this.currentPage);
        setTimeout(() => this.saveSuccess = false, 4000);
      },
      error: (err) => {
        console.error('Error saving user:', err);
        this.isSaving = false;
        this.saveError = 'Nepodařilo se uložit změny';
      }
    });
  }

  // Reset Password
  submitResetPassword() {
    if (!this.selectedUser) return;
    this.resetPasswordError = null;
    this.resetPasswordSuccess = false;

    const newPassword = Utils.randomstring(14);
    this.isResettingPassword = true;

    this.http.post<any>(
      `${Config.API_URL}/v1/system/users/${this.selectedUser.id}/reset-password`,
      { new_password: newPassword },
      { withCredentials: true }
    ).subscribe({
      next: () => {
        this.isResettingPassword = false;
        this.resetPasswordSuccess = true;
        this.resetPasswordForm.generatedPassword = newPassword;
        this.resetPasswordForm.new_password = '';
        this.resetPasswordForm.confirm_password = '';
        this.resetPasswordForm.showPassword = false;
      },
      error: (err) => {
        console.error('Error resetting password:', err);
        this.isResettingPassword = false;
        this.resetPasswordError = 'Nepodařilo se resetovat heslo';
      }
    });
  }



  // Transform API response
  private transformUser(apiUser: UserAPIResponse['data'][0]): User {
    return {
      id: apiUser.user_id,
      username: apiUser.username,
      first_name: apiUser.first_name,
      last_name: apiUser.last_name,
      full_name: apiUser.full_name,
      email: apiUser.email,
      login_type: apiUser.login_type,
      role: this.mapRole(apiUser.role),
      status: this.mapStatus(apiUser.status),
      photo_url: apiUser.photo_url,
      avatar: apiUser.avatar,
      last_login: apiUser.last_login,
      created_at: apiUser.created_at,
      updated_at: apiUser.updated_at
    };
  }

  // Map backend role to frontend role
  private mapRole(role: string): 'admin' | 'teacher' | 'student' | 'parent' {
    switch (String(role).toLowerCase()) {
      case 'admin':
        return 'admin';
      case 'teacher':
        return 'teacher';
      case 'student':
        return 'student';
      case 'parent':
        return 'parent';
      default:
        return 'student';
    }
  }

  // Map backend status to frontend status
  private mapStatus(status: string): 'active' | 'inactive' | 'suspended' {
    switch (status) {
      case 'active':
        return 'active';
      case 'inactive':
      case 'disabled':
        return 'inactive';
      case 'suspended':
      case 'banned':
        return 'suspended';
      default:
        return 'active';
    }
  }

  // Get role text
  getRoleText(role: string): string {
    switch (role) {
      case 'admin': return 'Administrátor';
      case 'teacher': return 'Učitel';
      case 'student': return 'Student';
      case 'parent': return 'Rodič';
      default: return role;
    }
  }

  // Get role icon
  getRoleIcon(role: string): string {
    switch (role) {
      case 'admin': return 'shield-check';
      case 'teacher': return 'school';
      case 'student': return 'book';
      case 'parent': return 'users';
      default: return 'user';
    }
  }

  // Get status text
  getStatusText(status: string): string {
    switch (status) {
      case 'active': return 'Aktivní';
      case 'inactive': return 'Neaktivní';
      case 'suspended': return 'Pozastaven';
      default: return status;
    }
  }

  // Format last login timestamp
  formatLastLogin(timestamp: string | null): string {
    if (!timestamp) return 'Nikdy';

    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Právě teď';
    if (diffMins < 60) return `Před ${diffMins} minutami`;
    if (diffHours < 24) return `Před ${diffHours} hodinami`;
    if (diffDays < 7) return `Před ${diffDays} dny`;

    return date.toLocaleDateString('cs-CZ');
  }

  // User actions
  editUser(user: User, event: Event) {
    event.stopPropagation();
    this.selectUser(user);
    setTimeout(() => this.setActiveTab('edit'), 600);
  }

  deleteUser(user: User, event: Event) {
    event.stopPropagation();
    console.log('Delete user:', user);
    // TODO: Confirm and delete
  }

  resetPassword(user: User, event: Event) {
    event.stopPropagation();
    this.resetPasswordForm.generatedPassword = null;
    this.selectUser(user);
    setTimeout(() => this.setActiveTab('security'), 600);
  }

  manageFiles(user: User, event: Event) {
    event.stopPropagation();
    this.selectedUserForFiles = user;
    this.dropdownManager.selected_dropdown = ''; // Close dropdown
  }

  closeFileManager() {
    this.selectedUserForFiles = null;
  }

  openAddUserModal() {
    this.resetNewUserForm();
    this.loadClasses();
    this.loadUnlinkedPersons();
    this.loadRooms();
    this.showAddUserModal = true;
    this.currentStep = 1;
  }

  loadRooms() {
    this.http.get<{ rooms: any[] }>(`${Config.API_URL}/v1/school/architecture/rooms`, { withCredentials: true })
      .subscribe(res => {
        if (res.rooms) this.availableRooms = res.rooms;
      });
  }


  loadClasses() {
    this.http.get<{ success: boolean; data: any[] }>(`${Config.API_URL}/v1/system/users/classes`, { withCredentials: true })
      .subscribe(res => {
        if (res.success) this.availableClasses = res.data;
      });
  }

  loadUnlinkedPersons() {
    this.http.get<{ success: boolean; data: any[] }>(`${Config.API_URL}/v1/system/users/unlinked_persons`, { withCredentials: true })
      .subscribe(res => {
        if (res.success) this.unlinkedPersons = res.data;
      });
  }

  onPersonSelect(personId: number) {
    const person = this.unlinkedPersons.find(p => p.person_id === personId);
    if (person) {
      this.newUser.person_id = person.person_id;
      this.newUser.first_name = person.first_name;
      this.newUser.last_name = person.last_name;
      if (person.suggested_role) {
        this.newUser.role = person.suggested_role;
      }
    }
  }

  getClassName(classId: number | null): string {
    if (!classId) return 'Vyberte třídu...';
    const c = this.availableClasses.find(c => c.class_id === classId);
    return c ? c.class_name : 'Vyberte třídu...';
  }

  getRoomName(roomId: number | null): string {
    if (!roomId) return 'Žádný / Vyberte...';
    const r = this.availableRooms.find(r => r.room_id === roomId);
    return r ? `${r.name} (${r.building_name})` : 'Vyberte...';
  }


  resetNewUserForm(mode?: 'new' | 'import') {
    const currentMode = mode || this.newUser.mode || 'new';
    this.newUser = {
      mode: currentMode,
      person_id: null,
      username: '',
      first_name: '',
      last_name: '',
      email: '',
      role: 'student',
      class_id: null,
      is_distance: false,
      cabinet_id: null,
      employee_number: '',
      contract_type: 'fulltime',
      hours_per_week: 40,
      password: ''
    };
    this.formErrors = {
      username: '',
      first_name: '',
      last_name: '',
      email: '',
      role: '',
      password: '',
      general: ''
    };
    this.generatePassword();
  }

  nextStep() {
    if (this.currentStep === 1) {
      if (!this.validateStep1()) return;
      this.currentStep = 2;
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  validateStep1(): boolean {
    let isValid = true;
    this.formErrors = {
      username: '',
      first_name: '',
      last_name: '',
      email: '',
      role: '',
      password: '',
      general: ''
    };

    if (this.newUser.mode === 'import' && !this.newUser.person_id) {
      this.formErrors['general'] = 'Vyberte osobu k importu';
      isValid = false;
    }

    if (!this.newUser.username || this.newUser.username.length < 3) {
      this.formErrors['username'] = 'Uživatelské jméno musí mít alespoň 3 znaky';
      isValid = false;
    }

    if (!this.newUser.first_name) {
      this.formErrors['first_name'] = 'Jméno je povinné';
      isValid = false;
    }
    if (!this.newUser.last_name) {
      this.formErrors['last_name'] = 'Příjmení je povinné';
      isValid = false;
    }

    if (this.newUser.mode === 'new' && !this.newUser.email) {
      this.formErrors['email'] = 'Email je povinný';
      isValid = false;
    }

    if (!this.newUser.password || this.newUser.password.length < 8) {
      this.formErrors['password'] = 'Heslo musí mít alespoň 8 znaků';
      isValid = false;
    }

    return isValid;
  }

  validateStep2(): boolean {
    let isValid = true;
    this.formErrors = {
      username: '',
      first_name: '',
      last_name: '',
      email: '',
      role: '',
      password: '',
      general: ''
    };

    if (!this.newUser.role) {
      this.formErrors['general'] = 'Vyberte roli uživatele';
      isValid = false;
    }

    if (this.newUser.role === 'student' && !this.newUser.class_id) {
      this.formErrors['general'] = 'Vyberte třídu pro studenta';
      isValid = false;
    }

    return isValid;
  }





  closeAddUserModal() {
    this.showAddUserModal = false;
    this.resetNewUserForm();
  }

  generatePassword() {
    this.newUser.password = Utils.randomstring(12);
  }



  submitNewUser() {
    if (!this.validateStep1()) {
      this.currentStep = 1;
      return;
    }
    if (!this.validateStep2()) return;

    this.isSubmitting = true;
    this.http.post<{ success: boolean; data: any; error?: string }>(
      `${Config.API_URL}/v1/system/users`,
      this.newUser,
      { withCredentials: true }
    )
      .subscribe({
        next: (res) => {
          this.isSubmitting = false;
          if (res.success) {
            this.closeAddUserModal();
            this.loadUsers();
          } else {
            this.formErrors['general'] = res.error || 'Nastala chyba při vytváření uživatele';
          }
        },
        error: (err) => {
          this.isSubmitting = false;
          this.formErrors['general'] = err.error?.error || 'Chyba spojení se serverem';
        }
    });
  }
}
