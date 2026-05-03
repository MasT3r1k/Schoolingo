import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@Schoolingo/icons';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Config } from '@Schoolingo/config';
import { Utils } from '@Schoolingo/utils';
import { DropdownManager } from '@Schoolingo/dropdown';
import { Locale } from '@Schoolingo/locale';
import { RouterLink } from '@angular/router';
import { CalendarComponent } from '@Components/calendar';
import { CalendarManager } from '@Components/calendar-dropdown';
import { ModalManager } from '@Schoolingo/modal';
import { AddStudentModalComponent } from './modals/add-student-modal/add-student-modal.component';
import { AvatarService } from '../../infrastructure/utils/avatar.service';
import moment from 'moment';

// Interfaces
export interface Student {
  id: number;
  person_id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  avatar: string | null;
  photo_url?: string;
  gender: number;
  birthday: Date;
  status: string;
  email: string;
  phone: string;
  
  // Study info
  class_name: string;
  year: number;
  field_of_study: string;
  start_study: string;
  graduation_date?: string;
  teacher_name?: string;
  
  // Stats
  average_grade: any;
  absence_rate: any;
  absence_rate_excused: any;
  absence_rate_unexcused: any;
  education_measures_count: number;
  class_rank?: number;

  // Address
  street: string;
  house_number: string;
  city_name: string;
  postcode: string;
  address_country: string;
  address_country_code2: string;
  
  // Identity
  birthnum: string;
  birth_place: string;
  nationality: string;
  nationality_code2: string;
  insurance_id: number | null;
  insurance_name: string;
  insurance_short: string;

  // Associated data
  parents: ParentInfo[];
  history: any[];
  timetable: any[];
  substitution: any[];
  medical_records: any[];
  student_notes: any[];
  evaluations: any[];
  matrika?: StudentMatrika;
  matrika_records?: StudentMatrikaRecord[];
  subject_exemptions: StudentSubjectExemption[];
  last_grades: any[];
}

export interface StudentSubjectExemption {
  exemption_id: number;
  student_id: number;
  subject_id: number;
  subject_name: string;
  subject_shortcut: string;
  valid_from: string | null;
  valid_to: string | null;
  note: string | null;
}

export interface StudentMatrikaRecord {
  id: number;
  student_id: number;
  type: string;
  description: string | null;
  valid_from: string | null;
  valid_to: string | null;
}

export interface StudentMatrika {
  [key: string]: string | number | null | Date | undefined;
  student_id: number;
  highest_education_id: number | null;
  previous_school_izo: string | null;
  study_type_code: string | null;
  financing_code: string | null;
  start_reason_code: string | null;
  end_reason_code: string | null;
  individual_plan_code: string | null;
  special_needs_code: string | null;
  language_code: string | null;
  health_status_code: string | null;
  updated_at?: Date;
}

export interface ParentInfo {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  relationship: 'mother' | 'father' | 'guardian';
  email: string;
  phone: string;
  occupation?: string;
  register_number?: string;
  siblings?: any[];
  legal_guardian_de_jure?: boolean;
  closest_legal_representative?: boolean;
  allowed_to_receive_information?: boolean;
}

export interface StudentFilters {
  search: string;
  status: 'all' | 'active' | 'former' | 'suspended';
  scopeId: number | null;
  classId: number | null;
  year: number | null;
  avgGradeDates: { from: number | null; to: number | null };
  absenceRates: { from: number | null; to: number | null };
  missingInfo: boolean;
}

// Backend API response interface
interface StudentAPIResponse {
  data: {
    person_id: number;
    first_name: string;
    last_name: string;
    full_name: string;
    email?: string;
    phone?: string;
    avatar: string | null;
    gender: number;
    birthday: Date;
    status: string;
    start_study: string;
    class_name?: string;
    year?: number;
    field_of_study?: string;
    average_grade?: string;
    absence_rate?: string;
  }[];
  meta: {
    total: number;
    page: number;
    limit: number;
  }
}

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [CommonModule, IconsModule, FormsModule, RouterLink],
  templateUrl: './students.component.html',
  styleUrl: './students.component.css'
})
export class StudentsComponent implements OnInit {
  private http = inject(HttpClient);
  public Utils = Utils;
  public dropdownManager = inject(DropdownManager);
  public l = inject(Locale);
  public calendarManager = inject(CalendarManager);
  public modalManager = inject(ModalManager);
  public avatarService = inject(AvatarService);

  // Loading state
  isLoading = false;
  loadError: string | null = null;

  // Detail Modals
  showGradesModal = false;
  showAbsenceModal = false;
  showDisciplineModal = false;
  showAddDisciplineForm = false;

  // Filters
  filters: StudentFilters = {
    search: '',
    status: 'all',
    scopeId: null,
    classId: null,
    year: null,
    avgGradeDates: { from: null, to: null },
    absenceRates: { from: null, to: null },
    missingInfo: false
  };

  // Filter options
  availableClasses: { id: number; name: string }[] = [];
  availableScopes: { id: number; name: string }[] = [];
  years = [1, 2, 3, 4];

  public getFilterLabel(type: 'status' | 'class' | 'scope', value: any): string {
    if (value === null || value === 'all') {
      switch (type) {
        case 'status': return 'Všichni';
        case 'class': return 'Všechny třídy';
        case 'scope': return 'Všechny obory';
      }
    }

    switch (type) {
      case 'status':
        const statusMap: Record<string, string> = { 'active': 'Aktivní', 'former': 'Bývalí', 'suspended': 'Pozastavení' };
        return statusMap[value] || value;
      case 'class':
        return this.availableClasses.find(c => c.id === value)?.name || 'Neznámá třída';
      case 'scope':
        return this.availableScopes.find(s => s.id === value)?.name || 'Neznámý obor';
    }
    return value;
  }

  public getFilterOptions(type: 'status'): { value: string, label: string }[] {
    return [
      { value: 'all', label: 'Všichni' },
      { value: 'active', label: 'Aktivní' },
      { value: 'former', label: 'Bývalí' },
      { value: 'suspended', label: 'Pozastavení' }
    ];
  }

  // Pagination
  currentPage = 1;
  pageSize = 20;
  totalItems = 0;
  totalPages = 0;

  // Students data from API
  students: Student[] = [];

  ngOnInit() {
    this.loadFilters();
    this.loadStudents();

    // Registrace modalu přes modalManager
    this.modalManager.addModal(
      'add_student',
      {
        icon: 'user-plus',
        title: 'students.add_student',
        closeable: true,
        width: 600,
        items: [{
          type: 'component',
          component: AddStudentModalComponent
        }]
      }
    );
  }

  // Load available filters (classes, scopes)
  loadFilters() {
    this.http.get<{ classes: { id: number; name: string }[], scopes: { id: number; name: string }[] }>(
      `${Config.API_URL}/v1/students/filters`,
      { withCredentials: true }
    ).subscribe({
      next: (response) => {
        this.availableClasses = response.classes;
        this.availableScopes = response.scopes;
      },
      error: (error) => {
        console.error('Error loading filters:', error);
      }
    });
  }

  // Load students from API
  loadStudents(page = this.currentPage) {
    this.currentPage = page;
    this.isLoading = true;
    this.loadError = null;

    // Build params
    let params: any = {
      limit: this.pageSize,
      offset: (page - 1) * this.pageSize,
      search: this.filters.search,
      status: this.filters.status,
      // API expects string parameters or specific types. 
      // Handling empty values:
    };

    if (this.filters.classId) params.classId = this.filters.classId;
    if (this.filters.scopeId) params.scopeId = this.filters.scopeId;
    if (this.filters.year) params.year = this.filters.year;

    if (this.filters.avgGradeDates.from) params.avgGradeMin = this.filters.avgGradeDates.from;
    if (this.filters.avgGradeDates.to) params.avgGradeMax = this.filters.avgGradeDates.to;

    if (this.filters.absenceRates.from) params.absenceMin = this.filters.absenceRates.from;
    if (this.filters.absenceRates.to) params.absenceMax = this.filters.absenceRates.to;

    if (this.filters.missingInfo) params.missingInfo = 'true';

    this.http.get<StudentAPIResponse | any>(
      `${Config.API_URL}/v1/students`,
      {
        withCredentials: true,
        params: params
      }
    ).subscribe({
      next: (response) => {
        // Transform API response
        this.students = response.data;

        // Update pagination
        this.totalItems = response.meta.total;
        this.totalPages = Math.ceil(this.totalItems / this.pageSize);

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading students:', error);
        this.loadError = 'Nepodařilo se načíst seznam studentů';
        this.isLoading = false;
        // Fallback to empty array
        this.students = [];
      }
    });
  }

  // Handle filter changes
  onFilterChange() {
    this.loadStudents(1); // Reset to first page
  }

  // Clear all filters
  clearFilters() {
    this.filters = {
      search: '',
      status: 'all',
      scopeId: null,
      classId: null,
      year: null,
      avgGradeDates: { from: null, to: null },
      absenceRates: { from: null, to: null },
      missingInfo: false
    };
    this.loadStudents(1);
  }

  // Pagination controls
  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.loadStudents(this.currentPage + 1);
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.loadStudents(this.currentPage - 1);
    }
  }

  setPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.loadStudents(page);
    }
  }

  // Datalist-style pagination helpers
  getPageList(): number[] {
    let pages = [-4, -3, -2, -1, 0, 1, 2, 3, 4];
    let list: number[] = [];
    pages.forEach((page: number) => {
      list.push(page + this.currentPage);
    })

    let startSlice = 0;
    if (this.currentPage == 4 || this.currentPage == this.totalPages - 1) {
      startSlice = 1;
    }

    else if (this.currentPage > 3 && this.currentPage <= this.totalPages - 2) {
      startSlice = 2;
    }

    return list.filter((page) => page > 0 && page <= this.totalPages).slice(startSlice).slice(0, 5);
  }

  // Direct access for template since we rely on server filtering now
  public get filteredStudents(): Student[] {
    return this.students;
  }

  // Add Student Modal handler
  openAddStudentModal() {
    this.modalManager.openModal('add_student');
  }

  // Clear all filters - removed duplicate logic, handled above
  /* clearFilters() { ... } */

  // Get status badge class
  getStatusClass(status: string): string {
    switch (status) {
      case 'active': return 'status-active';
      case 'former': return 'status-former';
      case 'suspended': return 'status-suspended';
      default: return '';
    }
  }

  // Get status text
  getStatusText(status: string): string {
    switch (status) {
      case 'active': return 'Aktivní';
      case 'former': return 'Bývalý';
      case 'suspended': return 'Pozastaven';
      default: return status;
    }
  }

  // Get grade color class
  public getGradeClass(grade: any): string {
    if (grade === null || grade === '-') return '';
    const g = typeof grade === 'number' ? grade : parseInt(grade);
    if (isNaN(g)) return '';
    if (g === 1) return 'grade--success';
    if (g >= 4) return 'grade--danger';
    if (g === 3) return 'grade--warning';
    return 'grade--primary';
  }

}
