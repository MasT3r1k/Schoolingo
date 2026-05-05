import { NgClass, NgStyle } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit, OnDestroy, effect } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Authentication } from '@Schoolingo/authentication';
import { Config } from '@Schoolingo/config';
import { ContextMenu } from '@Schoolingo/context-menu';
import { Dashboard } from '@Schoolingo/dashboard';
import { DropdownManager } from '@Schoolingo/dropdown';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { MarkConfig } from '@Schoolingo/marks';
import { MarksManager } from '@Schoolingo/marks';
import { MessageConfig, MessageManager } from '@Schoolingo/messages';
import { Permission, permType } from '@Schoolingo/permission';
import { School } from '@Schoolingo/school';
import { Sidebar } from '@Schoolingo/sidebar';
import { DiaryWeek, Traineeship } from '@Schoolingo/traineeship';
import { Utils } from '@Schoolingo/utils';
import moment from 'moment';
import { TokenExpirationService } from '../infrastructure/token-expiration/token-expiration.service';
import { SessionExpiredService } from '../infrastructure/session/session-expired.service';
import { ModalManager } from '@Schoolingo/modal';
import { TokenWarningModalComponent } from '@Components/token-warning-modal/token-warning-modal.component';
import { Subscription } from 'rxjs';
import { WsService, NotificationPayload } from '@Schoolingo/websocket';
import { SeasonalService } from '@Schoolingo/seasonal';
import { SnowEffectComponent } from '@Components/seasonal/snow-effect/snow-effect.component';
import { studentSummaryComponent } from '@Components/student-summary/student-summary.component';
import { UpdateModalComponent } from '@Components/update-modal/update-modal.component';
import { Cookies } from '@Schoolingo/cookies';
import { Country } from 'country-state-city';

export interface SidebarItem {
    item: string;
    type?: 'default' | 'danger';
    icon?: string;
    url?: string;
    permission?: permType[];
    children?: SidebarItem[];
    badge?: any;
    modules?: string[];
    action?: Function;
}

const notification_types: Record<string, any> = {
  new_message: {
    color: "#4aa3ff",
    icon: "message",
    title: "notifications.message.title",
    url: "/messages/received",
    close_after_action: true,
    description: "notifications.message.description"
  },
  new_login: {
    color: "#ff5757",
    icon: "lock",
    title: "notifications.new_login.title",
    url: "/user/logins",
    close_after_action: true,
    description: "notifications.new_login.description"
  },
  new_grade: {
    color: "#ffc107",
    icon: "star",
    title: "notifications.new_grade.title",
    url: "/marks/interm",
    close_after_action: true,
    description: "notifications.new_grade.description"
  },
  homework: {
    color: "#7cd67c",
    icon: "book-2",
    title: "notifications.homework.title",
    description: "notifications.homework.description"
  },
  reward: {
    color: "#f5d142",
    icon: "trophy",
    title: "notifications.reward.title",
    description: "notifications.reward.description"
  }
}

interface Notification {
  notification_id: number;
  type: string;
  data: any;
  url: any;
  read_at: Date | null;
  created_at: Date;
}

@Component({
  standalone: true,
  imports: [IconsModule, RouterLink, RouterLinkActive, NgStyle, NgClass, RouterOutlet, SnowEffectComponent],
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css', '../styles/sidebar.css']
})
export class BoardComponent implements OnInit, OnDestroy {
  constructor() {
    // Subscribe to dashboard cookie changes for seasonal service
    effect(() => {
      this.seasonalService.setCookiesConsent(this.dashboard.cookies());
    });
  }
  public dashboard = inject(Dashboard);
  private cookies = inject(Cookies);
  public dropdownManager = inject(DropdownManager);
  private tokenExpirationService = inject(TokenExpirationService);
  private sessionExpiredService = inject(SessionExpiredService);
  private modalManager = inject(ModalManager);
  private wsService = inject(WsService);
  public seasonalService = inject(SeasonalService);
  private subscriptions: Subscription[] = [];
  App = Config
  Utils = Utils;
  sidebarToggled = false;
  public notification_loading = true;
  public notification_count = 0;
  public updateAvailable = false;
  private router = inject(Router);
  public sidebar = inject(Sidebar);
  public sidebarClickHandler(item: SidebarItem, index: number): void {
    if (item.url) {
      this.sidebar.sidebarToggled = false;
      this.dropdownManager.selected_dropdown = '';
    } else {
      this.sidebar.toggleDropdown(index)
    }
  }
  private marks = inject(MarksManager);
  private messages = inject(MessageManager);
  private http = inject(HttpClient);
  public perm = inject(Permission);
  private traineeship = inject(Traineeship);
  public context_menu = inject(ContextMenu);
  school = inject(School);
  
  l = inject(Locale);
  u = inject(Authentication);

  public appClickHandler(): void {
    this.dropdownManager.selected_dropdown = '';
    this.context_menu.hideContextMenu();
    const expiresAt = this.tokenExpirationService.getExpiresAt();
    if (expiresAt && moment(expiresAt).diff(moment(), 'minutes') < 5) {
      this.u.refreshToken().subscribe({
        next: () => {
          console.log('[TokenWarning] Session extended successfully');
          this.modalManager.closeModal('token-warning');
        },
        error: (error) => {
          console.error('[TokenWarning] Failed to extend session:', error);
        }
      });
    }
  }

  public notifications_types = notification_types;
  public notifications: Notification[] = [];

  public getNotificationTitle(notification: Notification): string {
    const config = this.notifications_types[notification.type];
    if (!config) return '';
    const data = typeof notification.data === 'string' ? JSON.parse(notification.data) : notification.data;
    return this.l.s(config.title, data);
  }

  public getNotificationText(notification: Notification): string {
    const config = this.notifications_types[notification.type];
    if (!config) return '';
    const data = typeof notification.data === 'string' ? JSON.parse(notification.data) : notification.data;
    let text = this.l.s(config.description, data);
    Object.entries(data).forEach((arg) => {text = text.replaceAll(`%flag_${arg[0]}%`, `${Country.getCountryByCode(String(arg[1]))?.flag}`) ?? ''});
    return text;
  }

  public markAllAsRead(): void {
    this.notifications.forEach(n => n.read_at = new Date());
    this.dashboard.newNotifications.set(0);
    this.http.post(
      `${Config.API_URL}/v1/notification/-1`,
      {},
      { withCredentials: true }
    )
    .subscribe((data) => console.log(data));
  }

  // dropdown: 'add' | 'notification' | 'child' | 'user' | '' = '';

  private addDropdownConfig: SidebarItem[] = [
    {
      icon: 'mail',
      item: 'dropdown.add.message',
      url: "/messages/send",
      permission: ['all']
    },
    {
      icon: 'home-plus',
      item: 'dropdown.add.homework',
      permission: ['teacher']
    },
    {
      icon: 'calendar-week',
      item: 'dropdown.add.event',
      permission: ['teacher']
    },
    {
      icon: 'note',
      item: 'dropdown.add.note',
      permission: ['all']
    },
    {
      icon: 'clipboard-plus',
      item: 'dropdown.add.anketa',
      permission: ['teacher']
    },
    {
      icon: 'number-1',
      item: 'dropdown.add.mark',
      permission: ['teacher']
    },
    {
      icon: 'ambulance',
      item: 'dropdown.add.excuse',
      permission: ['parent', 'older:18']
    },
    {
      icon: 'category-plus',
      item: 'dropdown.add.request',
      permission: ['manager:admin']
    },
    {
      icon: 'building-plus',
      item: 'dropdown.add.company',
      permission: ['manager:traineeship:manage']
    }
  ];

  public addDropdown: SidebarItem[] = [];
  public buildAddDropdown(): void {
    this.addDropdown = [];
    const isDemo = this.school.config.getValue()?.demo_enabled;

    this.addDropdownConfig.forEach((item) => {
      if (this.perm.checkPermission(item.permission)) {
        if (isDemo) {
          const demoAllowed = ['dropdown.add.message', 'dropdown.add.mark'];
          if (!demoAllowed.includes(item.item)) return;
        }

        this.addDropdown.push(item);
      }
    })
  }

  userDropdown: SidebarItem[] = [
    {
      item: 'sidebar.account',
      icon: 'user',
      action: () => {
        this.router.navigate(['', 'user'])
      }
    },
    {
      item: 'sidebar.settings',
      icon: 'settings-2',
      action: () => {
        this.router.navigate(['', 'user', 'settings'])
      }
    },
    {
      item: 'user.logout',
      type: 'danger',
      icon: 'logout',
      action: () => {
        this.u.logout()
      }
    }
  ];

  ngOnInit(): void {
    // Register token warning modal
    this.modalManager.addModal(
      'token-warning',
      {
        title: '',
        closeable: false,
        index: 9999999,
        items: [
          { type: 'component', component: TokenWarningModalComponent }
        ]
      }
    );

    this.modalManager.addModal(
      'student_summary',
      {
        title: 'student_summary.title',
        title_placeholders: { year: '2024/25' },
        closeable: true,
        width: 1200,
        items: [
          { type: 'component', component: studentSummaryComponent }
        ]
      }
    )

    this.modalManager.addModal(
      'system_update',
      {
        title: 'system.update_title',
        closeable: true,
        width: 600,
        items: [
          { type: 'component', component: UpdateModalComponent }
        ]
      }
    )

    // if (this.perm.checkPermission(['student'])) {
    //   this.modalManager.openModal('student_summary')
    // }

    // Subscribe to token expiration warnings
    const warningSubscription = this.tokenExpirationService.warningThreshold$.subscribe(() => {
      this.modalManager.openModal('token-warning');
    });
    this.subscriptions.push(warningSubscription);

    // Subscribe to token expiration events
    const expiredSubscription = this.tokenExpirationService.expired$.subscribe(() => {
      this.sessionExpiredService.handleSessionExpired();
    });
    this.subscriptions.push(expiredSubscription);
    
    this.u.getAuthState().subscribe((data) => {
      this.sidebar.build();
      if (data) {
        // === Connect to WebSocket for real-time notifications ===
        this.wsService.connect();
        
        // Subscribe to real-time notifications
        const notifSubscription = this.wsService.getNotifications().subscribe((notification) => {
          // Add to notifications list
          this.notifications.unshift({
            notification_id: notification.id,
            type: notification.type,
            data: notification.data || {},
            url: notification.url || '',
            read_at: null,
            created_at: new Date()
          });
      
          // Update dashboard count
          this.dashboard.newNotifications.update(n => n + 1);
        });
        this.subscriptions.push(notifSubscription);
        
        // Subscribe to unread count updates
        const unreadSubscription = this.wsService.getUnreadCount().subscribe((count) => {
          this.dashboard.newNotifications.set(count);
        });
        this.subscriptions.push(unreadSubscription);
        
        // === Update add dropdown ===
        this.buildAddDropdown();

        // === Check for system updates ===
        if (this.perm.checkPermission(['manager:admin'])) {
          this.checkUpdates();
        }

        // === Get dashboard stats ===
        this.dashboard.fetchDashboard();

        // === Get traineeship weeks ===
        this.http.get(
          `${Config.API_URL}/v1/traineeship/diary_weeks`,
          { withCredentials: true }
        )
        .subscribe((data) => {
          if ('error' in data) {
            return;
          }

          if (!Array.isArray(data)) return;

          this.traineeship.diaryWeeks.next(
            data.map((_) => ({
              ..._,
              start: moment(_.start),
              end: moment(_.end)
            })) as DiaryWeek[]
          );
        });

        this.http.get(
          `${Config.API_URL}/v1/marks/config`,
          { withCredentials: true }
        )
        .subscribe((data) => {
          if ('error' in data) {
            return;
          }

          this.marks.setConfig(data as MarkConfig);
        })

        this.http.get(
          `${Config.API_URL}/v1/messages/config`,
          { withCredentials: true }
        )
        .subscribe((data) => {
          if ('error' in data) {
            return;
          }

          this.messages.setConfig(data as MessageConfig);
        })
      }
    })
  }

  public openNotificationDropdown(): void {
    if (this.dropdownManager.selected_dropdown !== 'notification') {
      this.loadNotifications()
    }
    this.dropdownManager.selected_dropdown = (this.dropdownManager.selected_dropdown == 'notification') ? '' : 'notification';
  }

  public loadNotifications(): void {
    this.http.get<Notification[]>(
      `${Config.API_URL}/v1/notifications`,
      { withCredentials: true }
    )
    .subscribe((data) => {
      this.notifications = data;
      this.notification_loading = false;
    });
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
    // Close WebSocket connection
    this.wsService.close();
  }

  public updateCookies(cookies: 'max' | 'min'): void {
    switch(cookies) {
      case 'max':
        this.cookies.acceptAll();
        break;
      case 'min':
        this.cookies.acceptEssentialOnly();
        break;
    }

    this.dashboard.cookies.set(this.cookies.preferencesToDecimal());
  }

  public getUserRole(): string {
    let roles = [this.l.s('roles.' + this.u.getRole())];
    if (this.u.getUser().manager == -1) {
      roles.push(this.l.s('roles.manager'))
    }

    return roles.join(', ');
  }

  public checkUpdates(): void {
    this.http.get<any>(`${Config.API_URL}/v1/version`, { withCredentials: true }).subscribe({
      next: (data) => {
        if (data.isBehind) {
          this.updateAvailable = true;
        }
      }
    });
  }

  public openUpdateModal(): void {
    this.modalManager.openModal('system_update');
  }

}
