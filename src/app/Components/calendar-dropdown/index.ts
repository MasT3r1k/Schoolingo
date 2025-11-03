import { NgClass } from '@angular/common';
import { Component, EventEmitter, inject, Output } from '@angular/core';
import { CalendarComponent } from '@Components/calendar';
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
    position: {
        x: number;
        y: number;
    };
    options: { [key: 'multiple_days' | 'multiple_hours' | string]: boolean };
    width: number;
    selected_date: moment.Moment[];
    selected_hour: number;

    visible?: boolean;
}

@Component({
  selector: 'calendar-dropdowns',
  templateUrl: './calendar.html',
  styleUrls: ['./calendar.css'],
  imports: [IconsModule, NgClass]
})
export class CalendarManager {
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

    public getCalendars(): any[] {
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
            calendar.selected_date = [day.clone(), day.clone()];
            return;
        }

        // Je povolený multiple_days
        // 1) Nemám nic vybráno → nastavím start
        if (!calendar.selected_date || calendar.selected_date.length === 0) {
            calendar.selected_date = [day.clone()];
            return;
        }

        // 2) Mám jen start → nastavím end
        if (calendar.selected_date.length === 1) {
            const start = calendar.selected_date[0];
            const end = day.clone();

            // Pokud se klikne na stejný, bereme jako single-day
            if (start.isSame(end, 'day')) {
                calendar.selected_date = [start, start];
                return;
            }

            // Když se klikne na dřívější den → prohodit
            if (end.isBefore(start)) {
                calendar.selected_date = [end, start];
            } else {
                calendar.selected_date = [start, end];
            }
            return;
        }

        // 3) Existuje start i end → restart výběru od nového dne
        if (calendar.selected_date.length === 2) {
            calendar.selected_date = [day.clone()];
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
                calendars[name].width = value.width;
                break;
        }
    }

    public l = inject(Locale);
    date = new BehaviorSubject<moment.Moment>(moment());
    selectedDate: moment.Moment = moment();
    selectedHour: string | null = null;

    public isSameDay(calendar: CalendarData, day: moment.Moment): boolean {
        return (
            calendar.selected_date &&
            calendar.selected_date.length === 2 &&
            (calendar.selected_date[0].isSame(day, 'day') ||
            calendar.selected_date[1].isSame(day, 'day'))
        );
    }

    public isBetweenDay(calendar: CalendarData, day: moment.Moment): boolean {
        const [start, end] = calendar.selected_date || [];
        if (!start || !end) return false;
        return day.isBetween(start, end, 'day', '()');
    }

  @Output() dateSelected = new EventEmitter<moment.Moment>();
  @Output() hourSelected = new EventEmitter<string>();

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

    onDateChange(date: moment.Moment) {
        this.selectedDate = date;
        this.dateSelected.emit(date);
    }

    onHourSelect(hour: string) {
        this.selectedHour = hour;
        this.hourSelected.emit(hour);
    }

}
