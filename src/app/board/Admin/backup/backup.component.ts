import { Component, inject, OnInit } from '@angular/core';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { Permission } from '@Schoolingo/permission';
import { BackupService, Backup } from '../../../infrastructure/backup/backup.service';
import moment from 'moment';

@Component({
  selector: 'app-backup',
  standalone: true,
  imports: [IconsModule],
  templateUrl: './backup.component.html',
  styleUrls: ['./backup.component.css']
})
export class BackupComponent implements OnInit {
  public l = inject(Locale);
  public perm = inject(Permission);
  public backupService = inject(BackupService);

  public backups: Backup[] = [];
  public loading = true;
  public creating = false;

  ngOnInit(): void {
    if (!this.perm.checkPermission(['admin'])) {
      return;
    }
    this.loadBackups();
  }

  private loadBackups(): void {
    this.loading = true;
    this.backupService.loadBackups().subscribe({
      next: (data) => {
        this.backups = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  public createBackup(): void {
    if (this.creating) return;
    
    this.creating = true;
    this.backupService.createBackup().subscribe({
      next: (response) => {
        if (response.success) {
          this.loadBackups();
        }
        this.creating = false;
      },
      error: () => {
        this.creating = false;
      }
    });
  }

  public downloadBackup(backup: Backup): void {
    this.backupService.downloadBackup(backup.filename);
  }

  public deleteBackup(backup: Backup): void {
    if (!confirm(`Opravdu chcete smazat zálohu ${backup.filename}?`)) return;

    this.backupService.deleteBackup(backup.filename).subscribe({
      next: (response) => {
        if (response.success) {
          this.backups = this.backups.filter(b => b.filename !== backup.filename);
        }
      }
    });
  }

  public restoreBackup(backup: Backup): void {
    if (!confirm('POZOR! Obnovení zálohy přepíše veškerá aktuální data. Pokračovat?')) return;
    if (!confirm('Opravdu chcete obnovit tuto zálohu? Tato akce je nevratná!')) return;

    this.backupService.restoreBackup(backup.filename).subscribe({
      next: (response) => {
        if (response.success) {
          alert('Záloha byla úspěšně obnovena.');
        }
      }
    });
  }

  public formatDate(date: Date): string {
    return moment(date).format('D. M. YYYY HH:mm:ss');
  }

  public formatSize(bytes: number): string {
    return this.backupService.formatSize(bytes);
  }

  public getRelativeTime(date: Date): string {
    return moment(date).fromNow();
  }
}
