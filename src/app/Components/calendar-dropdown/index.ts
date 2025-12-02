import { NgClass } from '@angular/common';
import { Component, inject } from '@angular/core';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import moment from 'moment';
import { BehaviorSubject } from 'rxjs';

let calendars: {[key: string]: CalendarData} = {};

export type Calendar = {
    date: moment.Moment;
    gray: Boolean;
}

export type CalendarData = {
    id: string;
    size: 'full' | 'center';
    position: {
        x: number;
        y: number;
        position: 'top' | 'bottom';
    };
    options: { [key: 'multiple_days' | 'multiple_hours' | string]: boolean };
    width: number;
    selected_date: BehaviorSubject<moment.Moment>[];
    selected_hour: number;
    dropdownBounds?: any;

    visible?: boolean;
}

@Component({
  selector: 'calendar-dropdowns',
  templateUrl: './calendar.html',
  styleUrls: ['./calendar.css'],
  imports: [IconsModule]
})
export class CalendarManager {
    public l = inject(Locale);
    date = new BehaviorSubject<moment.Moment>(moment());
    selectedDate: moment.Moment = moment();
    selectedHour: string | null = null;
    
    public addCalendar(name: string, calendar: CalendarData): void {
        console.log(name, calendar);
        if (!calendar.visible) {
            calendar.visible = false;
        }
        calendars[name] = calendar;
    }

    public getCalendarData(name: string): CalendarData {
        return calendars[name];
    }

    public getCalendars(): CalendarData[] {
        return Object.entries(calendars).map(([name, calendar]) => ({...calendar, id: name}));
    }

    public getVisibleCalendars(): CalendarData[] {
        return Object.entries(calendars).filter((calendar) => calendar[1].visible === true).map(([name, calendar]) => ({...calendar, id: name}));
    }

    public isVisibleCalendar(name: string): boolean {
        return calendars[name].visible || false;
    }

    public showCalendar(name: string): void {
        calendars[name].visible = true;
    }

    public closeCalendar(name: string): void {
        calendars[name].visible = false;
    }

    public selectDay(calendarName: string, day: moment.Moment): void {
        const calendar = calendars[calendarName];
        if (!calendar) return;

        // Pokud není multi-day výběr povolen → jeden den = start i end stejný
        if (!calendar.options['multiple_days']) {
            calendar.selected_date[0].next(day.clone());
            calendar.selected_date[1].next(day.clone());
            this.closeCalendar(calendar.id)
            return;
        }

        // Je povolený multiple_days
        // 1) Nemám nic vybráno → nastavím start
        if (calendar.options['multiple_days'] && (!calendar.selected_date || calendar.selected_date.length === 0)) {
            calendar.selected_date[0].next(day.clone());
            return;
        }

        // 2) Mám jen start → nastavím end
        if (calendar.options['multiple_days'] && calendar.selected_date.length === 1) {
            const start = calendar.selected_date[0];
            const end = day.clone();

            // Pokud se klikne na stejný, bereme jako single-day
            if (start.getValue().isSame(end, 'day')) {
                calendar.selected_date[0].next(start.getValue());
                calendar.selected_date[1].next(start.getValue());
                return;
            }

            // Když se klikne na dřívější den → prohodit
            if (end.isBefore(start.getValue())) {
                calendar.selected_date[0].next(end);
                calendar.selected_date[1].next(start.getValue());
            } else {
                calendar.selected_date[0].next(start.getValue());
                calendar.selected_date[1].next(end);
            }
            return;
        }

        // 3) Existuje start i end → restart výběru od nového dne
        if (calendar.selected_date.length === 2) {
            calendar.selected_date[0].next(day.clone());
            return;
        }
    }

    public closeAllCalendars(): void {
        Object.values(calendars).forEach((calendar) => calendar.visible = false);
    }

    public updateCalendar(name: string, key: string, value: any): void {
        if (!calendars[name]) return;
        switch(key) {
            case "position":
                calendars[name].position.x = value.x;
                calendars[name].position.y = value.y;
                calendars[name].position.position = value.position;
                calendars[name].width = value.width;
                calendars[name].dropdownBounds = value.dropdownBounds;
                break;
            case "size":
                calendars[name].size = value.size;
                break;
        }
    }

    public isSameDay(calendar: CalendarData, day: moment.Moment): boolean {
        return (
            calendar.selected_date &&
            calendar.selected_date.length === 2 &&
            (calendar.selected_date[0].getValue().isSame(day, 'day') ||
            calendar.selected_date[1].getValue().isSame(day, 'day'))
        );
    }

    public isBetweenDay(calendar: CalendarData, day: moment.Moment): boolean {
        const [start, end] = calendar.selected_date || [];
        if (!start || !end) return false;
        return day.isBetween(start.getValue(), end.getValue(), 'day', '()');
    }

  hours: string[] = [
    '08:00',
    '09:00',
    '10:00',
    '11:00',
    '12:00',
    '13:00',
    '14:00',
    '15:00',
    '16:00'
  ];

    // Calendar
    public getCalendar(date: moment.Moment): Calendar[] {
        let calendar: Calendar[] = [];
        let startMonth = date.clone().startOf('month');

        // Before month
        for(let i = startMonth.day() ? startMonth.day() - 1 : 6;i > 0;i--) {
            let day = startMonth.clone().subtract(i, 'day');
            calendar.push({
                date: day,
                gray: true
            })
        }

        // Month
        for(let i = 0;i < startMonth.daysInMonth();i++) {
            let day = startMonth.clone().add(i, 'day');
            calendar.push({
                date: day,
                gray: false
            })
        }

        // After month
        let endMonth = startMonth.clone().endOf('month');
        if (endMonth.isoWeekday() < 7) {
            for(let i = 1;i < (endMonth ? 8 - endMonth.day() : 6);i++) {
                let day = endMonth.clone().add(i, 'day');
                calendar.push({
                    date: day,
                    gray: true
                })
            }
        } 

        return calendar;
    }

    public getLeft(calendar: CalendarData): string {
        switch(calendar.size) {
            case 'center':
                return `${calendar.position.x}px`
            case 'full':
                return `${calendar.position.x}px`;
        }
    }

    public getWidth(calendar: CalendarData): string {
        switch(calendar.size) {
            case 'center':
                return ''
            case 'full':
                return `${calendar.width}px`;
        }
    }

    public getTransform(calendar: CalendarData): string {
        switch(calendar.position.position) {
            case 'top':
                return 'translateY(calc(-100% - 4px))';
            case 'bottom':
                return 'translateY(calc(-100% + 4px))'
        }
    }
}
