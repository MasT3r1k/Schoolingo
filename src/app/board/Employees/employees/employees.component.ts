import { Component, OnInit, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@Schoolingo/icons';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Config } from '@Schoolingo/config';
import { Utils } from '@Schoolingo/utils';
import { DropdownManager } from '@Schoolingo/dropdown';
import { Locale } from '@Schoolingo/locale';
import { Permission } from '@Schoolingo/permission';
import { Authentication } from '@Schoolingo/authentication';
import { TabsComponent } from '@Components/Tabs';
import { CalendarComponent } from '@Components/calendar';
import { ModalManager } from '@Schoolingo/modal';
import { BoardAlertManager } from '../../../infrastructure/alert/board.alert.manager';
import { BehaviorSubject, Subscription } from 'rxjs';
import { AddEmployeeModalComponent } from './modals/add-employee-modal/add-employee-modal.component';
import { VacationRequestModalComponent } from './modals/vacation-request-modal/vacation-request-modal.component';
import { AddBonusModalComponent } from './modals/add-bonus-modal/add-bonus-modal.component';
import { SetSalaryModalComponent } from './modals/set-salary-modal/set-salary-modal.component';
import { EditAttendanceModalComponent } from './modals/edit-attendance-modal/edit-attendance-modal.component';
import { EditEmployeeModalComponent } from './modals/edit-employee-modal/edit-employee-modal.component';
import { RejectVacationModalComponent } from './modals/reject-vacation-modal/reject-vacation-modal.component';
import { AdjustVacationModalComponent } from './modals/adjust-vacation-modal/adjust-vacation-modal.component';
import { RequestMoreVacationModalComponent } from './modals/request-more-vacation-modal/request-more-vacation-modal.component';
import { AvatarService } from '../../../infrastructure/utils/avatar.service';
import { EMPLOYEE_CONFIG } from '../../../infrastructure/employees/const';
import moment from 'moment';

export interface Employee {
  person_id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  role: string;
  employee_number?: string;
  department?: string;
  contract_type?: string;
  status: Omit<EMPLOYEE_CONFIG.EMPLOYEE_STATUS, 'all'>;
  hours_per_week?: number;
  start_date?: string;
  end_date?: string;
  rank?: string;
  cabinet?: number;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  avatar?: string;
}

export interface VacationRequest {
  request_id: number;
  teacher_id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  start_date: string;
  end_date: string;
  days: number;
  type: string;
  status: string;
  reason?: string;
  created_at: Date;
  approved_at: Date | null;
}

export interface AttendanceRecord {
  attendance_id: number;
  teacher_id: number;
  full_name: string;
  first_name: string;
  last_name: string;
  date: string;
  check_in?: string;
  check_out?: string;
  break_minutes: number;
  worked_minutes: number;
  type: string;
  approved: boolean;
  avatar?: string;
}

export interface EmployeeFilters {
  search: string;
  status: EMPLOYEE_CONFIG.EMPLOYEE_STATUS;
  role: string;
  department: string;
}

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [CommonModule, IconsModule, FormsModule, TabsComponent, CalendarComponent],
  templateUrl: './employees.component.html',
  styleUrl: './employees.component.css'
})
export class EmployeesComponent implements OnInit {
  private http = inject(HttpClient);
  public Utils = Utils;
  public dropdownManager = inject(DropdownManager);
  public l = inject(Locale);
  public perm = inject(Permission);
  private auth = inject(Authentication);
  private subscriptions: Subscription[] = [];
  public modalManager = inject(ModalManager);
  private alertManager = inject(BoardAlertManager) as BoardAlertManager;
  public avatarService = inject(AvatarService);
  public canViewAllEmployees: boolean = true;
  EMPLOYEE_CONFIG = EMPLOYEE_CONFIG

  // Loading state - Signals
  isLoading = signal(false);
  loadError = signal<string | null>(null);

  // Selected employee for detail view - Signal
  selectedEmployee = new BehaviorSubject<Employee | null>(null);
  
  // Wrapper for TabsComponent compatibility (it expects BehaviorSubject)
  selectedViewTabSubject = new BehaviorSubject<number>(0);
  // Main view tabs
  selectedViewTab = new BehaviorSubject<number>(0);
  viewTabOptions = ['employees.list', 'employees.attendance', 'employees.vacations.title', 'employees.salaries', 'employees.bonuses'];
  viewTabIcons = ['users', 'clock', 'beach', 'cash', 'gift'];
  
  // Detail tabs
  selectedDetailTab = new BehaviorSubject<number>(0);
  detailTabOptions = ['employees.overview', 'employees.attendance', 'employees.vacations.title', 'employees.salary', 'employees.bonuses'];
  detailTabIcons = ['layout-dashboard', 'clock', 'beach', 'cash', 'gift'];

  // Filters - Signals
  filters = signal<EmployeeFilters>({
    search: '',
    status: 'all',
    role: 'all',
    department: ''
  });

  // Pagination - Signals
  currentPage = signal(1);
  pageSize = signal(20);
  totalItems = signal(0);
  totalPages = computed(() => Math.ceil(this.totalItems() / this.pageSize()));

  // Data - Signals
  employees = signal<Employee[]>([]);
  vacationRequests = signal<VacationRequest[]>([]);
  attendanceRecords = signal<AttendanceRecord[]>([]);
  allAttendanceRecords = signal<AttendanceRecord[]>([]);
  currentAttendanceRecord = signal<AttendanceRecord | null>(null);

  // Check-in/out state - Signals
  isCheckedIn = signal(false);
  checkInTime = signal<string | null>(null);

  // Detail view data - Signals
  attendanceStats = computed(() => {
    const records = this.attendanceRecords();
    let totalMinutes = 0;
    let daysWithRecords = 0;

    records.forEach(record => {
      if (record.worked_minutes) {
        totalMinutes += record.worked_minutes;
        daysWithRecords++;
      }
    });

    return {
      totalHours: Number((totalMinutes / 60).toFixed(1)),
      daysPresent: daysWithRecords,
      avgDaily: daysWithRecords > 0 ? Number((totalMinutes / 60 / daysWithRecords).toFixed(1)) : 0
    };
  });
  attendanceFilter = signal<{ period: string; startDate: string; endDate: string }>({ period: 'month', startDate: '', endDate: '' });
  
  salaryHistory = signal<any[]>([]);
  currentSalary = signal<any>(null);
  
  bonuses = signal<any[]>([]);
  bonusFilter = signal<{ status: string; type: string }>({ status: 'all', type: 'all' });
  
  // Computed signals for filtered bonuses and totals
  filteredBonuses = computed(() => {
    const bonuses = this.bonuses();
    const filter = this.bonusFilter();
    return bonuses.filter(bonus => {
      if (filter.status !== 'all') {
        const isPaid = bonus.paid;
        if (filter.status === 'paid' && !isPaid) return false;
        if (filter.status === 'unpaid' && isPaid) return false;
      }
      if (filter.type !== 'all' && bonus.type !== filter.type) {
        return false;
      }
      return true;
    });
  });
  
  bonusesTotal = computed(() => this.bonuses().reduce((sum, b) => sum + (b.amount || 0), 0));
  bonusesUnpaid = computed(() => this.bonuses().filter(b => !b.paid).reduce((sum, b) => sum + (b.amount || 0), 0));
  
  vacationBalance = signal<{ total: number; used: number; remaining: number }>({ total: 0, used: 0, remaining: 0 });
  currentYear = new Date().getFullYear();

  attendanceMoment = computed(() => {
    const startDate = this.attendanceFilter().startDate;
    return startDate ? moment(startDate) : moment();
  });

  public getFilterLabel(type: 'attendancePeriod' | 'bonusStatus' | 'bonusType', value: any): string {
    const options = this.getFilterOptions(type);
    return options.find(o => o.value === value)?.label || value;
  }

  public getFilterOptions(type: 'attendancePeriod' | 'bonusStatus' | 'bonusType'): {value: string, label: string}[] {
    switch(type) {
      case 'attendancePeriod':
        return [
          {value: 'week', label: 'Tento týden'},
          {value: 'month', label: 'Tento měsíc'},
          {value: 'custom', label: 'Vlastní'}
        ];
      case 'bonusStatus':
        return [
          {value: 'all', label: 'Všechny'},
          {value: 'paid', label: 'Vyplacené'},
          {value: 'unpaid', label: 'Nevyplacené'}
        ];
      case 'bonusType':
        return [
          {value: 'all', label: 'Všechny typy'},
          {value: 'performance', label: 'Výkon'},
          {value: 'project', label: 'Projekt'},
          {value: 'holiday', label: 'Svátky'},
          {value: 'other', label: 'Ostatní'}
        ];
      default: return [];
    }
  }

  ngOnInit() {
    this.loadEmployees();
    this.checkAttendanceStatus();
    const personId = this.auth.getId();
    if (personId) {
      this.loadVacationData(personId);
    }

    // Register add employee modal
    this.modalManager.addModal(
      'add_employee',
      {
        title: 'employees.add_employee.title',
        description: 'employees.add_employee.description',
        icon: 'user-plus',
        closeable: true,
        forceScrollbar: true,
        width: 600,
        items: [{
          type: 'component',
          component: AddEmployeeModalComponent
        }]
      }
    );

    this.modalManager.addModal(
      'edit_employee',
      {
        title: 'Upravit zaměstnance',
        closeable: true,
        width: 600,
        items: [{
          type: 'component',
          component: EditEmployeeModalComponent
        }]
      }
    );

    this.modalManager.addModal(
      'request_vacation',
      {
        icon: 'beach',        
        title: 'employees.request_vacation.title',
        description: 'employees.request_vacation.description',
        closeable: true,
        width: 600,
        items: [{
          type: 'component',
          component: VacationRequestModalComponent
        }]
      }
    );

    this.modalManager.addModal(
      'reject_vacation',
      {
        title: 'employees.reject_vacation.title',
        closeable: true,
        width: 500,
        items: [{
          type: 'component',
          component: RejectVacationModalComponent
        }]
      }
    );

    this.modalManager.addModal(
      'add_bonus',
      {
        title: 'Přidat prémii',
        closeable: true,
        width: 500,
        items: [{
          type: 'component',
          component: AddBonusModalComponent
        }]
      }
    );

    this.modalManager.addModal(
      'set_salary',
      {
        icon: 'wallet',
        title: 'Nastavit plat',
        closeable: true,
        width: 600,
        items: [{
          type: 'component',
          component: SetSalaryModalComponent
        }]
      }
    );


    this.modalManager.addModal(
      'edit_attendance',
      {
        icon: 'clock-edit',
        title: 'employees.edit_attendance.title',
        description: 'employees.edit_attendance.description',
        closeable: true,
        width: 500,
        items: [{
          type: 'component',
          component: EditAttendanceModalComponent
        }]
      }
    );

    this.modalManager.addModal(
      'adjust_vacation',
      {
        icon: 'beach',
        title: 'Upravit nárok na dovolenou',
        closeable: true,
        width: 450,
        items: [{
          type: 'component',
          component: AdjustVacationModalComponent
        }]
      }
    );

    this.modalManager.addModal(
      'request_extra_vacation',
      {
        icon: 'beach',        
        title: 'employees.request_vacation.request_extra_vacation.title',
        description: 'employees.request_vacation.request_extra_vacation.description',
        closeable: true,
        width: 500,
        items: [{
          type: 'component',
          component: RequestMoreVacationModalComponent
        }]
      }
    );

    // Sync signal with BehaviorSubject for TabsComponent compatibility (bidirectional)
    this.subscriptions.push(
      this.selectedViewTab.subscribe(tab => {
        if (tab === 1) { // attendance tab
          this.loadAllAttendance();
        }
        if (tab === 2) { // vacations tab
          this.loadVacationRequests();
        }
      })
    );
    this.subscriptions.push(
      this.selectedDetailTab.subscribe(tab => {
        const employee = this.selectedEmployee.getValue()
        if (!employee) return;

        if (tab === 1) { // Attendance
             this.loadAttendanceForDetail(employee.person_id);
        }
        if (tab === 2) { // Vacation
             this.loadVacationData(employee.person_id);
             this.loadVacationRequests(employee.person_id);
        }
        if (tab === 3) { // Salary
             this.loadSalaryData(employee.person_id);
        }
        if (tab === 4) { // Bonuses
             this.loadBonusesData(employee.person_id);
        }
      })
    );

    // Subscribe to BehaviorSubject changes from TabsComponent and update signal
    this.selectedViewTabSubject.subscribe(tab => {
      if (this.selectedViewTab.getValue() !== tab) {
        this.selectedViewTab.next(tab);
      }
    });

    // Use effect() instead of subscriptions for reactive updates
    effect(() => {
      const tab = this.selectedViewTab.getValue();
      if (tab === 1) { // attendance tab
        this.loadAllAttendance();
      }
      if (tab === 2) { // vacations tab
        this.loadVacationRequests();
      }
    });
  }

  // Load employees from API - Using Signals
  loadEmployees(page = this.currentPage()) {
    this.currentPage.set(page);
    this.isLoading.set(true);
    this.loadError.set(null);

    const filters = this.filters();
    let params: any = {
      limit: this.pageSize(),
      offset: (page - 1) * this.pageSize(),
      search: filters.search,
      status: filters.status,
    };

    if (filters.role !== 'all') params.role = filters.role;
    if (filters.department) params.department = filters.department;

    this.http.get<{ canViewAll: boolean;data: Employee[], meta: { total: number } }>(
      `${Config.API_URL}/v1/employees`,
      { withCredentials: true, params }
    ).subscribe({
      next: (response) => {
        this.canViewAllEmployees = response.canViewAll;
        this.employees.set(response.data);
        this.totalItems.set(response.meta.total);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading employees:', error);
        this.loadError.set('Nepodařilo se načíst seznam zaměstnanců');
        this.isLoading.set(false);
        this.alertManager.alert('error', 'employees.errors.load_failed').closeable(true);
      }
    });
  }

  // Check current attendance status
  checkAttendanceStatus() {
    const personId = this.auth.getId();
    if (!personId) return;

    const now = new Date();
    const today = moment();
    
    this.http.get<{ data: AttendanceRecord[] }>(
      `${Config.API_URL}/v1/employees/attendance`,
      { 
        withCredentials: true, 
        params: { 
          dateFrom: today.format('YYYY-MM-DD'),
          employeeId: personId 
        } 
      }
    ).subscribe({
      next: (response) => {
        // Find specifically my record for today that is "active"
        const myRecord = response.data.find(r => 
          Number(r.teacher_id) === personId && 
          moment(r.date).format('YYYY-MM-DD') == today.format('YYYY-MM-DD') &&
          !r.check_out
        );

        if (myRecord) {
          this.isCheckedIn.set(true);
          this.checkInTime.set(myRecord.check_in ? String(myRecord.check_in).substring(0, 5) : null);
          this.currentAttendanceRecord.set(myRecord);
        } else {
          this.isCheckedIn.set(false);
          this.checkInTime.set(null);
          this.currentAttendanceRecord.set(null);
        }
      }
    });
  }

  // Check-in
  performCheckIn() {
    this.http.post<{ success: boolean, time: string }>(
      `${Config.API_URL}/v1/employees/attendance/checkin`,
      { type: 'regular' },
      { withCredentials: true }
    ).subscribe({
      next: (response) => {
        this.isCheckedIn.set(true);
        this.checkInTime.set(response.time);
        this.checkAttendanceStatus();
        this.alertManager.alert('success', 'employees.attendance_status.checkin_success').closeable(true);
      },
      error: (error) => {
        console.error('Check-in failed:', error);
        this.alertManager.alert('error', 'employees.attendance_status.checkin_failed').closeable(true);
      }
    });
  }

  // Check-out
  performCheckOut(breakMinutes = 0) {
    this.http.post<{ success: boolean, workedMinutes: number }>(
      `${Config.API_URL}/v1/employees/attendance/checkout`,
      { breakMinutes },
      { withCredentials: true }
    ).subscribe({
      next: () => {
        this.isCheckedIn.set(false);
        this.checkInTime.set(null);
        this.currentAttendanceRecord.set(null);
        this.checkAttendanceStatus();
        this.alertManager.alert('success', 'employees.attendance_status.checkout_success').closeable(true);
      },
      error: (error) => {
        console.error('Check-out failed:', error);
        this.alertManager.alert('error', 'employees.attendance_status.checkout_failed').closeable(true);
      }
    });
  }

  // Load vacation requests
  loadVacationRequests(employeeId?: number) {
    let url = `${Config.API_URL}/v1/employees/vacations/requests`;
    if (employeeId) {
       url += `?employeeId=${employeeId}`;
    }

    this.http.get<{ data: VacationRequest[] }>(
      url,
      { withCredentials: true }
    ).subscribe({
      next: (response) => {
        this.vacationRequests.set(response.data);
      },
      error: (error) => {
        console.error('Failed to load vacation requests:', error);
        this.alertManager.alert('error', 'employees.vacations.load_failed').closeable(true);
      }
    });
  }

  // Filter changes
  onFilterChange() {
    this.loadEmployees(1);
  }

  // Helper method to update filters safely
  updateFilter<K extends keyof EmployeeFilters>(key: K, value: EmployeeFilters[K]) {
    this.filters.set({ ...this.filters(), [key]: value });
  }

  // Attendance filter helpers (template cannot use spread syntax)
  setAttendanceFilterPeriod(period: string) {
    this.attendanceFilter.set({ ...this.attendanceFilter(), period });
    const emp = this.selectedEmployee.getValue();
    if (emp) this.loadAttendanceForDetail(emp.person_id);
  }
  setAttendanceFilterStartDate(startDate: string) {
    this.attendanceFilter.set({ ...this.attendanceFilter(), startDate });
  }
  setAttendanceFilterEndDate(endDate: string) {
    this.attendanceFilter.set({ ...this.attendanceFilter(), endDate });
  }
  setAttendanceFilterStartDateAndReload(startDate: string) {
    this.attendanceFilter.set({ ...this.attendanceFilter(), startDate });
    this.loadAllAttendance();
  }

  changeAttendanceDate(delta: number) {
    const current = moment(this.attendanceFilter().startDate || undefined);
    const next = current.add(delta, 'days');
    this.setAttendanceFilterStartDateAndReload(next.format('YYYY-MM-DD'));
  }

  goToToday() {
    this.setAttendanceFilterStartDateAndReload(moment().format('YYYY-MM-DD'));
  }

  // Bonus filter helpers (template cannot use spread syntax)
  setBonusFilterStatus(status: string) {
    this.bonusFilter.set({ ...this.bonusFilter(), status });
  }
  setBonusFilterType(type: string) {
    this.bonusFilter.set({ ...this.bonusFilter(), type });
  }

  clearFilters() {
    this.filters.set({
      search: '',
      status: 'all',
      role: 'all',
      department: ''
    });
    this.loadEmployees(1);
  }

  // Pagination helpers - Computed signal
  getPageList = computed(() => {
    const pages = [-2, -1, 0, 1, 2];
    return pages
      .map(p => p + this.currentPage())
      .filter(p => p > 0 && p <= this.totalPages());
  });

  // Employee selection
  selectEmployee(employee: Employee) {
    this.selectedEmployee.next(employee);
    this.selectedDetailTab.next(0);
    this.loadEmployeeDetail(employee.person_id);
    this.loadAttendanceForDetail(employee.person_id);
    this.loadVacationData(employee.person_id);
    this.loadBonusesData(employee.person_id);
  }

  //Load employee detail from API
  loadEmployeeDetail(employeeId: number) {
    this.http.get<Employee>(
      `${Config.API_URL}/v1/employees/${employeeId}`,
      { withCredentials: true }
    ).subscribe({
      next: (response) => {
        const current = this.selectedEmployee.getValue();
        if (current) {
          this.selectedEmployee.next({ ...current, ...response });
        }
      },
      error: (error) => {
        console.error('Failed to load employee detail:', error);
        this.alertManager.alert('error', 'employees.errors.load_detail_failed').closeable(true);
      }
    });
  }





  loadAllAttendance() {
    // Default to today if not set
    const filter = this.attendanceFilter();
    const startDate = filter.startDate || new Date().toISOString().split('T')[0];
    
    if (!filter.startDate) {
      this.attendanceFilter.set({ ...filter, startDate });
    }
    
    this.http.get<{ data: AttendanceRecord[] }>(
      `${Config.API_URL}/v1/employees/attendance`,
      { 
        withCredentials: true,
        params: { 
          dateFrom: startDate,
          dateTo: startDate
        }
      }
    ).subscribe({
      next: (response) => {
        this.allAttendanceRecords.set(response.data);
      },
      error: (error) => {
        console.error('Failed to load all attendance:', error);
        this.alertManager.alert('error', 'employees.attendance.load_all_failed').closeable(true);
      }
    });
  }

  // Modal handlers
  openAddEmployeeModal() {
    this.modalManager.openModal('add_employee');
  }

  closeAddEmployeeModal() {
    this.modalManager.closeModal('add_employee');
  }

  openEditEmployeeModal() {
    const employee = this.selectedEmployee.getValue();
    if (!employee) return;
    this.modalManager.openModal('edit_employee', {
      employee: employee,
      onSave: () => {
        const current = this.selectedEmployee.getValue();
        if (current) {
          this.loadEmployeeDetail(current.person_id);
        }
      }
    });
  }

  openVacationRequestModal() {
    this.modalManager.openModal('request_vacation', {
      balance: this.vacationBalance(),
      onSave: () => {
        this.loadVacationData(this.auth.getId());
        this.loadVacationRequests();
      }
    });
  }

  getStatusClass(status: any): string {
    switch (status) {
      case 'active': return 'status-active';
      case 'inactive': return 'status-inactive';
      case 'terminated': return 'status-terminated';
      default: return '';
    }
  }

  getStatusLabel(status: any): string {
    switch (status) {
      case 'active': return 'Aktivní';
      case 'inactive': return 'Neaktivní';
      case 'terminated': return 'Zrušeno';
      default: return '';
    }
  }

  getStatusText(status: any): string {
    switch (status) {
      case 'active': return 'Aktivní';
      case 'inactive': return 'Neaktivní';
      case 'terminated': return 'Ukončen';
      default: return status;
    }
  }

  getContractTypeLabel(type?: string): string {
    switch (type) {
      case 'fulltime': return 'Plný úvazek';
      case 'parttime': return 'Částečný úvazek';
      case 'dpp': return 'DPP';
      case 'dpc': return 'DPČ';
      default: return 'Neuvedeno';
    }
  }

  getVacationTypeLabel(type: string): string {
    switch (type) {
      case 'vacation': return 'Dovolená';
      case 'inability_to_work': return 'Pracovní neschopnost';
      case 'personal_obstacle': return 'Osobní překážka';
      case 'school_event': return 'Školní akce';
      case 'business_trip': return 'Pracovní cesta';
      case 'education': return 'Vzdělávání';
      case 'other': return 'Jiné';
      default: return type;
    }
  }

  public getAttendanceStatus(record: AttendanceRecord): 'active' | 'inactive' | 'unknown' {
    if (!record || !record.check_in) return 'unknown';

    const now = moment();
    const todayStr = now.format('YYYY-MM-DD');

    // Robust date matching (strip time/ISO parts)
    let recordDateStr = '';
    if (record.date) {
        if (typeof record.date === 'string') {
            recordDateStr = moment(record.date).format('YYYY-MM-DD');
        } else {
            const rd = moment(record.date);
            recordDateStr = rd.format('YYYY-MM-DD')
        }
    }

    // If it's not today, respect checkout for status (historic)
    if (recordDateStr !== todayStr) {
      return record.check_out ? 'inactive' : 'unknown';
    }

    const currentMinutes = now.hours() * 60 + now.minutes();
    const parse = (t: any) => {
      if (!t || typeof t !== 'string') return 0;
      const parts = t.split(':');
      return parseInt(parts[0]) * 60 + (parseInt(parts[1]) || 0);
    };

    const startMinutes = parse(record.check_in);

    // If no checkOut, it's definitely active if it's today and started
    if (!record.check_out) {
        return currentMinutes >= startMinutes ? 'active' : 'unknown';
    }

    const endMinutes = parse(record.check_out);
    // If current time is within record range, it's active
    if (currentMinutes >= startMinutes && currentMinutes <= endMinutes) {
        return 'active';
    }

    return 'inactive';
  }

  getVacationStatusClass(status: string): string {
    switch (status) {
      case 'approved': return 'status-approved';
      case 'rejected': return 'status-rejected';
      case 'pending': return 'status-pending';
      default: return '';
    }
  }

  getVacationStatusLabel(status: string): string {
    switch (status) {
      case 'approved': return 'Schváleno';
      case 'rejected': return 'Zamítnuto';
      case 'pending': return 'Čeká na schválení';
      default: return status;
    }
  }

  // Export payroll
  exportPayroll(format: 'csv' | 'xml' | 'json') {
    const month = new Date().toISOString().substring(0, 7);
    window.open(`${Config.API_URL}/v1/employees/salaries/export?format=${format}&month=${month}`, '_blank');
  }

  // Can manage check
  get canManage(): boolean {
    return this.perm.checkPermission(['manager:admin']);
  }

  closeDetail() {
    this.selectedEmployee.next(null);
    this.selectedDetailTab.next(0);
    const personId = this.auth.getId();
    if (personId) {
      this.loadVacationData(personId);
    }
  }

  loadEmployeeDetailData(personId: number) {
    this.loadAttendanceForDetail(personId);
    this.loadVacationData(personId);
    this.loadSalaryData(personId);
    this.loadBonusesData(personId);
  }

  // Attendance methods
  loadAttendanceForDetail(personId: number) {
    const filter = this.attendanceFilter();
    const params: any = { employeeId: personId };
    
    if (filter.period === 'week') {
      const now = new Date();
      const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
      params.startDate = weekStart.toISOString().split('T')[0];
    } else if (filter.period === 'month') {
      const now = new Date();
      params.startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    } else if (filter.period === 'custom') {
      params.startDate = filter.startDate;
      params.endDate = filter.endDate;
    }

    this.http.get<{ data: any[] }>(
      `${Config.API_URL}/v1/employees/attendance`,
      { params, withCredentials: true }
     ).subscribe({
       next: (response) => {
         this.attendanceRecords.set(response.data);
       },
      error: (error) => {
        console.error('Failed to load attendance:', error);
        this.alertManager.alert('error', 'employees.attendance.load_detail_failed').closeable(true);
      }
    });
  }



  editAttendanceRecord(record: any) {
    this.modalManager.openModal('edit_attendance', {
      record: { ...record }, // Copy to avoid direct mutation
      onSave: () => {
        // Refresh data
        const employee = this.selectedEmployee.getValue();
        if (employee) {
          this.loadAttendanceForDetail(employee.person_id);
        } else if (this.selectedViewTab.getValue() === 1) {
          this.loadAllAttendance();
        }
      }
    });
  }

  addAttendanceRecord() {
    const employee = this.selectedEmployee.getValue();
    if (!employee) return;
    
    this.modalManager.openModal('edit_attendance', {
      record: { 
        teacher_id: employee.person_id,
        date: new Date().toISOString().split('T')[0],
        check_in: '08:00',
        check_out: '16:00',
        break_minutes: 30,
        type: 'office',
        approved: true
      },
      onSave: () => {
        this.loadAttendanceForDetail(employee.person_id);
      }
    });
  }

  exportAttendanceCSV() {
    const headers = ['Datum', 'Příchod', 'Odchod', 'Pauza (min)', 'Odpracováno (h)', 'Typ'];
    const records = this.attendanceRecords();
    const employee = this.selectedEmployee.getValue();
    const rows = records.map(r => [
      Utils.formatDateShort(r.date),
      r.check_in || '',
      r.check_out || '',
      `${r.break_minutes || 0} minut`,
      `${r.worked_minutes ? (r.worked_minutes / 60).toFixed(2) : '0.00'} hod`,
      r.type || 'office'
    ]);

    let csv = headers.join(';') + '\n';
    rows.forEach(row => {
      csv += row.join(';') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${employee?.last_name || 'unknown'}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  // Vacation methods
  loadVacationData(personId: number) {
    this.http.get<any>(
      `${Config.API_URL}/v1/employees/vacations/balance?employeeId=${personId}&year=${this.currentYear}`,
      { withCredentials: true }
    ).subscribe({
       next: (response) => {
         const data = response.data?.balance || response.data || response.balance || response;
         this.vacationBalance.set({
          total: data.entitlement || data.total || 0,
          used: data.used || 0,
          remaining: data.remaining || 0
        });
      },
      error: (error) => {
        console.error('Failed to load vacation balance:', error);
        this.alertManager.alert('error', 'employees.vacations.load_balance_failed').closeable(true);
      }
    });
  }

  changeVacationEntitlement() {
    const employee = this.selectedEmployee.getValue();
    if (!employee) return;
    
    // Use modal instead of prompt for security
    this.modalManager.openModal('adjust_vacation', {
      employee: employee,
      entitlement: this.vacationBalance().total,
      onConfirm: (amount: number) => {
        this.http.post(
          `${Config.API_URL}/v1/employees/vacations/balance/adjust`,
          { 
            employeeId: employee.person_id,
            amount: amount,
            reason: 'Manual adjustment'
          },
          { withCredentials: true }
        ).subscribe({
          next: () => {
            this.loadVacationData(employee.person_id);
            this.alertManager.alert('success', 'employees.vacations.balance_adjusted').closeable(true);
          },
          error: (error) => {
            console.error('Failed to adjust balance:', error);
            this.alertManager.alert('error', 'employees.vacations.adjust_failed').closeable(true);
          }
        });
      }
    });
  }

  approveVacation(requestId: number) {
    // Use alert manager for confirmation - show warning alert
    const confirmAlert = this.alertManager.alert('warning', 'employees.vacations.confirm_approve');
    confirmAlert.closeable(true);
    
    // For now, directly approve - in future, implement proper confirmation modal
    this.http.put(
      `${Config.API_URL}/v1/employees/vacations/request/${requestId}/approve`,
      {},
      { withCredentials: true }
    ).subscribe({
      next: () => {
        confirmAlert.close();
        this.alertManager.alert('success', 'employees.vacations.approved').closeable(true);
        const employee = this.selectedEmployee.getValue();
        if (employee) {
          this.loadVacationData(employee.person_id);
          this.loadVacationRequests();
        }
      },
      error: (error) => {
        console.error('Failed to approve:', error);
        confirmAlert.close();
        this.alertManager.alert('error', 'employees.vacations.approve_failed').closeable(true);
      }
    });
  }

  rejectVacation(requestId: number) {
    // Use modal instead of prompt for security
    this.modalManager.openModal('reject_vacation', {
      requestId: requestId,
      onConfirm: (reason: string) => {
        this.http.put(
          `${Config.API_URL}/v1/employees/vacations/request/${requestId}/reject`,
          { reason },
          { withCredentials: true }
        ).subscribe({
          next: () => {
            this.alertManager.alert('success', 'employees.vacations.rejected').closeable(true);
            const employee = this.selectedEmployee.getValue();
            if (employee) {
              this.loadVacationData(employee.person_id);
              this.loadVacationRequests();
            }
          },
          error: (error) => {
            console.error('Failed to reject:', error);
            this.alertManager.alert('error', 'employees.vacations.reject_failed').closeable(true);
          }
        });
      }
    });
  }

  // Salary methods
  loadSalaryData(personId: number) {
    this.http.get<{ data: any[] }>(
      `${Config.API_URL}/v1/employees/salaries/history/${personId}`,
      { withCredentials: true }
    ).subscribe({
      next: (response) => {
        this.salaryHistory.set(response.data);
        const current = response.data.find(s => 
          !s.valid_to || new Date(s.valid_to) > new Date()
        ) || null;
        this.currentSalary.set(current);

      },
      error: (error) => {
        console.error('Failed to load salary:', error);
        this.alertManager.alert('error', 'employees.salaries.load_failed').closeable(true);
      }
    });
  }

  openSetSalaryModal() {
    const employee = this.selectedEmployee.getValue();
    this.modalManager.openModal('set_salary', {
      personId: employee?.person_id,
      onSave: () => {
        if (employee) this.loadSalaryData(employee.person_id);
      }
    });
  }


  exportPayrollXML() {
    this.alertManager.alert('info', 'employees.salaries.xml_export_not_implemented').closeable(true);
  }

  // Bonus methods
  loadBonusesData(personId: number) {
    this.http.get<{ data: any[] }>(
      `${Config.API_URL}/v1/employees/bonuses?employeeId=${personId}`,
      { withCredentials: true }
    ).subscribe({
      next: (response) => {
        this.bonuses.set(response.data);
        // Filtering and totals are now computed signals
      },
      error: (error) => {
        console.error('Failed to load bonuses:', error);
        this.alertManager.alert('error', 'employees.bonuses.load_failed').closeable(true);
      }
    });
  }

  openAddBonusModal() {
    this.modalManager.openModal('add_bonus');
  }

  markBonusAsPaid(bonusId: number) {
    // Use alert manager for confirmation - show warning alert
    const confirmAlert = this.alertManager.alert('warning', 'employees.bonuses.confirm_mark_paid');
    confirmAlert.closeable(true);
    
    // For now, directly mark as paid - in future, implement proper confirmation modal
    this.http.put(
      `${Config.API_URL}/v1/employees/bonuses/${bonusId}/paid`,
      {},
      { withCredentials: true }
    ).subscribe({
      next: () => {
        confirmAlert.close();
        this.alertManager.alert('success', 'employees.bonuses.marked_paid').closeable(true);
        const employee = this.selectedEmployee.getValue();
        if (employee) {
          this.loadBonusesData(employee.person_id);
        }
      },
      error: (error) => {
        console.error('Failed to mark as paid:', error);
        confirmAlert.close();
        this.alertManager.alert('error', 'employees.bonuses.mark_paid_failed').closeable(true);
      }
    });
  }

  deleteBonus(bonusId: number) {
    // Use alert manager for confirmation - show warning alert
    const confirmAlert = this.alertManager.alert('warning', 'employees.bonuses.confirm_delete');
    confirmAlert.closeable(true);
    
    // For now, directly delete - in future, implement proper confirmation modal
    this.http.delete(
      `${Config.API_URL}/v1/employees/bonuses/${bonusId}`,
      { withCredentials: true }
    ).subscribe({
      next: () => {
        confirmAlert.close();
        this.alertManager.alert('success', 'employees.bonuses.deleted').closeable(true);
        const employee = this.selectedEmployee.getValue();
        if (employee) {
          this.loadBonusesData(employee.person_id);
        }
      },
      error: (error) => {
        console.error('Failed to delete:', error);
        confirmAlert.close();
        this.alertManager.alert('error', 'employees.bonuses.delete_failed').closeable(true);
      }
    });
  }

  getBonusTypeLabel(type: string): string {
    const types: any = { performance: 'Výkon', project: 'Projekt', holiday: 'Svátky', other: 'Ostatní' };
    return types[type] || type;
  }
}
