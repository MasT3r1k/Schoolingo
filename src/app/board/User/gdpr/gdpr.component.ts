import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Config } from '@Schoolingo/config';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { BehaviorSubject, skip } from 'rxjs';
import { Authentication } from '@Schoolingo/authentication';
import { TabsComponent } from '@Components/Tabs';
import { School } from '@Schoolingo/school';
import { Utils } from '@Schoolingo/utils';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalManager } from '@Schoolingo/modal';
import { DeleteConfirmComponent } from './modals/delete-confirm/delete-confirm.component';

// --- INTERFACES ---

export interface GdprConsent {
  consent_id?: number;
  type: string;
  description?: string;
  purpose?: string;
  instructions?: string;
  granted: boolean | null;
  granted_at?: Date;
  expires_at?: Date;
  required: boolean;
  person_name?: string;
  target_user_id: number;
}

export interface GdprTraining {
  training_id: number;
  name: string;
  description: string;
  valid_days: number;
  valid_to: Date;
  questions_count: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'failed';
  score?: number;
}

export interface DataExportRequest {
  request_id?: number;
  status: 'pending' | 'processing' | 'ready' | 'expired';
  requested_at: Date;
  completed_at?: Date;
  download_url?: string;
}

export interface AdminGdprConsent {
  id: number;
  title: string;
  target_group: string;
  active: boolean;
  respondents_count: number;
  granted_count: number;
}

export interface AdminGdprReport {
  report_id: number;
  type: 'breach' | 'objection';
  subject: string;
  message: string;
  user_name: string;
  status: 'new' | 'processing' | 'closed';
  created_at: Date;
}

// --- COMPONENT ---

@Component({
  selector: 'app-gdpr',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule, TabsComponent],
  templateUrl: './gdpr.component.html',
  styleUrl: './gdpr.component.css'
})
export class GdprComponent implements OnInit {
  private http = inject(HttpClient);
  public auth = inject(Authentication);
  public school = inject(School);
  public l = inject(Locale);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private modalManager = inject(ModalManager);
  public Utils = Utils;

  // VIEW NAVIGATION
  public selectedView = new BehaviorSubject<number>(0);
  public ViewSelector: any = {
    overview: 0,
    consents: 1,
    training: 2,
    officer: 3,
    admin: 4
  };

  public tabsOptions = ['gdpr.tabs.overview', 'gdpr.tabs.consents', 'gdpr.tabs.training', 'gdpr.tabs.officer'];
  public tabsIcons = ['layout-dashboard', 'shield-check', 'school', 'user-shield'];

  // ADMIN VIEW NAVIGATION
  public selectedAdminView = new BehaviorSubject<number>(0);
  public AdminViewSelector: any = {
    consents: 0,
    training: 1,
    reports: 2,
    templates: 3,
    checklist: 4
  };

  public adminTabsOptions = ['gdpr.admin.tabs.consents', 'gdpr.admin.tabs.training', 'gdpr.admin.tabs.reports', 'gdpr.admin.tabs.templates', 'gdpr.admin.tabs.checklist'];
  public adminTabsIcons = ['shield-lock', 'certificate', 'clipboard-list', 'copy', 'checklist'];

  // DATA
  public consents: GdprConsent[] = [];
  public trainingList: GdprTraining[] = [];
  public dataExportRequests: DataExportRequest[] = [];
  
  // ADMIN DATA
  public adminConsents: AdminGdprConsent[] = [];
  public adminReports: AdminGdprReport[] = [];
  public adminTraining: (GdprTraining & { training_id: number })[] = [];
  public adminReviews: any[] = [];

  // ADMIN MODALS & FORMS
  public showConsentModal = false;
  public consentForm: any = {
    id: null,
    title: '',
    type: 'essential',
    description: '',
    purpose: '',
    instructions: '',
    required: false,
    target_group: 'all'
  };

  public showTrainingModal = false;
  public trainingForm: any = {
    id: null,
    name: '',
    description: '',
    valid_days: 365,
    target_group: 'all'
  };

  public showReportDetailModal = false;
  public selectedReport: AdminGdprReport | null = null;

  // LOADING STATES
  public loading = false;
  public exportLoading = false;
  public deleteAccountLoading = false;
  public showDeleteConfirm = false;
  public deleteConfirmText = '';

  // Breach/Objection Form
  public reportForm = {
    type: 'breach' as 'breach' | 'objection',
    subject: '',
    message: '',
    submitting: false,
    success: false
  };

  public consentTypesConfig = [
    { id: 'essential', icon: 'lock', color: '#6366f1' },
    { id: 'analytics', icon: 'chart-bar', color: '#8b5cf6' },
    { id: 'marketing', icon: 'mail', color: '#06b6d4' },
    { id: 'third_party', icon: 'users', color: '#f59e0b' },
    { id: 'profiling', icon: 'user-scan', color: '#ec4899' }
  ];

  public get stats() {
    return {
      granted: this.getGrantedConsentsCount(),
      denied: this.getDeniedConsentsCount(),
      pending: this.getNewConsentsCount()
    };
  }

  public get notifications() {
    const list = [];
    const newConsents = this.getNewConsentsCount();
    if (newConsents > 0) {
      list.push({
        id: 'new_consents',
        type: 'warning',
        title: this.l.s('gdpr.overview.new_consents', { count: newConsents }),
        date: new Date(),
        tag: this.l.s('gdpr.tabs.consents'),
        read: false
      });
    }
    const pendingTraining = this.getPendingTrainingCount();
    if (pendingTraining > 0) {
      list.push({
        id: 'pending_training',
        type: 'info',
        title: this.l.s('gdpr.overview.pending_training', { count: pendingTraining }),
        date: new Date(),
        tag: this.l.s('gdpr.tabs.training'),
        read: false
      });
    }
    return list;
  }

  public get parentConsents(): GdprConsent[] {
    return this.consents.filter(c => !c.person_name);
  }

  public get childConsents(): GdprConsent[] {
    return this.consents.filter(c => !!c.person_name);
  }

  ngOnInit(): void {
    if (this.auth.getRole() && ['management', 'admin_staff', 'manager'].includes(this.auth.getRole()!)) {
        this.tabsOptions.push('gdpr.tabs.admin');
        this.tabsIcons.push('settings');
        this.loadAdminData();
    }

    // Sync from URL
    this.route.params.subscribe(params => {
        if (params['tab']) {
            const tab = params['tab'];
            if (this.ViewSelector[tab] !== undefined) {
                this.selectedView.next(this.ViewSelector[tab]);
            }
        }
    });

    // Sync to URL
    this.selectedView.pipe(skip(1)).subscribe(index => {
        const tabName = Object.keys(this.ViewSelector).find(key => this.ViewSelector[key] === index);
        if (tabName) {
            this.router.navigate(['user', 'gdpr', tabName], { replaceUrl: true });
        }
    });

    // Modals
    this.modalManager.addModal('gdpr_delete-user', {
      title: 'gdpr.officer.actions.forget_me',
      icon: 'user-minus',
      closeable: true,
      items: [
        {  type: 'component', component: DeleteConfirmComponent }
      ]
    })

    this.loadAllData();
  }

  private loadAllData(): void {
    this.loadConsents();
    this.loadTraining();
    this.loadDataExportRequests();
  }

  private loadAdminData(): void {
    this.loadAdminConsents();
    this.loadAdminReports();
    this.loadAdminTraining();
    this.loadAdminReviews();
  }

  public openDeleteConfirmModal(): void {
    this.modalManager.openModal('gdpr_delete-user');
  }

  // DATA LOADING METHODS
  private loadConsents(): void {
    this.loading = true;
    this.http.get<{ consents: GdprConsent[] }>(
      `${Config.API_URL}/v1/gdpr/consents`,
      { withCredentials: true }
    ).subscribe({
      next: (data) => {
        if (data.consents) this.consents = data.consents;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  private loadTraining(): void {
    this.http.get<{ training: GdprTraining[] }>(
      `${Config.API_URL}/v1/gdpr/training`,
      { withCredentials: true }
    ).subscribe({
      next: (data) => {
        if (data.training) this.trainingList = data.training;
      }
    });
  }

  private loadDataExportRequests(): void {
    this.http.get<{ requests: DataExportRequest[] }>(
      `${Config.API_URL}/v1/gdpr/export-requests`,
      { withCredentials: true }
    ).subscribe({
      next: (data) => {
        if (data.requests) this.dataExportRequests = data.requests;
      }
    });
  }

  // ADMIN LOADING METHODS
  public loadAdminConsents(): void {
    this.http.get<{ consents: AdminGdprConsent[] }>(
      `${Config.API_URL}/v1/gdpr/admin/consents`,
      { withCredentials: true }
    ).subscribe({
      next: (data) => {
        if (data.consents) this.adminConsents = data.consents;
      }
    });
  }

  public loadAdminReports(): void {
    this.http.get<{ reports: AdminGdprReport[] }>(
      `${Config.API_URL}/v1/gdpr/admin/reports`,
      { withCredentials: true }
    ).subscribe({
      next: (data) => {
        if (data.reports) this.adminReports = data.reports;
      }
    });
  }

  public loadAdminTraining(): void {
    this.http.get<{ training: any[] }>(
      `${Config.API_URL}/v1/gdpr/admin/training`,
      { withCredentials: true }
    ).subscribe({
      next: (data) => {
        if (data.training) this.adminTraining = data.training;
      }
    });
  }

  public loadAdminReviews(): void {
    this.http.get<{ reviews: any[] }>(
      `${Config.API_URL}/v1/gdpr/admin/reviews`,
      { withCredentials: true }
    ).subscribe({
      next: (data) => {
        if (data.reviews) this.adminReviews = data.reviews;
      }
    });
  }

  // ADMIN ACTIONS - CONSENTS
  public openConsentModal(consent: any = null): void {
    if (consent) {
        this.consentForm = { ...consent };
    } else {
        this.consentForm = {
            id: null,
            title: '',
            type: 'essential',
            description: '',
            purpose: '',
            instructions: '',
            required: false,
            active: true,
            target_group: 'all'
        };
    }
    this.showConsentModal = true;
  }

  public saveConsent(): void {
    const url = `${Config.API_URL}/v1/gdpr/admin/consents` + (this.consentForm.id ? `/${this.consentForm.id}` : '');
    const method = this.consentForm.id ? 'put' : 'post';

    this.http[method](url, this.consentForm, { withCredentials: true }).subscribe({
        next: () => {
            this.showConsentModal = false;
            this.loadAdminConsents();
            this.loadConsents();
        }
    });
  }

  public deleteConsent(id: number): void {
    if (!confirm('Opravdu chcete tento souhlas smazat?')) return;
    this.http.delete(`${Config.API_URL}/v1/gdpr/admin/consents/${id}`, { withCredentials: true }).subscribe({
        next: () => this.loadAdminConsents()
    });
  }

  // ADMIN ACTIONS - TRAINING
  public openTrainingModal(training: any = null): void {
    if (training) {
        this.trainingForm = { ...training, id: training.training_id };
    } else {
        this.trainingForm = {
            id: null,
            name: '',
            description: '',
            valid_days: 365,
            target_group: 'all',
            active: true
        };
    }
    this.showTrainingModal = true;
  }

  public saveTraining(): void {
    const url = `${Config.API_URL}/v1/gdpr/admin/training` + (this.trainingForm.id ? `/${this.trainingForm.id}` : '');
    const method = this.trainingForm.id ? 'put' : 'post';

    this.http[method](url, this.trainingForm, { withCredentials: true }).subscribe({
        next: () => {
            this.showTrainingModal = false;
            this.loadAdminTraining();
            this.loadTraining();
        }
    });
  }

  public deleteTraining(id: number): void {
    if (!confirm('Opravdu chcete toto školení smazat?')) return;
    this.http.delete(`${Config.API_URL}/v1/gdpr/admin/training/${id}`, { withCredentials: true }).subscribe({
        next: () => this.loadAdminTraining()
    });
  }

  // ADMIN ACTIONS - REPORTS
  public openReportDetail(report: AdminGdprReport): void {
    this.selectedReport = report;
    this.showReportDetailModal = true;
  }

  public updateReportStatus(reportId: number, status: string): void {
    this.http.patch(`${Config.API_URL}/v1/gdpr/admin/reports/${reportId}/status`, { status }, { withCredentials: true }).subscribe({
        next: () => {
            this.loadAdminReports();
            if (this.selectedReport && this.selectedReport.report_id === reportId) {
                this.selectedReport.status = status as any;
            }
        }
    });
  }

  // ACTIONS
  public takeTest(tr: GdprTraining): void {
    if (tr.status === 'not_started') {
        tr.status = 'in_progress';
        this.http.patch(`${Config.API_URL}/v1/gdpr/training/${tr.training_id}/status`, { status: tr.status }, { withCredentials: true }).subscribe();
    }
  }

  public updateConsent(consent: GdprConsent, status: boolean | null): void {
    const oldStatus = consent.granted;
    consent.granted = status;
    this.http.put(
      `${Config.API_URL}/v1/gdpr/consents`,
      {
        consent_id: consent.consent_id,
        granted: status,
        target_user_id: consent.target_user_id
      },
      { withCredentials: true }
    ).subscribe({
      error: () => {
        consent.granted = oldStatus;
      }
    });
  }

  public grantAllOptional(): void {
    this.consents.filter(c => !c.required && c.granted !== true).forEach(consent => {
      this.updateConsent(consent, true);
    });
  }

  public revokeAllOptional(): void {
    this.consents.filter(c => !c.required && c.granted !== false).forEach(consent => {
      this.updateConsent(consent, false);
    });
  }

  public requestDataExport(): void {
    this.exportLoading = true;
    this.http.post(
      `${Config.API_URL}/v1/gdpr/export`,
      {},
      { withCredentials: true }
    ).subscribe({
      next: (response: any) => {
        if (response.request_id) {
          this.dataExportRequests.unshift({
            request_id: response.request_id,
            status: 'pending',
            requested_at: new Date()
          });
        }
        this.exportLoading = false;
      },
      error: () => this.exportLoading = false
    });
  }

  public downloadExport(request: DataExportRequest): void {
    if (request.download_url) window.open(request.download_url, '_blank');
  }

  public requestAccountDeletion(): void {
    if (this.deleteConfirmText.toLowerCase() !== 'smazat účet') return;
    this.deleteAccountLoading = true;
    this.http.delete(
      `${Config.API_URL}/v1/gdpr/account`,
      { withCredentials: true }
    ).subscribe({
      next: () => window.location.href = '/login',
      error: () => this.deleteAccountLoading = false
    });
  }

  public submitReport(): void {
    if (!this.reportForm.subject || !this.reportForm.message) return;
    this.reportForm.submitting = true;
    this.http.post(
      `${Config.API_URL}/v1/gdpr/report`,
      {
        type: this.reportForm.type,
        subject: this.reportForm.subject,
        message: this.reportForm.message
      },
      { withCredentials: true }
    ).subscribe({
      next: () => {
        this.reportForm.submitting = false;
        this.reportForm.success = true;
        this.reportForm.subject = '';
        this.reportForm.message = '';
        setTimeout(() => this.reportForm.success = false, 5000);
      },
      error: () => this.reportForm.submitting = false
    });
  }

  // HELPERS
  public getConsentIcon(typeId: string): string {
    return this.consentTypesConfig.find(t => t.id === typeId)?.icon || 'shield-check';
  }

  public getConsentColor(typeId: string): string {
    return this.consentTypesConfig.find(t => t.id === typeId)?.color || 'var(--primary)';
  }

  public getNewConsentsCount(): number {
    return this.consents.filter(c => c.granted === null).length;
  }

  public getPendingTrainingCount(): number {
    return this.trainingList.filter(t => t.status === 'not_started' || t.status === 'in_progress').length;
  }

  public getGrantedConsentsCount(): number {
    return this.consents.filter(c => c.granted === true).length;
  }

  public getDeniedConsentsCount(): number {
    return this.consents.filter(c => c.granted === false).length;
  }

  public getNotificationIcon(type: string): string {
    switch (type) {
      case 'warning': return 'alert-triangle';
      case 'danger': return 'alert-circle';
      case 'success': return 'circle-check';
      case 'info':
      default: return 'info-circle';
    }
  }
}
