import { Component, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Config } from '@Schoolingo/config';
import { Locale } from '@Schoolingo/locale';
import { IconsModule } from '@Schoolingo/icons';
import { SeasonalService } from '@Schoolingo/seasonal';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-seasonal-countdown',
  standalone: true,
  imports: [IconsModule, RouterLink],
  template: `
    <div class="seasonal-widget seasonal-countdown-widget">
      <div class="seasonal-widget-body">
        <div class="countdown-content">
          <!-- Large animated countdown number -->
          <div class="countdown-circle">
            <svg class="countdown-ring" width="180" height="180">
              <circle class="countdown-ring-bg" cx="90" cy="90" r="80"></circle>
              <circle class="countdown-ring-progress" cx="90" cy="90" r="80" 
                [style.strokeDashoffset]="progressOffset"></circle>
            </svg>
            <div class="countdown-number">
              <div class="days-value">{{ daysRemaining }}</div>
              <div class="days-label">{{ l.s('seasonal.countdown.daysLeft') }}</div>
            </div>
          </div>
          
          <!-- Date information with icon -->
          <div class="date-info">
            <div class="date-icon">🎄</div>
            <div class="date-range">{{ dateRangeText }}</div>
          </div>
          
          <!-- Action button -->
          <!-- <a class="btn btn--seasonal">
            <i-tabler name="gift"></i-tabler>
            <span>{{ l.s('seasonal.countdown.viewCalendar') }}</span>
          </a> -->
        </div>
      </div>
    </div>
  `,
  styles: [`
    .seasonal-countdown-widget {
        /* background: linear-gradient(135deg, 
        rgba(var(--seasonal-primary-rgb), 0.05) 0%, 
        rgba(var(--seasonal-cool-rgb, var(--seasonal-primary-rgb)), 0.08) 100%
      );
      border: 2px solid rgba(var(--seasonal-primary-rgb), 0.2);*/
      position: relative;
      overflow: hidden;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;
    }
    
    .seasonal-countdown-widget::before {
      content: '❄️';
      position: absolute;
      top: -10px;
      right: -10px;
      font-size: 60px;
      opacity: 0.06;
      transform: rotate(15deg);
      pointer-events: none;
    }
    
    .countdown-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-6);
      padding: var(--space-4) 0;
    }
    
    /* Animated circular countdown */
    .countdown-circle {
      position: relative;
      width: 180px;
      height: 180px;
    }
    
    .countdown-ring {
      transform: rotate(-90deg);
      position: absolute;
      top: 0;
      left: 0;
    }
    
    .countdown-ring-bg {
      fill: none;
      stroke: rgba(212, 168, 83, 0.1); /* fallback */
      stroke: rgba(var(--seasonal-primary-rgb, 212, 168, 83), 0.1);
      stroke-width: 8;
    }
    
    .countdown-ring-progress {
      fill: none;
      stroke: #D4A853; /* fallback */
      stroke: var(--seasonal-primary, #D4A853);
      stroke-width: 8;
      stroke-linecap: round;
      stroke-dasharray: 502.4; /* 2 * PI * 80 */
      transition: stroke-dashoffset 1s ease;
      filter: drop-shadow(0 0 8px rgba(212, 168, 83, 0.4));
      filter: drop-shadow(0 0 8px rgba(var(--seasonal-primary-rgb, 212, 168, 83), 0.4));
    }
    
    .countdown-number {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
    }
    
    .days-value {
      font-size: 4rem;
      font-weight: 900;
      color: #D4A853; /* fallback */
      color: var(--seasonal-primary, #D4A853);
      line-height: 1;
      text-shadow: 0 0 20px rgba(212, 168, 83, 0.3);
      text-shadow: 0 0 20px rgba(var(--seasonal-primary-rgb, 212, 168, 83), 0.3);
      animation: pulse-glow 2s ease-in-out infinite;
    }
    
    .days-label {
      font-size: var(--text-sm);
      color: var(--text-secondary);
      font-weight: 600;
      margin-top: var(--space-2);
      text-transform: lowercase;
    }
    
    @keyframes pulse-glow {
      0%, 100% {
        text-shadow: 0 0 20px rgba(212, 168, 83, 0.3);
        text-shadow: 0 0 20px rgba(var(--seasonal-primary-rgb, 212, 168, 83), 0.3);
      }
      50% {
        text-shadow: 0 0 30px rgba(212, 168, 83, 0.5);
        text-shadow: 0 0 30px rgba(var(--seasonal-primary-rgb, 212, 168, 83), 0.5);
      }
    }
    
    /* Date information */
    .date-info {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-3) var(--space-5);
      background: rgba(212, 168, 83, 0.1); /* fallback */
      background: rgba(var(--seasonal-primary-rgb, 212, 168, 83), 0.1);
      border: 1px solid rgba(212, 168, 83, 0.2);
      border: 1px solid rgba(var(--seasonal-primary-rgb, 212, 168, 83), 0.2);
      border-radius: var(--radius-full);
    }
    
    .date-icon {
      font-size: 1.5rem;
      animation: sway 3s ease-in-out infinite;
    }
    
    @keyframes sway {
      0%, 100% { transform: rotate(-5deg); }
      50% { transform: rotate(5deg); }
    }
    
    .date-range {
      font-size: var(--text-md);
      font-weight: 600;
      color: #D4A853; /* fallback */
      color: var(--seasonal-primary, #D4A853);
    }
    
    /* Action button */
    .btn--seasonal {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-3) var(--space-5);
      background: linear-gradient(135deg, #D4A853, #7EB8D8); /* fallback */
      background: linear-gradient(135deg, var(--seasonal-primary, #D4A853), var(--seasonal-cool, #7EB8D8));
      color: white;
      border: none;
      border-radius: var(--radius-full);
      font-size: var(--text-sm);
      font-weight: 600;
      cursor: pointer;
      transition: all var(--transition-fast);
      box-shadow: 0 4px 12px rgba(212, 168, 83, 0.3);
      box-shadow: 0 4px 12px rgba(var(--seasonal-primary-rgb, 212, 168, 83), 0.3);
      text-decoration: none;
    }
    
    .btn--seasonal:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(212, 168, 83, 0.4);
      box-shadow: 0 6px 20px rgba(var(--seasonal-primary-rgb, 212, 168, 83), 0.4);
    }
    
    .btn--seasonal i-tabler {
      width: 18px;
      height: 18px;
    }
  `]
})
export class CountdownComponent implements OnInit {
  private http = inject(HttpClient);
  public l = inject(Locale);
  public seasonalService = inject(SeasonalService);
  
  public daysRemaining = 0;
  public dateRangeText = '';
  public progressOffset = 502.4; // Full circle initially
  
  // Default winter break dates
  private breakStartDate: Date = new Date(new Date().getFullYear(), 11, 23); // Dec 23
  private breakEndDate: Date = new Date(new Date().getFullYear() + 1, 0, 3); // Jan 3
  
  ngOnInit(): void {
    this.loadBreakDates();
    this.calculateCountdown();
  }
  
  private loadBreakDates(): void {
    this.http.get<any>(`${Config.API_URL}/v1/school/calendar/breaks`, {
      withCredentials: true
    }).subscribe({
      next: (data) => {
        if (data && data.winterBreak) {
          this.breakStartDate = new Date(data.winterBreak.start);
          this.breakEndDate = new Date(data.winterBreak.end);
          this.calculateCountdown();
        }
      },
      error: () => {
        this.calculateCountdown();
      }
    });
  }
  
  private calculateCountdown(): void {
    const now = new Date();
    const start = this.breakStartDate;
    
    if (now > this.breakEndDate) {
      start.setFullYear(now.getFullYear() + 1);
      this.breakEndDate.setFullYear(now.getFullYear() + 1);
    }
    
    const diffTime = start.getTime() - now.getTime();
    this.daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    
    // Calculate progress for circular indicator (max 60 days)
    const maxDays = 60;
    const progress = Math.min(this.daysRemaining, maxDays) / maxDays;
    const circumference = 2 * Math.PI * 80; // 2πr
    this.progressOffset = circumference - (progress * circumference);
    
    // Format date range
    const startStr = this.formatDate(this.breakStartDate);
    const endStr = this.formatDate(this.breakEndDate);
    this.dateRangeText = `${startStr} – ${endStr}`;
  }
  
  private formatDate(date: Date): string {
    const day = date.getDate();
    const month = date.toLocaleString('cs', { month: 'long' });
    return `${day}. ${month}`;
  }
}
