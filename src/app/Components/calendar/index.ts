import { NgClass } from '@angular/common';
import { Component, ElementRef, EventEmitter, inject, Input, OnInit, Output, Renderer2, RendererFactory2 } from '@angular/core';
import { CalendarManager } from '@Components/calendar-dropdown';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { Utils } from '@Schoolingo/utils';
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
    @Input() id: string = '';
    @Input() size: 'full' | 'center' = 'center';
    @Input() options: { multiple_days?: boolean, multiple_hours?: boolean } = {
        multiple_days: false,
        multiple_hours: false
    };
    @Input() value: moment.Moment | null = null;
    @Output() valueChange = new EventEmitter<moment.Moment>();

    Utils = Utils;
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
        this.calendarManager.addCalendar(
            this.id,
            {
                id: this.id,
                size: this.size,
                position: { x: bounds.x, y: bounds.y, position: 'top' },
                options: this.options,
                width: bounds.width,
                selected_date: [new BehaviorSubject(this.value ? this.value.clone() : moment()), new BehaviorSubject(this.value ? this.value.clone() : moment())],
                selected_hour: 1
            }
        );

        // Listen for changes
        const calData = this.calendarManager.getCalendarData(this.id);
        if (calData) {
            calData.selected_date[0].subscribe((val) => {
                this.valueChange.emit(val);
            });
        }

        // this.updateCalendarPosition();
        this.resizeListener = this.renderer.listen('window', 'resize', () => {
            this.updateCalendarPosition();
        });
    }

    public updateCalendarPosition(): void {
        const el = this.elementRef.nativeElement as HTMLElement;
        const bounds = el.getBoundingClientRect();

        let x = 0;
        let y = 0;
        let position = 'top';
        const calendarDropdown = document.querySelector(".calendar-panel[calendar_id='" + this.id + "']") as HTMLElement;
        if (!calendarDropdown) return;
        const dropdownBounds = calendarDropdown.getBoundingClientRect();

        if (dropdownBounds.height <= bounds.top) {
            y = bounds.y;
            position = 'top';
        }

        if (dropdownBounds.height > bounds.top) {
            y = bounds.y + bounds.height + dropdownBounds.height;
            position = 'bottom';
        }

        if (this.size == 'full') { x = bounds.x }
        if (this.size == 'center') { x = bounds.x + ((bounds.width - dropdownBounds.width) / 2) }

        this.calendarManager.updateCalendar(
            this.id,
            'position',
            {
                x: x,
                y: y,
                width: bounds.width,
                height: bounds.height,
                position,
                dropdownBounds
            }
        );
    }

    ngOnDestroy(): void {
        if (this.resizeListener) this.resizeListener();
    }

}
