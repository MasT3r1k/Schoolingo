import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@Schoolingo/icons';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Config } from '@Schoolingo/config';
import { Utils } from '@Schoolingo/utils';
import { DropdownManager } from '@Schoolingo/dropdown';

// Interfaces
export interface Student {
  id: number;
  firstName: string;
 lastName: string;
  fullName: string;
  photoUrl?: string;
  className: string;
  year: number;
  fieldOfStudy: string;
  status: 'active' | 'former' | 'suspended';
  dateOfBirth: string;
  email: string;
  phone: string;
  address: string;
  enrollmentDate: string;
  graduationDate?: string;
  averageGrade: string;
  absenceRate: string;
  disciplinaryIssues: number;
  
  // Parent info
  parents: ParentInfo[];
  
  // Additional details
  notes?: string;
  allergies?: string[];
  medicalConditions?: string[];
}

export interface ParentInfo {
  id: number;
  firstName: string;
  lastName: string;
  relationship: 'mother' | 'father' | 'guardian';
  email: string;
  phone: string;
  occupation?: string;
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
    personId: number;
    firstName: string;
    lastName: string;
    fullName: string;
    email?: string;
    phone?: string;
    dateOfBirth: string;
    birth: string;
    status: string;
    startStudy: string;
    className?: string;
    year?: number;
    fieldOfStudy?: string;
    averageGrade?: string;
    absenceRate?: string;
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
  imports: [CommonModule, IconsModule, FormsModule],
  templateUrl: './students.component.html',
  styleUrl: './students.component.css'
})
export class StudentsComponent implements OnInit {
  private http = inject(HttpClient);
  public Utils = Utils;
  public dropdownManager = inject(DropdownManager);

  // Loading state
  isLoading = false;
  loadError: string | null = null;

  // Selected student for detail view
  selectedStudent: Student | null = null;
  
  // Detail View Tabs
  activeTab: 'overview' | 'personal' | 'parents' | 'academic' | 'medical' | 'notes' = 'overview';

  // Add Student Modal
  showAddStudentModal = false;
  addStudentTab: 'manual' | 'ldap' | 'excel' = 'manual';
  
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

    this.http.get<StudentAPIResponse>(
      `${Config.API_URL}/v1/students`,
      { 
        withCredentials: true,
        params: params
      }
    ).subscribe({
      next: (response) => {
        // Transform API response
        this.students = response.data.map(apiStudent => this.transformStudent(apiStudent));
        
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

      return list.filter((page) => page > 0 && page <= this.totalPages).slice(startSlice).slice(0,5);
  }

  // Transform API response (updated for nested data response type in signature)
  private transformStudent(apiStudent: StudentAPIResponse['data'][0]): Student {
    return {
      id: apiStudent.personId,
      firstName: apiStudent.firstName,
      lastName: apiStudent.lastName,
      fullName: apiStudent.fullName,
      className: apiStudent.className || '-',
      year: apiStudent.year || 1,
      fieldOfStudy: apiStudent.fieldOfStudy || 'Nezadáno',
      status: this.mapStatus(apiStudent.status),
      dateOfBirth: apiStudent.dateOfBirth,
      email: apiStudent.email || '',
      phone: apiStudent.phone || '',
      address: '', // Not provided by API yet
      enrollmentDate: apiStudent.startStudy,
      // Real data from API
      averageGrade: apiStudent.averageGrade || '0.00',
      absenceRate: apiStudent.absenceRate || '0.00',
      disciplinaryIssues: Math.floor(Math.random() * 3), // Still mock - not in API yet
      parents: [], // Will be loaded separately if needed
      notes: '',
      allergies: [],
      medicalConditions: []
    };
  }

  // Map backend status to frontend status
  private mapStatus(status: string): 'active' | 'former' | 'suspended' {
    switch (status.toLowerCase()) {
      case 'active':
        return 'active';
      case 'archive':
      case 'former':
        return 'former';
      case 'suspended':
        return 'suspended';
      default:
        return 'active';
    }
  }
  
  // Direct access for template since we rely on server filtering now
  get filteredStudents(): Student[] {
    return this.students;
  }
  
  // Select student for detail view
  selectStudent(student: Student) {
    this.selectedStudent = student;
    this.activeTab = 'overview';
  }
  
  // Close detail view
  closeDetail() {
    this.selectedStudent = null;
  }

  // Tab switching
  setActiveTab(tab: typeof this.activeTab) {
    this.activeTab = tab;
  }

  // Add Student Modal
  openAddStudentModal() {
    this.showAddStudentModal = true;
    this.addStudentTab = 'manual';
  }

  closeAddStudentModal() {
    this.showAddStudentModal = false;
  }

  setAddStudentTab(tab: typeof this.addStudentTab) {
    this.addStudentTab = tab;
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
  getGradeClass(grade: string): string {
    if (parseFloat(grade) <= 2.0) return 'grade-excellent';
    if (parseFloat(grade) <= 3.0) return 'grade-good';
    if (parseFloat(grade) <= 4.0) return 'grade-fair';
    return 'grade-poor';
  }
}
