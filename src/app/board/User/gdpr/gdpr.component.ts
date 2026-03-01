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
}

export interface GdprTraining {
  training_id: number;
  name: string;
  description: string;
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
  public adminTraining: GdprTraining[] = [];

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

  // GDPR consent types (client-side defaults/config)
  public consentTypesConfig = [
    { id: 'essential', icon: 'lock', color: '#6366f1' },
    { id: 'analytics', icon: 'chart-bar', color: '#8b5cf6' },
    { id: 'marketing', icon: 'mail', color: '#06b6d4' },
    { id: 'third_party', icon: 'users', color: '#f59e0b' },
    { id: 'profiling', icon: 'user-scan', color: '#ec4899' }
  ];

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
    this.http.get<{ training: GdprTraining[] }>(
      `${Config.API_URL}/v1/gdpr/admin/training`,
      { withCredentials: true }
    ).subscribe({
      next: (data) => {
        if (data.training) this.adminTraining = data.training;
      }
    });
  }

  // ACTIONS
  public updateConsent(consent: GdprConsent, status: boolean | null): void {
    const oldStatus = consent.granted;
    consent.granted = status;
    this.http.put(
      `${Config.API_URL}/v1/gdpr/consents`,
      { consent_id: consent.consent_id, granted: status },
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
}
