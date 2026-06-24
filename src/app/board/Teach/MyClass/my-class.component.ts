
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Config } from '@Schoolingo/config';
import { BehaviorSubject } from 'rxjs';
import { TabsComponent } from '../../../Components/Tabs';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { Utils } from '@Schoolingo/utils';
import { CalendarComponent } from '@Components/calendar';
import { CalendarManager } from '@Components/calendar-dropdown';
import { absence, AbsenceType } from '@Schoolingo/absence';
import moment from 'moment';
import { RouterLink } from '@angular/router';
import { StatCardComponent } from "@Components/stat-card/stat-card.component";

@Component({
  selector: 'app-my-class',
  standalone: true,
  imports: [CommonModule, FormsModule, TabsComponent, IconsModule, CalendarComponent, RouterLink, StatCardComponent],
  templateUrl: './my-class.component.html',
  styleUrls: ['./my-class.component.css']
})
export class MyClassComponent implements OnInit {
  activeTab = new BehaviorSubject<number>(0);
  tabs = ['sidebar.students', 'sidebar.absence', 'classbook.class_service']; 

  l = inject(Locale);
  Utils = Utils;
  public calendarManager = inject(CalendarManager);

  classes: any[] = [];
  selectedClassId: number | null = null;
  classInfo: any = null;

  students: any[] = [];
  absences: any[] = [];
  currentServices: any[] = [];
  plannedServices: any[] = [];
  serviceHistory: any[] = [];
  todayStats: any = null;
  absenceStats: any = null;
  
  loading = true;
  error: string | null = null;

  // New Service Form
  newService = {
    studentId: null,
    start: moment().startOf('isoWeek'),
    end: moment().endOf('isoWeek')
  };

  // Auto Service Form
  autoServiceRange = {
      start: moment().add(1, 'week').startOf('isoWeek'),
      end: moment().add(1, 'week').endOf('isoWeek'),
      count: 2,
      method: 'random' as 'random' | 'alphabetical',
      offset: 0
  }

  // Absence Edit Form
  AbsenceType = AbsenceType;
  absenceConfig = absence;
  editingAbsence: any = null;
  editForm = {
      type: AbsenceType.ABSENCE,
      reason: '',
      note: '',
      minutes: 0
  };

  // Absence Weekly View
  absenceWeekStart = moment().startOf('isoWeek');
  selectedStudent: any = null;

  selectStudent(student: any) {
    this.selectedStudent = student;
    this.editingAbsence = null;
  }

  getStudentAbsenceCount(studentId: number): number {
    return this.absences.filter(a => a.student_id === studentId).length;
  }

  getSelectedStudentAbsenceCount(): number {
    if (!this.selectedStudent) return 0;
    return this.absences.filter(a => a.student_id === this.selectedStudent.person_id).length;
  }
  _cachedAbsenceLen: number = -1;
  _cachedHours: number[] = [];

  getHoursRange(): number[] {
    if (this._cachedAbsenceLen !== this.absences.length) {
      this._cachedAbsenceLen = this.absences.length;
      const hours = this.absences.map(a => Number(a.day_hour)).filter(h => !isNaN(h));
      const max = hours.length > 0 ? Math.max(...hours) : 7;
      const count = Math.max(max + 1, 8);
      this._cachedHours = Array.from({ length: count }, (_, i) => i);
    }
    return this._cachedHours;
  }

  getAbsenceCell(studentId: number, date: string, hour: number): any {
    return this.absences.find(a => {
      // Coerce to string safely
      if (a.student_id != studentId) return false;
      if (a.day_hour != hour) return false;
      
      const aDate = String(a.date).split('T')[0].substring(0, 10);
      return aDate === date;
    }) || null;
  }

  getAbsenceCellIcon(studentId: number, date: string, hour: number): string {
    const cell = this.getAbsenceCell(studentId, date, hour);
    return cell ? this.getAbsenceIcon(cell.type) : '';
  }

  getAbsenceCellClass(studentId: number, date: string, hour: number): string {
    const cell = this.getAbsenceCell(studentId, date, hour);
    return cell ? this.getAbsenceClass(cell.type) : '';
  }

  getAbsenceCellTypeName(studentId: number, date: string, hour: number): string {
    const cell = this.getAbsenceCell(studentId, date, hour);
    return cell ? this.getAbsenceTypeName(cell.type) : '';
  }

  getAbsenceClass(type: AbsenceType | undefined): string {
    if (type === undefined || type === null) return '';
    const numType = Number(type);
    if (!this.absenceConfig[numType]) return '';
    return 'ab-' + this.absenceConfig[numType].locale;
  }

  getAbsenceIcon(type: AbsenceType | undefined): string {
    if (type === undefined || type === null) return '';
    const numType = Number(type);
    if (!this.absenceConfig[numType]) return '';
    return this.absenceConfig[numType].icon || '';
  }

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchData();

    // Calendar subscriptions are handled via (valueChange) in template
  }

  fetchData() {
    this.loading = true;
    let url = `${Config.API_URL}/v1/teach/my-class?absenceStart=${this.absenceWeekStart.format('YYYY-MM-DD')}&absenceEnd=${this.absenceWeekStart.clone().endOf('isoWeek').format('YYYY-MM-DD')}`;
    if (this.selectedClassId) {
        url += `&classId=${this.selectedClassId}`;
    }

    this.http.get<any>(url, { withCredentials: true }).subscribe({
      next: (data) => {
        this.classes = data.classes || [];
        this.classInfo = data.currentClass;
        
        if (this.classes.length > 0 && !this.selectedClassId && this.classInfo) {
            this.selectedClassId = this.classInfo.classId;
        }

        this.students = data.students || [];
        this.absences = data.absences || [];
        // Fix DB UTC -> Local string parsing issues
        this.absences.forEach(a => {
            if (a.date) {
               a.date = moment(a.date).format('YYYY-MM-DD');
            }
        });
        
        this.currentServices = data.currentServices || [];
        this.plannedServices = data.plannedServices || [];
        this.serviceHistory = data.serviceHistory || [];
        this.todayStats = data.todayStats || null;
        this.absenceStats = data.absenceStats || null;

        // Auto-select first student if none selected or previously selected not in list
        if (this.students.length > 0) {
          if (!this.selectedStudent || !this.students.find(s => s.person_id === this.selectedStudent.person_id)) {
            this.selectedStudent = this.students[0];
          }
        }

        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load my class data', err);
        this.error = 'Nepodařilo se načíst data třídy.';
        this.loading = false;
      }
    });
  }

  onClassChange() {
      // When dropdown changes
      this.fetchData();
  }

  getStudentName(id: number): string {
    const s = this.students.find(x => x.personId === id);
    return s ? `${s.lastName} ${s.firstName}` : 'Neznámý žák';
  }

  _cachedReasonsType: number = -1;
  _cachedReasons: string[] = [];

  getAbsenceReasons(type: AbsenceType): string[] {
     const numType = Number(type);
     if (this._cachedReasonsType !== numType) {
         this._cachedReasonsType = numType;
         if (numType === undefined || numType === null || isNaN(numType) || !this.absenceConfig[numType]) {
             this._cachedReasons = [];
         } else {
             let arr = [...(this.absenceConfig[numType].reasons || [])];
             if (arr.length > 0) arr.push('other');
             this._cachedReasons = arr;
         }
     }
     return this._cachedReasons;
  }

  _cachedTypes: any = null;
  getAbsenceTypes() {
      if (!this._cachedTypes) {
          this._cachedTypes = [
              { value: AbsenceType.ABSENCE, label: this.l.s('absence.absence') },
              { value: AbsenceType.EXCUSED, label: this.l.s('absence.excused') },
              { value: AbsenceType.UNEXCUSED, label: this.l.s('absence.unexcused') },
              { value: AbsenceType.NON_COUNT, label: this.l.s('absence.non_count') },
              { value: AbsenceType.LATE, label: this.l.s('absence.late') },
              { value: AbsenceType.EARLY, label: this.l.s('absence.early') },
              { value: AbsenceType.DISTANCE, label: this.l.s('absence.distance') }
          ];
      }
      return this._cachedTypes;
  }

  getAbsenceTypeName(type: AbsenceType) {
      const cfg = this.absenceConfig[type];
      return cfg ? this.l.s('absence.' + cfg.locale) : type.toString();
  }

  _cachedDaysStart: string = '';
  _cachedDays: moment.Moment[] = [];

  getDaysInWeek() {
      const startStr = this.absenceWeekStart.format('YYYY-MM-DD');
      if (this._cachedDaysStart !== startStr) {
          this._cachedDaysStart = startStr;
          let days = [];
          for (let i = 0; i < 5; i++) {
              days.push(this.absenceWeekStart.clone().add(i, 'days'));
          }
          this._cachedDays = days;
      }
      return this._cachedDays;
  }

  getAbsencesForDate(date: moment.Moment) {
      const dateStr = date.format('YYYY-MM-DD');
      return this.absences.filter(a => a.date === dateStr).sort((a,b) => a.day_hour - b.day_hour);
  }

  prevWeek() {
      this.absenceWeekStart = this.absenceWeekStart.clone().subtract(1, 'week');
      this.fetchData();
  }

  nextWeek() {
      this.absenceWeekStart = this.absenceWeekStart.clone().add(1, 'week');
      this.fetchData();
  }

  getDayName(day: moment.Moment) {
      // Return czech day name
      return day.locale('cs').format('dddd');
  }

  formatDateString(date: any): string {
      if (!date) return '';
      return moment(date).format('YYYY-MM-DD');
  }

  startEdit(a: any, date?: string, hour?: number) {
      if (a) {
          this.editingAbsence = a;
      } else {
          this.editingAbsence = {
              student_id: this.selectedStudent.person_id,
              date: date,
              day_hour: hour,
              isNew: true
          };
      }
      this.editForm = {
          type: a?.type ?? AbsenceType.EXCUSED,
          reason: a?.reason || '',
          note: a?.note || '',
          minutes: a?.minutes || 0
      };
      this.bulkAbsenceDay = null;
  }

  saveEdit() {
      if (!this.editingAbsence) return;

      const payload: any = {
          studentId: this.editingAbsence.student_id,
          type: parseInt(<any>this.editForm.type),
          reason: this.editForm.reason,
          note: this.editForm.note,
          minutes: this.editForm.minutes
      };

      if (this.editingAbsence.lesson_id) {
          payload.lessonId = this.editingAbsence.lesson_id;
      } else {
          payload.date = this.editingAbsence.date;
          payload.hour = this.editingAbsence.day_hour;
      }

      this.http.put(`${Config.API_URL}/v1/teach/my-class/absence`, payload, { withCredentials: true }).subscribe({
          next: () => {
              this.fetchData();
              this.editingAbsence = null;
          },
          error: (err) => {
              console.error('Failed to update/create absence', err);
              if (err.error?.error) {
                  alert(err.error.error);
              }
          }
      });
  }

  deleteAbsence(a: any) {
      if (a.isNew) {
          this.editingAbsence = null;
          return;
      }
      if (!confirm('Opravdu chcete tuto absenci vymazat?')) return;

      const payload: any = { studentId: a.student_id };
      if (a.lesson_id) payload.lessonId = a.lesson_id;
      else { payload.date = a.date; payload.hour = a.day_hour; }

      this.http.delete(`${Config.API_URL}/v1/teach/my-class/absence`, {
          body: payload,
          withCredentials: true 
      }).subscribe({
          next: () => {
              this.absences = this.absences.filter(item => item !== a);
          },
          error: (err) => {
              console.error('Failed to delete absence', err);
              if (err.error?.error) {
                  alert(err.error.error);
              }
          }
      });
  }

  // Bulk Absence
  bulkAbsenceDay: string | null = null;
  bulkAbsenceForm = {
      type: AbsenceType.EXCUSED,
      reason: '',
      note: ''
  };

  startBulkAbsence(date: string) {
      this.bulkAbsenceDay = date;
      this.bulkAbsenceForm = {
          type: AbsenceType.EXCUSED,
          reason: '',
          note: ''
      };
      this.editingAbsence = null;
  }

  saveBulkAbsence() {
      if (!this.bulkAbsenceDay || !this.selectedStudent) return;
      
      this.http.post(`${Config.API_URL}/v1/teach/my-class/absence/bulk`, {
          studentId: this.selectedStudent.person_id,
          date: this.bulkAbsenceDay,
          type: parseInt(<any>this.bulkAbsenceForm.type),
          reason: this.bulkAbsenceForm.reason,
          note: this.bulkAbsenceForm.note
      }, { withCredentials: true }).subscribe({
          next: () => {
              this.fetchData();
              this.bulkAbsenceDay = null;
          },
          error: (err) => console.error('Failed to add bulk absence', err)
      });
  }

  deleteBulkAbsence(date: string) {
      if (!this.selectedStudent) return;
      if (!confirm(`Opravdu chcete vymazat u studenta ${this.selectedStudent.full_name} veškerou absenci pro den ${moment(date).format('DD.MM.YYYY')}?`)) return;
      
      this.http.delete(`${Config.API_URL}/v1/teach/my-class/absence/bulk`, { 
          body: {
              studentId: this.selectedStudent.person_id,
              date: date
          },
          withCredentials: true 
      }).subscribe({
          next: () => {
              this.fetchData();
          },
          error: (err) => {
              console.error('Failed to delete bulk absence', err);
              alert('Nepodařilo se smazat absenci pro tento den.');
          }
      });
  }

  addService() {
    if (!this.newService.studentId || !this.newService.start || !this.newService.end) return;

    this.http.post(`${Config.API_URL}/v1/teach/my-class/service`, {
        ...this.newService,
        start: this.newService.start.format('YYYY-MM-DD'),
        end: this.newService.end.format('YYYY-MM-DD')
    }, { withCredentials: true }).subscribe({
      next: () => {
        this.fetchData(); 
        this.newService.studentId = null; 
        // keep dates for convenience
      },
      error: (err) => console.error('Failed to add service', err)
    });
  }
  
  autoAssignService() {
      if (!this.classInfo) return;
      
      const methodText = this.autoServiceRange.method === 'random' ? 'náhodně' : 'abecedně';
      if (!confirm(`Opravdu chcete automaticky vybrat ${this.autoServiceRange.count} studentů (${methodText})? Termín: ${this.autoServiceRange.start.format('DD.MM.YYYY')} - ${this.autoServiceRange.end.format('DD.MM.YYYY')}`)) return;

      this.http.post(`${Config.API_URL}/v1/teach/my-class/service/auto`, {
          classId: this.classInfo.class_id,
          start: this.autoServiceRange.start.format('YYYY-MM-DD'),
          end: this.autoServiceRange.end.format('YYYY-MM-DD'),
          count: this.autoServiceRange.count,
          method: this.autoServiceRange.method,
          offset: this.autoServiceRange.offset
      }, { withCredentials: true }).subscribe({
          next: () => {
              this.fetchData();
          },
          error: (err) => {
              console.error(err);
              alert('Chyba při automatickém přiřazení.');
          }
      })
  }

  removeService(id: number) {
    if(!confirm('Opravdu chcete odebrat tuto službu?')) return;
    
    this.http.delete(`${Config.API_URL}/v1/teach/my-class/service/${id}`, { withCredentials: true }).subscribe({
      next: () => {
        this.currentServices = this.currentServices.filter(s => s.csId !== id);
        this.plannedServices = this.plannedServices.filter(s => s.csId !== id);
      },
      error: (err) => console.error('Failed to remove service', err)
    });
  }

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
