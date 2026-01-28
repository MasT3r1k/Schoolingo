import { HttpClient } from '@angular/common/http';
import { Component, HostListener, inject, OnInit } from '@angular/core';
import { Config } from '@Schoolingo/config';
import { DropdownManager } from '@Schoolingo/dropdown';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { TimetableHours } from '../../Teach/timetable/timetable.component';
import moment from 'moment';
import { School } from '@Schoolingo/school';

interface ScopeAPI {
  scopeId: number;
  scopeName: string;
  scopeShort: string;
  scopeCode: string;
  years: number;
  is_active: boolean;
}

@Component({
  imports: [IconsModule],
  templateUrl: './template-timetable.component.html',
  styleUrl: './template-timetable.component.css'
})
export class TemplateTimetableComponent implements OnInit {
  public dropdownManager = inject(DropdownManager);
  public l = inject(Locale);
  private http = inject(HttpClient);
  public school = inject(School);
  public is_dragging = false;

  public selected_type: 'empty' | 'disabled' | 'maybe' | 'lunch' | 'continuous' = 'empty';

  public selected_scope: ScopeAPI | null = null;
  public scopes: ScopeAPI[] = [];
  public selected_year: number = -1;
  public maxHours = 9;
  public hours: TimetableHours[] = [];

  public default_schema: (string[][])[] = [
    [['disabled'], ['continuous'], ['continuous'], ['continuous'], ['continuous'], ['lunch'], ['disabled'], ['disabled'], ['disabled'], ['disabled']],
    [['disabled'], ['continuous'], ['continuous'], ['continuous'], ['continuous'], ['lunch'], ['disabled'], ['disabled'], ['disabled'], ['disabled']],
    [['disabled'], ['continuous'], ['continuous'], ['continuous'], ['continuous'], ['lunch'], ['disabled'], ['disabled'], ['disabled'], ['disabled']],
    [['disabled'], ['continuous'], ['continuous'], ['continuous'], ['continuous'], ['lunch'], ['disabled'], ['disabled'], ['disabled'], ['disabled']],
    [['disabled'], ['continuous'], ['continuous'], ['continuous'], ['continuous'], ['lunch'], ['disabled'], ['disabled'], ['disabled'], ['disabled']]
  ]

  public schema: typeof this.default_schema = [];

  public updateCell(x: number, y: number, a: number = 0): void {
    if (!this.is_dragging) return;
    this.schema[x][y][a] = this.selected_type;
  }

  public loadScheme(): void {
    if (!this.selected_scope || this.selected_year <= 0) return;
    this.http.get<{ day: number; hour: number; type: string }[]>(
      `${Config.API_URL}/v1/timetable_scheme/${this.selected_scope?.scopeId ?? -1}/${this.selected_year ?? -1}`,
      { withCredentials: true }
    )
    .subscribe((data) => {
      this.schema = [];
      if (data.length == 0) {
        this.schema = JSON.parse(JSON.stringify(this.default_schema));
        return;
      }
      data.forEach((adata) => {
        if (!this.schema[adata.day]) {
          this.schema[adata.day] = [];
        }
        if (!this.schema[adata.day][adata.hour]) {
          this.schema[adata.day][adata.hour] = [];
        }
        this.schema[adata.day][adata.hour].push(adata.type);
      })
    });

  }
  
  @HostListener('window:mousedown', ['$event'])
  onMouseDown(e: MouseEvent) {
    if (e.button === 0) {
      this.is_dragging = true;
    }
  }

  @HostListener('window:mouseup')
  onMouseUp() {
    this.is_dragging = false;
  }

  public saveScheme(
    scope_id: number = this.selected_scope?.scopeId ?? -1,
    year: number = this.selected_year ?? -1
  ): void {
    if (!scope_id) return;
    if (!year) return;

    if (this.selected_scope?.scopeId == -1 && this.selected_year == -1) {
      this.default_schema = JSON.parse(JSON.stringify(this.schema));
    }

    this.http.post(
      `${Config.API_URL}/v1/timetable_scheme`,
      {
        scopeId: scope_id,
        year,
        scheme: this.schema
      },
      { withCredentials: true }
    )
    .subscribe((data) => {
      console.log(data)
    });
  }

  ngOnInit(): void {
    this.http.get<ScopeAPI[]>(
      `${Config.API_URL}/v1/scopes`
    )
    .subscribe((data) => {
      this.scopes = data;
      if (data.length) {
        this.selected_scope = data[0];
        this.selected_year = 1;
        this.loadScheme();
      }
    });

    let schoolConfig = this.school.config.getValue();

    let hours: TimetableHours[] = [];
    let time = moment()
    .set('hours', schoolConfig?.startHour!)
    .set('minutes', schoolConfig?.startMinute!);

    for(let i = 1;i <= this.maxHours;i++) {
        let startHour = time.clone();
        time.add(schoolConfig?.lessonHour, 'minutes');
        hours.push(
          {
            startMoment: startHour.clone(),
            start: startHour.format('HH:mm'),
            endMoment: time.clone(),
            end: time.format('HH:mm')
          }
        );
        let customBreak = schoolConfig?.breaks.filter((_) => _.hour == i + 1)[0]?.minutes;
        time.add(customBreak || schoolConfig?.breakTime, 'minutes');
    }

    this.hours = hours;

    this.http.get<{ day: number; hour: number; type: string }[]>(
      `${Config.API_URL}/v1/timetable_scheme/-1/-1`,
      { withCredentials: true }
    )
    .subscribe((data) => {
      if (data.length == 0) {
        return;
      }
      this.default_schema = [];
      data.forEach((adata) => {
        if (!this.default_schema[adata.day]) {
          this.default_schema[adata.day] = [];
        }
        if (!this.default_schema[adata.day][adata.hour]) {
          this.default_schema[adata.day][adata.hour] = [];
        }
        this.default_schema[adata.day][adata.hour].push(adata.type);
      })
    });
  }
}
