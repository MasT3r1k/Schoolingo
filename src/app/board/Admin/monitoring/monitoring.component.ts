import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule, SlicePipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Config } from '@Schoolingo/config'; 
import { Locale } from '@Schoolingo/locale';
import { IconsModule } from '@Schoolingo/icons';
import { Utils } from '@Schoolingo/utils';
import { TabsComponent } from "@Components/Tabs";
import { BehaviorSubject, Subscription } from 'rxjs';

/** One point in a polyline chart */
export interface ChartPoint {
  label: string;
  value: number;
  /** 0-100 normalized for SVG */
  x?: number;
  y?: number;
  isPeak?: boolean;
  isLow?: boolean;
}

@Component({
  selector: 'app-monitoring',
  standalone: true,
  imports: [CommonModule, IconsModule, SlicePipe, DatePipe, TabsComponent, FormsModule],
  templateUrl: './monitoring.component.html',
  styleUrls: ['./monitoring.component.css']
})
export class MonitoringComponent implements OnInit, OnDestroy {
  private http = inject(HttpClient);
  public l = inject(Locale);
  private subscribers: Subscription[] = [];
  
  // ── Analytics Stats ────────────────────────────────────
  stats: any = null;
  topPages: any[] = [];
  topUsers: any[] = [];

  /** Rendered SVG polyline points for visits chart */
  visitPoints: ChartPoint[] = [];
  /** Y-axis labels */
  visitYLabels: string[] = [];

  /** Hourly activity bars */
  activityChartData: { label: string; value: number; height?: number; isZero?: boolean }[] = [];
  browserStats: any[] = [];
  osStats: any[] = [];
  peakRange: string = '—';
  lowRanges: string[] = [];

  loading = true;
  error: string | null = null;
  selectedPeriodTab = new BehaviorSubject<number>(0);
  period: string = 'day';

  // Custom date range for period
  showCustomPeriod = false;
  customPeriodFrom: string = '';
  customPeriodTo: string = '';
  customPeriodError: string | null = null;

  // Max values for progress bars
  private maxPageVisits = 1;
  private maxUserActions = 1;

  // ── Uptime ─────────────────────────────────────────────
  uptimeData: any = null;
  uptimeDays: number = 7;
  uptimeLoading = false;
  selectedUptimeTab = new BehaviorSubject<number>(1);

  showCustomUptime = false;
  customUptimeFrom: string = '';
  customUptimeTo: string = '';
  customUptimeError: string | null = null;

  // ── Note modal (for offline segments) ─────────────────
  noteModal: { open: boolean; segment: any; text: string; saving: boolean } = {
    open: false, segment: null, text: '', saving: false
  };



  // ── Chart Tooltip ─────────────────────────────────────
  chartTooltip: {
    visible: boolean;
    x: number;   // px from left of svg-area div
    y: number;   // px from top of svg-area div
    svgX: number; // SVG coordinate for crosshair line
    svgY: number; // SVG coordinate for crosshair dot
    label: string;
    value: string;
    sub?: string;
  } = { visible: false, x: 0, y: 0, svgX: 0, svgY: 0, label: '', value: '' };



  // ── System Summary ─────────────────────────────────────
  systemSummary: { students: number; teachers: number; classes: number; subjects: number; totalUsers: number } | null = null;

  // Expose Math for templates
  readonly Math = Math;

  // SVG chart dimensions
  readonly SVG_W = 800;
  readonly SVG_H = 200;
  readonly SVG_PAD_LEFT = 48;
  readonly SVG_PAD_RIGHT = 16;
  readonly SVG_PAD_TOP = 16;
  readonly SVG_PAD_BOTTOM = 32;

  ngOnInit() {
    const today = new Date();
    const todayStr = this.toDateInputValue(today);
    const monthAgo = new Date(today);
    monthAgo.setDate(today.getDate() - 30);
    this.customPeriodFrom = this.toDateInputValue(monthAgo);
    this.customPeriodTo = todayStr;
    this.customUptimeFrom = this.toDateInputValue(monthAgo);
    this.customUptimeTo = todayStr;

    this.fetchStats();
    this.loadUptime(this.uptimeDays);
    this.loadSystemSummary();


    this.subscribers.push(this.selectedPeriodTab.subscribe((tabIndex) => {
      const periodRanges = ['day', 'week', 'month', 'custom'];
      const newPeriod = periodRanges[tabIndex];
      if (newPeriod === 'custom') { this.showCustomPeriod = true; return; }
      this.showCustomPeriod = false;
      this.customPeriodError = null;
      if (this.period === newPeriod) return;
      this.period = newPeriod;
      this.fetchStats();
    }));

    this.subscribers.push(this.selectedUptimeTab.subscribe((tabIndex) => {
      const dayValues = [1, 7, 30, -1];
      const days = dayValues[tabIndex];
      if (days === -1) { this.showCustomUptime = true; return; }
      this.showCustomUptime = false;
      this.customUptimeError = null;
      if (this.uptimeDays === days) return;
      this.loadUptime(days);
    }));
  }

  ngOnDestroy() {
    this.subscribers.forEach(s => s.unsubscribe());
  }

  // ── System Summary ────────────────────────────────────
  loadSystemSummary() {
    this.http.get<any>(`${Config.API_URL}/v1/admin/analytics/system-summary`, { withCredentials: true }).subscribe({
      next: (data) => { this.systemSummary = data; },
      error: () => { this.systemSummary = null; }
    });
  }



  // ── Custom period ─────────────────────────────────────
  applyCustomPeriod() {
    if (!this.customPeriodFrom || !this.customPeriodTo) { this.customPeriodError = 'Vyplňte oba datumy.'; return; }
    if (this.customPeriodFrom > this.customPeriodTo) { this.customPeriodError = 'Datum "od" musí být před datem "do".'; return; }
    this.customPeriodError = null;
    this.period = 'custom';
    this.fetchStats();
  }

  applyCustomUptime() {
    if (!this.customUptimeFrom || !this.customUptimeTo) { this.customUptimeError = 'Vyplňte oba datumy.'; return; }
    if (this.customUptimeFrom > this.customUptimeTo) { this.customUptimeError = 'Datum "od" musí být před datem "do".'; return; }
    this.customUptimeError = null;
    this.loadUptimeCustom(this.customUptimeFrom, this.customUptimeTo);
  }

  private toDateInputValue(d: Date): string {
    return d.toISOString().substring(0, 10);
  }

  // ── Uptime ────────────────────────────────────────────
  loadUptime(days: number) {
    this.uptimeDays = days;
    this.showCustomUptime = false;
    this.customUptimeError = null;
    this.uptimeLoading = true;
    this.http.get<any>(`${Config.API_URL}/v1/admin/analytics/uptime`, {
      params: { days: String(days) }, withCredentials: true
    }).subscribe({
      next: (data) => { this.uptimeData = data; this.uptimeLoading = false; },
      error: () => { this.uptimeData = null; this.uptimeLoading = false; }
    });
  }

  loadUptimeCustom(from: string, to: string) {
    this.uptimeDays = -1;
    this.uptimeLoading = true;
    this.http.get<any>(`${Config.API_URL}/v1/admin/analytics/uptime`, {
      params: { from, to }, withCredentials: true
    }).subscribe({
      next: (data) => { this.uptimeData = data; this.uptimeLoading = false; },
      error: () => { this.uptimeData = null; this.uptimeLoading = false; }
    });
  }

  // ── Note Modal ────────────────────────────────────────
  openNoteModal(segment: any) {
    this.noteModal = { open: true, segment, text: segment.note || '', saving: false };
  }

  closeNoteModal() {
    this.noteModal.open = false;
  }

  saveNote() {
    if (!this.noteModal.segment) return;
    this.noteModal.saving = true;
    this.http.patch(`${Config.API_URL}/v1/admin/analytics/uptime/note`, {
      segment_from: this.noteModal.segment.from,
      note: this.noteModal.text
    }, { withCredentials: true }).subscribe({
      next: () => {
        // Update locally
        this.noteModal.segment.note = this.noteModal.text;
        this.noteModal.saving = false;
        this.noteModal.open = false;
      },
      error: () => { this.noteModal.saving = false; }
    });
  }

  // ── Analytics Stats ───────────────────────────────────
  fetchStats() {
    this.loading = true;
    this.error = null;

    const params: any = { period: this.period };
    if (this.period === 'custom') {
      params['from'] = this.customPeriodFrom;
      params['to'] = this.customPeriodTo;
    }

    this.http.get<any>(`${Config.API_URL}/v1/admin/analytics/stats`, {
      params, withCredentials: true
    }).subscribe({
      next: (data) => {
        this.stats = data;
        this.topPages = data.pages || [];
        this.topUsers = data.topUsers || [];

        // Build visits line chart
        const rawChart = data.chartData || [];
        this.visitPoints = this.buildLineChart(rawChart, false);
        this.visitYLabels = this.buildYLabels(rawChart.map((d: any) => d.value));

        // Activity heatmap
        this.activityChartData = this.generateActivityData(data.hourlyActivity);

        // Browser & OS
        this.browserStats = this.generateBrowserStats(data.browsers || []);
        this.osStats = this.generateOSStats(data.operatingSystems || []);

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

  // ── SVG Line Chart builders ───────────────────────────

  /**
   * Converts raw {label, value}[] → ChartPoint[] with SVG x/y coordinates.
   * If highlightExtremes=true marks peak/low.
   */
  buildLineChart(data: { label: string; value: number }[], highlightExtremes: boolean): ChartPoint[] {
    if (!data || data.length === 0) return [];
    const values = data.map(d => d.value);
    const maxVal = Math.max(...values, 1);
    const minVal = Math.min(...values);

    const usableW = this.SVG_W - this.SVG_PAD_LEFT - this.SVG_PAD_RIGHT;
    const usableH = this.SVG_H - this.SVG_PAD_TOP - this.SVG_PAD_BOTTOM;
    const n = data.length;

    return data.map((d, i) => {
      const x = n === 1
        ? this.SVG_PAD_LEFT + usableW / 2
        : this.SVG_PAD_LEFT + (i / (n - 1)) * usableW;
      // Inverted: top = high value
      const y = this.SVG_PAD_TOP + usableH - ((d.value - minVal) / Math.max(maxVal - minVal, 1)) * usableH;
      return {
        label: d.label,
        value: d.value,
        x: Math.round(x * 10) / 10,
        y: Math.round(y * 10) / 10,
        isPeak: highlightExtremes && d.value === maxVal && maxVal > 0,
        isLow: highlightExtremes && d.value === minVal && data.length > 1
      };
    });
  }

  /** Build Y-axis labels for a list of values */
  buildYLabels(values: number[]): string[] {
    const maxVal = Math.max(...values, 1);
    const step = Math.ceil(maxVal / 4);
    return [
      String(maxVal),
      String(step * 3),
      String(step * 2),
      String(step),
      '0'
    ];
  }

  /** Produces an SVG <polyline> points attribute string */
  polylinePoints(points: ChartPoint[]): string {
    return points.map(p => `${p.x},${p.y}`).join(' ');
  }

  /** Produces a filled path string (close to bottom) for the area gradient */
  areaPath(points: ChartPoint[]): string {
    if (points.length === 0) return '';
    const bottom = this.SVG_H - this.SVG_PAD_BOTTOM;
    const pts = points.map(p => `${p.x},${p.y}`).join(' L ');
    const last = points[points.length - 1];
    const first = points[0];
    return `M ${first.x},${bottom} L ${pts} L ${last.x},${bottom} Z`;
  }

  // ── Hourly heatmap ────────────────────────────────────
  generateActivityData(hourlyActivity?: any[]) {
    let hours: string[] = [];
    let values: number[] = [];

    if (hourlyActivity && hourlyActivity.length > 0) {
      hours = hourlyActivity.map((h: any) => h.hour);
      values = hourlyActivity.map((h: any) => h.count);
    } else {
      for (let i = 0; i < 24; i++) {
        hours.push(Utils.addZeros(i, 2).toString());
        values.push(0);
      }
    }

    const maxVal = Math.max(...values, 1);
    const minVal = Math.min(...values);
    const allZero = values.every(v => v === 0);

    if (allZero) {
      this.peakRange = 'Žádná data';
      this.lowRanges = [];
      return hours.map(h => ({ label: h, value: 0, height: 8, isZero: true }));
    }

    const peakThreshold = maxVal * 0.70;
    const peakGroups = this.groupConsecutive(values, (v) => v >= peakThreshold);
    this.peakRange = this.groupsToLabel(hours, peakGroups) || '—';

    const lowThreshold = Math.max(minVal, Math.floor(maxVal * 0.05));
    const lowGroups = this.groupConsecutive(values, (v) => v <= lowThreshold);
    this.lowRanges = lowGroups.map(g => this.groupsToLabel(hours, [g])).filter(s => s !== '');

    return hours.map((hour, i) => ({
      label: hour,
      value: values[i],
      height: values[i] > 0 ? Math.max((values[i] / maxVal) * 100, 3) : 0,
      isZero: values[i] === 0
    }));
  }

  private groupConsecutive(values: number[], predicate: (v: number) => boolean): number[][] {
    const groups: number[][] = [];
    let current: number[] = [];
    for (let i = 0; i < values.length; i++) {
      if (predicate(values[i])) { current.push(i); }
      else { if (current.length > 0) { groups.push(current); current = []; } }
    }
    if (current.length > 0) groups.push(current);
    return groups;
  }

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
    if (heightPct < 20) return '#4a9eff';
    if (heightPct < 45) return '#5dd5a8';
    if (heightPct < 65) return '#FFD700';
    if (heightPct < 85) return '#FF9F43';
    return '#FF4444';
  }



  // ── Formatting helpers ────────────────────────────────
  formatDuration(seconds: number): string {
    if (seconds >= 60) {
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      return `${m}m ${s}s`;
    }
    return `${seconds}s`;
  }

  getPageBarWidth(visits: number): number {
    return this.maxPageVisits > 0 ? Math.round((visits / this.maxPageVisits) * 100) : 0;
  }

  getUserBarWidth(actions: number): number {
    return this.maxUserActions > 0 ? Math.round((actions / this.maxUserActions) * 100) : 0;
  }

  getAvatarColor(userId: number): string {
    const colors = [
      '#4AA3FF', '#2ecc71', '#FF9F43', '#EE5253',
      '#A29BFE', '#FD79A8', '#FDCB6E', '#6C5CE7',
      '#00B894', '#E17055'
    ];
    return colors[userId % colors.length];
  }

  getInitials(username: string): string {
    if (!username) return '?';
    const parts = username.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return username.substring(0, 2).toUpperCase();
  }

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

  setPeriod(period: string) {
    if (this.period !== period) { this.period = period; this.fetchStats(); }
  }

  // ── Chart Hover Tooltip ───────────────────────────────

  /**
   * Finds the data point nearest to the mouse X position within the SVG,
   * then positions the tooltip bubble above that point.
   */
  onChartMouseMove(event: MouseEvent, points: ChartPoint[], isSvgArea = true) {
    if (!points.length) return;
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    // Convert mouseX (px inside the div) → SVG X coordinate
    const svgScaleX = this.SVG_W / rect.width;
    const svgX = mouseX * svgScaleX;

    // Find nearest point by X
    let nearest = points[0];
    let minDist = Math.abs((nearest.x ?? 0) - svgX);
    for (const pt of points) {
      const dist = Math.abs((pt.x ?? 0) - svgX);
      if (dist < minDist) { minDist = dist; nearest = pt; }
    }

    // Position tooltip relative to the svg-area div (in px)
    const svgScaleY = this.SVG_H / rect.height;
    const tipX = (nearest.x ?? 0) / svgScaleX;
    const tipY = (nearest.y ?? 0) / svgScaleY;

    this.chartTooltip = {
      visible: true,
      x: tipX,
      y: tipY,
      svgX: nearest.x ?? 0,
      svgY: nearest.y ?? 0,
      label: nearest.label,
      value: String(nearest.value),
      sub: nearest.isPeak ? '🏆 Nejvíce' : undefined
    };
  }

  onChartMouseLeave() {
    this.chartTooltip = { ...this.chartTooltip, visible: false };
  }



  isSameDay(date1: any, date2: any): boolean {
    if (!date1 || !date2) return true;
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  }
}

