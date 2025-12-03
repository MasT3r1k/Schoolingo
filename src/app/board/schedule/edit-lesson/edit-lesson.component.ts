import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TitleStrategy } from '@angular/router';
import { CalendarManager } from '@Components/calendar-dropdown';
import { Config } from '@Schoolingo/config';
import { DropdownManager } from '@Schoolingo/dropdown';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { ModalManager } from '@Schoolingo/modal';
import { ScheduleBuilder } from '@Schoolingo/schedule_builder';
import { Utils } from '@Schoolingo/utils';

@Component({
  selector: 'app-edit-lesson',
  standalone: true,
  imports: [IconsModule, FormsModule, ReactiveFormsModule],
  templateUrl: './edit-lesson.component.html',
  styleUrls: ['./edit-lesson.component.css']
})
export class EditLessonComponent implements OnInit {
  public l = inject(Locale);
  private modalManager = inject(ModalManager);
  public scheduleBuilder = inject(ScheduleBuilder);
  public calendarManager = inject(CalendarManager);
  public dropdownManager = inject(DropdownManager);
  private http = inject(HttpClient);

  public selectedSubjectId: number | null = null;
  public selectedTeacherId: number | null = null;
  public selectedWeek: 'both' | 'odd' | 'even' = 'both';
  public selectedRoom: string = '';

  public types: string[] = [];
  public selected_type = '';

  ngOnInit(): void {
    const lesson = this.scheduleBuilder.activeLesson;
    this.types = [];

    if (lesson) {
      this.types.push('substitution', 'cancel');
      this.selectedSubjectId = lesson.subjectId;
      this.selectedTeacherId = lesson.teacherId;
      this.selectedWeek = lesson.week || 'both';
      this.selectedRoom = lesson.room || '';
    }
    this.types.push('classroom_lesson', 'change_timetable');
    this.selected_type = this.types[0];
  }

  public getSubjectName(subject_id: number): string {
    return this.scheduleBuilder.subjects.find((subject) => subject.subjectId == subject_id)?.subjectName ?? '';
  }

  public save(): void {
    if (this.scheduleBuilder.activeLesson) {
        this.scheduleBuilder.activeLesson.subjectId = this.selectedSubjectId;
        this.scheduleBuilder.activeLesson.teacherId = this.selectedTeacherId;
        this.scheduleBuilder.activeLesson.week = this.selectedWeek;
        this.scheduleBuilder.activeLesson.room = this.selectedRoom;
        
        // Trigger an update if necessary, or just rely on object reference
    }
    this.closeModal();
  }

  public closeModal(): void {
    this.modalManager.closeModal('schedule_edit_lesson');
  }

  public updateSubstitution(): void {
    const currentWeek = this.calendarManager.getCalendarData('scheduleBuilder_date').selected_date[0].getValue();
    const currentDay = Utils.getDayOfWeek(currentWeek, this.scheduleBuilder.activeLesson.day);
    this.http.post(
      `${Config.API_URL}/v1/timetable/substitution`,
      {
        group_id: this.scheduleBuilder.activeLesson.groupId,
        subject_id: this.selectedSubjectId,
        teacher_id: this.selectedTeacherId,
        start_date: currentDay.format('YYYY-MM-DD'),
        start_hour: this.scheduleBuilder.activeLesson.hour + 1,
        end_date: currentDay.format('YYYY-MM-DD'),
        end_hour: this.scheduleBuilder.activeLesson.hour + 1
      },
      { withCredentials: true }
    )
    .subscribe((data) => {
      console.log(data)
    })
  }
}
