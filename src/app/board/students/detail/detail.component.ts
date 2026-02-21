import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@Schoolingo/icons';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Config } from '@Schoolingo/config';
import { Utils } from '@Schoolingo/utils';
import { DropdownManager } from '@Schoolingo/dropdown';
import { Locale } from '@Schoolingo/locale';
import { ActivatedRoute, Router } from '@angular/router';
import moment from 'moment';
import { TimetableHours } from '../../Teach/timetable/timetable.component';
import { Student } from '../students.component';

// Interfaces
interface TimetableAPI {
  day: number;
  hour: number;
  type: number;
  room: string;
  free: boolean;
  end: boolean;
  subjectId: number;
  subjectName: string;
  subjectShortcut: string;
  lastName: string;
  teacher: string;
}

@Component({
  standalone: true,
  imports: [CommonModule, IconsModule, FormsModule],
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.css'
})
export class DetailComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  public Utils = Utils;
  public dropdownManager = inject(DropdownManager);
  public l = inject(Locale);

  // Loading state
  isLoading = false;
  loadError: string | null = null;

  // Selected student for detail view
  selectedStudent: Student | any | null = null;
  
  public hours: TimetableHours[] = [];
  public max_hours = 0;

  // Detail View Tabs
  activeTab: 'overview' | 'personal' | 'parents' | 'academic' | 'matrika' | 'medical' | 'history' | 'marks' | 'notes' | 'evaluation' | 'educational_measures' = 'overview';

  // Detail Modals
  showGradesModal = false;
  showAbsenceModal = false;
  showDisciplineModal = false;
  showAddDisciplineForm = false;
  

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.http.get(
      `${Config.API_URL}/v1/student/${id}`,
      { withCredentials: true }
    )
    .subscribe((student) => {
      console.log(student)
      this.selectedStudent = student;
    })
  }
  
  // Close detail view
  closeDetail() {
    this.router.navigate(['/', 'students'])
  }

  // Tab switching
  setActiveTab(tab: typeof this.activeTab) {
    this.activeTab = tab;
  }

  public getTodayTimetable(): any[] {
    return this.selectedStudent.timetable.filter((lesson: any) => lesson.day == Utils.getNow().isoWeek())
  }
  
  public getSelectedDateLessons(): TimetableAPI[] {
    const day = moment().isoWeekday();
    // Hodiny pro daný den
    const lessons = this.selectedStudent.timetable
      .filter((lesson: any) => lesson.day === day && (lesson.type == 0 || (lesson.type == 1 && moment().isoWeek() % 2) || (lesson.type == 2 && moment().isoWeek() % 2 == 0)));

    if (!lessons.length) return [];

    // Získáme seznam existujících hodin, např. [1, 2, 4, 5]
    const existingHours = lessons.map((l: any) => l.hour);
    const maxHour = Math.max(...existingHours);

    const fullList: TimetableAPI[] = [];
    

    for (let h = 1; h <= maxHour; h++) {
      const found = lessons.find((l: any) => l.hour === h);

      if (found) {
        fullList.push(found);
      } else {
        // volná hodina
        fullList.push({
          day,
          hour: h,
          type: 0,
          free: true,
          end: false,
          subjectId: -1,
          subjectName: "",
          subjectShortcut: "",
          teacher: "",
          lastName: "",
          room: ""
        });
      }
    }

      // Konec vyučování
      fullList.push({
        day,
        hour: (fullList[fullList.length - 1].hour || 0) + 1,
        type: 0,
        free: true,
        end: true,
        subjectId: -1,
        subjectName: "",
        subjectShortcut: "",
        teacher: "",
        lastName: "",
        room: ""
      });

    return fullList;
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

  // Parent Management
  showAddParentModal = false;
  addParentMode: 'existing' | 'new' = 'existing';
  searchParentQuery = '';
  foundParents: any[] = [];
  selectedParentId: number | null = null;
  
  newParent = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'father'
  };

  searchParents() {
    if (this.searchParentQuery.length < 3) return;
    
    this.http.get<any[]>(`${Config.API_URL}/v1/student/parent/search`, {
      params: { q: this.searchParentQuery },
      withCredentials: true
    }).subscribe(parents => {
      this.foundParents = parents;
    });
  }

  selectParent(id: number) {
    this.selectedParentId = id;
  }

  addParent() {
    if (!this.selectedStudent) return;

    const payload: any = {
      mode: this.addParentMode,
      role: this.newParent.role
    };

    if (this.addParentMode === 'existing') {
        if (!this.selectedParentId) return;
        payload.personId = this.selectedParentId;
    } else {
        if (!this.newParent.firstName || !this.newParent.lastName) return;
        payload.firstName = this.newParent.firstName;
        payload.lastName = this.newParent.lastName;
        payload.email = this.newParent.email;
        payload.phone = this.newParent.phone;
    }

    this.http.post(`${Config.API_URL}/v1/student/${this.selectedStudent.personId}/parent`, payload, {
      withCredentials: true
    }).subscribe({
      next: () => {
        this.showAddParentModal = false;
        // Reload student data
        this.ngOnInit();
        // Reset form
        this.resetParentForm();
      },
      error: (err) => {
        console.error('Failed to add parent', err);
        alert('Nepodařilo se přidat rodiče.');
      }
    });
  }

  resetParentForm() {
    this.searchParentQuery = '';
    this.foundParents = [];
    this.selectedParentId = null;
    this.newParent = {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      role: 'father'
    };
    this.addParentMode = 'existing';
  }

  // Address Management
  showEditAddressModal = false;
  editingAddress = {
    street: '',
    houseNumber: '',
    city: '',
    postcode: ''
  };

  openEditAddress() {
    if (!this.selectedStudent) return;
    this.editingAddress = {
      street: this.selectedStudent.street || '',
      houseNumber: this.selectedStudent.houseNumber || '',
      city: this.selectedStudent.city || '',
      postcode: this.selectedStudent.postcode || ''
    };
    this.showEditAddressModal = true;
  }

  saveAddress() {
    if (!this.selectedStudent) return;

    this.http.patch(`${Config.API_URL}/v1/student/${this.selectedStudent.personId}/address`, this.editingAddress, {
      withCredentials: true
    }).subscribe({
      next: () => {
        this.showEditAddressModal = false;
        this.ngOnInit();
      },
      error: (err) => {
        console.error('Failed to update address', err);
        alert('Nepodařilo se uložit adresu.');
      }
    });
  }
}
