import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Config } from '@Schoolingo/config';
import { Locale } from '@Schoolingo/locale';
import { IconsModule } from '@Schoolingo/icons';
import { ModalManager } from '@Schoolingo/modal';
import { Utils } from '@Schoolingo/utils';
import { School } from '@Schoolingo/school';
import moment from 'moment';

@Component({
  standalone: true,
  imports: [CommonModule, IconsModule, NgClass],
  template: `
    @if (generatingPdf) {
        <div style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0, 0, 0, 0.7); display: flex; align-items: center; justify-content: center; z-index: 99999; flex-direction: column;">
            <div class="loader" style="width: 48px; height: 48px; border-width: 4px; border-color: #fff; border-top-color: transparent;"></div>
            <p style="margin-top: 20px; color: #fff; font-size: 18px; font-weight: 500;">{{ l.s('timetable.generating_pdf') }}</p>
        </div>
    }
    <div class="timetable-container" [class.loading]="isLoading">
      <div style="display: flex; justify-content: flex-end; margin-bottom: 10px;">
        <div class="item-btn text" (click)="exportPdf()" style="cursor: pointer; display: inline-flex; width: 32px; height: 32px; align-items: center; justify-content: center; background: hsla(213, 100%, 50%, .12); border-radius: 8px; color: #3b82f6;">
            <div class="icon" style="display: flex;">
                <i-tabler name="printer"></i-tabler>
            </div>
        </div>
      </div>
      @if (isLoading) {
        <div class="loader-container">
          <div class="loader"></div>
        </div>
      }

      @if (!isLoading && timetable.length > 0) {
        <div class="timetable">
          <div class="hours">
            <div class="week-type">
                {{ l.s('weeks.' + (Utils.isOdd(selectedWeek.isoWeek()) ? 'odd' : 'even')) }}
            </div>
            @for (hour of timetableHours; track $index) {
              <div class="hour-info">
                <div class="hour-id">{{ $index + 1 }}</div>
                <div class="hour-time">{{ hour.start }} - {{ hour.end }}</div>
              </div>
            }
          </div>

          <div class="days">
            @for (dayIndex of [1, 2, 3, 4, 5]; track dayIndex) {
              <div class="day">
                <div class="name">
                  {{ l.s('days.' + dayIndex) }}
                  <div class="time">{{ Utils.getDayOfWeek(selectedWeek, dayIndex).format('D. M.') }}</div>
                </div>

                @for (hourIndex of [].constructor(timetableHours.length); track $index) {
                  <div class="item lesson-hour">
                    @if (timetable[dayIndex]?.[$index]) {
                      @for (lesson of timetable[dayIndex][$index]; track $index) {
                        <div class="sub-lesson-hour" [style.backgroundColor]="lesson.color">
                          <div class="group">
                             <span>{{ lesson.class_name }}{{ lesson.group_name ? ' (' + lesson.group_name + (lesson.group_num ? ' ' + lesson.group_num : '') + ')' : '' }}</span>
                          </div>
                          <div class="subject">
                            {{ lesson.subject_shortcut }}
                          </div>
                          <div class="teacher">
                             {{ lesson.last_name }}
                          </div>
                        </div>
                      }
                    }
                  </div>
                }
              </div>
            }
          </div>
        </div>
      } @else if (!isLoading) {
        <div class="empty-state">
          <i-tabler name="calendar-off" class="empty-icon"></i-tabler>
          <p>{{ l.s('timetable.no_lessons') }}</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .timetable-container {
      min-height: 300px;
      padding: 1rem;
      overflow-x: auto;
    }
    .loader-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 300px;
    }
    .timetable {
        display: flex;
        flex-direction: column;
        min-width: 800px;
    }
    .hours {
        display: flex;
        flex-direction: row;
        align-items: center;
        margin-bottom: 8px;
    }
    .hours > div {
        display: flex;
        justify-content: end;
        align-items: center;
        flex-direction: column;
        min-width: 100px;
    }
    .week-type {
        min-width: 80px !important;
        font-weight: 600;
        color: var(--text-muted);
        text-transform: uppercase;
        font-size: 10px;
    }
    .hour-id {
        font-size: 16px;
        font-weight: 600;
        color: var(--primary);
    }
    .hour-time {
        font-size: 10px;
        color: var(--text-muted);
    }
    .days {
        display: flex;
        flex-direction: column;
    }
    .day {
        display: flex;
        flex-direction: row;
        border-bottom: 1px solid var(--border);
    }
    .day:nth-child(2n) {
        background-color: var(--hover-bg);
    }
    .day > .name {
        min-width: 80px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        color: var(--primary);
        text-transform: capitalize;
    }
    .day > .name > .time {
        font-size: 11px;
        color: var(--text-muted);
        font-weight: 400;
    }
    .day > div {
        min-width: 100px;
        min-height: 80px;
    }
    .lesson-hour {
        display: flex;
        flex-direction: column;
        border-left: 1px solid var(--border);
    }
    .sub-lesson-hour {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        position: relative;
        padding: 0.5rem;
    }
    .group, .teacher {
        font-size: 10px;
        color: var(--text-muted);
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    .group {
        position: absolute;
        top: 2px;
        left: 4px;
        color: var(--primary);
    }
    .subject {
        font-size: 16px;
        font-weight: 600;
    }
    .teacher {
        margin-top: 2px;
    }
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 300px;
      color: var(--text-muted);
    }
    .empty-icon {
      width: 48px;
      height: 48px;
      margin-bottom: 1rem;
      opacity: 0.5;
    }
  `]
})
export class RoomTimetableModalComponent implements OnInit {
  public l = inject(Locale);
  private http = inject(HttpClient);
  public school = inject(School);
  public Utils = Utils;
  private modalManager = inject(ModalManager);

  public room: any;
  public isLoading = true;
  public generatingPdf = false;
  public timetable: any[] = [];
  public timetableHours: any[] = [];
  public selectedWeek = moment();

  ngOnInit(): void {
    const data = this.modalManager.getModalData('room-timetable-modal');
    if (data && data.room) {
      this.room = data.room;
      this.loadTimetable();
    }
  }

  loadTimetable(): void {
    this.isLoading = true;
    this.http.post<any>(`${Config.API_URL}/v1/timetable`, {
      type: 'room',
      id: this.room.room_id,
      time: this.selectedWeek.format('YYYY-MM-DD')
    }, { withCredentials: true }).subscribe({
      next: (data) => {
        this.processTimetable(data);
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  processTimetable(data: any): void {
    const timetableBuild: any[] = [];
    let maxHours = 0;

    data.timetable.forEach((item: any) => {
      if (item.hour + 1 > maxHours) maxHours = item.hour + 1;
      if (!timetableBuild[item.day]) timetableBuild[item.day] = [];
      if (!timetableBuild[item.day][item.hour - 1]) timetableBuild[item.day][item.hour - 1] = [];
      
      timetableBuild[item.day][item.hour - 1].push({
        ...item,
        color: item.type === 0 ? '' : 'hsla(353deg, 85%, 53%, .16)' // Example substitution color if not type 0
      });
    });

    // Subtitutions
    data.substitution.forEach((sub: any) => {
        // Find correct day/hour and merge or add
        // For simplicity, room view shows what's actually happening
    });

    this.timetable = timetableBuild;

    // Build hours info
    const schoolConfig = this.school.config.getValue();
    const hours = [];
    let time = moment().set('hours', schoolConfig?.start_hour!).set('minutes', schoolConfig?.start_minute!);

    for(let i = 1; i <= Math.max(maxHours, 8); i++) {
      let startHour = time.clone();
      time.add(schoolConfig?.lesson_hour, 'minutes');
      hours.push({
        start: startHour.format('HH:mm'),
        end: time.format('HH:mm')
      });
      let customBreak = schoolConfig?.breaks.filter((b: any) => b.hour == i + 1)[0]?.minutes;
      time.add(customBreak || schoolConfig?.break_time, 'minutes');
    }
    this.timetableHours = hours;
  }

  public exportPdf(): void {
    this.generatingPdf = true;
    const data = {
      type: 'rozvrh',
      timetableData: {
        timetable: this.timetable,
        timetableHours: this.timetableHours,
        selectedTab: 0, // Current week view
        timetableSelectedWeek: this.selectedWeek.format('YYYY-MM-DD'),
        targetType: 'room',
        targetId: this.room.room_id
      }
    };

    this.http.post(Config.API_URL + '/documents/generate', data, {
      withCredentials: true,
      responseType: 'blob'
    }).subscribe({
      next: (response: Blob) => {
        const url = window.URL.createObjectURL(response);
        window.open(url, '_blank');
        setTimeout(() => window.URL.revokeObjectURL(url), 100);
        this.generatingPdf = false;
      },
      error: () => {
        this.generatingPdf = false;
      }
    });
  }
}
