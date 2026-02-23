import { Component, ElementRef, EventEmitter, inject, Input, OnDestroy, OnInit, Output, Renderer2 } from '@angular/core';
import { CalendarManager } from '@Components/calendar-dropdown';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { Utils } from '@Schoolingo/utils';
import moment from 'moment';
import { BehaviorSubject, Subscription } from 'rxjs';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.html',
  styleUrls: ['./calendar.css'],
  imports: [IconsModule],
  standalone: true
})
export class CalendarComponent implements OnInit, OnDestroy {
    @Input() id: string = '';
    @Input() size: 'full' | 'center' = 'center';
    @Input() options: { multiple_days?: boolean, multiple_hours?: boolean } = {
        multiple_days: false,
        multiple_hours: false
    };
    @Input() value: moment.Moment | null = null;
    @Input() valueEnd: moment.Moment | null = null;
    
    @Output() valueChange = new EventEmitter<moment.Moment>();
    @Output() valueEndChange = new EventEmitter<moment.Moment>();

    Utils = Utils;
    private elementRef = inject(ElementRef);
    private renderer = inject(Renderer2); 
    private resizeListener: (() => void) | null = null;
    private subs = new Subscription();

    public calendarManager = inject(CalendarManager);
    public l = inject(Locale);

    ngOnInit(): void {
        if (!this.id) {
            this.id = 'cal-' + Math.random().toString(36).substring(2, 9);
        }
        const el = this.elementRef.nativeElement as HTMLElement;
        const bounds = el.getBoundingClientRect();
        
        this.calendarManager.addCalendar(
            this.id,
            {
                id: this.id,
                size: this.size,
                position: { x: bounds.left, y: bounds.top, position: 'bottom' },
                options: this.options,
                width: bounds.width,
                selected_date: [
                    new BehaviorSubject(this.value ? this.value.clone() : moment()), 
                    new BehaviorSubject(this.valueEnd ? this.valueEnd.clone() : (this.value ? this.value.clone() : moment()))
                ],
                selected_hour: 1,
                visible: false
            }
        );

        // Listen for changes
        const calData = this.calendarManager.getCalendarData(this.id);
        if (calData) {
            this.subs.add(calData.selected_date[0].subscribe((val) => {
                this.valueChange.emit(val);
            }));
            this.subs.add(calData.selected_date[1].subscribe((val) => {
                this.valueEndChange.emit(val);
            }));
        }

        this.resizeListener = this.renderer.listen('window', 'resize', () => {
            this.updateCalendarPosition();
        });
        this.subs.add(this.renderer.listen('window', 'scroll', () => {
            this.updateCalendarPosition();
        }, { capture: true }));

        // Initial position update
        setTimeout(() => this.updateCalendarPosition(), 0);
    }

    public updateCalendarPosition(): void {
        const el = this.elementRef.nativeElement.querySelector('.calendar-input') as HTMLElement;
        if (!el) return;
        const bounds = el.getBoundingClientRect();

        let x = bounds.left;
        let y = bounds.bottom;
        let position: 'top' | 'bottom' = 'bottom';

        const calendarDropdown = document.querySelector(".calendar-panel[calendar_id='" + this.id + "']") as HTMLElement;
        if (calendarDropdown) {
            const dropdownBounds = calendarDropdown.getBoundingClientRect();
            // Check if there is enough space below
            if (window.innerHeight - bounds.bottom < dropdownBounds.height + 20 && bounds.top > dropdownBounds.height + 20) {
                y = bounds.top;
                position = 'top';
            }

            if (this.size === 'center') {
                x = bounds.left + (bounds.width / 2) - (dropdownBounds.width / 2);
            }
        }

        this.calendarManager.updateCalendar(
            this.id,
            'position',
            { x, y, width: bounds.width, position }
        );
    }

    ngOnDestroy(): void {
        if (this.resizeListener) this.resizeListener();
        this.subs.unsubscribe();
    }
}

