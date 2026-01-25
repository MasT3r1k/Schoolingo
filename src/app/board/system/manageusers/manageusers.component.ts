import { Component, OnInit, inject } from '@angular/core';
import { UserFilesModalComponent } from './modals/user-files-modal/user-files-modal.component';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@Schoolingo/icons';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Config } from '@Schoolingo/config';
import { Utils } from '@Schoolingo/utils';
import { DropdownManager } from '@Schoolingo/dropdown';

// Interfaces
export interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  role: 'admin' | 'teacher' | 'student' | 'parent';
  status: 'active' | 'inactive' | 'suspended';
  photoUrl?: string;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserFilters {
  search: string;
  role: 'all' | 'admin' | 'teacher' | 'student' | 'parent';
  status: 'all' | 'active' | 'inactive' | 'suspended';
}

// Backend API response interface
interface UserAPIResponse {
  data: {
    userId: number;
    username: string;
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
    role: string;
    status: string;
    photoUrl?: string;
    lastLogin: string | null;
    createdAt: string;
    updatedAt: string;
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
  imports: [CommonModule, IconsModule, FormsModule, UserFilesModalComponent],
  templateUrl: './manageusers.component.html',
  styleUrl: './manageusers.component.css'
})
export class ManageusersComponent implements OnInit {
  private http = inject(HttpClient);
  public Utils = Utils;
  public dropdownManager = inject(DropdownManager);

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

  // Pagination
  currentPage = 1;
  totalItems = 0;
  totalPages = 0;

  // Selected User
  selectedUser: User | null = null;
  activeTab: 'overview' | 'permissions' | 'files' | 'activity' = 'overview'; // Mock tabs for now

  // Users data from API
  users: User[] = [];

  // Add User Modal
  showAddUserModal = false;
  newUser = {
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    role: 'student' as 'admin' | 'teacher' | 'student' | 'parent',
    password: ''
  };
  
  formErrors = {
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    password: ''
  };

  isSubmitting = false;

  // File Manager Modal
  selectedUserForFiles: User | null = null;

  ngOnInit() {
    this.loadUsers();
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
      this.selectedUser = user;
      this.activeTab = 'overview';
  }

  closeDetail() {
      this.selectedUser = null;
  }

  setActiveTab(tab: typeof this.activeTab) {
        this.activeTab = tab;
  }

  // Pagination controls


  // Transform API response
  private transformUser(apiUser: UserAPIResponse['data'][0]): User {
    return {
      id: apiUser.userId,
      username: apiUser.username,
      firstName: apiUser.firstName,
      lastName: apiUser.lastName,
      fullName: apiUser.fullName,
      email: apiUser.email,
      role: this.mapRole(apiUser.role),
      status: this.mapStatus(apiUser.status),
      photoUrl: apiUser.photoUrl,
      lastLogin: apiUser.lastLogin,
      createdAt: apiUser.createdAt,
      updatedAt: apiUser.updatedAt
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
    console.log('Edit user:', user);
    // TODO: Open edit modal
  }

  deleteUser(user: User, event: Event) {
    event.stopPropagation();
    console.log('Delete user:', user);
    // TODO: Confirm and delete
  }

  resetPassword(user: User, event: Event) {
    event.stopPropagation();
    console.log('Reset password for:', user);
    // TODO: Reset password
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
      firstName: '',
      lastName: '',
      email: '',
      role: 'student',
      password: ''
    };
    this.formErrors = {
      username: '',
      firstName: '',
      lastName: '',
      email: '',
      role: '',
      password: ''
    };
    this.isSubmitting = false;
  }

  generatePassword() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    this.newUser.password = password;
  }

  validateForm(): boolean {
    let isValid = true;
    this.formErrors = {
      username: '',
      firstName: '',
      lastName: '',
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
    if (!this.newUser.firstName) {
      this.formErrors.firstName = 'Jméno je povinné';
      isValid = false;
    } else if (this.newUser.firstName.length < 2 || this.newUser.firstName.length > 100) {
      this.formErrors.firstName = 'Jméno musí mít 2-100 znaků';
      isValid = false;
    }

    // Last name validation
    if (!this.newUser.lastName) {
      this.formErrors.lastName = 'Příjmení je povinné';
      isValid = false;
    } else if (this.newUser.lastName.length < 2 || this.newUser.lastName.length > 100) {
      this.formErrors.lastName = 'Příjmení musí mít 2-100 znaků';
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
        this.loadUsers(1); // Reload first page to see new user
        // TODO: Show success toast
      },
      error: (error) => {
        console.error('Error creating user:', error);
        this.isSubmitting = false;
        // TODO: Show error toast
        if (error.error?.message) {
          alert('Chyba: ' + error.error.message);
        } else {
          alert('Nepodařilo se vytvořit uživatele');
        }
      }
    });
  }
}
