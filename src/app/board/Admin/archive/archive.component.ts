import { Component, inject, OnInit } from '@angular/core';
import { NgClass } from '@angular/common';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { Permission } from '@Schoolingo/permission';
import { ArchiveService, SchoolYear, ArchivedGrade, ClassbookEntry, AuditLogEntry } from '../../../infrastructure/archive/archive.service';
import moment from 'moment';

@Component({
  selector: 'app-archive',
  standalone: true,
  imports: [IconsModule],
  templateUrl: './archive.component.html',
  styleUrls: ['./archive.component.css']
})
export class ArchiveComponent implements OnInit {
  public l = inject(Locale);
  public perm = inject(Permission);
  public archiveService = inject(ArchiveService);

  public years: SchoolYear[] = [];
  public grades: ArchivedGrade[] = [];
  public classbook: ClassbookEntry[] = [];
  public auditLogs: AuditLogEntry[] = [];
  
  public selectedYear: SchoolYear | null = null;
  public activeTab: 'years' | 'grades' | 'classbook' | 'audit' = 'years';
  public loading = true;

  ngOnInit(): void {
    this.loadYears();
  }

  private loadYears(): void {
    this.loading = true;
    this.archiveService.loadYears().subscribe({
      next: (data) => {
        this.years = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  public selectYear(year: SchoolYear): void {
    this.selectedYear = year;
    this.loadGrades(year.year_id);
    this.loadClassbook(year.year_id);
    this.activeTab = 'grades';
  }

  private loadGrades(yearId: number): void {
    this.archiveService.loadGrades(yearId).subscribe({
      next: (data) => {
        this.grades = data;
      }
    });
  }

  private loadClassbook(yearId: number): void {
    this.archiveService.loadClassbook(yearId).subscribe({
      next: (data) => {
        this.classbook = data;
      }
    });
  }

  public loadAuditLog(): void {
    if (!this.perm.checkPermission(['admin'])) return;
    
    this.activeTab = 'audit';
    this.archiveService.loadAuditLog().subscribe({
      next: (response) => {
        this.auditLogs = response.logs;
      }
    });
  }

  public formatDate(date: Date): string {
    return moment(date).format('D. M. YYYY');
  }

  public formatDateTime(date: Date): string {
    return moment(date).format('D. M. YYYY HH:mm');
  }

  public backToYears(): void {
    this.selectedYear = null;
    this.activeTab = 'years';
    this.grades = [];
    this.classbook = [];
  }

  public setTab(tab: 'years' | 'grades' | 'classbook' | 'audit'): void {
    this.activeTab = tab;
  }
}
