import { Component, Input, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Locale } from '@Schoolingo/locale';
import { Utils } from '@Schoolingo/utils';
import { absence, working_mode } from '@Schoolingo/absence';
import { Permission } from '@Schoolingo/permission';
import { IconsModule } from '@Schoolingo/icons';
import moment from 'moment';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'schoolingo-timetable',
  standalone: true,
  imports: [CommonModule, IconsModule],
  templateUrl: './timetable.component.html',
  styleUrl: './timetable.component.css'
})
export class SharedTimetableComponent implements OnInit, OnDestroy {
  public l = inject(Locale);
  public Utils = Utils;
  public perms = inject(Permission);

  public absenceConfig = absence;
  public workingModeConfig = working_mode;

  @Input() isLoading: boolean = false;
  @Input() timetable: any[] = [];
  @Input() timetableHours: any[] = [];
  @Input() selectedWeek: moment.Moment | null = moment();
  @Input() selectedTab: number = 0; // 0 = actual, 1 = permanent
  @Input() type: 'teacher' | 'student' | 'class' | 'room' | 'supervision' = 'student';

  public getLessonClasses(index: number, index2: number, lesson: any): string[] {
    let classes = ['sub-lesson-hour', 'lesson-count-' + (this.timetable?.[index]?.[index2]?.length || 1)];
    if (lesson.empty) {
      classes.push('empty');
    }

    if (lesson.oldSubject && lesson.oldTeacher) {
      classes.push('substitution');
    }

    return classes;
  }

  private timerSubscription?: Subscription;

  ngOnInit(): void {
    this.timerSubscription = interval(1000).subscribe(() => {
      // Refresh UI every second for timers
    });
  }

  ngOnDestroy(): void {
    this.timerSubscription?.unsubscribe();
  }

  public isCurrentLesson(dayIndex: number, hourIndex: number): boolean {
    if (this.selectedTab === 1 || !this.timetableHours?.[hourIndex]) return false;
    const now = moment();
    const week = this.selectedWeek || moment();
    const lessonDay = this.Utils.getDayOfWeek(week, dayIndex);
    if (!now.isSame(lessonDay, 'day')) return false;

    const hourInfo = this.timetableHours[hourIndex];
    const start = moment(hourInfo.start, 'HH:mm');
    const end = moment(hourInfo.end, 'HH:mm');

    return now.isBetween(start, end);
  }

  public getLessonRemainingTime(dayIndex: number, hourIndex: number): string | null {
    if (!this.isCurrentLesson(dayIndex, hourIndex)) return null;
    const now = moment();
    const hourInfo = this.timetableHours[hourIndex];
    const end = moment(hourInfo.end, 'HH:mm');
    const diff = end.diff(now);
    if (diff < 0) return null;
    return moment.utc(diff).format('m:ss');
  }

  public getBreakRemainingTime(dayIndex: number, hourIndex: number): string | null {
    if (this.selectedTab === 1 || hourIndex >= this.timetableHours.length - 1) return null;
    
    const now = moment();
    const h1 = this.timetableHours[hourIndex];
    const h2 = this.timetableHours[hourIndex+1];
    
    if (!h1 || !h2) return null;

    const week = this.selectedWeek || moment();
    const lessonDay = this.Utils.getDayOfWeek(week, dayIndex);
    if (!now.isSame(lessonDay, 'day')) return null;

    const breakStart = moment(h1.end, 'HH:mm');
    const breakEnd = moment(h2.start, 'HH:mm');
    
    if (now.isBetween(breakStart, breakEnd)) {
        const diff = breakEnd.diff(now);
        return moment.utc(diff).format('m:ss');
    }
    return null;
  }
}
