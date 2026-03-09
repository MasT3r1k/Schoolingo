import { Component, OnInit, inject } from '@angular/core';
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
export class ManageusersComponent implements OnInit {
  private http = inject(HttpClient);
  public l = inject(Locale);
  public Utils = Utils;
  public router = inject(Router);
  public modalManager = inject(ModalManager);
  public dropdownManager = inject(DropdownManager);
  public school = inject(School);

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
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    role: 'student' as 'admin' | 'teacher' | 'student' | 'parent',
    password: ''
  };
  
  formErrors = {
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    role: '',
    password: ''
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
    this.showAddUserModal = true;
    this.resetPasswordForm.generatedPassword = null;
    this.resetForm();
    this.generatePassword();
  }

  closeAddUserModal() {
    this.showAddUserModal = false;
    this.resetForm();
  }

  resetForm() {
    this.newUser = {
      username: '',
      first_name: '',
      last_name: '',
      email: '',
      role: 'student',
      password: ''
    };
    this.formErrors = {
      username: '',
      first_name: '',
      last_name: '',
      email: '',
      role: '',
      password: ''
    };
    this.isSubmitting = false;
  }

  generatePassword() {
    this.newUser.password = Utils.randomstring(12);
  }

  validateForm(): boolean {
    let isValid = true;
    this.formErrors = {
      username: '',
      first_name: '',
      last_name: '',
      email: '',
      role: '',
      password: ''
    };

    // Username validation
    if (!this.newUser.username) {
      this.formErrors.username = 'Uživatelské jméno je povinné';
      isValid = false;
    } else if (!/^[a-zA-Z0-9._]{3,50}$/.test(this.newUser.username)) {
      this.formErrors.username = 'Uživatelské jméno musí mít 3-50 znaků (pouze písmena, čísla, tečka, podtržítko)';
      isValid = false;
    }

    // First name validation
    if (!this.newUser.first_name) {
      this.formErrors.first_name = 'Jméno je povinné';
      isValid = false;
    } else if (this.newUser.first_name.length < 2 || this.newUser.first_name.length > 100) {
      this.formErrors.first_name = 'Jméno musí mít 2-100 znaků';
      isValid = false;
    }

    // Last name validation
    if (!this.newUser.last_name) {
      this.formErrors.last_name = 'Příjmení je povinné';
      isValid = false;
    } else if (this.newUser.last_name.length < 2 || this.newUser.last_name.length > 100) {
      this.formErrors.last_name = 'Příjmení musí mít 2-100 znaků';
      isValid = false;
    }

    // Email validation
    if (!this.newUser.email) {
      this.formErrors.email = 'Email je povinný';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.newUser.email)) {
      this.formErrors.email = 'Neplatný formát emailu';
      isValid = false;
    }

    // Password validation
    if (!this.newUser.password) {
      this.formErrors.password = 'Heslo je povinné';
      isValid = false;
    } else if (this.newUser.password.length < 8) {
      this.formErrors.password = 'Heslo musí mít alespoň 8 znaků';
      isValid = false;
    } else if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(this.newUser.password)) {
      this.formErrors.password = 'Heslo musí obsahovat písmena i čísla';
      isValid = false;
    }

    return isValid;
  }

  submitNewUser() {
    if (!this.validateForm()) {
      return;
    }

    this.isSubmitting = true;

    this.http.post<{ success: boolean; data: any }>(
      `${Config.API_URL}/v1/system/users`,
      this.newUser,
      { withCredentials: true }
    ).subscribe({
      next: (response) => {
        console.log('User created successfully:', response);
        this.closeAddUserModal();
        this.loadUsers(1);
      },
      error: (error) => {
        console.error('Error creating user:', error);
        this.isSubmitting = false;
        if (error.error?.message) {
          alert('Chyba: ' + error.error.message);
        } else {
          alert('Nepodařilo se vytvořit uživatele');
        }
      }
    });
  }
}
