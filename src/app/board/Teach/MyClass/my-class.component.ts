
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
import moment from 'moment';

@Component({
  selector: 'app-my-class',
  standalone: true,
  imports: [CommonModule, FormsModule, TabsComponent, IconsModule, CalendarComponent],
  templateUrl: './my-class.component.html',
  styleUrls: ['./my-class.component.css']
})
export class MyClassComponent implements OnInit {
  activeTab = new BehaviorSubject<number>(0);
  tabs = ['sidebar.students', 'sidebar.absence', 'Služba']; 

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
    start: moment().startOf('isoWeek').format('YYYY-MM-DD'),
    end: moment().endOf('isoWeek').format('YYYY-MM-DD')
  };

  // Auto Service Form
  autoServiceRange = {
      start: moment().add(1, 'week').startOf('isoWeek').format('YYYY-MM-DD'),
      end: moment().add(1, 'week').endOf('isoWeek').format('YYYY-MM-DD'),
      count: 2,
      method: 'random' as 'random' | 'alphabetical',
      offset: 0
  }

  // Excuse Form
  excuseReason: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchData();

    // Initialize calendars
    setTimeout(() => {
        this.calendarManager.getCalendarData('myClass_newService_start').selected_date[0].next(moment(this.newService.start));
        this.calendarManager.getCalendarData('myClass_newService_end').selected_date[0].next(moment(this.newService.end));
        this.calendarManager.getCalendarData('myClass_autoService_start').selected_date[0].next(moment(this.autoServiceRange.start));
        this.calendarManager.getCalendarData('myClass_autoService_end').selected_date[0].next(moment(this.autoServiceRange.end));
    });

    // Subscribe to calendar changes
    this.calendarManager.getCalendarData('myClass_newService_start').selected_date[0].subscribe((date) => {
        this.newService.start = date.format('YYYY-MM-DD');
    });
    this.calendarManager.getCalendarData('myClass_newService_end').selected_date[0].subscribe((date) => {
        this.newService.end = date.format('YYYY-MM-DD');
    });
    this.calendarManager.getCalendarData('myClass_autoService_start').selected_date[0].subscribe((date) => {
        this.autoServiceRange.start = date.format('YYYY-MM-DD');
    });
    this.calendarManager.getCalendarData('myClass_autoService_end').selected_date[0].subscribe((date) => {
        this.autoServiceRange.end = date.format('YYYY-MM-DD');
    });
  }

  fetchData() {
    this.loading = true;
    let url = `${Config.API_URL}/v1/teach/my-class`;
    if (this.selectedClassId) {
        url += `?classId=${this.selectedClassId}`;
    }

    this.http.get<any>(url, { withCredentials: true }).subscribe({
      next: (data) => {
        this.classes = data.classes || [];
        this.classInfo = data.currentClass;
        
        // If we have classes but none selected yet, select the first one (which backend likely returned as currentClass)
        if (this.classes.length > 0 && !this.selectedClassId && this.classInfo) {
            this.selectedClassId = this.classInfo.classId;
        }

        this.students = data.students || [];
        this.absences = data.absences || [];
        this.currentServices = data.currentServices || [];
        this.plannedServices = data.plannedServices || [];
        this.serviceHistory = data.serviceHistory || [];
        this.todayStats = data.todayStats || null;
        this.absenceStats = data.absenceStats || null;
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

  excuse(absence: any) {
    if (!this.excuseReason) return;
    
    this.http.post(`${Config.API_URL}/v1/teach/my-class/absence/excuse`, {
      studentId: absence.student,
      lessonId: absence.lesson,
      reason: this.excuseReason
    }, { withCredentials: true }).subscribe({
      next: () => {
        this.absences = this.absences.filter(a => a !== absence);
        this.excuseReason = '';
      },
      error: (err) => console.error('Failed to excuse absence', err)
    });
  }

  addService() {
    if (!this.newService.studentId || !this.newService.start || !this.newService.end) return;

    this.http.post(`${Config.API_URL}/v1/teach/my-class/service`, this.newService, { withCredentials: true }).subscribe({
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
      if (!confirm(`Opravdu chcete automaticky vybrat ${this.autoServiceRange.count} studentů (${methodText})? Termín: ${this.autoServiceRange.start} - ${this.autoServiceRange.end}`)) return;

      this.http.post(`${Config.API_URL}/v1/teach/my-class/service/auto`, {
          classId: this.classInfo.classId,
          start: this.autoServiceRange.start,
          end: this.autoServiceRange.end,
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

  getGradeClass(grade: number | string | null): string {
    if (!grade) return 'badge--gray';
    const g = Number(grade);
    if (g <= 1.5) return 'badge--success';
    if (g <= 2.5) return 'badge--info';
    if (g <= 3.5) return 'badge--warning';
    if (g <= 4.5) return 'badge--danger';
    return 'badge--danger'; 
  }
}
