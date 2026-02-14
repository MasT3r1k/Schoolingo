import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { CalendarService, CalendarEvent as ApiCalendarEvent } from '../../infrastructure/calendar/calendar.service';
import { ModalManager } from '@Schoolingo/modal';
import { CalendarAddEventComponent } from './modals/add-calendar-event/add-calendar-event.component';

interface CalendarEvent {
  id: number;
  title: string;
  type: 'lesson' | 'event' | 'exam';
  start: Date;
  end: Date;
  location?: string;
  description?: string;
  color?: string;
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, IconsModule],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.css'
})
export class CalendarComponent implements OnInit {
  public l = inject(Locale);
  public calendarService = inject(CalendarService);
  public modalManager = inject(ModalManager);
  
  public currentDate: Date = new Date();
  public today = new Date();
  public weekDays: Date[] = [];
  public hours: number[] = Array.from(
    { length: 13 },
    (_, i) => i + 7
  ); // 7:00 - 19:00
  public events: CalendarEvent[] = [];
  public loading = false;

  ngOnInit(): void {
    this.modalManager.addModal('calendar_add_event', {
      title: 'Přidat novou událost',
      closeable: true,
      items: [{ type: 'component', component: CalendarAddEventComponent }],
      width: 500
    });
    this.generateWeekDays();
    this.loadEvents();
  }

  private generateWeekDays(): void {
    const startOfWeek = this.getStartOfWeek(this.currentDate);
    this.weekDays = Array.from({ length: 5 }, (_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      return date;
    });
  }

  private getStartOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(d.setDate(diff));
  }

  private loadEvents(): void {
    this.loading = true;
    const startOfWeek = this.getStartOfWeek(this.currentDate);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 4);

    const startStr = startOfWeek.toISOString().split('T')[0];
    const endStr = endOfWeek.toISOString().split('T')[0];

    this.calendarService.loadEvents(startStr, endStr).subscribe({
      next: (apiEvents) => {
        if (apiEvents.length > 0) {
          // Map API events to component format
          this.events = apiEvents.map((e, index) => ({
            id: e.event_id,
            title: e.name,
            type: this.mapEventType(e.type),
            start: new Date(e.date),
            end: new Date(new Date(e.date).getTime() + 45 * 60000), // Default 45 min duration
            description: e.description,
            color: this.getEventColor(e.type)
          }));
        } else {
          // Fallback to mock if no API data
          this.loadMockEvents();
        }
        this.loading = false;
      },
      error: () => {
        this.loadMockEvents();
        this.loading = false;
      }
    });
  }

  private mapEventType(type: string): 'lesson' | 'event' | 'exam' {
    if (type === 'exam' || type === 'test') return 'exam';
    if (type === 'lesson') return 'lesson';
    return 'event';
  }

  private getEventColor(type: string): string {
    const colors: Record<string, string> = {
      'lesson': 'var(--primary)',
      'exam': 'var(--danger)',
      'test': 'var(--danger)',
      'event': 'var(--success)',
      'holiday': 'var(--accent)'
    };
    return colors[type] || 'var(--primary)';
  }

  private loadMockEvents(): void {
    const today = new Date();
    const startOfWeek = this.getStartOfWeek(today);

    // Helper to set time
    const setTime = (dayOffset: number, hour: number, minute: number) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + dayOffset);
      d.setHours(hour, minute, 0, 0);
      return d;
    };

    this.events = [
      {
        id: 1,
        title: 'Matematika',
        type: 'lesson',
        start: setTime(0, 8, 0),
        end: setTime(0, 8, 45),
        location: 'U12',
        color: 'var(--primary)'
      },
      {
        id: 2,
        title: 'Anglický jazyk',
        type: 'lesson',
        start: setTime(0, 8, 55),
        end: setTime(0, 9, 40),
        location: 'J1',
        color: 'var(--accent)'
      },
      {
        id: 3,
        title: 'Školní výlet',
        type: 'event',
        start: setTime(2, 8, 0),
        end: setTime(2, 14, 0),
        description: 'Návštěva muzea',
        color: 'var(--success)'
      },
      {
        id: 4,
        title: 'Test z Dějepisu',
        type: 'exam',
        start: setTime(3, 10, 0),
        end: setTime(3, 10, 45),
        location: 'U5',
        color: 'var(--danger)'
      }
    ];
  }

  public getEventsForDay(date: Date): CalendarEvent[] {
    return this.events.filter(event => 
      event.start.getDate() === date.getDate() &&
      event.start.getMonth() === date.getMonth() &&
      event.start.getFullYear() === date.getFullYear()
    );
  }

  public getEventStyle(event: CalendarEvent): any {
    const startHour = event.start.getHours() + event.start.getMinutes() / 60;
    const endHour = event.end.getHours() + event.end.getMinutes() / 60;
    const duration = endHour - startHour;
    const top = (startHour - 7) * 60; // 60px per hour, starting at 7:00
    const height = duration * 60;

    return {
      top: `${top}px`,
      height: `${height}px`,
      backgroundColor: event.color || 'var(--primary)'
    };
  }

  public previousWeek(): void {
    this.currentDate.setDate(this.currentDate.getDate() - 7);
    this.generateWeekDays();
    this.loadEvents();
  }

  public nextWeek(): void {
    this.currentDate.setDate(this.currentDate.getDate() + 7);
    this.generateWeekDays();
    this.loadEvents();
  }

  public openAddEventModal(): void {
    this.modalManager.openModal('calendar_add_event');
  }
}

