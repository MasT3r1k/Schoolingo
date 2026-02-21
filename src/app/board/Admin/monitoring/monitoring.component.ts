import { Component, OnInit, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule, SlicePipe, DatePipe } from '@angular/common';
import { Config } from '@Schoolingo/config'; 
import { Locale } from '@Schoolingo/locale';
import { IconsModule } from '@Schoolingo/icons';
import { Utils } from '@Schoolingo/utils';
import { TabsComponent } from "@Components/Tabs";
import { BehaviorSubject, Subscription } from 'rxjs';

@Component({
  selector: 'app-monitoring',
  standalone: true,
  imports: [CommonModule, IconsModule, SlicePipe, DatePipe, TabsComponent],
  templateUrl: './monitoring.component.html',
  styleUrls: ['./monitoring.component.css']
})
export class MonitoringComponent implements OnInit {
  private http = inject(HttpClient);
  public l = inject(Locale);
  private subscribers: Subscription[] = [];
  
  stats: any = null;
  topPages: any[] = [];
  topUsers: any[] = [];
  chartData: { label: string; value: number; height?: number; isPeak?: boolean; isLow?: boolean }[] = [];
  activityChartData: { label: string; value: number; height?: number; isZero?: boolean }[] = [];
  browserStats: any[] = [];
  osStats: any[] = [];
  loading = true;
  error: string | null = null;
  selectedPeriodTab = new BehaviorSubject<number>(0);
  period: string = 'day';

  // Derived
  yAxisTicks: string[] = [];
  peakRange: string = '—';
  lowRanges: string[] = [];

  // Uptime / System Status
  uptimeData: any = null;
  uptimeDays: number = 7;
  uptimeLoading = false;

  private maxPageVisits = 1;
  private maxUserActions = 1;

  ngOnInit() {
    this.fetchStats();
    this.loadUptime(this.uptimeDays);
    this.subscribers.push(this.selectedPeriodTab.subscribe((period) => {
      const periodRanges = ['day', 'week', 'month'];
      if (this.period == periodRanges[period]) return;
      this.period = periodRanges[period];
      this.fetchStats();
    }))
  }

  /** Načte uptime historii z backendu */
  loadUptime(days: number) {
    this.uptimeDays = days;
    this.uptimeLoading = true;
    this.http.get<any>(`${Config.API_URL}/v1/admin/analytics/uptime`, {
        params: { days: String(days) }
    }).subscribe({
        next: (data) => { this.uptimeData = data; this.uptimeLoading = false; },
        error: ()     => { this.uptimeData = null; this.uptimeLoading = false; }
    });
  }

  fetchStats() {
    this.loading = true;
    this.error = null;

    this.http.get<any>(`${Config.API_URL}/v1/admin/analytics/stats`, {
        params: { period: this.period }
    }).subscribe({
        next: (data) => {
            this.stats = data;
            this.topPages = data.pages || [];
            this.topUsers = data.topUsers || [];
            
            // Process visits chart
            const rawChart = data.chartData || [];
            const maxVal = Math.max(...rawChart.map((d: any) => d.value), 1);
            const minVal = Math.min(...rawChart.map((d: any) => d.value), 0);

            this.chartData = rawChart.map((d: any) => ({
                ...d,
                height: Math.max((d.value / maxVal) * 100, d.value > 0 ? 4 : 0),
                isPeak: d.value === maxVal && maxVal > 0,
                isLow: d.value === minVal && rawChart.length > 1
            }));

            // Y-axis ticks (5 levels)
            const step = Math.ceil(maxVal / 4);
            this.yAxisTicks = [
                String(maxVal),
                String(step * 3),
                String(step * 2),
                String(step),
                '0'
            ];

            // Activity chart
            this.activityChartData = this.generateActivityData(data.hourlyActivity);

            // Browser & OS stats
            this.browserStats = this.generateBrowserStats(data.browsers || []);
            this.osStats = this.generateOSStats(data.operatingSystems || []);

            // Max page visits for bar widths
            this.maxPageVisits = Math.max(...this.topPages.map((p: any) => p.nb_visits || 0), 1);
            this.maxUserActions = Math.max(...this.topUsers.map((u: any) => u.actions || 0), 1);

            this.loading = false;
        },
        error: (err) => {
            console.error('Stats error', err);
            this.error = 'admin.monitoring.error';
            this.loading = false;
        }
    });
  }



  setPeriod(period: string) {
    if (this.period !== period) {
        this.period = period;
        this.fetchStats();
    }
  }

  /** Generate hourly activity data (mock or from backend) */
  generateActivityData(hourlyActivity?: any[]) {
    let hours: string[] = [];
    let values: number[] = [];

    if (hourlyActivity && hourlyActivity.length > 0) {
      hours = hourlyActivity.map((h: any) => h.hour);
      values = hourlyActivity.map((h: any) => h.count);
    } else {
      // Representative school-day mock data (24 hours)
      for(let i = 0;i < [].constructor(24);i++) {
        hours.push(Utils.addZeros(i, 2).toString())
        values.push(0)
      }
    }

    const maxVal = Math.max(...values, 1);
    const minVal = Math.min(...values);

    const allZero = values.every(v => v === 0);

    if (allZero) {
      // Žádná data z backendu — zobraz prázdné stubby a vymaž insights
      this.peakRange = 'Žádná data';
      this.lowRanges = [];
      return hours.map(hour => ({
        label: `${hour}`,
        value: 0,
        height: 8,   // viditelný stub
        isZero: true
      }));
    }

    // Největší aktivita: skupiny hodin >= 70 % maxima → zobrazit jako jeden rozsah
    const peakThreshold = maxVal * 0.70;
    const peakGroups = this.groupConsecutive(values, (v) => v >= peakThreshold);
    this.peakRange = this.groupsToLabel(hours, peakGroups) || '—';

    // Nejmenší aktivita: skupiny hodin <= max(minVal, 5 % maxima)
    const lowThreshold = Math.max(minVal, Math.floor(maxVal * 0.05));
    const lowGroups = this.groupConsecutive(values, (v) => v <= lowThreshold);
    this.lowRanges = lowGroups
      .map(g => this.groupsToLabel(hours, [g]))
      .filter(s => s !== '');

    return hours.map((hour, i) => ({
      label: `${hour}`,
      value: values[i],
      height: values[i] > 0 ? Math.max((values[i] / maxVal) * 100, 3) : 0,
      isZero: values[i] === 0
    }));
  }

  /**
   * Groups consecutive indices where predicate(value) is true.
   * Returns an array of groups, each group = array of indices.
   */
  private groupConsecutive(values: number[], predicate: (v: number) => boolean): number[][] {
    const groups: number[][] = [];
    let current: number[] = [];

    for (let i = 0; i < values.length; i++) {
      if (predicate(values[i])) {
        current.push(i);
      } else {
        if (current.length > 0) { groups.push(current); current = []; }
      }
    }
    if (current.length > 0) groups.push(current);
    return groups;
  }

  /**
   * Converts groups of indices into a readable label string.
   * Single-hour: "09:00", multi-hour: "08:00–10:00"
   * Multiple groups separated by ",  ".
   */
  private groupsToLabel(hours: string[], groups: number[][]): string {
    return groups.map(group => {
      if (group.length === 0) return '';
      const first = group[0];
      const last  = group[group.length - 1];
      const pad = (n: number) => String(n).padStart(2, '0');
      if (first === last) return `${pad(first)}:00`;
      return `${pad(first)}:00\u2013${pad(last + 1)}:00`;
    }).filter(Boolean).join(',\u00a0\u00a0');
  }

  /** Color for hourly bar: blue → yellow → red based on intensity */
  getActivityColor(heightPct: number): string {
    if (heightPct <= 0) return 'rgba(120,120,130,0.2)';
    if (heightPct < 20)  return '#4a9eff';
    if (heightPct < 45)  return '#5dd5a8';
    if (heightPct < 65)  return '#FFD700';
    if (heightPct < 85)  return '#FF9F43';
    return '#FF4444';
  }

  /** Format seconds as m:ss or Xs */
  formatDuration(seconds: number): string {
    if (seconds >= 60) {
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      return `${m}m ${s}s`;
    }
    return `${seconds}s`;
  }

  /** Page bar width relative to max visits */
  getPageBarWidth(visits: number): number {
    return this.maxPageVisits > 0 ? Math.round((visits / this.maxPageVisits) * 100) : 0;
  }

  /** User bar width relative to max actions */
  getUserBarWidth(actions: number): number {
    return this.maxUserActions > 0 ? Math.round((actions / this.maxUserActions) * 100) : 0;
  }

  /** Avatar background color based on user ID */
  getAvatarColor(userId: number): string {
    const colors = [
      '#4AA3FF', '#2ecc71', '#FF9F43', '#EE5253',
      '#A29BFE', '#FD79A8', '#FDCB6E', '#6C5CE7',
      '#00B894', '#E17055'
    ];
    return colors[userId % colors.length];
  }

  /** User initials */
  getInitials(username: string): string {
    if (!username) return '?';
    const parts = username.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return username.substring(0, 2).toUpperCase();
  }

  /** Browser icons and colors */
  generateBrowserStats(browsers: any[]) {
    const cfg: any = {
      'Chrome':  { icon: 'brand-chrome',  color: '#4285F4' },
      'Firefox': { icon: 'brand-firefox', color: '#FF7139' },
      'Safari':  { icon: 'brand-safari',  color: '#006CFF' },
      'Edge':    { icon: 'brand-edge',    color: '#0078D7' },
      'Other':   { icon: 'browser',       color: '#95A5A6' }
    };
    return browsers.map(b => ({
      name: b.name,
      percentage: b.percentage,
      icon: cfg[b.name]?.icon || 'browser',
      color: cfg[b.name]?.color || '#95A5A6'
    }));
  }

  /** OS icons and colors */
  generateOSStats(operatingSystems: any[]) {
    const cfg: any = {
      'Windows 10/11':   { icon: 'brand-windows', color: '#0078D6' },
      'Windows 8.1':     { icon: 'brand-windows', color: '#0078D6' },
      'Windows 8':       { icon: 'brand-windows', color: '#0078D6' },
      'Windows 7':       { icon: 'brand-windows', color: '#0078D6' },
      'Windows (Other)': { icon: 'brand-windows', color: '#0078D6' },
      'macOS':    { icon: 'brand-apple',   color: '#888888' },
      'iOS':      { icon: 'brand-apple',   color: '#888888' },
      'Android':  { icon: 'brand-android', color: '#3DDC84' },
      'Linux':    { icon: 'brand-ubuntu',  color: '#E95420' },
      'Ubuntu':   { icon: 'brand-ubuntu',  color: '#E95420' },
      'Other':    { icon: 'device-desktop', color: '#95A5A6' },
      'Unknown':  { icon: 'help-circle',   color: '#95A5A6' }
    };
    return operatingSystems.map(os => ({
      name: os.name,
      percentage: os.percentage,
      visits: os.visits,
      icon: cfg[os.name]?.icon || 'device-desktop',
      color: cfg[os.name]?.color || '#95A5A6'
    }));
  }
}
