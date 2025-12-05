import { Component, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Config } from '@Schoolingo/config';
import { Locale } from '@Schoolingo/locale';
import { IconsModule } from '@Schoolingo/icons';
import { NgClass } from '@angular/common';
import moment from 'moment';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [IconsModule, NgClass],
  templateUrl: './events.component.html',
  styleUrl: './events.component.css'
})
export class EventsComponent implements OnInit {
  private http = inject(HttpClient);
  public l = inject(Locale);
  public events: any[] = [];
  public isLoading = true;

  ngOnInit(): void {
    this.loadEvents();
  }

  public loadEvents(): void {
    this.http.get(
      `${Config.API_URL}/v1/events?limit=5`,
      { withCredentials: true }
    ).subscribe({
      next: (data: any) => {
        if ('events' in data) {
          this.events = data.events;
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
    return moment(date).format('D. M.');
  }

  public formatTime(date: string | Date): string {
    if (!date) return '';
    return moment(date).format('HH:mm');
  }

  public getEventTypeIcon(type: string): string {
    switch(type) {
      case 'exam': return 'file-text';
      case 'meeting': return 'users';
      case 'trip': return 'bus';
      case 'holiday': return 'calendar-off';
      case 'sport': return 'ball-football';
      default: return 'calendar-event';
    }
  }

  public getEventTypeClass(type: string): string {
    return `event-type-${type || 'default'}`;
  }
}
