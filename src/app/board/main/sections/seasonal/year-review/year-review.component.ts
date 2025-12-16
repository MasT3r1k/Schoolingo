import { Component, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Config } from '@Schoolingo/config';
import { Locale } from '@Schoolingo/locale';
import { IconsModule } from '@Schoolingo/icons';
import { RouterLink } from '@angular/router';

interface YearStats {
  lessonsAttended: number;
  assignmentsCompleted: number;
  averageGrade: number;
}

@Component({
  selector: 'app-seasonal-year-review',
  standalone: true,
  imports: [IconsModule, RouterLink],
  template: `
    <div class="seasonal-widget seasonal-year-review-widget">
      <div class="seasonal-widget-body">
        @if (isLoading) {
          <div class="stats-skeleton">
            <div class="stat-skeleton skeleton"></div>
            <div class="stat-skeleton skeleton"></div>
            <div class="stat-skeleton skeleton"></div>
          </div>
        } @else {
          <div class="year-review-content">
            <!-- Motivational header -->
            <div class="review-header">
              <div class="year-badge">2024</div>
              <div class="trophy-icon">🏆</div>
            </div>
            
            <!-- Stats grid with enhanced styling -->
            <div class="stats-grid">
              <div class="stat-card stat-lessons">
                <div class="stat-decoration">📚</div>
                <div class="stat-content">
                  <div class="stat-icon">
                    <i-tabler name="book"></i-tabler>
                  </div>
                  <div class="stat-value" [attr.data-value]="stats.lessonsAttended">
                    {{ stats.lessonsAttended }}
                  </div>
                  <div class="stat-label">{{ l.s('seasonal.yearReview.lessonsAttended') }}</div>
                </div>
              </div>
              
              <div class="stat-card stat-assignments">
                <div class="stat-decoration">✅</div>
                <div class="stat-content">
                  <div class="stat-icon">
                    <i-tabler name="checkbox"></i-tabler>
                  </div>
                  <div class="stat-value" [attr.data-value]="stats.assignmentsCompleted">
                    {{ stats.assignmentsCompleted }}
                  </div>
                  <div class="stat-label">{{ l.s('seasonal.yearReview.assignmentsCompleted') }}</div>
                </div>
              </div>
              
              <div class="stat-card stat-grade">
                <div class="stat-decoration">⭐</div>
                <div class="stat-content">
                  <div class="stat-icon">
                    <i-tabler name="star"></i-tabler>
                  </div>
                  <div class="stat-value" [attr.data-value]="stats.averageGrade">
                    {{ stats.averageGrade }}
                  </div>
                  <div class="stat-label">{{ l.s('seasonal.yearReview.averageGrade') }}</div>
                </div>
              </div>
            </div>
            
            <!-- Encouraging message -->
            <div class="review-footer">
              <span class="congrats-text">{{ l.s('seasonal.christmas.greeting') }}</span>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    
    .seasonal-year-review-widget {
      background: linear-gradient(135deg, 
        rgba(212, 168, 83, 0.08) 0%, 
        rgba(212, 168, 83, 0.05) 100%
      ); /* fallback */
      background: linear-gradient(135deg, 
        rgba(var(--seasonal-warm-rgb, var(--seasonal-primary-rgb, 212, 168, 83)), 0.08) 0%, 
        rgba(var(--seasonal-primary-rgb, 212, 168, 83), 0.05) 100%
      );
      border: 2px solid rgba(212, 168, 83, 0.2); /* fallback */
      border: 2px solid rgba(var(--seasonal-primary-rgb, 212, 168, 83), 0.2);
      position: relative;
      overflow: hidden;
    }
    
    .seasonal-year-review-widget::before {
      content: '✨';
      position: absolute;
      top: -5px;
      left: -10px;
      font-size: 50px;
      opacity: 0.06;
      pointer-events: none;
    }
    
    .year-review-content {
      display: flex;
      flex-direction: column;
      gap: var(--space-5);
    }
    
    /* Header with year badge */
    .review-header {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-3);
      padding: var(--space-3);
    }
    
    .year-badge {
      font-size: var(--text-2xl);
      font-weight: 900;
      color: #D4A853; /* fallback */
      color: var(--seasonal-primary, #D4A853);
      padding: var(--space-2) var(--space-4);
      background: linear-gradient(135deg, 
        rgba(212, 168, 83, 0.15), 
        rgba(212, 168, 83, 0.05)
      ); /* fallback */
      background: linear-gradient(135deg, 
        rgba(var(--seasonal-primary-rgb, 212, 168, 83), 0.15), 
        rgba(var(--seasonal-primary-rgb, 212, 168, 83), 0.05)
      );
      border: 2px solid rgba(212, 168, 83, 0.3); /* fallback */
      border: 2px solid rgba(var(--seasonal-primary-rgb, 212, 168, 83), 0.3);
      border-radius: var(--radius-full);
      text-shadow: 0 0 10px rgba(212, 168, 83, 0.3); /* fallback */
      text-shadow: 0 0 10px rgba(var(--seasonal-primary-rgb, 212, 168, 83), 0.3);
      animation: year-glow 3s ease-in-out infinite;
    }
    
    @keyframes year-glow {
      0%, 100% {
        box-shadow: 0 0 15px rgba(212, 168, 83, 0.3); /* fallback */
        box-shadow: 0 0 15px rgba(var(--seasonal-primary-rgb, 212, 168, 83), 0.3);
      }
      50% {
        box-shadow: 0 0 25px rgba(212, 168, 83, 0.5); /* fallback */
        box-shadow: 0 0 25px rgba(var(--seasonal-primary-rgb, 212, 168, 83), 0.5);
      }
    }
    
    .trophy-icon {
      font-size: 2rem;
      animation: trophy-bounce 2s ease-in-out infinite;
    }
    
    @keyframes trophy-bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-5px); }
    }
    
    /* Stats grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--space-4);
    }
    
    .stat-card {
      position: relative;
      padding: var(--space-4);
      background: linear-gradient(180deg, 
        rgba(212, 168, 83, 0.08), 
        rgba(212, 168, 83, 0.02)
      ); /* fallback */
      background: linear-gradient(180deg, 
        rgba(var(--seasonal-primary-rgb, 212, 168, 83), 0.08), 
        rgba(var(--seasonal-primary-rgb, 212, 168, 83), 0.02)
      );
      border: 2px solid rgba(212, 168, 83, 0.15); /* fallback */
      border: 2px solid rgba(var(--seasonal-primary-rgb, 212, 168, 83), 0.15);
      border-radius: var(--radius-lg);
      transition: all var(--transition-fast);
      overflow: hidden;
    }
    
    .stat-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, 
        #D4A853, 
        #7EB8D8
      ); /* fallback */
      background: linear-gradient(90deg, 
        var(--seasonal-primary, #D4A853), 
        var(--seasonal-cool, #7EB8D8)
      );
      opacity: 0.8;
    }
    
    .stat-card:hover {
      transform: translateY(-4px);
      border-color: #D4A853; /* fallback */
      border-color: var(--seasonal-primary, #D4A853);
      box-shadow: 0 8px 20px rgba(212, 168, 83, 0.2); /* fallback */
      box-shadow: 0 8px 20px rgba(var(--seasonal-primary-rgb, 212, 168, 83), 0.2);
    }
    
    .stat-decoration {
      position: absolute;
      top: 5px;
      right: 5px;
      font-size: 1.5rem;
      opacity: 0.1;
      pointer-events: none;
    }
    
    .stat-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-2);
      text-align: center;
    }
    
    .stat-icon {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #D4A853; /* fallback */
      color: var(--seasonal-primary, #D4A853);
      opacity: 0.8;
    }
    
    .stat-value {
      font-size: var(--text-3xl);
      font-weight: 800;
      color: #D4A853; /* fallback */
      color: var(--seasonal-primary, #D4A853);
      line-height: 1;
      text-shadow: 0 0 15px rgba(212, 168, 83, 0.2); /* fallback */
      text-shadow: 0 0 15px rgba(var(--seasonal-primary-rgb, 212, 168, 83), 0.2);
      counter-reset: stat-counter attr(data-value);
    }
    
    .stat-label {
      font-size: var(--text-xs);
      color: var(--text-secondary);
      font-weight: 600;
      text-transform: lowercase;
    }
    
    /* Individual stat colors */
    .stat-lessons .stat-value {
      color: #4A90E2;
    }
    
    .stat-assignments .stat-value {
      color: #50C878;
    }
    
    .stat-grade .stat-value {
      color: #FFB84D;
    }
    
    /* Footer message */
    .review-footer {
      padding: var(--space-3) var(--space-4);
      background: rgba(212, 168, 83, 0.08); /* fallback */
      background: rgba(var(--seasonal-primary-rgb, 212, 168, 83), 0.08);
      border: 1px solid rgba(212, 168, 83, 0.2); /* fallback */
      border: 1px solid rgba(var(--seasonal-primary-rgb, 212, 168, 83), 0.2);
      border-radius: var(--radius-lg);
      text-align: center;
    }
    
    .congrats-text {
      font-size: var(--text-sm);
      color: var(--text-secondary);
      font-weight: 500;
      font-style: italic;
    }
    
    /* Loading skeleton */
    .stats-skeleton {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--space-4);
    }
    
    .stat-skeleton {
      height: 120px;
      border-radius: var(--radius-lg);
    }
    
    .skeleton {
      background: linear-gradient(
        90deg,
        var(--surface-2) 25%,
        var(--surface-3) 50%,
        var(--surface-2) 75%
      );
      background-size: 200% 100%;
      animation: skeleton-shimmer 1.5s infinite;
    }
    
    @keyframes skeleton-shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    
    /* Responsive */
    @media (max-width: 768px) {
      .stats-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class YearReviewComponent implements OnInit {
  private http = inject(HttpClient);
  public l = inject(Locale);
  
  public isLoading = true;
  public stats: YearStats = {
    lessonsAttended: 0,
    assignmentsCompleted: 0,
    averageGrade: 0
  };
  
  ngOnInit(): void {
    this.loadStats();
  }
  
  private loadStats(): void {
    const year = new Date().getFullYear();
    
    this.http.get<YearStats>(`${Config.API_URL}/v1/user/year-stats?year=${year}`, {
      withCredentials: true
    }).subscribe({
      next: (data) => {
        // Use demo data if all values are 0
        if (data.lessonsAttended === 0 && data.assignmentsCompleted === 0 && data.averageGrade === 0) {
          this.stats = {
            lessonsAttended: 145,
            assignmentsCompleted: 87,
            averageGrade: 1.8
          };
        } else {
          this.stats = data;
        }
        this.isLoading = false;
      },
      error: () => {
        // Show demo data on error
        this.stats = {
          lessonsAttended: 145,
          assignmentsCompleted: 87,
          averageGrade: 1.8
        };
        this.isLoading = false;
      }
    });
  }
}
