import { Component, OnInit, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@Schoolingo/icons';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { Config } from '@Schoolingo/config';
import { Utils } from '@Schoolingo/utils';
import { DropdownManager } from '@Schoolingo/dropdown';
import { Locale } from '@Schoolingo/locale';
import { Permission } from '@Schoolingo/permission';
import { Authentication } from '@Schoolingo/authentication';
import { TabsComponent } from '@Components/Tabs';
import { ModalManager } from '@Schoolingo/modal';
import { BoardAlertManager } from '../../../infrastructure/alert/board.alert.manager';
import { BehaviorSubject } from 'rxjs';
import { AddEmployeeModalComponent } from './modals/add-employee-modal/add-employee-modal.component';
import { VacationRequestModalComponent } from './modals/vacation-request-modal/vacation-request-modal.component';
import { AddBonusModalComponent } from './modals/add-bonus-modal/add-bonus-modal.component';
import { SetSalaryModalComponent } from './modals/set-salary-modal/set-salary-modal.component';
import { EditAttendanceModalComponent } from './modals/edit-attendance-modal/edit-attendance-modal.component';
import { EditEmployeeModalComponent } from './modals/edit-employee-modal/edit-employee-modal.component';
import { EMPLOYEE_CONFIG } from '../../../infrastructure/employees/const';
import moment from 'moment';

export interface Employee {
  personId: number;
  firstName: string;
  lastName: string;
  fullName: string;
  role: string;
  employeeNumber?: string;
  department?: string;
  contractType?: string;
  status: Omit<EMPLOYEE_CONFIG.EMPLOYEE_STATUS, 'all'>;
  hoursPerWeek?: number;
  startDate?: string;
  endDate?: string;
  rank?: string;
  cabinet?: number;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
}

export interface VacationRequest {
  requestId: number;
  teacherId: number;
  firstName: string;
  lastName: string;
  startDate: string;
  endDate: string;
  days: number;
  type: string;
  status: string;
  reason?: string;
  createdAt: string;
}

export interface AttendanceRecord {
  attendanceId: number;
  teacherId: number;
  firstName: string;
  lastName: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  breakMinutes: number;
  workedMinutes: number;
  type: string;
  approved: boolean;
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
  imports: [CommonModule, IconsModule, FormsModule, TabsComponent],
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
  public modalManager = inject(ModalManager);
  private alertManager = inject(BoardAlertManager) as BoardAlertManager;
  EMPLOYEE_CONFIG = EMPLOYEE_CONFIG

  // Loading state - Signals
  isLoading = signal(false);
  loadError = signal<string | null>(null);

  // Selected employee for detail view - Signal
  selectedEmployee = signal<Employee | null>(null);
  
  // Main view tabs - Signals
  selectedViewTab = signal(0);
  // Wrapper for TabsComponent compatibility (it expects BehaviorSubject)
  selectedViewTabSubject = new BehaviorSubject<number>(0);
  viewTabOptions = ['employees.list', 'employees.attendance', 'employees.vacations', 'employees.salaries', 'employees.bonuses'];
  viewTabIcons = ['users', 'clock', 'beach', 'cash', 'gift'];
  
  // Detail tabs - Signals
  selectedDetailTab = signal(0);
  detailTabOptions = ['employees.overview', 'employees.attendance', 'employees.vacations', 'employees.salary', 'employees.bonuses'];
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
  attendanceStats = signal<{ totalHours: number; daysPresent: number; avgDaily: number }>({ totalHours: 0, daysPresent: 0, avgDaily: 0 });
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

    // Register add employee modal
    this.modalManager.addModal(
      'add_employee',
      {
        title: 'employees.add_employee.title',
        closeable: true,
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
        title: 'employees.request_vacation.title',
        closeable: true,
        width: 600,
        items: [{
          type: 'component',
          component: VacationRequestModalComponent
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
        title: 'employees.edit_attendance.title',
        closeable: true,
        width: 500,
        items: [{
          type: 'component',
          component: EditAttendanceModalComponent
        }]
      }
    );

    // Sync signal with BehaviorSubject for TabsComponent compatibility (bidirectional)
    effect(() => {
      const tab = this.selectedViewTab();
      if (this.selectedViewTabSubject.value !== tab) {
        this.selectedViewTabSubject.next(tab);
      }
    });

    // Subscribe to BehaviorSubject changes from TabsComponent and update signal
    this.selectedViewTabSubject.subscribe(tab => {
      if (this.selectedViewTab() !== tab) {
        this.selectedViewTab.set(tab);
      }
    });

    // Use effect() instead of subscriptions for reactive updates
    effect(() => {
      const tab = this.selectedViewTab();
      if (tab === 1) { // attendance tab
        this.loadAllAttendance();
      }
      if (tab === 2) { // vacations tab
        this.loadVacationRequests();
      }
    });

    effect(() => {
      const tab = this.selectedDetailTab();
      const employee = this.selectedEmployee();
      if (!employee) return;

      if (tab === 1) { // Attendance
        this.loadAttendanceForDetail(employee.personId);
      }
      if (tab === 2) { // Vacation
        this.loadVacationData(employee.personId);
        this.loadVacationRequests(employee.personId);
      }
      if (tab === 3) { // Salary
        this.loadSalaryData(employee.personId);
      }
      if (tab === 4) { // Bonuses
        this.loadBonusesData(employee.personId);
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

    this.http.get<{ data: Employee[], meta: { total: number } }>(
      `${Config.API_URL}/v1/employees`,
      { withCredentials: true, params }
    ).subscribe({
      next: (response) => {
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
          Number(r.teacherId) === personId && 
          moment(r.date).format('YYYY-MM-DD') == today.format('YYYY-MM-DD') &&
          this.getAttendanceStatus(r) == 'active'
        );

        if (myRecord) {
          this.isCheckedIn.set(true);
          this.checkInTime.set(myRecord.checkIn ? String(myRecord.checkIn).substring(0, 5) : null);
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
        this.alertManager.alert('success', 'employees.attendance.checkin_success').closeable(true);
      },
      error: (error) => {
        console.error('Check-in failed:', error);
        this.alertManager.alert('error', 'employees.attendance.checkin_failed').closeable(true);
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
        this.alertManager.alert('success', 'employees.attendance.checkout_success').closeable(true);
      },
      error: (error) => {
        console.error('Check-out failed:', error);
        this.alertManager.alert('error', 'employees.attendance.checkout_failed').closeable(true);
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
    const emp = this.selectedEmployee();
    if (emp) this.loadAttendanceRecords(emp.personId);
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
    this.selectedEmployee.set(employee);
    this.selectedDetailTab.set(0);
    this.loadEmployeeDetail(employee.personId);
    this.loadAttendanceRecords(employee.personId);
    this.loadVacationData(employee.personId);
    this.loadBonuses(employee.personId);
  }

  //Load employee detail from API
  loadEmployeeDetail(employeeId: number) {
    this.http.get<Employee>(
      `${Config.API_URL}/v1/employees/${employeeId}`,
      { withCredentials: true }
    ).subscribe({
      next: (response) => {
        const current = this.selectedEmployee();
        if (current) {
          this.selectedEmployee.set({ ...current, ...response });
        }
      },
      error: (error) => {
        console.error('Failed to load employee detail:', error);
        this.alertManager.alert('error', 'employees.errors.load_detail_failed').closeable(true);
      }
    });
  }

  // Load attendance records
  loadAttendanceRecords(employeeId?: number) {
    const today = new Date();
    const dateFrom = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const dateTo = today.toISOString().split('T')[0];

    let url = `${Config.API_URL}/v1/employees/attendance?dateFrom=${dateFrom}&dateTo=${dateTo}`;
    if (employeeId) {
      url += `&employeeId=${employeeId}`;
    }

    this.http.get<{ data: AttendanceRecord[] }>(
      url,
      { withCredentials: true }
    ).subscribe({
      next: (response) => {
        this.attendanceRecords.set(response.data);
      },
      error: (error) => {
        console.error('Failed to load attendance:', error);
        this.alertManager.alert('error', 'employees.attendance.load_failed').closeable(true);
      }
    });
  }

  // Load bonuses
  loadBonuses(employeeId?: number) {
    let url = `${Config.API_URL}/v1/employees/bonuses`;
    if (employeeId) {
      url += `?employeeId=${employeeId}`;
    }

    this.http.get<{ data: any[], unpaidTotal?: number }>(
      url,
      { withCredentials: true }
    ).subscribe({
      next: (response) => {
        // Store bonuses for display
        const current = this.selectedEmployee();
        if (current) {
          this.selectedEmployee.set({ ...current, bonuses: response.data } as any);
        }
      },
      error: (error) => {
        console.error('Failed to load bonuses:', error);
        this.alertManager.alert('error', 'employees.bonuses.load_failed').closeable(true);
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
    const employee = this.selectedEmployee();
    if (!employee) return;
    this.modalManager.openModal('edit_employee', {
      employee: employee,
      onSave: () => {
        const current = this.selectedEmployee();
        if (current) {
          this.loadEmployeeDetail(current.personId);
        }
      }
    });
  }

  openVacationRequestModal() {
    this.modalManager.openModal('request_vacation');
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
      case 'sick': return 'Nemocenská';
      case 'personal': return 'Osobní volno';
      case 'unpaid': return 'Neplacené volno';
      case 'study': return 'Studijní volno';
      case 'parental': return 'Rodičovská';
      default: return type;
    }
  }

  public getAttendanceStatus(record: AttendanceRecord): 'active' | 'inactive' | 'unknown' {
    if (!record || !record.checkIn) return 'unknown';

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
      return record.checkOut ? 'inactive' : 'unknown';
    }

    const currentMinutes = now.hours() * 60 + now.minutes();
    const parse = (t: any) => {
      if (!t || typeof t !== 'string') return 0;
      const parts = t.split(':');
      return parseInt(parts[0]) * 60 + (parseInt(parts[1]) || 0);
    };

    const startMinutes = parse(record.checkIn);

    // If no checkOut, it's definitely active if it's today and started
    if (!record.checkOut) {
        return currentMinutes >= startMinutes ? 'active' : 'unknown';
    }

    const endMinutes = parse(record.checkOut);
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
    this.selectedEmployee.set(null);
    this.selectedDetailTab.set(0);
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
        this.calculateAttendanceStats();
      },
      error: (error) => {
        console.error('Failed to load attendance:', error);
        this.alertManager.alert('error', 'employees.attendance.load_detail_failed').closeable(true);
      }
    });
  }

  calculateAttendanceStats() {
    const records = this.attendanceRecords();
    let totalMinutes = 0;
    let daysWithRecords = 0;

    records.forEach(record => {
      if (record.workedMinutes) {
        totalMinutes += record.workedMinutes;
        daysWithRecords++;
      }
    });

    this.attendanceStats.set({
      totalHours: Number((totalMinutes / 60).toFixed(1)),
      daysPresent: daysWithRecords,
      avgDaily: daysWithRecords > 0 ? Number((totalMinutes / 60 / daysWithRecords).toFixed(1)) : 0
    });
  }

  editAttendanceRecord(record: any) {
    this.modalManager.openModal('edit_attendance', {
      record: { ...record }, // Copy to avoid direct mutation
      onSave: () => {
        // Refresh data
        const employee = this.selectedEmployee();
        if (employee) {
          this.loadAttendanceForDetail(employee.personId);
        } else if (this.selectedViewTab() === 1) {
          this.loadAllAttendance();
        }
      }
    });
  }

  exportAttendanceCSV() {
    const headers = ['Datum', 'Příchod', 'Odchod', 'Pauza (min)', 'Odpracováno (h)', 'Typ'];
    const records = this.attendanceRecords();
    const employee = this.selectedEmployee();
    const rows = records.map(r => [
      Utils.formatDateShort(r.date),
      r.checkIn || '',
      r.checkOut || '',
      `${r.breakMinutes || 0} minut`,
      `${r.workedMinutes ? (r.workedMinutes / 60).toFixed(2) : '0.00'} hod`,
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
    a.download = `attendance_${employee?.lastName || 'unknown'}_${new Date().toISOString().split('T')[0]}.csv`;
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
        // Direct object response or wrapped
        this.vacationBalance.set(response.balance || response);
      },
      error: (error) => {
        console.error('Failed to load vacation balance:', error);
        this.alertManager.alert('error', 'employees.vacations.load_balance_failed').closeable(true);
      }
    });
  }

  changeVacationEntitlement() {
    const employee = this.selectedEmployee();
    if (!employee) return;
    
    // Use modal instead of prompt for security
    this.modalManager.openModal('adjust_vacation', {
      employee: employee,
      onConfirm: (amount: number) => {
        this.http.post(
          `${Config.API_URL}/v1/employees/vacations/balance/adjust`,
          { 
            employeeId: employee.personId,
            amount: amount,
            reason: 'Manual adjustment'
          },
          { withCredentials: true }
        ).subscribe({
          next: () => {
            this.loadVacationData(employee.personId);
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
        const employee = this.selectedEmployee();
        if (employee) {
          this.loadVacationData(employee.personId);
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
            const employee = this.selectedEmployee();
            if (employee) {
              this.loadVacationData(employee.personId);
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
          !s.validTo || new Date(s.validTo) > new Date()
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
    this.modalManager.openModal('set_salary');
  }

  exportPayrollXML() {
    this.alertManager.alert('info', 'employees.salaries.xml_export_not_implemented').closeable(true);
  }

  // Bonus methods
  loadBonusesData(personId: number) {
    this.http.get<{ data: any[] }>(
      `${Config.API_URL}/v1/employees/bonuses?personId=${personId}`,
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
        const employee = this.selectedEmployee();
        if (employee) {
          this.loadBonusesData(employee.personId);
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
        const employee = this.selectedEmployee();
        if (employee) {
          this.loadBonusesData(employee.personId);
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
