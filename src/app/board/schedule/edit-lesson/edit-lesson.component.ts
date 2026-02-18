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

interface roomAPI {
  br_id: number;
  name: string;
}

interface groupAPI {
  groupId: number;
  name: string;
  num: number;
  className: string;
}

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
  public weeks = ['both', 'odd', 'even'];
  public selectedWeek: 'both' | 'odd' | 'even' = 'both';
  public selectedRoom: string = '';

  public types: string[] = [];
  public selected_type = '';
  public rooms: roomAPI[] = [];
  public groups: groupAPI[] = [];
  public selectedRoomId: number | null = null;
  public selectedGroupId: number | null = null;

  ngOnInit(): void {
    const lesson = this.scheduleBuilder.activeLesson;
    console.log(lesson)
    
    // Fetch rooms
    this.http.get<roomAPI[]>(`${Config.API_URL}/v1/timetable/rooms`)
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

    // Fetch groups
    this.http.get<groupAPI[]>(`${Config.API_URL}/v1/timetable/groups?classId=${lesson.classId}`)
        .subscribe((groups) => {
            this.groups = groups;
            if (lesson && lesson.groupId) {
                 const found = this.groups.find(g => g.groupId === lesson.groupId);
                 if (found) {
                     this.selectedGroupId = found.groupId;
                 }
            }
        });

    this.types = [];

    if (lesson && !lesson.empty) {
      if (!(lesson.groupName == null && lesson.groupNum == null || lesson.type == 0)) {
        this.types.push('add_timetable')
      }
      if (lesson.isSubstitution) {
        this.types.push('cancel_substitution');
      } else {
        this.types.push('substitution');
      }
      
      if (lesson.lessonId) {
          this.types.push('cancel');
      }
      
      this.selectedSubjectId = lesson.subjectId;
      this.selectedTeacherId = lesson.teacherId;
      this.selectedWeek = lesson.week || this.weeks[0];
    }
    
    this.types.push('classroom_lesson', 'change_timetable');
    
    if (lesson && !lesson.lessonId) {
        this.selected_type = 'classroom_lesson';
    } else {
        if (this.types.includes('change_timetable')) {
             this.selected_type = 'change_timetable';
        } else {
             this.selected_type = this.types[0];
        }
    }
  }

  public getSubjectName(subject_id: number): string {
    return this.scheduleBuilder.subjects.find((subject) => subject.subjectId == subject_id)?.subjectName ?? '';
  }

  public getRoomName(room_id: number): string {
    return this.rooms.find((r) => r.br_id == room_id)?.name ?? '';
  }

  public getGroupName(group_id: number | null): string {
    if (group_id == null) return '';
    const group = this.groups.find((g) => g.groupId == group_id);
    if (!group) return '';
    return (group.name || group.className) + ' ' + (group.num || 'Celá třída')
  }

  public save(): void {
    if (!this.scheduleBuilder.activeLesson) return;

    const lesson = this.scheduleBuilder.activeLesson;
    let action = lesson.lessonId ? 'update' : 'create';
    let lessonId: number | null = lesson.lessonId;

    if (this.selected_type === 'add_timetable') {
        action = 'create';
        lessonId = null;
    }

    // Pokud je vybrána suplování
    if (this.selected_type === 'substitution') {
        this.updateSubstitution();
        return;
    }

    this.http.post(
        `${Config.API_URL}/v1/timetable/manage`,
        {
            action: action,
            lessonId: lessonId,
            day: lesson.day,
            hour: lesson.hour + 1,
            subjectId: this.selectedSubjectId,
            teacherId: this.selectedTeacherId,
            roomId: this.selectedRoomId,
            groupId: this.selectedGroupId,
            type: this.weeks.indexOf(this.selectedWeek)
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
    console.log(this.scheduleBuilder.activeLesson)
    if (!this.scheduleBuilder.activeLesson?.lessonId) return;

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
        room_id: this.selectedRoomId,
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

  public cancelSubstitution(): void {
    if (!this.scheduleBuilder.activeLesson) return;
    const lesson = this.scheduleBuilder.activeLesson;
    const currentWeek = this.calendarManager.getCalendarData('scheduleBuilder_date').selected_date[0].getValue();
    const currentDay = Utils.getDayOfWeek(currentWeek, lesson.day + 1);
    this.http.post(
      `${Config.API_URL}/v1/timetable/cancel_substitution`,
      {
        group_id: lesson.groupId,
        subject_id: this.selectedSubjectId,
        teacher_id: this.selectedTeacherId,
        start_date: lesson.start_date,
        start_hour: lesson.start_hour,
        end_date: lesson.end_date,
        end_hour: lesson.end_hour
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
