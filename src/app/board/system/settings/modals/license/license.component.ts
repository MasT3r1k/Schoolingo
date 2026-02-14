
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Config } from '@Schoolingo/config';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { Utils } from '@Schoolingo/utils';
import { ModalManager } from '@Schoolingo/modal';

@Component({
  standalone: true,
  imports: [CommonModule, IconsModule],
  templateUrl: './license.component.html',
  styleUrls: ['./license.component.css']
})
export class LicenseModalComponent implements OnInit {
  public Config = Config;
  private http = inject(HttpClient);
  private modalManager = inject(ModalManager);
  public l = inject(Locale);
  public Utils = Utils;

  public license: any = null;
  public isLoading = true;

  ngOnInit(): void {
      this.loadLicense();
  }

  public loadLicense(): void {
      this.http.get<any>(`${Config.API_URL}/v1/system`, { withCredentials: true }).subscribe({
          next: (data) => {
              // Extract license info from system settings
              const settings = data.settings;
              
              this.license = {
                  type: settings.license_type || 'FREE',
                  status: (settings.license_until && new Date(settings.license_until) < new Date()) ? 'expired' : 'active',
                  validUntil: settings.license_until ? new Date(settings.license_until) : null,
                  maxStudents: settings.studentsLimit,
                  currentStudents: data.student_count,
                  modules: settings.modules ? settings.modules.split(',') : [],
                  schoolName: settings.name,
                  schoolCode: settings.code,
                  supportLevel: settings.license_type === 'ENTERPRISE' ? 'Priority 24/7' : 'Standard',
                  storageLimit: settings.license_type === 'ENTERPRISE' ? 'Neomezeno' : '50 GB',
                  lastCheck: new Date(),
                  year: new Date().getFullYear()
              };

              // Mock some data if missing
              if (!this.license.modules || this.license.modules.length === 0) {
                  this.license.modules = ['System', 'Správa uživatelů', 'Rozvrh', 'Klasifikace', 'Docházka'];
              }

              setTimeout(() => {
                  this.isLoading = false;
              }, 500); 
          },
          error: (err) => {
              console.error('Failed to load license info', err);
              this.isLoading = false;
          }
      });
  }

  public getUsagePercent(): number {
      if (!this.license || this.license.maxStudents === -1) return 0;
      return Math.min(100, (this.license.currentStudents / this.license.maxStudents) * 100);
  }

  public copyLicenseKey(): void {
      // Mock license key generation
      if (!this.license || !this.license.schoolCode) return;
      const key = `SCH-${this.license.schoolCode.toUpperCase()}-${new Date().getFullYear()}-X892`;
      navigator.clipboard.writeText(key).then(() => {
          // Toast or change icon could be nice here, for now system alert or just do nothing visually
          /* alert('Licenční klíč zkopírován'); */
      });
  }

  public close(): void {
    this.modalManager.closeModal('license');
  }
}
