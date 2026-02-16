import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
  public rooms: {br_id: number, name: string}[] = [];
  public selectedRoomId: number | null = null;

  ngOnInit(): void {
    const lesson = this.scheduleBuilder.activeLesson;
    
    // Fetch rooms
    this.http.get<{br_id: number, name: string}[]>(`${Config.API_URL}/v1/timetable/rooms`)
        .subscribe((rooms) => {
            this.rooms = rooms;
            // Set initial room if lesson has one
            if (lesson && lesson.room) {
                 const found = this.rooms.find(r => r.name === lesson.room);
                 if (found) {
                     this.selectedRoomId = found.br_id;
                 }
            }
        });

    this.types = [];

    if (lesson && !lesson.empty) {
      this.types.push('substitution');
      
      if (lesson.lessonId) {
          this.types.push('cancel');
      }
      
      this.selectedSubjectId = lesson.subjectId;
      this.selectedTeacherId = lesson.teacherId;
      this.selectedWeek = lesson.week || 'both';
      // selectedRoomId handled in subscribe
    }
    
    this.types.push('classroom_lesson', 'change_timetable');
    
    if (lesson && !lesson.lessonId) {
        this.selected_type = 'classroom_lesson';
    } else {
        this.selected_type = this.types[0];
    }
  }

  public getSubjectName(subject_id: number): string {
    return this.scheduleBuilder.subjects.find((subject) => subject.subjectId == subject_id)?.subjectName ?? '';
  }

  public getRoomName(room_id: number): string {
    return this.rooms.find((r) => r.br_id == room_id)?.name ?? '';
  }

  public save(): void {
    if (!this.scheduleBuilder.activeLesson) return;

    // Pokud je vybrána suplování
    if (this.selected_type === 'substitution') {
        this.updateSubstitution();
        return;
    }

    const lesson = this.scheduleBuilder.activeLesson;
    const action = lesson.lessonId ? 'update' : 'create';

    this.http.post(
        `${Config.API_URL}/v1/timetable/manage`,
        {
            action: action,
            lessonId: lesson.lessonId,
            day: lesson.day + 1,
            hour: lesson.hour + 1,
            subjectId: this.selectedSubjectId,
            teacherId: this.selectedTeacherId,
            roomId: this.selectedRoomId,
            groupId: lesson.groupId
        },
        { withCredentials: true }
    ).subscribe({
        next: (res: any) => {
            if (res.success) {
                this.closeModal();
                // Refresh
                const currentClass = this.scheduleBuilder.selectedClass.getValue();
                this.scheduleBuilder.selectedClass.next(currentClass); 
            } else {
                alert(this.l.s('messages.error_save') + ': ' + (res.error || 'Unknown'));
            }
        },
        error: (err) => {
            console.error(err);
            alert('Error saving lesson');
        }
    });
  }

  public deleteLesson(): void {
    if (!this.scheduleBuilder.activeLesson?.lessonId) return;
    if (!confirm(this.l.s('messages.confirm_delete'))) return;

    this.http.post(
        `${Config.API_URL}/v1/timetable/manage`,
        {
            action: 'delete',
            lessonId: this.scheduleBuilder.activeLesson.lessonId
        },
        { withCredentials: true }
    ).subscribe((res: any) => {
        if (res.success) {
            this.closeModal();
            const currentClass = this.scheduleBuilder.selectedClass.getValue();
            this.scheduleBuilder.selectedClass.next(currentClass);
        }
    });
  }

  public closeModal(): void {
    this.modalManager.closeModal('schedule_edit_lesson');
  }

  public updateSubstitution(): void {
    if (!this.scheduleBuilder.activeLesson) return;
    const currentWeek = this.calendarManager.getCalendarData('scheduleBuilder_date').selected_date[0].getValue();
    const currentDay = Utils.getDayOfWeek(currentWeek, this.scheduleBuilder.activeLesson.day + 1);
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
      this.closeModal();
      const currentClass = this.scheduleBuilder.selectedClass.getValue();
      this.scheduleBuilder.selectedClass.next(currentClass);
    })
  }
}
