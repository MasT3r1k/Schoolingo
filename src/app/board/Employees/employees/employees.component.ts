import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@Schoolingo/icons';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Config } from '@Schoolingo/config';
import { Utils } from '@Schoolingo/utils';
import { DropdownManager } from '@Schoolingo/dropdown';
import { Locale } from '@Schoolingo/locale';
import { Permission } from '@Schoolingo/permission';
import { TabsComponent } from '@Components/Tabs';
import { BehaviorSubject, Subscription } from 'rxjs';
import { ModalManager } from '@Schoolingo/modal';
import { AddEmployeeModalComponent } from './modals/add-employee-modal/add-employee-modal.component';
import { VacationRequestModalComponent } from './modals/vacation-request-modal/vacation-request-modal.component';
import { AddBonusModalComponent } from './modals/add-bonus-modal/add-bonus-modal.component';
import { SetSalaryModalComponent } from './modals/set-salary-modal/set-salary-modal.component';
import { EditAttendanceModalComponent } from './modals/edit-attendance-modal/edit-attendance-modal.component';
import { EMPLOYEE_CONFIG } from '../../../infrastructure/employees/const';

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
export class EmployeesComponent implements OnInit, OnDestroy {
  private http = inject(HttpClient);
  public Utils = Utils;
  public dropdownManager = inject(DropdownManager);
  public l = inject(Locale);
  public perm = inject(Permission);
  private subscriptions: Subscription[] = [];
  public modalManager = inject(ModalManager);
  EMPLOYEE_CONFIG = EMPLOYEE_CONFIG


  // Loading state
  isLoading = false;
  loadError: string | null = null;

  // Selected employee for detail view
  selectedEmployee: Employee | null = null;
  
  // Main view tabs
  selectedViewTab = new BehaviorSubject<number>(0);
  viewTabOptions = ['employees.list', 'employees.attendance', 'employees.vacations', 'employees.salaries', 'employees.bonuses'];
  viewTabIcons = ['users', 'clock', 'beach', 'cash', 'gift'];
  
  // Detail tabs
  selectedDetailTab = new BehaviorSubject<number>(0);
  detailTabOptions = ['employees.overview', 'employees.attendance', 'employees.vacations', 'employees.salary', 'employees.bonuses'];
  detailTabIcons = ['layout-dashboard', 'clock', 'beach', 'cash', 'gift'];

  // Filters
  filters: EmployeeFilters = {
    search: '',
    status: 'all',
    role: 'all',
    department: ''
  };

  // Pagination
  currentPage = 1;
  pageSize = 20;
  totalItems = 0;
  totalPages = 0;

  // Data
  employees: Employee[] = [];
  vacationRequests: VacationRequest[] = [];
  attendanceRecords: AttendanceRecord[] = [];
  allAttendanceRecords: AttendanceRecord[] = [];

  // Check-in/out state
  isCheckedIn = false;
  checkInTime: string | null = null;

  // Detail view data
  attendanceStats: any = { totalHours: 0, daysPresent: 0, avgDaily: 0 };
  attendanceFilter: any = { period: 'month', startDate: '', endDate: '' };
  
  salaryHistory: any[] = [];
  currentSalary: any = null;
  
  bonuses: any[] = [];
  filteredBonuses: any[] = [];
  bonusesTotal = 0;
  bonusesUnpaid = 0;
  bonusFilter: any = { status: 'all', type: 'all' };
  
  vacationBalance: any = { total: 0, used: 0, remaining: 0 };
  currentYear = new Date().getFullYear();

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
  }
  
  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  // Load employees from API
  loadEmployees(page = this.currentPage) {
    this.currentPage = page;
    this.isLoading = true;
    this.loadError = null;

    let params: any = {
      limit: this.pageSize,
      offset: (page - 1) * this.pageSize,
      search: this.filters.search,
      status: this.filters.status,
    };

    if (this.filters.role !== 'all') params.role = this.filters.role;
    if (this.filters.department) params.department = this.filters.department;

    this.http.get<{ data: Employee[], meta: { total: number } }>(
      `${Config.API_URL}/v1/employees`,
      { withCredentials: true, params }
    ).subscribe({
      next: (response) => {
        this.employees = response.data;
        this.totalItems = response.meta.total;
        this.totalPages = Math.ceil(this.totalItems / this.pageSize);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading employees:', error);
        this.loadError = 'Nepodařilo se načíst seznam zaměstnanců';
        this.isLoading = false;
      }
    });
  }

  // Check current attendance status
  checkAttendanceStatus() {
    const today = new Date().toISOString().split('T')[0];
    this.http.get<{ data: AttendanceRecord[] }>(
      `${Config.API_URL}/v1/employees/attendance`,
      { 
        withCredentials: true, 
        params: { dateFrom: today, dateTo: today } 
      }
    ).subscribe({
      next: (response) => {
        const todayRecord = response.data.find(r => !r.checkOut);
        if (todayRecord) {
          this.isCheckedIn = true;
          this.checkInTime = todayRecord.checkIn || null;
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
        this.isCheckedIn = true;
        this.checkInTime = response.time;
      },
      error: (error) => {
        console.error('Check-in failed:', error);
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
        this.isCheckedIn = false;
        this.checkInTime = null;
      },
      error: (error) => {
        console.error('Check-out failed:', error);
      }
    });
  }

  // Load vacation requests
  loadVacationRequests() {
    this.http.get<{ data: VacationRequest[] }>(
      `${Config.API_URL}/v1/employees/vacations/requests`,
      { withCredentials: true }
    ).subscribe({
      next: (response) => {
        this.vacationRequests = response.data;
      }
    });
  }

  // Filter changes
  onFilterChange() {
    this.loadEmployees(1);
  }

  clearFilters() {
    this.filters = {
      search: '',
      status: 'all',
      role: 'all',
      department: ''
    };
    this.loadEmployees(1);
  }

  // Pagination helpers
  getPageList(): number[] {
    let pages = [-2, -1, 0, 1, 2];
    return pages
      .map(p => p + this.currentPage)
      .filter(p => p > 0 && p <= this.totalPages);
  }

  // Employee selection
  selectEmployee(employee: Employee) {
    this.selectedEmployee = employee;
    this.selectedDetailTab.next(0);
    this.loadEmployeeDetail(employee.personId);
    this.loadAttendanceRecords(employee.personId);
    this.loadBonuses(employee.personId);
  }

  //Load employee detail from API
  loadEmployeeDetail(employeeId: number) {
    this.http.get<Employee>(
      `${Config.API_URL}/v1/employees/${employeeId}`,
      { withCredentials: true }
    ).subscribe({
      next: (response) => {
        if (this.selectedEmployee) {
          this.selectedEmployee = { ...this.selectedEmployee, ...response };
        }
      },
      error: (error) => {
        console.error('Failed to load employee detail:', error);
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
        this.attendanceRecords = response.data;
      },
      error: (error) => {
        console.error('Failed to load attendance:', error);
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
        if (this.selectedEmployee) {
          (this.selectedEmployee as any).bonuses = response.data;
        }
      },
      error: (error) => {
        console.error('Failed to load bonuses:', error);
      }
    });
  }

  loadAllAttendance() {
    // Default to today if not set
    if (!this.attendanceFilter.startDate) {
      this.attendanceFilter.startDate = new Date().toISOString().split('T')[0];
    }
    
    this.http.get<{ data: AttendanceRecord[] }>(
      `${Config.API_URL}/v1/employees/attendance`,
      { 
        withCredentials: true,
        params: { 
          dateFrom: this.attendanceFilter.startDate,
          dateTo: this.attendanceFilter.startDate
        }
      }
    ).subscribe({
      next: (response) => {
        this.allAttendanceRecords = response.data;
      },
      error: (error) => {
        console.error('Failed to load all attendance:', error);
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

  // ==================== Detail View Methods ====================
  
  // selectEmployee(employee: Employee) {
  //   this.selectedEmployee = employee;
  //   this.selectedDetailTab.next(0);
  //   this.loadEmployeeDetailData(employee.personId);
  // }

  closeDetail() {
    this.selectedEmployee = null;
    this.selectedDetailTab.next(0);
  }

  loadEmployeeDetailData(personId: number) {
    this.loadAttendanceForDetail(personId);
    this.loadVacationData(personId);
    this.loadSalaryData(personId);
    this.loadBonusesData(personId);
  }

  // Attendance methods
  loadAttendanceForDetail(personId: number) {
    const params: any = { employeeId: personId };
    
    if (this.attendanceFilter.period === 'week') {
      const now = new Date();
      const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
      params.startDate = weekStart.toISOString().split('T')[0];
    } else if (this.attendanceFilter.period === 'month') {
      const now = new Date();
      params.startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    } else if (this.attendanceFilter.period === 'custom') {
      params.startDate = this.attendanceFilter.startDate;
      params.endDate = this.attendanceFilter.endDate;
    }

    this.http.get<{ data: any[] }>(
      `${Config.API_URL}/v1/employees/attendance`,
      { params, withCredentials: true }
    ).subscribe({
      next: (response) => {
        this.attendanceRecords = response.data;
        this.calculateAttendanceStats();
      },
      error: (error) => console.error('Failed to load attendance:', error)
    });
  }

  calculateAttendanceStats() {
    let totalMinutes = 0;
    let daysWithRecords = 0;

    this.attendanceRecords.forEach(record => {
      if (record.workedMinutes) {
        totalMinutes += record.workedMinutes;
        daysWithRecords++;
      }
    });

    this.attendanceStats = {
      totalHours: (totalMinutes / 60).toFixed(1),
      daysPresent: daysWithRecords,
      avgDaily: daysWithRecords > 0 ? (totalMinutes / 60 / daysWithRecords).toFixed(1) : 0
    };
  }

  editAttendanceRecord(record: any) {
    this.modalManager.openModal('edit_attendance', {
      record: { ...record }, // Copy to avoid direct mutation
      onSave: () => {
        // Refresh data
        if (this.selectedEmployee) {
          this.loadAttendanceForDetail(this.selectedEmployee.personId);
        } else if (this.selectedViewTab.getValue() === 1) {
          this.loadAllAttendance();
        }
      }
    });
  }

  exportAttendanceCSV() {
    const headers = ['Datum', 'Příchod', 'Odchod', 'Pauza (min)', 'Odpracováno (h)', 'Typ'];
    const rows = this.attendanceRecords.map(r => [
      r.date,
      r.checkIn || '',
      r.checkOut || '',
      // r.breakMinutes || 0,
      r.workedMinutes ? (r.workedMinutes / 60).toFixed(2) : '',
      r.type || 'office'
    ]);

    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
      csv += row.join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${this.selectedEmployee?.lastName}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  }

  // Vacation methods
  loadVacationData(personId: number) {
    this.http.get<{ balance: any }>(
      `${Config.API_URL}/v1/employees/vacations/balance?employeeId=${personId}&year=${this.currentYear}`,
      { withCredentials: true }
    ).subscribe({
      next: (response) => {
        this.vacationBalance = response.balance;
      },
      error: (error) => console.error('Failed to load vacation balance:', error)
    });
  }

  approveVacation(requestId: number) {
    if (!confirm('Schválit tuto žádost o dovolenou?')) return;

    this.http.put(
      `${Config.API_URL}/v1/employees/vacations/request/${requestId}/approve`,
      {},
      { withCredentials: true }
    ).subscribe({
      next: () => {
        alert('žádost byla schválena');
        if (this.selectedEmployee) {
          this.loadVacationData(this.selectedEmployee.personId);
          this.loadVacationRequests();
        }
      },
      error: (error) => {
        console.error('Failed to approve:', error);
        alert('Nepodařilo se schválit žádost');
      }
    });
  }

  rejectVacation(requestId: number) {
    const reason = prompt('Zadejte důvod zamítnutí:');
    if (!reason) return;

    this.http.put(
      `${Config.API_URL}/v1/employees/vacations/request/${requestId}/reject`,
      { reason },
      { withCredentials: true }
    ).subscribe({
      next: () => {
        alert('��dost byla zam�tnuta');
        if (this.selectedEmployee) {
          this.loadVacationData(this.selectedEmployee.personId);
          this.loadVacationRequests();
        }
      },
      error: (error) => {
        console.error('Failed to reject:', error);
        alert('Nepodařilo se zamítnout žádost');
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
        this.salaryHistory = response.data;
        this.currentSalary = this.salaryHistory.find(s => 
          !s.validTo || new Date(s.validTo) > new Date()
        ) || null;
      },
      error: (error) => console.error('Failed to load salary:', error)
    });
  }

  openSetSalaryModal() {
    this.modalManager.openModal('set_salary');
  }

  exportPayrollXML() {
    alert('XML export - zatím neimplementováno');
  }

  // Bonus methods
  loadBonusesData(personId: number) {
    this.http.get<{ data: any[] }>(
      `${Config.API_URL}/v1/employees/bonuses?personId=${personId}`,
      { withCredentials: true }
    ).subscribe({
      next: (response) => {
        this.bonuses = response.data;
        this.filterBonuses();
        this.calculateBonusTotals();
      },
      error: (error) => console.error('Failed to load bonuses:', error)
    });
  }

  filterBonuses() {
    this.filteredBonuses = this.bonuses.filter(bonus => {
      if (this.bonusFilter.status !== 'all') {
        const isPaid = bonus.paid;
        if (this.bonusFilter.status === 'paid' && !isPaid) return false;
        if (this.bonusFilter.status === 'unpaid' && isPaid) return false;
      }
      if (this.bonusFilter.type !== 'all' && bonus.type !== this.bonusFilter.type) {
        return false;
      }
      return true;
    });
  }

  calculateBonusTotals() {
    this.bonusesTotal = this.bonuses.reduce((sum, b) => sum + (b.amount || 0), 0);
    this.bonusesUnpaid = this.bonuses.filter(b => !b.paid).reduce((sum, b) => sum + (b.amount || 0), 0);
  }

  openAddBonusModal() {
    this.modalManager.openModal('add_bonus');
  }

  markBonusAsPaid(bonusId: number) {
    if (!confirm('Označit prémii jako vyplacenou?')) return;

    this.http.put(
      `${Config.API_URL}/v1/employees/bonuses/${bonusId}/paid`,
      {},
      { withCredentials: true }
    ).subscribe({
      next: () => {
        alert('Prémie označena jako vyplacená');
        if (this.selectedEmployee) {
          this.loadBonusesData(this.selectedEmployee.personId);
        }
      },
      error: (error) => {
        console.error('Failed to mark as paid:', error);
        alert('Nepodařilo se označit jako vyplacenou');
      }
    });
  }

  deleteBonus(bonusId: number) {
    if (!confirm('Opravdu smazat tuto prémii?')) return;

    this.http.delete(
      `${Config.API_URL}/v1/employees/bonuses/${bonusId}`,
      { withCredentials: true }
    ).subscribe({
      next: () => {
        alert('Prémie byla smazána');
        if (this.selectedEmployee) {
          this.loadBonusesData(this.selectedEmployee.personId);
        }
      },
      error: (error) => {
        console.error('Failed to delete:', error);
        alert('Nepodařilo se smazat prémii');
      }
    });
  }

  getBonusTypeLabel(type: string): string {
    const types: any = { performance: 'Výkon', project: 'Projekt', holiday: 'Svátky', other: 'Ostatní' };
    return types[type] || type;
  }
}
