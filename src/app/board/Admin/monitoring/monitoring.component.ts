import { Component, OnInit, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Config } from '@Schoolingo/config'; 
import { Locale } from '@Schoolingo/locale';
import { IconsModule } from '@Schoolingo/icons';

@Component({
  selector: 'app-monitoring',
  standalone: true,
  imports: [CommonModule, IconsModule],
  templateUrl: './monitoring.component.html',
  styleUrls: ['./monitoring.component.css']
})
export class MonitoringComponent implements OnInit {
  private http = inject(HttpClient);
  public l = inject(Locale);
  
  stats: any = null;
  topPages: any[] = [];
  topUsers: any[] = [];
  chartData: { label: string, value: number, height?: number }[] = [];
  activityChartData: { label: string, value: number, height?: number }[] = [];
  browserStats: any[] = [];
  osStats: any[] = [];
  loading = true;
  error: string | null = null;
  period: string = 'day';

  ngOnInit() {
    this.fetchStats();
  }

  fetchStats() {
    this.loading = true;
    this.error = null;

    // Fetch summary
    this.http.get<any>(`${Config.API_URL}/v1/admin/analytics/stats`, {
        params: { period: this.period }
    }).subscribe({
        next: (data) => {
            this.stats = data;
            this.topPages = data.pages || [];
            this.topUsers = data.topUsers || [];
            
            // Process chart data
            const rawChart = data.chartData || [];
            const maxVal = Math.max(...rawChart.map((d: any) => d.value), 1);
            this.chartData = rawChart.map((d: any) => ({
                ...d,
                height: (d.value / maxVal) * 100
            }));

            // Process activity chart data (hourly)
            this.activityChartData = this.generateActivityData();

            // Process browser stats
            this.browserStats = this.generateBrowserStats(data.browsers || []);

            // Process OS stats
            this.osStats = this.generateOSStats(data.operatingSystems || []);

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

  // Generate hourly activity data (mock for now, should come from backend)
  generateActivityData() {
    const hours = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'];
    const values = [12, 45, 123, 156, 98, 34];
    const maxVal = Math.max(...values, 1);
    
    return hours.map((hour, i) => ({
      label: hour,
      value: values[i],
      height: (values[i] / maxVal) * 100
    }));
  }

  // Generate browser stats with icons and colors
  generateBrowserStats(browsers: any[]) {
    const browserConfig: any = {
      'Chrome': { icon: 'brand-chrome', color: '#4285F4' },
      'Firefox': { icon: 'brand-firefox', color: '#FF7139' },
      'Safari': { icon: 'brand-safari', color: '#006CFF' },
      'Edge': { icon: 'brand-edge', color: '#0078D7' },
      'Other': { icon: 'browser', color: '#95A5A6' }
    };

    return browsers.map(browser => ({
      name: browser.name,
      percentage: browser.percentage,
      icon: browserConfig[browser.name]?.icon || 'browser',
      color: browserConfig[browser.name]?.color || '#95A5A6'
    }));
  }

  // Get avatar color based on user ID
  getAvatarColor(userId: number): string {
    const colors = [
      '#4AA3FF', '#7CD67C', '#FF9F43', '#EE5253',
      '#A29BFE', '#FD79A8', '#FDCB6E', '#6C5CE7'
    ];
    return colors[userId % colors.length];
  }

  // Get user initials
  getInitials(username: string): string {
    if (!username) return '?';
    const parts = username.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return username.substring(0, 2).toUpperCase();
  }

  // Generate OS stats with icons and colors
  generateOSStats(operatingSystems: any[]) {
    const osConfig: any = {
      'Windows 10/11': { icon: 'brand-windows', color: '#0078D6' },
      'Windows 8.1': { icon: 'brand-windows', color: '#0078D6' },
      'Windows 8': { icon: 'brand-windows', color: '#0078D6' },
      'Windows 7': { icon: 'brand-windows', color: '#0078D6' },
      'Windows (Other)': { icon: 'brand-windows', color: '#0078D6' },
      'macOS': { icon: 'brand-apple', color: '#000000' },
      'iOS': { icon: 'brand-apple', color: '#000000' },
      'Android': { icon: 'brand-android', color: '#3DDC84' },
      'Linux': { icon: 'brand-ubuntu', color: '#E95420' },
      'Ubuntu': { icon: 'brand-ubuntu', color: '#E95420' },
      'Other': { icon: 'device-desktop', color: '#95A5A6' },
      'Unknown': { icon: 'help-circle', color: '#95A5A6' }
    };

    return operatingSystems.map(os => ({
      name: os.name,
      percentage: os.percentage,
      visits: os.visits,
      icon: osConfig[os.name]?.icon || 'device-desktop',
      color: osConfig[os.name]?.color || '#95A5A6'
    }));
  }
}
