import { Component, OnInit, inject, signal, computed, effect, ViewChild, ElementRef, AfterViewInit, HostListener } from '@angular/core';
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
import { ModalManager } from '@Schoolingo/modal';
import { BoardAlertManager } from '../../../../infrastructure/alert/board.alert.manager';
import { SharedTimetableComponent } from '../../../../Components/timetable/timetable.component';
import { Timetable } from '../../../../infrastructure/timetable/timetable';
import { BehaviorSubject, Subscription, distinctUntilChanged } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { AvatarService } from '../../../../infrastructure/utils/avatar.service';
import { EMPLOYEE_CONFIG } from '../../../../infrastructure/employees/const';
import { AttendanceRecord, Employee, VacationRequest } from '../employees.component';
import { EditEmployeeModalComponent } from '../modals/edit-employee-modal/edit-employee-modal.component';
import { EditAttendanceModalComponent } from '../modals/edit-attendance-modal/edit-attendance-modal.component';
import { AdjustVacationModalComponent } from '../modals/adjust-vacation-modal/adjust-vacation-modal.component';
import { RejectVacationModalComponent } from '../modals/reject-vacation-modal/reject-vacation-modal.component';
import { SetSalaryModalComponent } from '../modals/set-salary-modal/set-salary-modal.component';
import { AddBonusModalComponent } from '../modals/add-bonus-modal/add-bonus-modal.component';
import { TimetableHours } from '../../../Teach/timetable/timetable.component';
import moment from 'moment';

@Component({
  selector: 'app-employees-detail',
  standalone: true,
  imports: [CommonModule, IconsModule, FormsModule, TabsComponent, SharedTimetableComponent],
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.css'
})
export class DetailComponent implements OnInit, AfterViewInit {
  @ViewChild('tabsNav') tabsNav!: ElementRef;
  showLeftScroll = signal(false);
  showRightScroll = signal(false);
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  public Utils = Utils;
  public dropdownManager = inject(DropdownManager);
  public l = inject(Locale);
  public perm = inject(Permission);
  private auth = inject(Authentication);
  public modalManager = inject(ModalManager);
  private alertManager = inject(BoardAlertManager) as BoardAlertManager;
  public avatarService = inject(AvatarService);
  public timetableService = inject(Timetable);
  
  public canManage: boolean = false;
  public canViewAllEmployees: boolean = true;
  EMPLOYEE_CONFIG = EMPLOYEE_CONFIG;

  // Selected employee for detail view - Signal
  selectedEmployee = signal<Employee | null>(null);
  isLoading = signal(true);
  loadError = signal<string | null>(null);

  // Detail tabs
  selectedDetailTab = new BehaviorSubject<number>(0);
  detailTabOptions = [
    'employees.overview', 
    'employees.attendance', 
    'employees.vacations.title', 
    'employees.salary', 
    'employees.bonuses', 
    'employees.subjects',
    'employees.professional',
    'employees.agenda',
    'employees.documents',
    'employees.evaluation',
    'employees.equipment',
    'employees.history',
    'employees.timetable'
  ];
  detailTabIcons = [
    'layout-dashboard', 
    'clock', 
    'beach', 
    'cash', 
    'gift', 
    'notebook',
    'certificate',
    'clipboard-list',
    'folder',
    'heart-rate-monitor',
    'device-tablet',
    'history',
    'calendar-time'
  ];

  // Data
  attendanceRecords = signal<AttendanceRecord[]>([]);
  vacationRequests = signal<VacationRequest[]>([]);
  salaryHistory = signal<any[]>([]);
  currentSalary = signal<any>(null);
  bonuses = signal<any[]>([]);
  
  attendanceFilter = signal<{ period: string; startDate: string; endDate: string }>({ period: 'month', startDate: '', endDate: '' });
  bonusFilter = signal<{ status: string; type: string }>({ status: 'all', type: 'all' });
  vacationBalance = signal<{ total: number; used: number; remaining: number }>({ total: 0, used: 0, remaining: 0 });
  currentYear = new Date().getFullYear();

  // Expanded Data Sections - Signals
  taughtSubjects = signal<any[]>([]);
  taughtGroups = signal<any[]>([]);
  supervisionSchedule = signal<any[]>([]);
  educationDVPP = signal<any[]>([]);
  agendaBOZP = signal<any[]>([]);
  documents = signal<any[]>([]);
  observations = signal<any[]>([]);
  evaluations = signal<any[]>([]);
  equipment = signal<any[]>([]);
  changeHistory = signal<any[]>([]);
  isClassTeacherOf = signal<string | null>(null);
  specialFunctions = signal<string[]>([]);

  // Timetable
  public isLoadingTimetable = false;
  public fullTimetable: any[] = [];
  public fullTimetableHours: TimetableHours[] = [];
  public timetableSelectedWeek = new BehaviorSubject<moment.Moment | null>(moment());
  public timetableSelectedTab = new BehaviorSubject<number>(0); // 0 = actual, 1 = permanent

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

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.loadEmployeeDetail(id);
      }
    });

    this.selectedDetailTab.subscribe(tab => {
        const employeeId = this.selectedEmployee()?.person_id;
        if (!employeeId) return;

        if (tab === 1) this.loadAttendanceForDetail(employeeId);
        if (tab === 2) {
             this.loadVacationData(employeeId);
             this.loadVacationRequests(employeeId);
        }
        if (tab === 3) this.loadSalaryData(employeeId);
        if (tab === 4) this.loadBonusesData(employeeId);
        if (tab === 5 || tab === 12) {
          if (tab === 12) {
            this.timetableSelectedTab.next(0);
            this.timetableSelectedWeek.next(moment());
          }
          this.refreshTimetable();
        }
    });

    this.timetableSelectedWeek
      .pipe(distinctUntilChanged())
      .subscribe(() => {
        this.refreshTimetable();
      });

    this.registerModals();
    this.checkPermissions();
  }

  ngAfterViewInit() {
    setTimeout(() => this.checkScroll(), 500);
  }

  @HostListener('window:resize')
  onResize() {
    this.checkScroll();
  }

  checkScroll() {
    if (!this.tabsNav) return;
    const el = this.tabsNav.nativeElement;
    this.showLeftScroll.set(el.scrollLeft > 5);
    this.showRightScroll.set(el.scrollLeft < (el.scrollWidth - el.clientWidth - 5));
  }

  scrollTabs(direction: number) {
    if (!this.tabsNav) return;
    const el = this.tabsNav.nativeElement;
    el.scrollBy({ left: direction * 200, behavior: 'smooth' });
    setTimeout(() => this.checkScroll(), 300);
  }

  // Computed for overview
  recentAttendance = computed(() => this.attendanceRecords().slice(0, 5));
  recentBonuses = computed(() => this.bonuses().slice(0, 5));

  registerModals() {
    this.modalManager.addModal('edit_employee', {
      icon: 'user-edit',
      title: 'employees.edit_employee.title',
      closeable: true,
      width: 600,
      items: [{
        type: 'component',
        component: EditEmployeeModalComponent
      }]
    });

    this.modalManager.addModal('edit_attendance', {
      icon: 'clock-edit',
      title: 'employees.edit_attendance.title',
      description: 'employees.edit_attendance.description',
      closeable: true,
      width: 500,
      items: [{
        type: 'component',
        component: EditAttendanceModalComponent
      }]
    });

    this.modalManager.addModal('adjust_vacation', {
      icon: 'beach',
      title: 'Upravit nárok na dovolenou',
      closeable: true,
      width: 450,
      items: [{
        type: 'component',
        component: AdjustVacationModalComponent
      }]
    });

    this.modalManager.addModal('reject_vacation', {
      title: 'employees.reject_vacation.title',
      closeable: true,
      width: 500,
      items: [{
        type: 'component',
        component: RejectVacationModalComponent
      }]
    });

    this.modalManager.addModal('set_salary', {
      icon: 'wallet',
      title: 'Nastavit plat',
      closeable: true,
      width: 600,
      items: [{
        type: 'component',
        component: SetSalaryModalComponent
      }]
    });

    this.modalManager.addModal('add_bonus', {
      title: 'Přidat prémii',
      closeable: true,
      width: 500,
      items: [{
        type: 'component',
        component: AddBonusModalComponent
      }]
    });
  }

  async checkPermissions() {
    this.canManage = await this.perm.checkPermission(['manager:admin']);
  }

  loadEmployeeDetail(id: number) {
    this.isLoading.set(true);
    this.http.get<Employee>(
      `${Config.API_URL}/v1/employees/${id}`,
      { withCredentials: true }
    ).subscribe({
      next: (response) => {
        this.selectedEmployee.set(response);
        this.isLoading.set(false);
        
        // Load some data for overview automatically
        this.loadAttendanceForDetail(response.person_id);
        this.loadBonusesData(response.person_id);
        this.loadVacationData(response.person_id);
        this.loadSalaryData(response.person_id);
        
        // Load expanded data
        this.loadExpandedData(response.person_id);

        // Trigger data load for current tab
        const currentTab = this.selectedDetailTab.getValue();
        if (currentTab !== 0) {
            this.selectedDetailTab.next(currentTab);
        }
      },
      error: (error) => {
        console.error('Failed to load employee detail:', error);
        this.loadError.set('employees.errors.load_detail_failed');
        this.alertManager.alert('error', 'employees.errors.load_detail_failed').closeable(true);
        this.isLoading.set(false);
      }
    });
  }

  loadAttendanceForDetail(employeeId: number) {
    const filter = this.attendanceFilter();
    let req_params: any = {};
    if (filter.period !== 'custom') {
      req_params.period = filter.period;
    } else {
      req_params.dateFrom = filter.startDate;
      req_params.dateTo = filter.endDate;
    }

    this.http.get<{ data: AttendanceRecord[] }>(
      `${Config.API_URL}/v1/employees/${employeeId}/attendance`,
      { withCredentials: true, params: req_params }
    ).subscribe({
      next: (response) => {
        this.attendanceRecords.set(response.data);
      }
    });
  }

  loadVacationData(employeeId: number) {
    this.http.get<any>(
      `${Config.API_URL}/v1/employees/${employeeId}/vacations/balance`,
      { withCredentials: true, params: { year: this.currentYear } }
    ).subscribe({
      next: (response) => {
        const data = response.data?.balance || response.data || response.balance || response;
        this.vacationBalance.set({
          total: data.entitlement || data.total || 0,
          used: data.used || 0,
          remaining: data.remaining || 0
        });
      }
    });
  }

  loadVacationRequests(employeeId: number) {
    let url = `${Config.API_URL}/v1/employees/${employeeId}/vacations/requests`;

    this.http.get<{ data: VacationRequest[] }>(
      url,
      { withCredentials: true }
    ).subscribe({
      next: (response) => {
        this.vacationRequests.set(response.data);
      }
    });
  }

  loadSalaryData(employeeId: number) {
    this.http.get<{ history: any[], current: any }>(
      `${Config.API_URL}/v1/employees/${employeeId}/salaries`,
      { withCredentials: true }
    ).subscribe({
      next: (response) => {
        this.salaryHistory.set(response.history || []);
        this.currentSalary.set(response.current || null);
      }
    });
  }

  loadBonusesData(employeeId: number) {
    this.http.get<{ data: any[] }>(
      `${Config.API_URL}/v1/employees/${employeeId}/bonuses`,
      { withCredentials: true }
    ).subscribe({
      next: (response) => {
        this.bonuses.set(response.data);
      }
    });
  }

  closeDetail() {
    this.router.navigate(['/employees']);
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
  
  getVacationStatusClass(status: string): string {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'approved': return 'status-approved';
      case 'rejected': return 'status-rejected';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  }

  getVacationStatusLabel(status: string): string {
    switch (status) {
      case 'pending': return 'Čeká na schválení';
      case 'approved': return 'Schváleno';
      case 'rejected': return 'Zamítnuto';
      case 'cancelled': return 'Zrušeno';
      default: return status;
    }
  }

  getFilterLabel(type: 'attendancePeriod' | 'bonusStatus' | 'bonusType', value: any): string {
    const options = this.getFilterOptions(type);
    return options.find(o => o.value === value)?.label || value;
  }

  getFilterOptions(type: 'attendancePeriod' | 'bonusStatus' | 'bonusType'): {value: string, label: string}[] {
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

  setAttendanceFilterPeriod(period: string) {
    this.attendanceFilter.set({ ...this.attendanceFilter(), period });
    const emp = this.selectedEmployee();
    if (emp) this.loadAttendanceForDetail(emp.person_id);
  }

  setAttendanceFilterStartDate(startDate: string) {
    this.attendanceFilter.set({ ...this.attendanceFilter(), startDate });
    const emp = this.selectedEmployee();
    if (emp && this.attendanceFilter().period === 'custom') this.loadAttendanceForDetail(emp.person_id);
  }

  setAttendanceFilterEndDate(endDate: string) {
    this.attendanceFilter.set({ ...this.attendanceFilter(), endDate });
    const emp = this.selectedEmployee();
    if (emp && this.attendanceFilter().period === 'custom') this.loadAttendanceForDetail(emp.person_id);
  }

  setBonusFilterStatus(status: string) {
    this.bonusFilter.set({ ...this.bonusFilter(), status });
  }

  setBonusFilterType(type: string) {
    this.bonusFilter.set({ ...this.bonusFilter(), type });
  }

  getBonusTypeLabel(type: string): string {
    switch (type) {
      case 'performance': return 'Výkonnostní';
      case 'project': return 'Projektová';
      case 'holiday': return 'Sváteční';
      default: return 'Ostatní';
    }
  }

  openEditEmployeeModal() {
    const employee = this.selectedEmployee();
    if (!employee) return;
    this.modalManager.openModal('edit_employee', {
      employee,
      onSave: () => this.loadEmployeeDetail(employee.person_id)
    });
  }

  addAttendanceRecord() {
    const employee = this.selectedEmployee();
    if (!employee) return;
    this.modalManager.openModal('edit_attendance', {
      record: { teacher_id: employee.person_id, date: new Date().toISOString().split('T')[0] },
      onSave: () => this.loadAttendanceForDetail(employee.person_id)
    });
  }

  editAttendanceRecord(record: any) {
    const employee = this.selectedEmployee();
    if (!employee) return;
    this.modalManager.openModal('edit_attendance', {
      record: { ...record },
      onSave: () => this.loadAttendanceForDetail(employee.person_id)
    });
  }

  exportAttendanceCSV() {
    const employee = this.selectedEmployee();
    if (!employee) return;
    const filter = this.attendanceFilter();
    let url = `${Config.API_URL}/v1/employees/${employee.person_id}/attendance/export?format=csv`;
    if (filter.period !== 'custom') {
        url += `&period=${filter.period}`;
    } else {
        url += `&dateFrom=${filter.startDate}&dateTo=${filter.endDate}`;
    }
    window.open(url, '_blank');
  }

  exportSalaryStatement(format: 'pdf' | 'xml') {
    const employee = this.selectedEmployee();
    if (!employee) return;
    const month = new Date().toISOString().substring(0, 7);
    window.open(`${Config.API_URL}/v1/employees/${employee.person_id}/salaries/export?format=${format}&month=${month}`, '_blank');
  }

  changeVacationEntitlement() {
    const employee = this.selectedEmployee();
    if (!employee) return;
    this.modalManager.openModal('adjust_vacation', {
      employeeId: employee.person_id,
      currentEntitlement: this.vacationBalance().total,
      onSave: () => this.loadVacationData(employee.person_id)
    });
  }

  approveVacation(id: number) {
    const employeeId = this.selectedEmployee()?.person_id;
    if (!employeeId) return;
    this.http.put(`${Config.API_URL}/v1/employees/${employeeId}/vacations/request/${id}/approve`, {}, { withCredentials: true })
      .subscribe(() => {
        const emp = this.selectedEmployee();
        if (emp) this.loadVacationRequests(emp.person_id);
        this.alertManager.alert('success', 'employees.vacations.approve_success').closeable(true);
      });
  }

  rejectVacation(id: number) {
    this.modalManager.openModal('reject_vacation', {
      requestId: id,
      onSave: () => {
        const emp = this.selectedEmployee();
        if (emp) this.loadVacationRequests(emp.person_id);
      }
    });
  }

  loadExpandedData(employeeId: number) {
    // 1. Subjects & Taught Groups
    this.http.get<any>(`${Config.API_URL}/v1/employees/${employeeId}/subjects`, { withCredentials: true })
      .subscribe(res => {
        this.taughtSubjects.set(res.subjects || []);
        this.taughtGroups.set(res.groups || []);
        this.supervisionSchedule.set(res.supervision || []);
      });

    // 2. Education & DVPP
    this.http.get<any>(`${Config.API_URL}/v1/employees/${employeeId}/professional`, { withCredentials: true })
      .subscribe(res => this.educationDVPP.set(res.data || []));

    // 3. Agenda (BOZP/PO/Medicals)
    this.http.get<any>(`${Config.API_URL}/v1/employees/${employeeId}/agenda`, { withCredentials: true })
      .subscribe(res => this.agendaBOZP.set(res.data || []));

    // 4. Equipment
    this.http.get<any>(`${Config.API_URL}/v1/employees/${employeeId}/equipment`, { withCredentials: true })
      .subscribe(res => this.equipment.set(res.data || []));

    // 5. Documents
    this.http.get<any>(`${Config.API_URL}/v1/employees/${employeeId}/documents`, { withCredentials: true })
      .subscribe(res => this.documents.set(res.data || []));

    // 6. Evaluations
    this.http.get<any>(`${Config.API_URL}/v1/employees/${employeeId}/evaluation`, { withCredentials: true })
      .subscribe(res => this.evaluations.set(res.data || []));

    // 7. History
    this.http.get<any>(`${Config.API_URL}/v1/employees/${employeeId}/history`, { withCredentials: true })
      .subscribe(res => this.changeHistory.set(res.data || []));

    // Note: ClassTeacher and SpecialFunctions will be integrated into the main employee detail object 
    // in a future update or extracted from existing fields.
    this.isClassTeacherOf.set(this.selectedEmployee()?.department || null); // Temporary logic
    this.specialFunctions.set(['Pedagogický pracovník']); // Temporary logic
  }

  generateEquipmentProtocol() {
    this.alertManager.alert('success', 'Předávací protokol byl vygenerován a připraven ke stažení.').closeable(true);
  }

  exportHistory() {
     this.alertManager.alert('info', 'Export historie byl spuštěn.').closeable(true);
  }

  openSetSalaryModal() {
    const employee = this.selectedEmployee();
    if (!employee) return;
    this.modalManager.openModal('set_salary', {
      employeeId: employee.person_id,
      currentSalary: this.currentSalary(),
      onSave: () => this.loadSalaryData(employee.person_id)
    });
  }

  exportPayrollXML() {
    const employee = this.selectedEmployee();
    if (!employee) return;
    const month = new Date().toISOString().substring(0, 7);
    window.open(`${Config.API_URL}/v1/employees/${employee.person_id}/salaries/export?format=xml&month=${month}`, '_blank');
  }

  openAddBonusModal() {
    const employee = this.selectedEmployee();
    if (!employee) return;
    this.modalManager.openModal('add_bonus', {
      employeeId: employee.person_id,
      onSave: () => this.loadBonusesData(employee.person_id)
    });
  }

  markBonusAsPaid(id: number) {
    const employeeId = this.selectedEmployee()?.person_id;
    if (!employeeId) return;
    this.http.put(`${Config.API_URL}/v1/employees/${employeeId}/bonuses/${id}/paid`, {}, { withCredentials: true })
      .subscribe(() => {
        const emp = this.selectedEmployee();
        if (emp) this.loadBonusesData(emp.person_id);
      });
  }

  deleteBonus(id: number) {
    const employeeId = this.selectedEmployee()?.person_id;
    if (!employeeId) return;
    this.http.delete(`${Config.API_URL}/v1/employees/${employeeId}/bonuses/${id}`, { withCredentials: true })
      .subscribe(() => {
        const emp = this.selectedEmployee();
        if (emp) this.loadBonusesData(emp.person_id);
      });
  }

  public refreshTimetable() {
    const employeeId = this.selectedEmployee()?.person_id;
    if (!employeeId) return;

    const { timetable, timetableHours, isLoading } = this.timetableService.getTimetable(
      'person',
      employeeId,
      this.timetableSelectedWeek.getValue(),
      this.timetableSelectedTab.getValue()
    );

    isLoading.subscribe(loading => this.isLoadingTimetable = loading);
    timetable.subscribe(data => this.fullTimetable = data);
    timetableHours.subscribe(data => this.fullTimetableHours = data);
  }

  public setTimetableTab(tab: number) {
    this.timetableSelectedTab.next(tab);
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
}
