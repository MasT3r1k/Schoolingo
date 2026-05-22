import { Component, OnInit, inject, ViewChild, ElementRef, AfterViewInit, HostListener } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { IconsModule } from '@Schoolingo/icons';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Config } from '@Schoolingo/config';
import { Utils } from '@Schoolingo/utils';
import { DropdownManager } from '@Schoolingo/dropdown';
import { Locale } from '@Schoolingo/locale';
import { ActivatedRoute, Router } from '@angular/router';
import moment from 'moment';
import { TimetableHours } from '../../Teach/timetable/timetable.component';
import { Student } from '../students.component';
import { Timetable } from '../../../infrastructure/timetable/timetable';
import { MessageManager, RatingType } from '@Schoolingo/messages';
import { SharedTimetableComponent } from '../../../Components/timetable/timetable.component';
import { BehaviorSubject, distinctUntilChanged } from 'rxjs';
import { MarksManager } from '@Schoolingo/marks';
import { EducationMeasuresService, EducationMeasure } from '../../../infrastructure/measures/education-measures.service';
import { ModalManager } from '@Schoolingo/modal';
import { MedicalModalComponent } from './modals/medical-modal/medical-modal.component';
import { EditPersonalModalComponent } from './modals/edit-personal/edit-personal.component';
import { ParentsSettingsComponent } from './modals/parents-settings/parents-settings.component';
import { AddParentComponent } from './modals/add-parent/add-parent.component';
import { CreateParentComponent } from './modals/create-parent/create-parent.component';
import { RemoveParentComponent } from './modals/remove-parent/remove-parent.component';
import { SaveHistoryModalComponent } from './modals/save-history-modal/save-history-modal.component';
import { EditAddressModalComponent } from './modals/edit-address/edit-address.component';
import { EditParentRoleComponent } from './modals/edit-parent-role/edit-parent-role.component';
import { StudentEducationalMeasureComponent } from './modals/student-educational-measure/student-educational-measure.component';
import { MeasureTemplatesComponent } from './modals/measure-templates/measure-templates.component';
import { MeasureTypesComponent } from './modals/measure-types/measure-types.component';
import { AddMeasureTypeComponent } from './modals/add-measure-type/add-measure-type.component';
import { AddMeasureTemplateComponent } from './modals/add-measure-template/add-measure-template.component';
import { TabsComponent } from '@Components/Tabs';
import { MarkDetailModalComponent } from '../../../Components/mark-detail-modal/mark-detail-modal.component';
import { AvatarService } from '../../../infrastructure/utils/avatar.service';
import { AddNoteComponent } from './modals/add-note/add-note.component';
import { AddRewardModalComponent } from './modals/add-reward-modal/add-reward-modal.component';
import { RemoveRewardModalComponent } from './modals/remove-reward-modal/remove-reward-modal.component';
import { BoardAlertManager } from '../../../infrastructure/alert/board.alert.manager';

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

interface StudentIntermAPI {
  status: boolean;
  marks: StudentIntermMarkAPI[];
  subject_stats: Record<number, StudentIntermSubjectStat>;
  mark_stats: Record<number, StudentIntermMarkStat>;
  marking_scales: Record<string, number[]>;
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

interface StudentHistory {
  teacher_id: number;
  full_name: string;
  type: string;
  data: string;
  created_at: Date;
}

interface StudentNote {
  note_id: number;
  student_id: number;
  teacher_id: number;
  teacher_name: string;
  content: string;
  is_public: boolean;
  created_at: Date;
  updated_at: Date;
}

interface Reward {
  id: number;
  title: string;
  description: string;
  amount?: number;
  type: 'financial' | 'certificate' | 'prize' | 'other';
  status: 'pending' | 'collected';
  createdAt: Date;
  collectedAt?: Date;
  studentName?: string;
  student_id: number;
  teacherId: number;
  teacherName?: string;
}

@Component({
  standalone: true,
  imports: [CommonModule, IconsModule, FormsModule, SharedTimetableComponent, TabsComponent],
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.css'
})
export class DetailComponent implements OnInit, AfterViewInit {
  private http = inject(HttpClient);
  public router = inject(Router);
  private route = inject(ActivatedRoute);
  private location = inject(Location);
  private modalManager = inject(ModalManager);
  public Utils = Utils;
  public dropdownManager = inject(DropdownManager);
  public l = inject(Locale);
  public measuresService = inject(EducationMeasuresService);
  public messageManager = inject(MessageManager);
  public avatarService = inject(AvatarService);
  private alert = inject(BoardAlertManager);

  @ViewChild('tabsNav') tabsNav?: ElementRef;
  public showLeftScroll = false;
  public showRightScroll = false;

  ngAfterViewInit(): void {
    setTimeout(() => this.checkScroll(), 250);
  }

  @HostListener('window:resize')
  public onResize() {
    this.checkScroll();
  }

  public checkScroll() {
    const el = this.tabsNav?.nativeElement;
    if (!el) return;
    this.showLeftScroll = el.scrollLeft > 5;
    this.showRightScroll = el.scrollLeft < el.scrollWidth - el.clientWidth - 5;
  }

  public scrollTabs(dir: number) {
    const el = this.tabsNav?.nativeElement;
    if (el) el.scrollBy({ left: dir * 150, behavior: 'smooth' });
  }

  // Loading state
  isLoading = false;
  loadError: string | null = null;

  // Selected student for detail view
  selectedStudent: Student | null = null;
  selectedParent: any | null = null;

  public hours: TimetableHours[] = [];
  public max_hours = 0;

  // Timetable
  public timetableService = inject(Timetable);
  public isLoadingTimetable = false;
  public fullTimetable: any[] = [];
  public fullTimetableHours: TimetableHours[] = [];
  public timetableSelectedWeek = new BehaviorSubject<moment.Moment | null>(moment());
  public timetableSelectedTab = new BehaviorSubject<number>(0); // 0 = actual, 1 = permanent

  // Overview Schedule
  public overviewSelectedDate = moment();

  // Marks
  public marksManager = inject(MarksManager);
  public marks: StudentIntermMarkAPI[] = [];
  public subjectStats: Record<number, StudentIntermSubjectStat> = {};
  public markStats: Record<number, StudentIntermMarkStat> = {};
  public marking_scales: Record<string, number[]> = {};
  public marking_scale: number[] = [85, 70, 50, 30, 0]; // Default fallback
  public selectedMark: any | null = null;
  public marksSelectedTab = new BehaviorSubject(0);
  public marksOptions = [
    'marks.interm.by_subjects',
    'marks.interm.chronologically'
  ];

  // Rewards
  public rewardSelectedTab = new BehaviorSubject(0);
  public rewardOptions = [
    'all',
    'pending',
    'collected'
  ];


  // Medical Records
  public medicalRecords: MedicalRecord[] = [];

  // Educational Measures
  public educationalMeasures: EducationMeasure[] = [];
  public isLoadingMeasures = false;

  // Student Notes
  public studentNotes: StudentNote[] = [];
  public isLoadingNotes = false;

  // Evaluations
  public evaluations: any[] = [];
  
  // Rewards
  public studentRewards: Reward[] = [];
  public isLoadingRewards = false;
  
  // Exemptions
  public availableSubjects: any[] = [];

  public matrikaSaveType: 'change' | 'correction' = 'change';
  private originalMatrika: any = null;

  get praiseCount(): number {
    return this.educationalMeasures.filter(m => m.type === 'praise').length;
  }

  // Detail View Tabs
  public tabs: (typeof this.activeTab)[] = ['overview', 'personal', 'parents', 'matrika', 'medical', 'history', 'marks', 'notes', 'evaluation', 'educational_measures', 'timetable', 'rewards'];
  activeTab: 'overview' | 'personal' | 'parents' | 'academic' | 'matrika' | 'medical' | 'history' | 'marks' | 'notes' | 'evaluation' | 'educational_measures' | 'timetable' | 'rewards' = 'overview';
  activeMatrikaSubTab: 'specific_data' | 'exemptions' | 'notes' | 'recommendations' | 'basic' = 'specific_data';
  activeHistorySubTab: 'details' | 'changes' | 'term_status' = 'details';

  // History filtering & pagination
  public historyLimit = 20;
  public historyOffset = 0;
  public historyFilterType: string = '';
  public historyFilterDateFrom: string = '';
  public historyFilterDateTo: string = '';
  public isLoadingHistory = false;
  public hasMoreHistory = true;

  public getTabIcon(tab: typeof this.activeTab): string {
    const iconsMap: Record<string, string> = {
      overview: 'layout-dashboard',
      personal: 'user',
      parents: 'users-group',
      matrika: 'clipboard-list',
      medical: 'heart-rate-monitor',
      history: 'history',
      marks: 'award',
      notes: 'notes',
      evaluation: 'checklist',
      educational_measures: 'alert-triangle',
      timetable: 'calendar-time',
      rewards: 'gift'
    };
    return iconsMap[tab] ?? 'help';
  }

  // Detail Modals
  showGradesModal = false;
  showAbsenceModal = false;
  showDisciplineModal = false;
  showAddDisciplineForm = false;


  ngOnInit() {
    this.refreshStudentData();

    this.timetableSelectedWeek
      .pipe(distinctUntilChanged())
      .subscribe(() => {
        this.refreshTimetable();
      });

    // Force load hours if empty
    this.refreshTimetable();

    this.modalManager.addModal('medical_record', {
      icon: 'report-medical',
      title: 'students.medical.title',
      closeable: true,
      width: 500,
      items: [{ type: 'component', component: MedicalModalComponent }]
    });

    this.modalManager.addModal('edit_personal', {
      title: 'students.edit_personal',
      description: 'students.edit_personal_description',
      icon: 'user-edit',
      closeable: true,
      forceScrollbar: true,
      width: 900,
      items: [{ type: 'component', component: EditPersonalModalComponent }]
    });

    this.modalManager.addModal('save_history', {
      title: 'students.save_history.title',
      description: 'students.save_history.description',
      icon: 'history',
      closeable: true,
      width: 700,
      index: 600,
      items: [{ type: 'component', component: SaveHistoryModalComponent }]
    });

    this.modalManager.addModal('edit_address', {
      title: 'students.edit_address.title',
      description: 'students.edit_address.description',
      icon: 'home',
      closeable: true,
      width: 550,
      items: [{ type: 'component', component: EditAddressModalComponent }]
    });

    this.modalManager.addModal('add_reward', {
      icon: 'award',
      title: 'students.add_reward.title',
      description: 'students.add_reward.description',
      closeable: true,
      width: 600,
      items: [{
        type: 'component',
        component: AddRewardModalComponent
      }]
    });

    this.modalManager.addModal('remove_reward', {
      icon: 'trash',
      title: 'rewards.delete_confirm_title',
      description: 'rewards.confirm_delete',
      closeable: true,
      width: 500,
      items: [{
        type: 'component',
        component: RemoveRewardModalComponent
      }]
    });

    this.modalManager.addModal('add_parent', {
      title: 'students.add_parent.title',
      description: 'students.add_parent.description',
      icon: 'user-plus',
      closeable: true,
      width: 800,
      items: [{ type: 'component', component: AddParentComponent }]
    });

    this.modalManager.addModal('create_parent', {
      icon: 'user-plus',
      title: 'students.create_parent.title',
      closeable: true,
      width: 600,
      index: 600,
      items: [{ type: 'component', component: CreateParentComponent }]
    });

    this.modalManager.addModal('edit_parent_role', {
      icon: 'shield-check',
      title: 'students.edit_parent_role.title',
      description: 'students.edit_parent_role.description',
      closeable: true,
      width: 550,
      index: 600,
      items: [{ type: 'component', component: EditParentRoleComponent }]
    });

    this.modalManager.addModal('remove_parent', {
      icon: 'user-minus',
      title: 'students.remove_parent.title',
      closeable: true,
      index: 502,
      items: [
        { type: 'component', component: RemoveParentComponent }
      ]
    });

    this.modalManager.addModal('parents_settings', {
      title: 'students.manage_parent.title',
      description: 'students.manage_parent.description',
      icon: 'users-group',
      closeable: true,
      width: 600,
      items: [{ type: 'component', component: ParentsSettingsComponent }]
    });
    
    this.modalManager.addModal('mark_detail', {
      title: 'marks.detail_title',
      closeable: true,
      width: 450,
      items: [{ type: 'component', component: MarkDetailModalComponent }]
    });

    this.modalManager.addModal('add_measure_student', {
      title: 'education_measures.new_measure',
      icon: 'gavel',
      closeable: true,
      width: 900,
      items: [{ type: 'component', component: StudentEducationalMeasureComponent }]
    });

    this.modalManager.addModal('measure_templates', {
      title: 'education_measures.templates.title',
      icon: 'file-text',
      closeable: true,
      width: 800,
      index: 1000,
      items: [{ type: 'component', component: MeasureTemplatesComponent }]
    });

    this.modalManager.addModal('measure_types', {
      title: 'education_measures.types_management.title',
      icon: 'list-details',
      closeable: true,
      width: 900,
      index: 1100,
      items: [{ type: 'component', component: MeasureTypesComponent }]
    });

    this.modalManager.addModal('add_measure_type', {
      title: 'education_measures.types_management.add',
      icon: 'plus',
      closeable: true,
      width: 500,
      index: 1200,
      items: [{ type: 'component', component: AddMeasureTypeComponent }]
    });

    this.modalManager.addModal('add_measure_template', {
      title: 'education_measures.templates.add',
      icon: 'plus',
      closeable: true,
      width: 600,
      index: 1200,
      items: [{ type: 'component', component: AddMeasureTemplateComponent }]
    });

    this.modalManager.addModal('add_note', {
      title: 'students.add_note.title',
      icon: 'message-plus',
      closeable: true,
      items: [{ type: 'component', component: AddNoteComponent }]
    })
  }

  public refreshStudentData() {
    const id = this.route.snapshot.paramMap.get('id');
    this.isLoading = true;
    this.loadError = null;
    this.http.get(
      `${Config.API_URL}/v1/student/${id}`,
      { withCredentials: true }
    )
      .subscribe({
        next: (student: any) => {
          this.selectedStudent = student;
          if (student.medical_records) {
            this.medicalRecords = student.medical_records;
          }
          if (student.student_notes) {
            this.studentNotes = student.student_notes;
          }
          if (student.evaluations) {
            this.evaluations = student.evaluations;
          }
          if (student.matrika) {
            this.originalMatrika = { ...student.matrika };
          }

          if (student.parents.length) {
            this.selectedParent = student.parents[0];
          }
          this.loadMarks();
          this.refreshTimetable();
          this.isLoading = false;
          setTimeout(() => this.checkScroll(), 100);
        },
        error: () => {
          this.isLoading = false;
          this.loadError = 'Failed to load student data.';
        }
      });
  }

  public openParentSettings(): void {
    this.modalManager.openModal('parents_settings', { 
      student_id: this.selectedStudent!.person_id, 
      student: this.selectedStudent!, 
      parents: this.selectedStudent!.parents,
      callback: () => this.refreshStudentData()
    });
  }

  public openAddParentModal(): void {
    this.modalManager.openModal('add_parent', {
      student_id: this.selectedStudent!.person_id,
      callback: () => this.refreshStudentData()
    });
  }

  public refreshTimetable() {
    if (!this.selectedStudent?.person_id) return;

    const { timetable, timetableHours, isLoading } = this.timetableService.getTimetable(
      'person',
      this.selectedStudent!.person_id,
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

  public selectStudent(student_id: number): void {
    this.router.navigate(['/students', student_id], {
      queryParamsHandling: 'preserve'
    });
    setTimeout(() => {
      this.refreshStudentData();
    }, 100)
  }

  // Close detail view
  closeDetail() {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    if (returnUrl) {
      this.router.navigateByUrl(returnUrl);
    } else {
      this.router.navigate(['/', 'students']);
    }
  }

  // Tab switching
  setActiveTab(tab: typeof this.activeTab) {
    this.activeTab = tab;
    if (tab === 'timetable') {
      this.timetableSelectedTab.next(0);
      this.timetableSelectedWeek.next(moment());
    }
    if (tab == 'history') {
      this.refreshHistory();
    }
    if (tab == 'educational_measures') {
      this.refreshMeasures();
    }
    if (tab == 'notes') {
      this.refreshNotes();
    }
    if (tab == 'matrika') {
      this.refreshAvailableSubjects();
    }
    if (tab == 'rewards') {
      this.refreshRewards();
    }
  }

  public refreshRewards(): void {
    if (!this.selectedStudent?.person_id) return;
    this.isLoadingRewards = true;
    this.http.get<{ rewards: any[] }>(
      `${Config.API_URL}/v1/rewards?studentId=${this.selectedStudent.person_id}`,
      { withCredentials: true }
    ).subscribe({
      next: (response) => {
        this.studentRewards = response.rewards.map(r => ({
          ...r,
          createdAt: new Date(r.createdAt),
          collectedAt: r.collectedAt ? new Date(r.collectedAt) : undefined
        }));
        this.isLoadingRewards = false;
      },
      error: () => {
        this.isLoadingRewards = false;
      }
    });
  }

  public openAddReward(): void {
    this.modalManager.openModal('add_reward', {
      studentId: this.selectedStudent!.person_id,
      callback: () => this.refreshRewards()
    });
  }

  public markRewardAsCollected(reward: Reward): void {
    this.http.put(
      `${Config.API_URL}/v1/rewards/${reward.id}`,
      { status: 'collected' },
      { withCredentials: true }
    ).subscribe({
      next: () => {
        reward.status = 'collected';
        reward.collectedAt = new Date();
      },
      error: (err) => {
        console.error('Failed to update reward:', err);
      }
    });
  }

  public deleteReward(reward: Reward): void {
    this.modalManager.openModal('remove_reward', {
      reward,
      callback: () => {
        this.http.delete(
          `${Config.API_URL}/v1/rewards/${reward.id}`,
          { withCredentials: true }
        ).subscribe({
          next: () => {
            this.studentRewards = this.studentRewards.filter(r => r.id !== reward.id);
          },
          error: (err) => {
            console.error('Failed to delete reward:', err);
          }
        });
      }
    });
  }

  public getRewardTypeIcon(type: string): string {
    switch (type) {
      case 'financial': return 'cash';
      case 'certificate': return 'certificate';
      case 'prize': return 'trophy';
      default: return 'gift';
    }
  }

  public getFilteredRewards(): Reward[] {
    const tab = this.rewardSelectedTab.getValue();
    if (tab === 1) return this.studentRewards.filter(r => r.status === 'pending');
    if (tab === 2) return this.studentRewards.filter(r => r.status === 'collected');
    return this.studentRewards;
  }


  public getRewardTypeLabel(type: string): string {
    let type_id = 'other';
    if (['financial', 'certificate', 'prize'].includes(type)) {
      type_id = type;
    }
    return this.l.s(`rewards.type.${type_id}`);
  }

  public refreshMeasures(): void {
    if (!this.selectedStudent?.person_id) return;
    this.isLoadingMeasures = true;
    this.measuresService.loadMeasures(this.selectedStudent!.person_id).subscribe({
      next: (data) => {
        this.educationalMeasures = data;
        this.isLoadingMeasures = false;
      },
      error: () => {
        this.isLoadingMeasures = false;
      }
    });
  }

  public openAddMeasureModal(): void {
    this.modalManager.openModal('add_measure_student', {
      student_id: this.selectedStudent!.person_id,
      student: this.selectedStudent!,
      callback: () => this.refreshMeasures()
    });
  }

  public setActiveHistorySubTab(tab: 'details' | 'changes' | 'term_status') {
    this.activeHistorySubTab = tab;
    this.historyFilterType = '';
    this.historyFilterDateFrom = '';
    this.historyFilterDateTo = '';
    this.refreshHistory(true);
  }

  public refreshHistory(reset: boolean = true): void {
    if (reset) {
      this.historyOffset = 0;
      this.hasMoreHistory = true;
      if (this.selectedStudent) {
          this.selectedStudent.history = [];
      }
    }
    
    if (!this.selectedStudent || !this.hasMoreHistory || this.isLoadingHistory) return;
    
    this.isLoadingHistory = true;
    
    let typeFilter = this.historyFilterType;
    if (this.activeHistorySubTab === 'changes') {
       if (!typeFilter) {
           typeFilter = 'updated_student,updated_matrika';
       }
    }

    let params = new HttpParams()
        .set('limit', this.historyLimit.toString())
        .set('offset', this.historyOffset.toString());
        
    if (typeFilter) params = params.set('type', typeFilter);
    if (this.historyFilterDateFrom) params = params.set('dateFrom', this.historyFilterDateFrom);
    if (this.historyFilterDateTo) params = params.set('dateTo', this.historyFilterDateTo);

    this.http.get<StudentHistory[]>(`${Config.API_URL}/v1/student/${this.selectedStudent.person_id}/history`, { params, withCredentials: true })
      .subscribe({
          next: (data) => {
            if (reset) {
              this.selectedStudent!.history = data;
            } else {
              this.selectedStudent!.history.push(...data);
            }
            this.historyOffset += data.length;
            if (data.length < this.historyLimit) {
                this.hasMoreHistory = false;
            }
            this.isLoadingHistory = false;
          },
          error: () => {
              this.isLoadingHistory = false;
          }
      });
  }

  public onHistoryScroll(event: Event): void {
    const target = event.target as HTMLElement;
    if (target.scrollHeight - target.scrollTop <= target.clientHeight + 50) {
      if (!this.isLoadingHistory && this.hasMoreHistory) {
        this.refreshHistory(false);
      }
    }
  }

  public formatHistoryEvent(item: StudentHistory): { title: string, description: string, icon: string, color: string, details: { label: string, value: string }[] } {
    let data: any = {};
    try {
      data = typeof item.data === 'string' ? JSON.parse(item.data) : item.data;
    } catch (e) { }

    switch (item.type) {
      case 'added_parent':
        return {
          title: 'Přidán zákonný zástupce',
          description: `Byl přidán nový zákonný zástupce <strong>${data.parent_full_name || 'neznámý'}</strong> s rolí <strong>${this.l.s('family.' + (data.type || data.role || ''))}</strong>.`,
          icon: 'user-plus',
          color: 'success',
          details: [
            { label: 'Zákonný zástupce', value: data.parent_full_name || '—' },
            { label: 'Role', value: this.l.s('family.' + (data.type || data.role || '')) || '—' },
          ]
        };
      case 'removed_parent':
        return {
          title: 'Odebrán zákonný zástupce',
          description: `Byl odebrán zákonný zástupce${data.parent_full_name ? ' <strong>' + data.parent_full_name + '</strong>' : ''}.`,
          icon: 'user-minus',
          color: 'danger',
          details: [
            { label: 'Zákonný zástupce', value: data.parent_full_name || '—' },
          ]
        };
      case 'updated_parent':
        return {
          title: 'Úprava zákonného zástupce',
          description: `Byly upraveny údaje u zákonného zástupce.`,
          icon: 'user-edit',
          color: 'warning',
          details: []
        };
      case 'updated_student': {
        const details: { label: string, value: string }[] = [];
        if (data.changes && Array.isArray(data.changes)) {
          data.changes.forEach((c: any) => {
            details.push({ 
              label: c.label, 
              value: `<s>${c.oldValue || 'Nezadáno'}</s> &nbsp;&rarr;&nbsp; ${c.newValue || 'Nezadáno'}` 
            });
          });
        } else {
          if (data.firstName || data.lastName) details.push({ label: 'Jméno', value: `${data.firstName || ''} ${data.lastName || ''}`.trim() });
          if (data.birthday) details.push({ label: 'Datum narození', value: data.birthday });
          if (data.birthPlace) details.push({ label: 'Místo narození', value: data.birthPlace });
          if (data.birthNum) details.push({ label: 'Rodné číslo', value: data.birthNum });
          if (data.street) details.push({ label: 'Ulice', value: `${data.street} ${data.houseNumber || ''}`.trim() });
          if (data.city) details.push({ label: 'Město', value: `${data.city}${data.postcode ? ', ' + data.postcode : ''}` });
        }
        return {
          title: data.street ? 'Úprava adresy studenta' : 'Úprava údajů studenta',
          description: data.street
            ? `Byla aktualizována adresa studenta: <strong>${data.street} ${data.houseNumber || ''}, ${data.city || ''}</strong>.`
            : `Byly aktualizovány osobní nebo studijní údaje studenta.`,
          icon: data.street ? 'home' : 'user-cog',
          color: 'primary',
          details
        };
      }
      case 'updated_matrika': {
        const matrikaLabels: Record<string, string> = {
          highest_education_id: 'Nejvyšší vzdělání',
          previous_school_izo: 'IZO předchozí školy',
          study_type_code: 'Typ studia',
          financing_code: 'Financování',
          start_reason_code: 'Důvod nástupu',
          end_reason_code: 'Důvod ukončení',
          individual_plan_code: 'Individuální plán',
          special_needs_code: 'Spec. potřeby',
          language_code: 'Jazyk',
          health_status_code: 'Zdravotní stav',
        };
        const details: { label: string, value: string }[] = [];
        if (data.changes && Array.isArray(data.changes)) {
          data.changes.forEach((c: any) => {
            details.push({ 
              label: c.label, 
              value: `<s>${c.oldValue || 'Nezadáno'}</s> &nbsp;&rarr;&nbsp; ${c.newValue || 'Nezadáno'}` 
            });
          });
        } else {
          Object.entries(matrikaLabels)
            .filter(([key]) => data[key] !== undefined && data[key] !== null && data[key] !== '')
            .map(([key, label]) => ({ label, value: String(data[key]) }))
            .forEach(d => details.push(d));
        }
        return {
          title: 'Úprava matriky studenta',
          description: `Byly aktualizovány údaje v matrice studenta.`,
          icon: 'clipboard-list',
          color: 'info',
          details
        };
      }
      case 'moved_to_class':
        return {
          title: 'Přesun do jiné třídy',
          description: `Student byl přesunut do třídy <strong>${data.class_name || 'neznámá'}</strong>.`,
          icon: 'arrows-exchange',
          color: 'warning',
          details: [
            { label: 'Nová třída', value: data.class_name || '—' },
          ]
        };
      default:
        return {
          title: 'Neznámá akce',
          description: `Provedena akce typu ${item.type}.`,
          icon: 'help',
          color: 'muted',
          details: []
        };
    }
  }

  /** Vrátí záznamy vhodné pro záložku "sledování změn" (updated_student, updated_matrika) */
  public getChangesHistory(): StudentHistory[] {
    if (!this.selectedStudent?.history) return [];
    return this.selectedStudent.history;
  }


  public getTodayTimetable(): any[] {
    return this.selectedStudent!.timetable.filter((lesson: any) => lesson.day == this.overviewSelectedDate.isoWeekday())
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
    const lessons = this.selectedStudent!.timetable
      .filter((lesson: any) => lesson.day === day && (lesson.type == 0 || (lesson.type == 1 && isOdd) || (lesson.type == 2 && !isOdd)));

    // Přidat substituce
    const substitutions = this.selectedStudent!.substitution.filter((sub: any) => {
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
      .post<StudentIntermAPI>(
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
        if ('marking_scales' in data) {
          this.marking_scales = data.marking_scales;
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
        let markVal = 0;
        if (grade.type === 1) { // Points
          const scale = this.marking_scales[`${grade.subject_id}_${grade.group_id}`] || this.marking_scale;
          markVal = this.getPointGrade(grade.mark, grade.max_points || 1, scale);
        } else {
          markVal = grade.mark;
        }

        if (markVal > 0) {
          total += markVal * weight;
          totalDivide += weight;
        }
      }
    }
    if (totalDivide === 0) return this.l.s('marks.no_subjects');
    const average = total / totalDivide;
    return average < 1 ? "1.00" : average.toFixed(2);
  }

  public getPointGrade(pointsRaw: string | number | null, maxPoints: number, overrideScale?: number[]): number {
    if (pointsRaw === null || pointsRaw === undefined) return 0;
    const pointsStr = String(pointsRaw);
    const points = parseFloat(pointsStr.replace(',', '.'));
    if (isNaN(points)) return 0;
    if (maxPoints <= 0) return 1;
    const percentage = (points / maxPoints) * 100;

    const scale = overrideScale || this.marking_scale;
    if (scale && scale.length >= 4) {
      for (let i = 0; i < 4; i++) {
        if (percentage >= scale[i]) return i + 1;
      }
      return 5;
    }
    if (percentage >= 85) return 1;
    if (percentage >= 70) return 2;
    if (percentage >= 50) return 3;
    if (percentage >= 30) return 4;
    return 5;
  }

  public formatMark(mark: any): string {
    if (!mark) return "";
    let mark_id: number;

    if (typeof mark === 'object') {
      if (mark.type === 1) { // Points
        const scale = this.marking_scales[`${mark.subject_id}_${mark.group_id}`] || this.marking_scale;
        return this.getPointGrade(mark.mark, mark.max_points || 1, scale).toString();
      }
      mark_id = mark.mark;
    } else {
      mark_id = mark;
    }

    const config = this.marksManager.getConfig();
    let idIndex = config.mark_ids.findIndex((m) => m == mark_id);
    let displayMark = config.mark_display[idIndex];
    if (displayMark) return displayMark;
    return mark_id.toString();
  }

  /**
   * Returns base mark 1-5 for color classes
   * @param mark 
   */
  public getBaseMark(mark: any): number {
    if (!mark) return 0;
    let mark_id: number;

    if (typeof mark === 'object') {
      if (mark.type === 1) {
        const scale = this.marking_scales[`${mark.subject_id}_${mark.group_id}`] || this.marking_scale;
        return this.getPointGrade(mark.mark, mark.max_points || 1, scale);
      }
      mark_id = mark.mark;
    } else {
      mark_id = mark;
    }

    if (mark_id > 100) mark_id = Math.floor(mark_id / 100);
    if (mark_id > 5) return 0;
    return mark_id;
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
    this.modalManager.openModal('mark_detail', {
      selectedMark: mark,
      markStats: this.markStats,
      marking_scales: this.marking_scales,
      marking_scale: this.marking_scale
    });
  }

  public closeMarkDetails(): void {
    this.selectedMark = null;
    this.modalManager.closeModal('mark_detail');
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
      studentId: this.selectedStudent!.person_id,
      callback: () => this.refreshMedicalRecords()
    });
  }

  public openEditPersonalModal() {
    this.modalManager.openModal('edit_personal', {
      student: this.selectedStudent!,
      callback: () => this.refreshStudentData()
    });
  }



  public deleteMedicalRecord(recordId: number) {
    if (!this.selectedStudent?.person_id) return;
    if (!confirm('Opravdu chcete smazat tento zdravotní záznam?')) return;

    this.http.delete(`${Config.API_URL}/v1/student/${this.selectedStudent!.person_id}/medical/${recordId}`, { withCredentials: true })
      .subscribe(() => {
        this.refreshMedicalRecords();
      });
  }

  public refreshMedicalRecords() {
    if (!this.selectedStudent?.person_id) return;
    this.http.get<MedicalRecord[]>(`${Config.API_URL}/v1/student/${this.selectedStudent!.person_id}/medical`, { withCredentials: true })
      .subscribe(records => {
        this.medicalRecords = records;
      });
  }

  public saveMatrika() {
    if (!this.selectedStudent?.person_id) return;
    const changes: any[] = [];
    const matrikaLabels: Record<string, string> = {
      highest_education_id: 'Nejvyšší vzdělání',
      previous_school_izo: 'IZO předchozí školy',
      study_type_code: 'Typ studia',
      financing_code: 'Financování',
      start_reason_code: 'Důvod nástupu',
      end_reason_code: 'Důvod ukončení',
      individual_plan_code: 'Individuální plán',
      special_needs_code: 'Spec. potřeby',
      language_code: 'Jazyk',
      health_status_code: 'Zdravotní stav',
    };

    if (this.originalMatrika) {
      Object.entries(matrikaLabels).forEach(([key, label]) => {
        const oldVal = this.originalMatrika[key] ?? '';
        const newVal = this.selectedStudent!.matrika?.[key] ?? '';
        if (oldVal.toString() !== newVal.toString()) {
          changes.push({ label, oldValue: oldVal || 'Nezadáno', newValue: newVal || 'Nezadáno' });
        }
      });
    }

    if (changes.length === 0) {
       alert('Žádné změny k uložení.');
       return;
    }

    this.modalManager.openModal('save_history', {
      student: this.selectedStudent!,
      changes: changes,
      callback: (saveType: string, historyDate: string) => {
        const personId = this.selectedStudent!.person_id;
        this.http.patch(`${Config.API_URL}/v1/student/${personId}/matrika`, {
          ...this.selectedStudent!.matrika,
          saveType: saveType,
          historyDate: historyDate,
          changes
        }, { withCredentials: true })
        .subscribe({
          next: () => {
             this.refreshStudentData();
          },
             error: (err) => {
             console.error('Failed to update matrika', err);
             alert('Nepodařilo se uložit údaje matriky.');
          }
        });
      }
    });
  }

  public addMatrikaRecord(type: string, description: string, from: string, to: string) {
    if (!this.selectedStudent?.person_id) return;
    this.http.post(`${Config.API_URL}/v1/student/${this.selectedStudent!.person_id}/matrika/record`, {
      type, description, valid_from: from, valid_to: to
    }, { withCredentials: true })
      .subscribe(() => {
        this.refreshStudentData();
      });
  }

  public deleteMatrikaRecord(id: number) {
    if (!this.selectedStudent?.person_id) return;
    this.http.delete(`${Config.API_URL}/v1/student/${this.selectedStudent!.person_id}/matrika/record/${id}`, { withCredentials: true })
      .subscribe(() => {
        this.refreshStudentData();
      });
  }

  public refreshAvailableSubjects() {
    if (!this.selectedStudent?.person_id) return;
    this.http.get<any[]>(`${Config.API_URL}/v1/student/${this.selectedStudent!.person_id}/subjects`, { withCredentials: true })
      .subscribe(subjects => {
        this.availableSubjects = subjects;
      });
  }

  public addExemption(subjectId: string, from: string, to: string, note: string) {
    if (!this.selectedStudent?.person_id || !subjectId) return;
    this.http.post(`${Config.API_URL}/v1/student/${this.selectedStudent!.person_id}/exemptions`, {
      subject_id: parseInt(subjectId), 
      valid_from: from || null, 
      valid_to: to || null, 
      note
    }, { withCredentials: true })
      .subscribe(() => {
        this.refreshStudentData();
      });
  }

  public deleteExemption(id: number) {
    if (!this.selectedStudent?.person_id) return;
    this.http.delete(`${Config.API_URL}/v1/student/${this.selectedStudent!.person_id}/exemptions/${id}`, { withCredentials: true })
      .subscribe(() => {
        this.refreshStudentData();
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

  // NOTE METHODS
  public refreshNotes(): void {
    if (!this.selectedStudent?.person_id) return;
    this.isLoadingNotes = true;
    this.http.get<StudentNote[]>(`${Config.API_URL}/v1/student/${this.selectedStudent!.person_id}/notes`, { withCredentials: true })
      .subscribe({
        next: (notes) => {
          this.studentNotes = notes;
          this.isLoadingNotes = false;
        },
        error: () => {
          this.isLoadingNotes = false;
        }
      });
  }

  public openAddNote(): void {
    this.modalManager.updateModal('add_note', 'title', 'students.add_note.title');
    this.modalManager.openModal('add_note', { note: { content: '', is_public: false }, saveNote: this.saveNote });
  }

  public openEditNote(note: StudentNote): void {
    this.modalManager.updateModal('add_note', 'title', 'students.edit_note.title');
    this.modalManager.openModal('add_note', { note, saveNote: this.saveNote });

  }

  public saveNote(): void {
    const editingNote = this.modalManager.getModalData('add_note').note;
    if (!editingNote || !editingNote.content?.trim()) return;

    const id = this.selectedStudent!.person_id;
    if (editingNote.note_id) {
      // Update
      this.http.patch(`${Config.API_URL}/v1/student/${id}/notes/${editingNote.note_id}`, editingNote, { withCredentials: true })
        .subscribe(() => {
          this.modalManager.closeModal('add_note');
          this.refreshNotes();
        });
    } else {
      // Create
      this.http.post(`${Config.API_URL}/v1/student/${id}/notes`, editingNote, { withCredentials: true })
        .subscribe(() => {
          this.modalManager.closeModal('add_note');
          this.refreshNotes();
        });
    }
  }

  public deleteNote(noteId: number): void {
    if (!confirm('Opravdu chcete smazat tuto poznámku?')) return;
    this.http.delete(`${Config.API_URL}/v1/student/${this.selectedStudent!.person_id}/notes/${noteId}`, { withCredentials: true })
      .subscribe(() => {
        this.refreshNotes();
      });
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

  public getRatingType(index: any): RatingType | null {
    if (index === null || index === undefined) return null;
    return this.messageManager.ratingTypes[index] || null;
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

  public getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      'praise': 'Pochvala',
      'reprimand': 'Důtka',
      'warning': 'Napomenutí',
      'reduced_behavior': 'Snížená známka z chování',
      'other': 'Jiné'
    };
    return labels[type] || type;
  }

  public getTypeIcon(type: string): string {
    const icons: Record<string, string> = {
      'praise': 'star',
      'reprimand': 'alert-triangle',
      'warning': 'alert-circle',
      'reduced_behavior': 'mood-sad',
      'other': 'file-text'
    };
    return icons[type] || 'file-text';
  }

  // Get grade color class
  public getGradeClass(grade: any): string {
    if (grade === null || grade === '-') return '';
    const g = typeof grade === 'number' ? grade : parseInt(grade);
    if (isNaN(g)) return '';
    if (g === 1) return 'stat--success';
    if (g >= 4) return 'stat--danger';
    if (g === 3) return 'stat--warning';
    return 'stat--primary';
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

    this.http.post(`${Config.API_URL}/v1/student/${this.selectedStudent!.person_id}/parent`, payload, {
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

  // Print Management
  public showPrintMenu = false;
  public togglePrintMenu() {
    this.showPrintMenu = !this.showPrintMenu;
  }

  // Address Management


  openEditAddress() {
    this.modalManager.openModal('edit_address', {
      student: this.selectedStudent!,
      callback: () => this.refreshStudentData()
    });
  }

  public printStudyConfirmation() {
    if (!this.selectedStudent) return;
    try {
      this.alert.alert('success', 'Generuji potvrzení o studiu...');
      const studentData = {
        ...this.selectedStudent,
        birthday: this.Utils.formatDateShort(this.selectedStudent.birthday) || '',
        full_name: this.selectedStudent.full_name || '',
        street: this.selectedStudent.street || '',
        house_number: this.selectedStudent.house_number || '',
        city_name: this.selectedStudent.city_name || '',
        postcode: this.selectedStudent.postcode || '',
        class_name: this.selectedStudent.class_name || '',
        field_of_study: this.selectedStudent.field_of_study || '',
        teacher_name: this.selectedStudent.teacher_name || ''
      };

      this.http.post(Config.API_URL + '/documents/generate', { 
        type: 'potvrzeni_studia', 
        student: studentData,
        currentDate: moment().format('DD. MM. YYYY')
      }, {
        withCredentials: true,
        responseType: 'blob'
      }).subscribe({
        next: (response: Blob) => {
          const url = window.URL.createObjectURL(response);
          window.open(url, '_blank');
          setTimeout(() => window.URL.revokeObjectURL(url), 100);
        },
        error: () => {
          this.alert.alert('error', 'Nepodařilo se vygenerovat potvrzení o studiu.');
        }
      });
    } catch (e) {
      this.alert.alert('error', 'Nepodařilo se vygenerovat potvrzení o studiu.');
    }
  }

  public printReportCard(type: string = 'vysvedceni') {
    if (!this.selectedStudent) return;
    this.showPrintMenu = false;
    try {
      this.alert.alert('success', 'Generuji vysvědčení...');
      
      // Calculating marks for both semesters
      const marksBySemester: any = {};
      this.marks.forEach((mark: any) => {
          const subject = mark.subject_name;
          if (!marksBySemester[subject]) {
              marksBySemester[subject] = { subject_name: subject, sem1: '-', sem2: '-' };
          }
          // Assuming we have a semester field or can derive it. 
          // If not available, we'll use current for whichever column makes sense.
          // For now let's assume the component has access to all grades or we mock the split.
          marksBySemester[subject].sem1 = mark.mark; 
          marksBySemester[subject].sem2 = mark.mark; 
      });

      const formattedMarks = Object.values(marksBySemester);

      const studentData = {
        ...this.selectedStudent,
        birthday: this.Utils.formatDateShort(this.selectedStudent.birthday) || '',
        full_name: this.selectedStudent.full_name || '',
        street: this.selectedStudent.street || '',
        house_number: this.selectedStudent.house_number || '',
        city_name: this.selectedStudent.city_name || '',
        postcode: this.selectedStudent.postcode || '',
        class_name: this.selectedStudent.class_name || '',
        field_of_study: this.selectedStudent.field_of_study || '',
        teacher_name: this.selectedStudent.teacher_name || ''
      };

      this.http.post(Config.API_URL + '/documents/generate', { 
        type: type, 
        student: studentData,
        marks: formattedMarks
      }, {
        withCredentials: true,
        responseType: 'blob'
      }).subscribe({
        next: (response: Blob) => {
          const url = window.URL.createObjectURL(response);
          window.open(url, '_blank');
          setTimeout(() => window.URL.revokeObjectURL(url), 100);
        },
        error: () => {
          this.alert.alert('error', 'Nepodařilo se vygenerovat vysvědčení.');
        }
      });
    } catch (e) {
      this.alert.alert('error', 'Nepodařilo se vygenerovat vysvědčení.');
    }
  }


}
