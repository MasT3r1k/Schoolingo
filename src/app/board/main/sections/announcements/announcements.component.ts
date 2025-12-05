import { Component, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Config } from '@Schoolingo/config';
import { Locale } from '@Schoolingo/locale';
import { IconsModule } from '@Schoolingo/icons';
import moment from 'moment';

@Component({
  selector: 'app-announcements',
  imports: [IconsModule],
  templateUrl: './announcements.component.html',
  styleUrl: './announcements.component.css'
})
export class AnnouncementsComponent implements OnInit {
  private http = inject(HttpClient);
  public l = inject(Locale);
  public announcements: any[] = [];
  public isLoading = true;

  ngOnInit(): void {
    this.loadAnnouncements();
  }

  public loadAnnouncements(): void {
    this.http.get(
      `${Config.API_URL}/v1/announcements?limit=5`,
      { withCredentials: true }
    ).subscribe({
      next: (data: any) => {
        if ('announcements' in data) {
          this.announcements = data.announcements;
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  public formatDate(date: string | Date): string {
    if (!date) return '';
    const d = moment(date);
    const now = moment();
    
    if (d.isSame(now, 'day')) {
      return 'Dnes';
    } else if (d.isSame(moment().subtract(1, 'day'), 'day')) {
      return 'Včera';
    }
    return d.format('D. M. YYYY');
  }

  public getPriorityClass(priority: number): string {
    switch(priority) {
      case 3: return 'priority-high';
      case 2: return 'priority-medium';
      default: return 'priority-normal';
    }
  }

  public getPriorityIcon(priority: number): string {
    switch(priority) {
      case 3: return 'alert-triangle';
      case 2: return 'info-circle';
      default: return 'bell';
    }
  }
}
