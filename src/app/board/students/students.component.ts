import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@Schoolingo/icons';
import { FormsModule } from '@angular/forms';

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
  averageGrade: number;
  absenceRate: number;
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

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [CommonModule, IconsModule, FormsModule],
  templateUrl: './students.component.html',
  styleUrl: './students.component.css'
})
export class StudentsComponent {
  // Selected student for detail view
  selectedStudent: Student | null = null;
  
  // Detail View Tabs
  activeTab: 'overview' | 'personal' | 'parents' | 'academic' | 'medical' | 'notes' = 'overview';

  // Add Student Modal
  showAddStudentModal = false;
  addStudentTab: 'manual' | 'ldap' | 'excel' = 'manual';
  
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
  
  // Mock students data
  students: Student[] = [
    {
      id: 1,
      firstName: 'Jan',
      lastName: 'Novák',
      fullName: 'Jan Novák',
      photoUrl: undefined,
      className: 'IT-4.A',
      year: 4,
      fieldOfStudy: 'Informační technologie',
      status: 'active',
      dateOfBirth: '2006-03-15',
      email: 'jan.novak@student.school.cz',
      phone: '+420 123 456 789',
      address: 'Hlavní 123, Praha 1',
      enrollmentDate: '2020-09-01',
      averageGrade: 1.8,
      absenceRate: 5.2,
      disciplinaryIssues: 0,
      parents: [
        {
          id: 1,
          firstName: 'Petr',
          lastName: 'Novák',
          relationship: 'father',
          email: 'petr.novak@email.cz',
          phone: '+420 111 222 333',
          occupation: 'Inženýr'
        },
        {
          id: 2,
          firstName: 'Jana',
          lastName: 'Nováková',
          relationship: 'mother',
          email: 'jana.novak@email.cz',
          phone: '+420 444 555 666',
          occupation: 'Učitelka'
        }
      ],
      notes: 'Výborný student, aktivní v ITprojektech.',
      allergies: [],
      medicalConditions: []
    },
    {
      id: 2,
      firstName: 'Marie',
      lastName: 'Svobodová',
      fullName: 'Marie Svobodová',
      className: 'EK-3.B',
      year: 3,
      fieldOfStudy: 'Ekonomika',
      status: 'active',
      dateOfBirth: '2007-07-22',
      email: 'marie.svobodova@student.school.cz',
      phone: '+420 987 654 321',
      address: 'Zahradní 45, Brno',
      enrollmentDate: '2021-09-01',
      averageGrade: 2.1,
      absenceRate: 8.5,
      disciplinaryIssues: 1,
      parents: [
        {
          id: 3,
          firstName: 'Tomáš',
          lastName: 'Svoboda',
          relationship: 'father',
          email: 'tomas.svoboda@email.cz',
          phone: '+420 777 888 999'
        }
      ],
      notes: 'Dobrá studentka s občasnou absencí.'
    },
    {
      id: 3,
      firstName: 'Petr',
      lastName: 'Dvořák',
      fullName: 'Petr Dvořák',
      className: 'ZD-2.A',
      year: 2,
      fieldOfStudy: 'Zdravotnictví',
      status: 'active',
      dateOfBirth: '2008-11-08',
      email: 'petr.dvorak@student.school.cz',
      phone: '+420 555 111 222',
      address: 'Nová 78, Ostrava',
      enrollmentDate: '2022-09-01',
      averageGrade: 2.7,
      absenceRate: 12.3,
      disciplinaryIssues: 3,
      parents: [
        {
          id: 4,
          firstName: 'Alena',
          lastName: 'Dvořáková',
          relationship: 'mother',
          email: 'alena.dvorak@email.cz',
          phone: '+420 666 777 888',
          occupation: 'Zdravotní sestra'
        }
      ],
      notes: 'Potřebuje více pozornosti, časté absence.',
      allergies: ['arašídy'],
      medicalConditions: ['astma']
    },
    {
      id: 4,
      firstName: 'Lucie',
      lastName: 'Černá',
      fullName: 'Lucie Černá',
      className: 'IT-4.A',
      year: 4,
      fieldOfStudy: 'Informační technologie',
      status: 'active',
      dateOfBirth: '2006-01-30',
      email: 'lucie.cerna@student.school.cz',
      phone: '+420 333 444 555',
      address: 'Školní 12, Praha 5',
      enrollmentDate: '2020-09-01',
      averageGrade: 1.5,
      absenceRate: 2.1,
      disciplinaryIssues: 0,
      parents: [
        {
          id: 5,
          firstName: 'Karel',
          lastName: 'Černý',
          relationship: 'father',
          email: 'karel.cerny@email.cz',
          phone: '+420 222 333 444',
          occupation: 'Programátor'
        }
      ],
      notes: 'Vynikající studentka, reprezentuje školu na soutěžích.'
    },
    {
      id: 5,
      firstName: 'Martin',
      lastName: 'Procházka',
      fullName: 'Martin Procházka',
      className: '-',
      year: 4,
      fieldOfStudy: 'Elektrotechnika',
      status: 'former',
      dateOfBirth: '2005-05-12',
      email: 'martin.prochazka@email.cz',
      phone: '+420 888 999 111',
      address: 'Dlouhá 90, Plzeň',
      enrollmentDate: '2019-09-01',
      graduationDate: '2023-06-30',
      averageGrade: 2.3,
      absenceRate: 7.8,
      disciplinaryIssues: 2,
      parents: [
        {
          id: 6,
          firstName: 'Eva',
          lastName: 'Procházková',
          relationship: 'mother',
          email: 'eva.prochazka@email.cz',
          phone: '+420 111 000 999'
        }
      ],
      notes: 'Absolvent 2023, nyní pracuje jako elektrikář.'
    },
    {
      id: 6,
      firstName: 'Kateřina',
      lastName: 'Horáková',
      fullName: 'Kateřina Horáková',
      className: 'EK-1.A',
      year: 1,
      fieldOfStudy: 'Ekonomika',
      status: 'active',
      dateOfBirth: '2009-09-18',
      email: 'katerina.horak@student.school.cz',
      phone: '+420 444 333 222',
      address: 'Krátká 5, Liberec',
      enrollmentDate: '2023-09-01',
      averageGrade: 1.9,
      absenceRate: 3.5,
      disciplinaryIssues: 0,
      parents: [
        {
          id: 7,
          firstName: 'Jiří',
          lastName: 'Horák',
          relationship: 'father',
          email: 'jiri.horak@email.cz',
          phone: '+420 555 666 777',
          occupation: 'Ekonom'
        }
      ]
    }
  ];
  
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
  getGradeClass(grade: number): string {
    if (grade <= 2.0) return 'grade-excellent';
    if (grade <= 3.0) return 'grade-good';
    if (grade <= 4.0) return 'grade-fair';
    return 'grade-poor';
  }
}
