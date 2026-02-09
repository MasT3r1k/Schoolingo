import { Component, OnInit, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Config } from '@Schoolingo/config'; 
import { Locale } from '@Schoolingo/locale';

@Component({
  selector: 'app-monitoring',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './monitoring.component.html',
  styleUrls: ['./monitoring.component.css']
})
export class MonitoringComponent implements OnInit {
  private http = inject(HttpClient);
  public l = inject(Locale);
  
  stats: any = null;
  topPages: any[] = [];
  chartData: { label: string, value: number, height?: number }[] = [];
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
            
            // Process chart data
            const rawChart = data.chartData || [];
            const maxVal = Math.max(...rawChart.map((d: any) => d.value), 1); // Avoid division by zero
            this.chartData = rawChart.map((d: any) => ({
                ...d,
                height: (d.value / maxVal) * 100
            }));

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
}
