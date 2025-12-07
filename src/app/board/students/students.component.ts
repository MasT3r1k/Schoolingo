import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@Schoolingo/icons';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Config } from '@Schoolingo/config';
import { Utils } from '@Schoolingo/utils';

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
  fieldOfStudy: string;
  className: string;
  year: number | null;
}

// Backend API response interface
interface StudentAPIResponse {
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
    fieldOfStudy: '',
    className: '',
    year: null
  };
  
  // Filter options
  fieldsOfStudy = ['Informační technologie', 'Ekonomika', 'Zdravotnictví', 'Stavebnictví', 'Elektrotechnika'];
  years = [1, 2, 3, 4];
  
  // Students data from API
  students: Student[] = [];

  ngOnInit() {
    this.loadStudents();
  }

  // Load students from API
  loadStudents() {
    this.isLoading = true;
    this.loadError = null;

    this.http.get<StudentAPIResponse[]>(
      `${Config.API_URL}/v1/students?limit=100&offset=0`,
      { withCredentials: true }
    ).subscribe({
      next: (data) => {
        // Transform API response to Student interface
        this.students = data.map(apiStudent => this.transformStudent(apiStudent));
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

  // Transform API response to Student interface
  private transformStudent(apiStudent: StudentAPIResponse): Student {
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
  
  // Get filtered students
  get filteredStudents(): Student[] {
    return this.students.filter(student => {
      // Search filter
      if (this.filters.search) {
        const search = this.filters.search.toLowerCase();
        const matchesSearch = 
          student.fullName.toLowerCase().includes(search) ||
          student.email.toLowerCase().includes(search) ||
          student.className.toLowerCase().includes(search);
        if (!matchesSearch) return false;
      }
      
      // Status filter
      if (this.filters.status !== 'all' && student.status !== this.filters.status) {
        return false;
      }
      
      // Field of study filter
      if (this.filters.fieldOfStudy && student.fieldOfStudy !== this.filters.fieldOfStudy) {
        return false;
      }
      
      // Class name filter
      if (this.filters.className && student.className !== this.filters.className) {
        return false;
      }
      
      // Year filter
      if (this.filters.year !== null && student.year !== this.filters.year) {
        return false;
      }
      
      return true;
    });
  }
  
  // Get unique classes for filter
  get availableClasses(): string[] {
    const classes = [...new Set(this.students
      .filter(s => s.status === 'active')
      .map(s => s.className))];
    return classes.sort();
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
  
  // Clear all filters
  clearFilters() {
    this.filters = {
      search: '',
      status: 'all',
      fieldOfStudy: '',
      className: '',
      year: null
    };
  }
  
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
