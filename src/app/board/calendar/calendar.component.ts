import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';

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
  public currentDate: Date = new Date();
  public today = new Date();
  public weekDays: Date[] = [];
  public hours: number[] = Array.from(
    { length: 13 },
    (_, i) => i + 7
  ); // 7:00 - 19:00
  public events: CalendarEvent[] = [];

  ngOnInit(): void {
    this.generateWeekDays();
    this.loadMockEvents();
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
    this.loadMockEvents(); // Reload/regenerate mock events for the new week if needed
  }

  public nextWeek(): void {
    this.currentDate.setDate(this.currentDate.getDate() + 7);
    this.generateWeekDays();
    this.loadMockEvents();
  }
}
