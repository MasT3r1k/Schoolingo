import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '@Schoolingo/icons';
import { ModalManager } from '@Schoolingo/modal';
import { Locale } from '@Schoolingo/locale';
import { HttpClient } from '@angular/common/http';
import { Config } from '@Schoolingo/config';
import { AvatarService } from '../../../../../infrastructure/utils/avatar.service';
import { Authentication } from '@Schoolingo/authentication';

@Component({
  selector: 'app-share-report-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule],
  template: `
    <div class="modal-body">
      <div class="form-group input-icon-wrap">
        <i-tabler name="search"></i-tabler>
        <input type="text" [(ngModel)]="shareSearch"
          [placeholder]="l.s('reports.share_report.search_user')" />
      </div>

      <div class="user-list">
        @if (isLoadingShares || isLoadingUsers) {
        <div class="modal-loading">
          <div class="spinner"></div>
        </div>
        } @else {
        @for (user of filteredUsers; track user.user_id) {
        <div class="user-item" [class.is-shared]="isUserShared(user.user_id)">
          <div class="user-avatar">
            <img [src]="avatarService.getAvatar(user.avatar, user.full_name || user.username)" [alt]="user.full_name" />
          </div>
          <div class="user-info">
            <span class="uname">{{ user.full_name || user.username }}</span>
            <span class="urole">{{ l.s('roles.' + user.role) }}</span>
          </div>
          <button class="share-toggle-btn" [class.active]="isUserShared(user.user_id)" (click)="toggleShare(user)">
             @if (isToggling === user.user_id) {
                <div class="spinner mini"></div>
             } @else {
                <i-tabler [name]="isUserShared(user.user_id) ? 'check' : 'plus'"></i-tabler>
                {{ l.s('reports.share_report.' + (isUserShared(user.user_id) ? 'shared' : 'share')) }}
             }
          </button>
        </div>
        } @empty {
        <div class="no-results">{{ l.s('auth.errors.invalid_username') }}</div>
        }
        }
      </div>

      <div class="modal-actions">
        <button class="btn btn--primary" (click)="close()">{{ l.s('buttons.done') }}</button>
      </div>
    </div>
  `,
  styles: [`
    .user-list {
      max-height: 350px;
      overflow-y: auto;
      margin-bottom: 1.5rem;
    }
    .user-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      border-radius: var(--radius);
      border: 1px solid var(--border);
      transition: background 0.2s;
    }
    .user-item:hover {
      background: var(--hover-bg);
    }
    .user-item.is-shared {
      border-color: var(--primary);
    }
    .user-avatar {
      width: 38px;
      height: 38px;
      background: var(--hover-bg);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      color: var(--text-muted);
    }
    .user-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .user-info {
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    .uname {
      font-weight: 600;
      font-size: 13.5px;
    }
    .urole {
      font-size: 11px;
      color: var(--text-muted);
    }
    .share-toggle-btn {
      min-width: 90px;
      justify-content: center;
      padding: 0.5rem 0.75rem;
      border-radius: 6px;
      border: 1px solid var(--border);
      background: var(--surface);
      color: var(--text);
      font-size: 12px;
      display: flex;
      align-items: center;
      gap: 0.4rem;
      cursor: pointer;
      transition: all 0.2s;
    }
    .share-toggle-btn i-tabler {
      width: 14px;
      height: 14px;
    }
    .share-toggle-btn.active {
      background: var(--primary);
      border-color: var(--primary);
      color: #fff;
    }
    .modal-loading {
      padding: 2rem;
      display: flex;
      justify-content: center;
    }
    .spinner {
      width: 24px;
      height: 24px;
      border: 3px solid var(--border);
      border-top-color: var(--primary);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    .spinner.mini {
      width: 14px;
      height: 14px;
      border-width: 2px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class ShareReportModalComponent implements OnInit {
  private modalManager = inject(ModalManager);
  private http = inject(HttpClient);
  private auth = inject(Authentication);
  public l = inject(Locale);
  public avatarService = inject(AvatarService);

  public report: any;
  public reportShares: any[] = [];
  public allUsers: any[] = [];
  public filteredUsers: any[] = [];
  public isLoadingShares = false;
  public isLoadingUsers = false;
  public isToggling: number | null = null;
  private _shareSearch = '';

  get shareSearch() { return this._shareSearch; }
  set shareSearch(v: string) {
    this._shareSearch = v;
    this.filterUsers();
  }

  ngOnInit(): void {
    const data = this.modalManager.getModalData('share_report');
    this.report = data.report;
    this.loadReportShares();
    this.loadTeachers();
  }

  public loadTeachers() {
    this.isLoadingUsers = true;
    this.http.get<any>(`${Config.API_URL}/v1/system/users?role=teacher&limit=1000`, { withCredentials: true })
      .subscribe({
        next: (res) => {
          this.allUsers = res.data || [];
          this.filterUsers();
          this.isLoadingUsers = false;
        },
        error: () => this.isLoadingUsers = false
      });
  }

  public loadReportShares() {
    this.isLoadingShares = true;
    this.http.get<any>(`${Config.API_URL}/v1/system/reports/${this.report.report_id}/shares`, { withCredentials: true })
      .subscribe({
        next: (res) => {
          this.reportShares = res.data || [];
          this.isLoadingShares = false;
        },
        error: () => {
          this.isLoadingShares = false;
        }
      });
  }

  public filterUsers() {
    const currentUserId = this.auth.getUser()?.user_id;
    const ownerId = this.report.user_id;
    let users = this.allUsers.filter(u => u.user_id !== currentUserId && u.user_id !== ownerId);

    if (this.shareSearch) {
      const s = this.shareSearch.toLowerCase();
      users = users.filter(u => 
        u.username?.toLowerCase().includes(s) || 
        u.full_name?.toLowerCase().includes(s)
      );
    }
    
    this.filteredUsers = users.slice(0, 50);
  }

  public isUserShared(userId: number): boolean {
    return this.reportShares.some(s => s.user_id === userId);
  }

  public toggleShare(user: any) {
    if (this.isToggling) return;
    this.isToggling = user.user_id;
    const isShared = this.isUserShared(user.user_id);
    if (isShared) {
      this.http.delete<any>(`${Config.API_URL}/v1/system/reports/${this.report.report_id}/share/${user.user_id}`, { withCredentials: true })
        .subscribe({
          next: () => {
            this.reportShares = this.reportShares.filter(s => s.user_id !== user.user_id);
            this.isToggling = null;
          },
          error: () => this.isToggling = null
        });
    } else {
      this.http.post<any>(`${Config.API_URL}/v1/system/reports/${this.report.report_id}/share`, {
        user_id: user.user_id
      }, { withCredentials: true }).subscribe({
        next: () => {
          this.reportShares.push({ user_id: user.user_id });
          this.isToggling = null;
        },
        error: () => this.isToggling = null
      });
    }
  }

  public close(): void {
    this.modalManager.closeModal('share_report');
  }
}
