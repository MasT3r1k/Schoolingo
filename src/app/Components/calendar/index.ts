import { NgClass } from '@angular/common';
import { Component, ElementRef, EventEmitter, inject, OnInit, Output, Renderer2, RendererFactory2 } from '@angular/core';
import { CalendarManager } from '@Components/calendar-dropdown';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import moment from 'moment';
import { BehaviorSubject } from 'rxjs';

export type Calendar = {
    date: moment.Moment;
    gray: Boolean;
}

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.html',
  styleUrls: ['./calendar.css'],
  imports: [IconsModule, NgClass]
})
export class CalendarComponent implements OnInit {
    public visible: boolean = false;
    private elementRef = inject(ElementRef);
    private renderer = inject(Renderer2); 
    private resizeListener: (() => void) | null = null;

    public calendarManager = inject(CalendarManager);
    public l = inject(Locale);
    date = new BehaviorSubject<moment.Moment>(moment());
    selectedDate: moment.Moment = moment();
    selectedHour: string | null = null;

    public calendar = null;
    ngOnInit(): void {
        const el = this.elementRef.nativeElement as HTMLElement;
        const bounds = el.getBoundingClientRect();
        console.log(el)
        console.log(el.getBoundingClientRect());
        this.calendarManager.addCalendar(
            "interm-record",
            {
                position: { x: bounds.x, y: bounds.y },
                options: {
                    multiple_days: true,
                    multiple_hours: false
                },
                width: bounds.width,
                selected_date: [moment(), moment()],
                selected_hour: 1
            }
        );

        this.resizeListener = this.renderer.listen('window', 'resize', () => {
        this.updateCalendarPosition();
        });
    }

    private updateCalendarPosition(): void {
        const el = this.elementRef.nativeElement as HTMLElement;
        const bounds = el.getBoundingClientRect();

        this.calendarManager.updateCalendar('interm-record', 'position', {
        x: bounds.x,
        y: bounds.y,
        width: bounds.width,
        height: bounds.height
        });
    }

    @Output() dateSelected = new EventEmitter<moment.Moment>();
    @Output() hourSelected = new EventEmitter<string>();

    onDateChange(date: moment.Moment) {
        this.selectedDate = date;
        this.dateSelected.emit(date);
    }

    onHourSelect(hour: string) {
        this.selectedHour = hour;
        this.hourSelected.emit(hour);
    }

    ngOnDestroy(): void {
        if (this.resizeListener) this.resizeListener();
    }

}
