import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Config } from '@Schoolingo/config';
import { Locale } from '@Schoolingo/locale';
import { ModalManager } from '@Schoolingo/modal';
import { IconsModule } from '@Schoolingo/icons';

@Component({
  selector: 'app-update-modal',
  standalone: true,
  imports: [CommonModule, IconsModule],
  templateUrl: './update-modal.component.html',
  styleUrl: './update-modal.component.css'
})
export class UpdateModalComponent implements OnInit {
  private http = inject(HttpClient);
  public l = inject(Locale);
  private modalManager = inject(ModalManager);

  public versionInfo: any = null;
  public changelog: any[] = [];
  public loading = true;
  public updating = false;
  public updateStatus: any = null;

  ngOnInit(): void {
    this.fetchVersionInfo();
  }

  fetchVersionInfo(): void {
    this.http.get(`${Config.API_URL}/v1/version`, { withCredentials: true }).subscribe({
      next: (data: any) => {
        this.versionInfo = data;
        this.fetchChangelog();
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  fetchChangelog(): void {
    this.http.get(`${Config.API_URL}/v1/changelog`, { withCredentials: true }).subscribe({
      next: (data: any) => {
        this.changelog = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  performUpdate(): void {
    this.updating = true;
    this.http.post(`${Config.API_URL}/system/update/trigger`, {}, { withCredentials: true }).subscribe({
      next: (data: any) => {
        this.updateStatus = data;
        // Start polling for status if needed
        this.pollStatus();
      },
      error: (err) => {
        this.updating = false;
        console.error('Update failed:', err);
      }
    });
  }

  pollStatus(): void {
    const interval = setInterval(() => {
      this.http.get(`${Config.API_URL}/system/update/status`, { withCredentials: true }).subscribe({
        next: (status: any) => {
          this.updateStatus = status;
          if (!status.isUpdating && status.progress === 'Successful (Restart pending)') {
            clearInterval(interval);
            // Reload page after update
            setTimeout(() => window.location.reload(), 3000);
          }
          if (status.error) {
            clearInterval(interval);
            this.updating = false;
          }
        },
        error: () => clearInterval(interval)
      });
    }, 2000);
  }

  close(): void {
    this.modalManager.closeModal('system_update');
  }
}
