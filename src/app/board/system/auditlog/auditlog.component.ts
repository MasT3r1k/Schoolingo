import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@Schoolingo/icons';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Config } from '@Schoolingo/config';
import { Utils } from '@Schoolingo/utils';
import { Locale } from '@Schoolingo/locale';
import { DropdownManager } from '@Schoolingo/dropdown';

// ... interfaces ... (unchanged)
export interface AuditLogEntry {
  id: number;
  action: 'login' | 'logout' | 'create' | 'update' | 'delete' | 'failed_login' | 'password_reset';
  userId: number;
  username: string;
  userFullName: string;
  userRole: string;
  targetType?: string; // e.g., 'student', 'grade', 'user'
  targetId?: number;
  targetName?: string;
  details?: {
    ipAddress?: string;
    userAgent?: string;
    device?: string;
    browser?: string;
    changes?: Record<string, any>;
    reason?: string;
    sessionDuration?: string;
  };
  timestamp: string;
  createdAt: string;
}

export interface AuditFilters {
  search: string;
  action: 'all' | 'login' | 'logout' | 'create' | 'update' | 'delete' | 'failed_login';
  userRole: 'all' | 'admin' | 'teacher' | 'student' | 'parent';
  timeRange: 'today' | 'week' | 'month' | 'custom';
  dateFrom?: string;
  dateTo?: string;
}

// Backend API response interface
interface AuditLogAPIResponse {
  data: {
    logId: number;
    action: string;
    userId: number;
    username: string;
    userFullName: string;
    userRole: string;
    targetType?: string;
    targetId?: number;
    targetName?: string;
    ipAddress?: string;
    userAgent?: string;
    metadata?: Record<string, any>;
    timestamp: string;
    createdAt: string;
  }[];
  meta: {
    total: number;
    page: number;
    limit: number;
  }
}

@Component({
  selector: 'app-auditlog',
  standalone: true,
  imports: [CommonModule, IconsModule, FormsModule],
  templateUrl: './auditlog.component.html',
  styleUrl: './auditlog.component.css'
})
export class AuditlogComponent implements OnInit {
  private http = inject(HttpClient);
  public l = inject(Locale)
  public Utils = Utils;
  public dropdownManager = inject(DropdownManager);

  // Loading state
  isLoading = false;
  loadError: string | null = null;

  // Filters
  filters: AuditFilters = {
    search: '',
    action: 'all',
    userRole: 'all',
    timeRange: 'today'
  };

  public getFilterLabel(type: 'action' | 'userRole' | 'timeRange', value: string): string {
    const options = this.getFilterOptions(type);
    return options.find(o => o.value === value)?.label || value;
  }

  public getFilterOptions(type: 'action' | 'userRole' | 'timeRange'): {value: string, label: string}[] {
    switch(type) {
      case 'action':
        return [
          {value: 'all', label: 'Všechny akce'},
          {value: 'login', label: 'Přihlášení'},
          {value: 'logout', label: 'Odhlášení'},
          {value: 'create', label: 'Vytvoření'},
          {value: 'update', label: 'Úprava'},
          {value: 'delete', label: 'Smazání'},
          {value: 'failed_login', label: 'Neúspěšné přihlášení'}
        ];
      case 'userRole':
        return [
          {value: 'all', label: 'Všichni uživatelé'},
          {value: 'admin', label: 'Administrátoři'},
          {value: 'teacher', label: 'Učitelé'},
          {value: 'student', label: 'Studenti'},
          {value: 'parent', label: 'Rodiče'}
        ];
      case 'timeRange':
        return [
          {value: 'today', label: 'Dnes'},
          {value: 'week', label: 'Tento týden'},
          {value: 'month', label: 'Tento měsíc'},
          {value: 'custom', label: 'Vlastní rozsah'}
        ];
      default: return [];
    }
  }

  // Pagination
  currentPage = 1;
  pageSize = 20;
  totalItems = 0;
  totalPages = 0;

  // Audit log entries from API
  auditLogs: AuditLogEntry[] = [];

  ngOnInit() {
    this.loadAuditLogs();
  }

  // Load audit logs from API
  loadAuditLogs(page = this.currentPage) {
    this.currentPage = page;
    this.isLoading = true;
    this.loadError = null;

    // Build params
    let params: any = {
      limit: this.pageSize,
      offset: (page - 1) * this.pageSize,
      search: this.filters.search,
    };

    if (this.filters.action !== 'all') params.action = this.filters.action;
    if (this.filters.userRole !== 'all') params.userRole = this.filters.userRole;
    if (this.filters.timeRange !== 'custom') {
      params.timeRange = this.filters.timeRange;
    } else {
      if (this.filters.dateFrom) params.dateFrom = this.filters.dateFrom;
      if (this.filters.dateTo) params.dateTo = this.filters.dateTo;
    }

    this.http.get<AuditLogAPIResponse>(
      `${Config.API_URL}/v1/system/audit`,
      {
        withCredentials: true,
        params: params
      }
    ).subscribe({
      next: (response) => {
        // Transform API response
        this.auditLogs = response.data.map(apiLog => this.transformAuditLog(apiLog));

        // Update pagination
        this.totalItems = response.meta.total;
        this.totalPages = Math.ceil(this.totalItems / this.pageSize);

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading audit logs:', error);
        this.loadError = 'Nepodařilo se načíst auditní protokol';
        this.isLoading = false;
        this.auditLogs = [];
      }
    });
  }

  // Handle filter changes
  onFilterChange() {
    this.loadAuditLogs(1); // Reset to first page
  }

  // Clear all filters
  clearFilters() {
    this.filters = {
      search: '',
      action: 'all',
      userRole: 'all',
      timeRange: 'today'
    };
    this.loadAuditLogs(1);
  }

  // Pagination controls
  getPageList(): number[] {
    let pages = [-4, -3, -2, -1, 0, 1, 2, 3, 4];
    let list: number[] = [];
    pages.forEach((page: number) => {
      list.push(page + this.currentPage);
    })

    let startSlice = 0;
    if (this.currentPage == 4 || this.currentPage == this.totalPages - 1) {
      startSlice = 1;
    } else if (this.currentPage > 3 && this.currentPage <= this.totalPages - 2) {
      startSlice = 2;
    }

    return list.filter((page) => page > 0 && page <= this.totalPages).slice(startSlice).slice(0, 5);
  }

  // Transform API response
  private transformAuditLog(apiLog: AuditLogAPIResponse['data'][0]): AuditLogEntry {
    return {
      id: apiLog.logId,
      action: this.mapAction(apiLog.action),
      userId: apiLog.userId,
      username: apiLog.username,
      userFullName: apiLog.userFullName,
      userRole: apiLog.userRole,
      targetType: apiLog.targetType,
      targetId: apiLog.targetId,
      targetName: apiLog.targetName,
      details: {
        ipAddress: apiLog.ipAddress,
        userAgent: apiLog.userAgent,
        device: this.parseDevice(apiLog.userAgent),
        browser: this.parseBrowser(apiLog.userAgent),
        changes: apiLog.metadata?.['changes'],
        reason: apiLog.metadata?.['reason'],
        sessionDuration: apiLog.metadata?.['sessionDuration']
      },
      timestamp: apiLog.timestamp,
      createdAt: apiLog.createdAt
    };
  }

  // Map backend action to frontend action
  private mapAction(action: string): AuditLogEntry['action'] {
    switch (action.toLowerCase()) {
      case 'login':
      case 'user_login':
        return 'login';
      case 'logout':
      case 'user_logout':
        return 'logout';
      case 'create':
      case 'created':
        return 'create';
      case 'update':
      case 'updated':
      case 'edit':
        return 'update';
      case 'delete':
      case 'deleted':
        return 'delete';
      case 'failed_login':
      case 'login_failed':
        return 'failed_login';
      case 'password_reset':
        return 'password_reset';
      default:
        return 'update';
    }
  }

  // Parse device from user agent
  private parseDevice(userAgent?: string): string {
    if (!userAgent) return 'Neznámé zařízení';

    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS')) return 'iOS';

    return 'Neznámé zařízení';
  }

  // Parse browser from user agent
  private parseBrowser(userAgent?: string): string {
    if (!userAgent) return 'Neznámý prohlížeč';

    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    if (userAgent.includes('Opera')) return 'Opera';

    return 'Neznámý prohlížeč';
  }

  // Get action title
  getActionTitle(action: string): string {
    switch (action) {
      case 'login': return 'Úspěšné přihlášení';
      case 'logout': return 'Odhlášení';
      case 'create': return 'Vytvoření záznamu';
      case 'update': return 'Úprava záznamu';
      case 'delete': return 'Smazání záznamu';
      case 'failed_login': return 'Neúspěšný pokus o přihlášení';
      case 'password_reset': return 'Resetování hesla';
      default: return action;
    }
  }

  // Get action icon
  getActionIcon(action: string): string {
    switch (action) {
      case 'login': return 'login';
      case 'logout': return 'logout';
      case 'create': return 'plus';
      case 'update': return 'edit';
      case 'delete': return 'trash';
      case 'failed_login': return 'alert-triangle';
      case 'password_reset': return 'key';
      default: return 'activity';
    }
  }

  // Get audit dot class
  getAuditDotClass(action: string): string {
    switch (action) {
      case 'login':
      case 'create':
        return 'success';
      case 'logout':
      case 'update':
      case 'password_reset':
        return 'info';
      case 'failed_login':
        return 'warning';
      case 'delete':
        return 'danger';
      default:
        return 'info';
    }
  }

  // Format timestamp
  formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Právě teď';
    if (diffMins < 60) return `Před ${diffMins} minutami`;
    if (diffHours < 24) return `Před ${diffHours} hodinami`;
    if (diffDays < 7) return `Před ${diffDays} dny`;

    return date.toLocaleDateString('cs-CZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Get user initials
  getUserInitials(fullName: string): string {
    const parts = fullName.split(' ');
    if (parts.length >= 2) {
      return parts[0][0] + parts[1][0];
    }
    return fullName.substring(0, 2).toUpperCase();
  }

  // Export audit log
  exportAuditLog() {
    console.log('Export audit log');
    // TODO: Implement export functionality
  }

  // Open advanced filters
  openAdvancedFilters() {
    console.log('Open advanced filters');
    // TODO: Open advanced filters modal
  }
}
