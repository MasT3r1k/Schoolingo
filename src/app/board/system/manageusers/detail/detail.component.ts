import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, inject, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TabsComponent } from '@Components/Tabs';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { AvatarService } from '../../../../infrastructure/utils/avatar.service';
import { HttpClient } from '@angular/common/http';
import { Config } from '@Schoolingo/config';
import { User } from '../manageusers.component';
import { Utils } from '@Schoolingo/utils';
import { ModalManager } from '@Schoolingo/modal';
import { ResetPasswordManageUsersComponent } from '../modals/reset-password/reset-password.component';
import { Authentication } from '@Schoolingo/authentication';
import { MessageTemplateSettings, TemplateComponent } from '../../../messages/template/template.component';
import { StatCardComponent } from "@Components/stat-card/stat-card.component";

export interface UserDetail extends User {
  user_id: number | null;
  person_id: number | null;
  locale: string | null;
  theme: number | null;
  birthday: string | null;
  gender: string | null;
  '2fa': boolean;
  password_changed: string | null;
  emails: { email: string; is_verified: boolean; description: string | null }[];
  phones: { code: string; number: string; description: string | null; is_verified: boolean }[];
  login_history: { created: string; ip: string; user_agent: string; success: boolean }[];
  logins_7days: number;
  failed_logins_7days: number;
  student?: any;
  employee?: any;
  parent?: any;
  messages?: { id: number; topic: string; message: string; created_at: string; type: number }[];
  files?: { id: number; uuid: string; name: string; real_file_name: string; size: number; type: string; created_at: string }[];
  message_count?: number;
  file_count?: number;
}

@Component({
  imports: [CommonModule, IconsModule, FormsModule, TabsComponent, TemplateComponent, RouterLink, StatCardComponent],
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.css', '../../../students/detail/detail.component.css']
})
export class ManageUsersDetailComponent implements OnInit {
  public l = inject(Locale);
  public u = inject(Authentication);
  public router = inject(Router);
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  private modalManager = inject(ModalManager);
  public Utils = Utils;
  public avatarService = inject(AvatarService);
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

  public settings: MessageTemplateSettings = {
    no_items: 'messages.no_messages',
    list_message_header: 'receivers',
    select_item_title: 'messages.select_message',
    select_item_description: 'messages.select_message_desc',
    show_receivers: true,
    show_receivers_detailed: true,
    show_files: true,
    add_header_padding: false
  }

  storageLimit = 1073741824;

  // Loading state
  isLoading = false;
  loadError: string | null = null;

  selectedUser: UserDetail | null = null;

  public tabs: (typeof this.activeTab)[] = ['security', 'activity', 'messages', 'files'];

  activeTab: 'overview' | 'personal' | 'security' | 'activity' | 'messages' | 'files' = this.tabs[0];

  public getTabIcon(tab: typeof this.activeTab): string {
    const iconsMap: Record<string, string> = {
      overview: 'layout-dashboard',
      security: 'lock',
      activity: 'history',
      messages: 'message',
      files: 'files',
    };
    return iconsMap[tab] ?? 'help';
  }

  closeDetail() {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    if (returnUrl) {
      this.router.navigateByUrl(returnUrl);
    } else {
      this.router.navigate(['/', 'system', 'manageusers']);
    }
  }

  setActiveTab(tab: typeof this.activeTab) {
    this.activeTab = tab;
  }

  public resetPassword(): void {
    this.modalManager.openModal('manageusers_resetpassword', { user: this.selectedUser });
  }

  public changePassword(): void {
    this.router.navigate(['user', 'settings'], { queryParams: { page: 'change_password' } });
  }

  public getTargetId(): number | null {
    return parseInt(this.route.snapshot.paramMap.get('id') as string);
  }

  public toggleStatus(event?: Event): void {
    if (event) event.stopPropagation();
    if (!this.selectedUser) return;
    const newStatus = this.selectedUser.status === 'active' ? 'inactive' : 'active';
    this.http.patch<any>(
      `${Config.API_URL}/v1/system/users/${this.selectedUser.user_id}`,
      { active: newStatus === 'active' ? 1 : 0 },
      { withCredentials: true }
    ).subscribe({
      next: () => {
        if (this.selectedUser) {
          this.selectedUser.status = newStatus;
        }
      },
      error: (err) => {
        console.error('Error toggling status:', err);
      }
    });
  }

  ngOnInit(): void {
    const id = this.getTargetId();

    this.http.get<UserDetail>(
      `${Config.API_URL}/v1/system/users/${id}`,
      { withCredentials: true }
    ).subscribe((data: UserDetail) => this.selectedUser = data)

    this.modalManager.addModal(
      'manageusers_resetpassword',
      {
        icon: 'password-user',
        title: 'system.manage_users.reset_password.title',
        closeable: true,
        items: [
          {
            type: 'component', component: ResetPasswordManageUsersComponent
          }
        ]
      }
    )
  }
}
