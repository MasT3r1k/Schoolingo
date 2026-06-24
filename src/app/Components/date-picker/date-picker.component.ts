import { Component, Input, ElementRef, ViewChild, OnInit, OnDestroy, ChangeDetectorRef, inject, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@Schoolingo/icons';
import moment from 'moment';
import { Locale } from '@Schoolingo/locale';

type visible_type = 'day'|'month'|'year';

@Component({
  selector: 'date-picker',
  imports: [CommonModule, IconsModule],
  templateUrl: './date-picker.component.html',
  styleUrl: './date-picker.component.css'
})
export class DatePickerComponent implements OnInit, OnDestroy {
  @Input() type: 'single' | 'range' = 'single';
  @Input() min: Date | null = null;
  @Input() max: Date | null = null;

  @Input() value: (Date | null) | [Date | null, Date | null] = null;

  @Output() valueChange = new EventEmitter<any>();

  @ViewChild('trigger') trigger!: ElementRef<HTMLElement>;

  public l = inject(Locale);
  public todayYear = parseInt(moment().format('YYYY'), 10);

  public preview_date: moment.Moment = moment();

  public visible_types: visible_type[] = ['day', 'month', 'year'];
  public visible_type: visible_type = 'day';

  public is_open = false;
  public choose_date_index = 0;
  public dates: [Date | null, Date | null] = [null, null];
  
  public dropdownPosition: 'down' | 'up' = 'down';
  public panelStyles: Record<string, string | number> = {};

  public daysGrid: any[] = [];
  public hoverDate: moment.Moment | null = null;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    if (this.type == 'single' && !Array.isArray(this.value)) {
      this.dates = [this.value, null];
    } else if (this.type == 'range' && Array.isArray(this.value)) {
      this.dates = this.value;
    }

    this.generateDays();
    window.addEventListener('scroll', this.updatePosition, true);
    window.addEventListener('resize', this.updatePosition, true);
  }

  ngOnDestroy() {
    window.removeEventListener('scroll', this.updatePosition, true);
    window.removeEventListener('resize', this.updatePosition, true);
  }

  updatePosition = () => {
    if (this.is_open) {
      this.calculatePosition();
      this.cdr.markForCheck();
    }
  };

  public toggleCalendar(event?: Event): void {
    if (event) {
        event.stopPropagation();
    }
    this.is_open = !this.is_open;
    if (this.is_open) {
      this.calculatePosition();
      if (this.dates[0]) {
        this.preview_date = moment(this.dates[0]);
      }
      this.visible_type = 'day';
      this.generateDays();
    } else {
      this.hoverDate = null;
    }
    this.cdr.markForCheck();
  }

  calculatePosition(): void {
    if (!this.trigger) return;

    const rect = this.trigger.nativeElement.getBoundingClientRect();
    const panelMaxHeight = 360;
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    if (spaceBelow < panelMaxHeight && spaceAbove > spaceBelow) {
        this.dropdownPosition = 'up';
        this.panelStyles = {
            position: 'fixed',
            bottom: `${window.innerHeight - rect.top + 8}px`,
            left: `${rect.left}px`,
            zIndex: 9999
        };
    } else {
        this.dropdownPosition = 'down';
        this.panelStyles = {
            position: 'fixed',
            top: `${rect.bottom + 8}px`,
            left: `${rect.left}px`,
            zIndex: 9999
        };
    }
  }

  public toggleVisibleType(): void {
    const index = this.visible_types.indexOf(this.visible_type);
    let new_index = index + 1;
    if (new_index >= this.visible_types.length) {
      new_index = 0;
    }
    this.visible_type = this.visible_types[new_index];
    this.cdr.markForCheck();
  }

  public getHeader(): string | number {
    switch(this.visible_type) {
      case "day":
        return `${this.l.s('months.' + this.preview_date.month())} ${this.preview_date.year()}`;
      case "month":
        return this.preview_date.year();
      case "year":
        return "Rok";
    }
  }

  public closeCalendar(): void {
    this.is_open = false;
    this.hoverDate = null;
    this.cdr.markForCheck();
  }

  public moveCalendar(index: number): void {
    if (this.visible_type == 'year') {
      this.preview_date.add(index * 12, 'years');
    } else {
      const config: any = {
        day: 'month',
        month: 'year'
      };
      this.preview_date.add(index, config[this.visible_type]);
    }
    if (this.visible_type === 'day') this.generateDays();
    this.cdr.markForCheck();
  }

  public generateDays(): void {
    this.daysGrid = [];
    const firstDay = this.preview_date.clone().startOf('month');
    let startDow = firstDay.day(); // 0=Sun
    startDow = (startDow + 6) % 7; // shift to 0=Mon

    const daysInMonth = this.preview_date.daysInMonth();
    const prevMonthDays = this.preview_date.clone().subtract(1, 'month').daysInMonth();

    const minM = this.min ? moment(this.min) : null;
    const maxM = this.max ? moment(this.max) : null;

    for (let i = startDow - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      this.daysGrid.push({ day: d, outside: true, disabled: true, date: this.preview_date.clone().subtract(1, 'month').date(d) });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const date = this.preview_date.clone().date(d);
      let disabled = false;
      if (minM && date.isBefore(minM, 'day')) disabled = true;
      if (maxM && date.isAfter(maxM, 'day')) disabled = true;
      this.daysGrid.push({ day: d, outside: false, disabled, date });
    }

    const totalCells = startDow + daysInMonth;
    const remainder = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    for (let i = 1; i <= remainder; i++) {
      this.daysGrid.push({ day: i, outside: true, disabled: true, date: this.preview_date.clone().add(1, 'month').date(i) });
    }
  }

  public selectDay(dayObj: any): void {
    if (dayObj.disabled || dayObj.outside) return;

    if (this.type === 'single') {
      this.dates[0] = dayObj.date.toDate();
      this.dates[1] = null;
      this.valueChange.emit(this.dates[0]);
      this.closeCalendar();
    } else {
      if (this.choose_date_index === 0) {
        this.dates[0] = dayObj.date.toDate();
        this.dates[1] = null;
        this.choose_date_index = 1;
        this.hoverDate = null;
      } else {
        if (dayObj.date.isBefore(moment(this.dates[0]), 'day')) {
          this.dates[1] = this.dates[0];
          this.dates[0] = dayObj.date.toDate();
        } else {
          this.dates[1] = dayObj.date.toDate();
        }
        this.choose_date_index = 0;
        this.hoverDate = null;
        this.closeCalendar();
      }
      this.valueChange.emit(this.dates);
    }
    this.cdr.markForCheck();
  }

  public onHoverDay(dayObj: any): void {
    if (this.type === 'range' && this.choose_date_index === 1 && this.dates[0]) {
      if (!dayObj.outside) {
        this.hoverDate = dayObj.date;
        this.cdr.markForCheck();
      }
    }
  }

  public onLeaveDay(): void {
    this.hoverDate = null;
    this.cdr.markForCheck();
  }

  public isSelected(date: moment.Moment): boolean {
    if (this.type === 'single') {
      return this.dates[0] ? date.isSame(moment(this.dates[0]), 'day') : false;
    }
    return false;
  }

  public isRangeStart(date: moment.Moment): boolean {
    return this.type === 'range' && !!this.dates[0] && date.isSame(moment(this.dates[0]), 'day');
  }

  public isRangeEnd(date: moment.Moment): boolean {
    if (this.type !== 'range') return false;
    const end = this.dates[1] ? moment(this.dates[1]) : (this.hoverDate ? this.hoverDate : null);
    return !!end && date.isSame(end, 'day');
  }

  public isInRange(date: moment.Moment): boolean {
    if (this.type !== 'range' || !this.dates[0]) return false;
    const end = this.dates[1] ? moment(this.dates[1]) : (this.hoverDate ? this.hoverDate : null);
    if (!end) return false;
    return date.isAfter(moment(this.dates[0]), 'day') && date.isBefore(end, 'day');
  }

  public isTodayDay(date: moment.Moment): boolean {
    return date.isSame(moment(), 'day');
  }

  public getYearsGrid(): number[] {
    const base = this.preview_date.year() - 6;
    return Array.from({length: 12}, (_, i) => base + i);
  }

  get selectedYear(): number {
    return this.dates[0] ? this.dates[0].getFullYear() : -1;
  }

  public selectYear(year: number): void {
    this.preview_date.set('year', year);
    this.visible_type = 'month';
    this.cdr.markForCheck();
  }

  public isCurrentMonth(monthIndex: number): boolean {
    return moment().year() === this.preview_date.year() && moment().month() === monthIndex;
  }

  public isSelectedMonth(monthIndex: number): boolean {
    if (!this.dates[0]) return false;
    return moment(this.dates[0]).year() === this.preview_date.year() && moment(this.dates[0]).month() === monthIndex;
  }

  public selectMonth(month: number): void {
    this.preview_date.set('month', month);
    this.visible_type = 'day';
    this.generateDays();
    this.cdr.markForCheck();
  }

  public setToday(): void {
    const t = moment();
    const minM = this.min ? moment(this.min) : null;
    const maxM = this.max ? moment(this.max) : null;
    
    if (minM && t.isBefore(minM, 'day')) return;
    if (maxM && t.isAfter(maxM, 'day')) return;

    this.dates[0] = t.toDate();
    if (this.type === 'single') {
      this.dates[1] = null
      this.valueChange.emit(this.dates[0]);
    } else {
      this.valueChange.emit(this.dates);
    }
    this.preview_date = t.clone();
    this.visible_type = 'day';
    this.generateDays();
    this.cdr.markForCheck();
  }

  public clearSelection(event: Event): void {
    event.stopPropagation();
    this.dates = [null, null];
    this.choose_date_index = 0;
    this.hoverDate = null;
    if (this.type === 'single') {
      this.valueChange.emit(null);
    } else {
      this.valueChange.emit(this.dates);
    }
    this.closeCalendar();
    this.cdr.markForCheck();
  }

  public getInputValue(): string {
    if (!this.dates[0]) return '';
    if (this.type === 'single') {
      return moment(this.dates[0]).format('DD. MM. YYYY');
    } else {
      const start = moment(this.dates[0]).format('DD. MM. YYYY');
      const end = this.dates[1] ? moment(this.dates[1]).format('DD. MM. YYYY') : 'Konec';
      return `${start} → ${end}`;
    }
  }

}
