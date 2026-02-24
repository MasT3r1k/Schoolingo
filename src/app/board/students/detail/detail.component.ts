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
import { Timetable } from '../../../infrastructure/timetable/timetable';
import { SharedTimetableComponent } from '../../../Components/timetable/timetable.component';
import { BehaviorSubject, distinctUntilChanged } from 'rxjs';
import { MarksManager } from '@Schoolingo/marks';
import { ModalManager } from '@Schoolingo/modal';
import { MedicalModalComponent } from './medical/modals/medical-modal/medical-modal.component';
import { EditPersonalModalComponent } from './personal/modals/edit-personal/edit-personal.component';
import { ParentsSettingsComponent } from './modals/parents-settings/parents-settings.component';
import { AddParentComponent } from './modals/add-parent/add-parent.component';



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

interface StudentIntermMarkAPI {
  mark: number;
  column_id: number;
  teacher_id: number;
  teacher_first_name: string;
  teacher_last_name: string;
  teacher_full_name: string;
  created: Date;
  topic: string;
  weight: number;
  max_points: number | null;
  type: number;
  column_index: number;
  subject_id: number;
  subject_name: string;
  group_id: number;
}

interface StudentIntermSubjectStat {
  rank: string;
  total_students: number;
  class_avg: string;
}

interface StudentIntermMarkStat {
  rank: string;
  count: number;
  avg: string;
}

interface MedicalRecord {
  record_id: number;
  student_id: number;
  type: string;
  title: string;
  description: string | null;
  severity: 'low' | 'medium' | 'high';
  is_food_allergy: number;
  allergen_codes: string | null;
  created_at: Date;
}

@Component({
  standalone: true,
  imports: [CommonModule, IconsModule, FormsModule, SharedTimetableComponent],
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.css'
})
export class DetailComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private modalManager = inject(ModalManager);
  public Utils = Utils;
  public dropdownManager = inject(DropdownManager);
  public l = inject(Locale);

  // Loading state
  isLoading = false;
  loadError: string | null = null;

  // Selected student for detail view
  selectedStudent: Student | any | null = null;
  selectedParent: any | null = null;
  
  public hours: TimetableHours[] = [];
  public max_hours = 0;

  // Timetable
  public timetableService = inject(Timetable);
  public isLoadingTimetable = false;
  public fullTimetable: any[] = [];
  public fullTimetableHours: TimetableHours[] = [];
  public timetableSelectedWeek = new BehaviorSubject<moment.Moment | null>(moment());
  public timetableSelectedTab = 0; // 0 = actual, 1 = permanent

  // Overview Schedule
  public overviewSelectedDate = moment();

  // Marks
  public marksManager = inject(MarksManager);
  public marks: StudentIntermMarkAPI[] = [];
  public subjectStats: Record<number, StudentIntermSubjectStat> = {};
  public markStats: Record<number, StudentIntermMarkStat> = {};
  public selectedMark: any | null = null;
  public marksSelectedTab = 0; // 0 = by subject, 1 = chronological
  public marksOptions = [
    'marks.interm.by_subjects',
    'marks.interm.chronologically'
  ];

  // Medical Records
  public medicalRecords: MedicalRecord[] = [];

  // Detail View Tabs
  public tabs: (typeof this.activeTab)[] = ['overview','personal','parents','academic','matrika','medical','history','marks','notes','evaluation','educational_measures','timetable'];
  activeTab: 'overview' | 'personal' | 'parents' | 'academic' | 'matrika' | 'medical' | 'history' | 'marks' | 'notes' | 'evaluation' | 'educational_measures' | 'timetable' = 'overview';

  public getTabIcon(tab: typeof this.activeTab): string {
    const icons = ['layout-dashboard','user','users-group','school','calendar-time','school','heart-rate-monitor','history','notes','history','history','history'];
    return icons[this.tabs.indexOf(tab)] ?? icons[0];
  }

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
    .subscribe((student: any) => {
      this.selectedStudent = student;
      if (student.parents.length) {
        this.selectedParent = student.parents[0];
      }
      if (student.medical_records) {
        this.medicalRecords = student.medical_records;
      }
      this.loadMarks();
      this.refreshTimetable();
    });

    this.timetableSelectedWeek
    .pipe(distinctUntilChanged())
    .subscribe(() => {
      this.refreshTimetable();
    });

    // Force load hours if empty
    this.refreshTimetable();

    this.modalManager.addModal('medical_record', {
      title: 'students.medical.title',
      closeable: true,
      width: 500,
      items: [{ type: 'component', component: MedicalModalComponent }]
    });

    this.modalManager.addModal('edit_personal', {
      title: 'students.edit_personal',
      closeable: true,
      forceScrollbar: true,
      width: 600,
      items: [{ type: 'component', component: EditPersonalModalComponent }]
    });

    this.modalManager.addModal('add_parent', {
      title: 'students.add_parent.title',
      closeable: true,
      width: 800,
      items: [{ type: 'component', component: AddParentComponent }]
    })

    this.modalManager.addModal('parents_settings', {
      title: 'students.manage_parent',
      closeable: true,
      width: 600,
      items: [{ type: 'component', component: ParentsSettingsComponent }]
    })
  }

  public refreshStudentData() {
    const id = this.route.snapshot.paramMap.get('id');
    this.http.get(
      `${Config.API_URL}/v1/student/${id}`,
      { withCredentials: true }
    )
    .subscribe((student: any) => {
      this.selectedStudent = student;
      if (student.medical_records) {
        this.medicalRecords = student.medical_records;
      }
      this.loadMarks();
    });
  }

  public openParentSettings(): void {
    this.modalManager.openModal('parents_settings');
  }

  public openAddParentModal(): void {
    this.modalManager.openModal('add_parent', { student_id: this.selectedStudent.person_id });
  }

  public refreshTimetable() {
    if (!this.selectedStudent?.person_id) return;
    
    const { timetable, timetableHours, isLoading } = this.timetableService.getTimetable(
      'person',
      this.selectedStudent.person_id,
      this.timetableSelectedWeek.getValue(),
      this.timetableSelectedTab
    );

    isLoading.subscribe(loading => this.isLoadingTimetable = loading);
    timetable.subscribe(data => this.fullTimetable = data);
    timetableHours.subscribe(data => this.fullTimetableHours = data);
  }

  public setTimetableTab(tab: number) {
    this.timetableSelectedTab = tab;
    if (tab === 1) {
      this.timetableSelectedWeek.next(null);
    } else {
      this.timetableSelectedWeek.next(moment());
    }
  }

  public previousWeek(): void {
    const week = this.timetableSelectedWeek.getValue() || moment();
    this.timetableSelectedWeek.next(week.clone().subtract(1, 'week'));
  }

  public nextWeek(): void {
    const week = this.timetableSelectedWeek.getValue() || moment();
    this.timetableSelectedWeek.next(week.clone().add(1, 'week'));
  }

  public formatDateDisplay(): string {
    const week = this.timetableSelectedWeek.getValue();
    if (!week) return '';
    return week.clone().startOf('isoWeek').format('D. M.') + ' - ' + week.clone().endOf('isoWeek').format('D. M. YYYY');
  }

  
  // Close detail view
  closeDetail() {
    this.router.navigate(['/', 'students'])
  }

  // Tab switching
  setActiveTab(tab: typeof this.activeTab) {
    this.activeTab = tab;
    if (tab === 'timetable') {
      this.timetableSelectedTab = 0;
      this.timetableSelectedWeek.next(moment());
    }
  }


  public getTodayTimetable(): any[] {
    return this.selectedStudent.timetable.filter((lesson: any) => lesson.day == this.overviewSelectedDate.isoWeekday())
  }

  public getLessonSubjectName(lesson: TimetableAPI | any): string {
    if (lesson.end) {
      return this.l.s('timetable.end_class');
    }

    if (lesson.free) {
      return this.l.s('timetable.free_time');
    }

    return lesson.subjectName || lesson.subject_name;
  }

  public getLessonTime(lesson: TimetableAPI | any): string {
    if (this.fullTimetableHours.length === 0) return '';
    if (lesson.end == true) return this.fullTimetableHours[lesson.hour - 2].end;
    return `${this.fullTimetableHours[lesson.hour - 1].start} - ${this.fullTimetableHours[lesson.hour - 1].end}`;
  }
  
  public getSelectedDateLessons(): TimetableAPI[] {
    const day = this.overviewSelectedDate.isoWeekday();
    const isOdd = Utils.isOdd(this.overviewSelectedDate.isoWeek());

    // Hodiny pro daný den
    const lessons = this.selectedStudent.timetable
      .filter((lesson: any) => lesson.day === day && (lesson.type == 0 || (lesson.type == 1 && isOdd) || (lesson.type == 2 && !isOdd)));

    // Přidat substituce
    const substitutions = this.selectedStudent.substitution.filter((sub: any) => {
        const start = moment(sub.start_date);
        const end = moment(sub.end_date);
        return this.overviewSelectedDate.isBetween(start, end, 'day', '[]');
    });

    if (!lessons.length && !substitutions.length) return [];

    // Combine and find max hour
    const existingHours = [...lessons.map((l: any) => l.hour), ...substitutions.map((s: any) => s.start_hour)];
    const maxHour = Math.max(...existingHours);

    const fullList: TimetableAPI[] = [];
    

    for (let h = 1; h <= maxHour; h++) {
      let found: any = substitutions.find((s: any) => h >= s.start_hour && h <= s.end_hour);
      if (!found) {
        found = lessons.find((l: any) => l.hour === h);
      }

      if (found) {
        fullList.push({
            ...found,
            day,
            hour: found.hour || found.start_hour,
            free: false,
            end: false
        });
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
        hour: fullList.length ? (fullList[fullList.length - 1].hour || 0) + 1 : 1,
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

  public nextOverviewDay() {
    this.overviewSelectedDate = this.overviewSelectedDate.clone().add(1, 'day');
  }

  public previousOverviewDay() {
    this.overviewSelectedDate = this.overviewSelectedDate.clone().subtract(1, 'day');
  }

  public isCurrentLesson(lesson: any): boolean {
    if (lesson.free || lesson.end) return false;
    const now = moment();
    if (!this.overviewSelectedDate.isSame(now, 'day')) return false;

    const hourInfo = this.fullTimetableHours[lesson.hour - 1];
    if (!hourInfo) return false;

    return now.isBetween(hourInfo.startMoment, hourInfo.endMoment, 'minute', '[]');
  }

  // Marks methods
  public loadMarks(): void {
    if (!this.selectedStudent?.person_id) return;
    this.http
      .post<any>(
        `${Config.API_URL}/v1/marks/student`,
        { student_id: this.selectedStudent.person_id },
        { withCredentials: true }
      )
      .subscribe((data) => {
          if ('marks' in data) {
          this.marks = data.marks;
        }
        if ('subject_stats' in data) {
          this.subjectStats = data.subject_stats;
        }
        if ('mark_stats' in data) {
          this.markStats = data.mark_stats;
        }
      });
  }

  public getMarksPerSubject() {
    const result: { [subject: string]: any[] } = {};
    if (!this.marks) return [];
    for (const mark of this.marks) {
      const subject = mark.subject_name;
      if (!result[subject]) result[subject] = [];
      result[subject].push(mark);
    }
    return Object.entries(result).map(([subject, marks]) => ({
      subject,
      marks
    }));
  }

  public getAverageBySubject(subject: string): string {
    if (!subject) return "";
    const grades = this.marks?.filter((mark: any) => mark.subject_name === subject) || [];
    if (!grades || grades.length === 0) return this.l.s('marks.no_subjects');

    let total = 0;
    let totalDivide = 0;

    for (const grade of grades) {
      if (typeof grade.mark === "number") {
        const weight = (typeof grade.weight === "number" ? grade.weight : 0) + 1;
        total += grade.mark * weight;
        totalDivide += weight;
      }
    }
    if (totalDivide === 0) return this.l.s('marks.no_subjects');
    const average = total / totalDivide;
    return average < 1 ? "1.00" : average.toFixed(2);
  }

  public formatMark(mark_id: number): string {
    const config = this.marksManager.getConfig();
    let idIndex = config.mark_ids.findIndex((mark) => mark == mark_id);
    let displayMark = config.mark_display[idIndex];
    if (displayMark) return displayMark;
    return mark_id.toString();
  }

  public getMarkTooltip(mark: any): string {
    let tooltip = `${mark.topic} (${Utils.formatDateShort(mark.created)})`;
    if (mark.type === 1 && mark.max_points) {
        tooltip += `\n${this.l.s('marks.points')}: ${mark.mark} / ${mark.max_points}`;
    }
    if (this.markStats[mark.column_id]) {
      const stats = this.markStats[mark.column_id];
      tooltip += `\n${this.l.s('marks.class_average')}: ${stats.avg}`;
      tooltip += `\n${this.l.s('marks.class_rank')}: ${stats.rank}`;
    }
    return tooltip;
  }

  public selectMark(mark: any): void {
    this.selectedMark = mark;
  }

  public closeMarkDetails(): void {
    this.selectedMark = null;
  }

  public getFontSize(weight: number): number {
    const minWeight = 1;
    const maxWeight = 10;
    const minFont = 14;
    const maxFont = 22;
    if (weight <= minWeight) return minFont;
    if (weight >= maxWeight) return maxFont;
    return minFont + ((weight - minWeight) / (maxWeight - minWeight)) * (maxFont - minFont);
  }

  // Medical methods
  public openMedicalModal(mode: 'add' | 'edit', record: MedicalRecord | null = null, initialData: any = {}) {
      this.modalManager.openModal('medical_record', {
          mode,
          record,
          initialData,
          studentId: this.selectedStudent.person_id,
          callback: () => this.refreshMedicalRecords()
      });
  }

  public openEditPersonalModal() {
      this.modalManager.openModal('edit_personal', {
          student: this.selectedStudent,
          callback: () => this.refreshStudentData()
      });
  }



  public deleteMedicalRecord(recordId: number) {
      if (!this.selectedStudent?.person_id) return;
      if (!confirm('Opravdu chcete smazat tento zdravotní záznam?')) return;

      this.http.delete(`${Config.API_URL}/v1/student/${this.selectedStudent.person_id}/medical/${recordId}`, { withCredentials: true })
          .subscribe(() => {
              this.refreshMedicalRecords();
          });
  }

  public refreshMedicalRecords() {
      if (!this.selectedStudent?.person_id) return;
      this.http.get<MedicalRecord[]>(`${Config.API_URL}/v1/student/${this.selectedStudent.person_id}/medical`, { withCredentials: true })
          .subscribe(records => {
              this.medicalRecords = records;
          });
  }


  public getSeverityLabel(severity: string): string {
      switch (severity) {
          case 'low': return 'Nízká';
          case 'medium': return 'Střední';
          case 'high': return 'Vysoká';
          default: return severity;
      }
  }

  public getMedicalRecords(): MedicalRecord[] {
      return this.medicalRecords.filter(r => !r.is_food_allergy);
  }

  public getFoodAllergies(): MedicalRecord[] {
      return this.medicalRecords.filter(r => !!r.is_food_allergy);
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
