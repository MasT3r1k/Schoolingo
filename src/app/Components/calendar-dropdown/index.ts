import { AsyncPipe, NgClass, NgFor, NgIf } from '@angular/common';
import { Component, inject, Injectable } from '@angular/core';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import moment from 'moment';
import { BehaviorSubject, Observable } from 'rxjs';

export type Calendar = {
    date: moment.Moment;
    gray: boolean;
}

export type CalendarData = {
    id: string;
    size: 'full' | 'center';
    position: {
        x: number;
        y: number;
        position: 'top' | 'bottom';
        dropdownBounds?: any;
    };
    options: { [key: string]: boolean };
    width: number;
    selected_date: BehaviorSubject<moment.Moment>[];
    selected_hour: number;
    viewDate: moment.Moment;
    visible: boolean;
}

@Injectable({ providedIn: 'root' })
export class CalendarManager {
    private calendars: {[key: string]: CalendarData} = {};
    private calendarsSubject = new BehaviorSubject<CalendarData[]>([]);

    public addCalendar(name: string, calendar: any): void {
        if (!calendar.visible) {
            calendar.visible = false;
        }
        if (!calendar.viewDate) {
            calendar.viewDate = moment(calendar.selected_date[0].getValue());
        }
        this.calendars[name] = calendar as CalendarData;
        this.updateCalendarsSubject();
    }

    public getCalendarData(name: string): CalendarData {
        return this.calendars[name];
    }

    public getCalendars(): CalendarData[] {
        return Object.values(this.calendars);
    }

    public getCalendarsObservable(): Observable<CalendarData[]> {
        return this.calendarsSubject.asObservable();
    }

    private updateCalendarsSubject(): void {
        this.calendarsSubject.next(Object.values(this.calendars));
    }

    public isVisibleCalendar(name: string): boolean {
        return this.calendars[name]?.visible || false;
    }

    public showCalendar(name: string): void {
        if (this.calendars[name]) {
            this.calendars[name].visible = true;
            this.updateCalendarsSubject();
        }
    }

    public closeCalendar(name: string): void {
        if (this.calendars[name]) {
            this.calendars[name].visible = false;
            this.updateCalendarsSubject();
        }
    }

    public closeAllCalendars(): void {
        Object.values(this.calendars).forEach((calendar) => calendar.visible = false);
        this.updateCalendarsSubject();
    }

    public navigateCalendar(name: string, amount: number, unit: moment.unitOfTime.DurationConstructor): void {
        if (this.calendars[name]) {
            this.calendars[name].viewDate = this.calendars[name].viewDate.clone().add(amount, unit);
            this.updateCalendarsSubject();
        }
    }

    public selectDay(calendarName: string, day: moment.Moment): void {
        const calendar = this.calendars[calendarName];
        if (!calendar) return;

        if (!calendar.options['multiple_days']) {
            calendar.selected_date[0].next(day.clone());
            calendar.selected_date[1].next(day.clone());
            this.closeCalendar(calendarName);
            return;
        }

        const startSubject = calendar.selected_date[0];
        const endSubject = calendar.selected_date[1];
        const start = startSubject.getValue();
        const end = endSubject.getValue();

        // Selection logic for range
        if (start.isSame(end, 'day')) {
            // Only one day was selected, now selecting the second one
            if (day.isBefore(start, 'day')) {
                startSubject.next(day.clone());
                endSubject.next(start.clone());
            } else if (day.isSame(start, 'day')) {
                // Clicking same day again - keeps it single day
            } else {
                endSubject.next(day.clone());
            }
        } else {
            // Range was already selected, start a new one
            startSubject.next(day.clone());
            endSubject.next(day.clone());
        }
        this.updateCalendarsSubject();
    }

    public updateCalendar(name: string, key: string, value: any): void {
        if (!this.calendars[name]) return;
        switch(key) {
            case "position":
                this.calendars[name].position.x = value.x;
                this.calendars[name].position.y = value.y;
                this.calendars[name].position.position = value.position;
                this.calendars[name].width = value.width;
                this.calendars[name].position.dropdownBounds = value.dropdownBounds;
                break;
            case "size":
                this.calendars[name].size = value.size;
                break;
        }
        this.updateCalendarsSubject();
    }

    public isSameDay(calendar: CalendarData, day: moment.Moment): boolean {
        return (
            calendar.selected_date[0].getValue().isSame(day, 'day') ||
            calendar.selected_date[1].getValue().isSame(day, 'day')
        );
    }

    public isBetweenDay(calendar: CalendarData, day: moment.Moment): boolean {
        const start = calendar.selected_date[0].getValue();
        const end = calendar.selected_date[1].getValue();
        return day.isAfter(start, 'day') && day.isBefore(end, 'day');
    }

    public getCalendar(date: moment.Moment): Calendar[] {
        let calendar: Calendar[] = [];
        let startMonth = date.clone().startOf('month');
        
        // Align to Monday
        let firstDayOfWeek = startMonth.isoWeekday(); // 1 = Monday, 7 = Sunday
        let prevDays = firstDayOfWeek - 1;

        for(let i = prevDays; i > 0; i--) {
            calendar.push({
                date: startMonth.clone().subtract(i, 'day'),
                gray: true
            });
        }

        for(let i = 0; i < startMonth.daysInMonth(); i++) {
            calendar.push({
                date: startMonth.clone().add(i, 'day'),
                gray: false
            });
        }

        let endMonth = startMonth.clone().endOf('month');
        let lastDayOfWeek = endMonth.isoWeekday();
        let nextDays = 7 - lastDayOfWeek;

        for(let i = 1; i <= nextDays; i++) {
            calendar.push({
                date: endMonth.clone().add(i, 'day'),
                gray: true
            });
        }

        return calendar;
    }
}

@Component({
  selector: 'calendar-dropdowns',
  templateUrl: './calendar.html',
  styleUrls: ['./calendar.css'],
  imports: [IconsModule, NgIf, NgFor, NgClass, AsyncPipe],
  standalone: true
})
export class CalendarDropdownsComponent {
    public calendarManager = inject(CalendarManager);
    public l = inject(Locale);

    public isVisible = (c: CalendarData) => c.visible;


    public getLeft(calendar: CalendarData): string {
        return `${calendar.position.x}px`;
    }

    public getWidth(calendar: CalendarData): string {
        return calendar.size === 'full' ? `${calendar.width}px` : '';
    }

    public getTransform(calendar: CalendarData): string {
        return calendar.position.position === 'top' 
            ? 'translateY(calc(-100% - 8px))' 
            : 'translateY(8px)';
    }
}

