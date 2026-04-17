import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CalendarManager } from '@Components/calendar-dropdown';
import { Config } from '@Schoolingo/config';
import { DropdownManager } from '@Schoolingo/dropdown';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { ModalManager } from '@Schoolingo/modal';
import { ScheduleBuilder } from '@Schoolingo/schedule_builder';
import { Utils } from '@Schoolingo/utils';

interface roomAPI {
  room_id: number;
  name: string;
}

interface groupAPI {
  group_id: number;
  name: string;
  num: number;
  class_name: string;
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
  public selectedTeacher2Id: number | null = null;
  public weeks = ['both', 'odd', 'even'];
  public selectedWeek: 'both' | 'odd' | 'even' = 'both';
  public selectedRoom: string = '';

  public searchSubject = new FormControl('');
  public searchTeacher = new FormControl('');
  public searchTeacher2 = new FormControl('');
  public searchRoom = new FormControl('');

  public types: string[] = [];
  public selected_type = '';
  public rooms: roomAPI[] = [];
  public groups: groupAPI[] = [];
  public selectedRoomId: number | null = null;
  public selectedGroupId: number | null = null;

  public unavailable: { teachers: number[], rooms: number[] } = { teachers: [], rooms: [] };

  ngOnInit(): void {
    const lesson = this.scheduleBuilder.activeLesson;
    console.log(lesson)

    const currentWeek = this.scheduleBuilder.selectedDate;
    if (currentWeek && lesson) {
      const currentDay = Utils.getDayOfWeek(currentWeek, lesson.day + 1);
      this.http.get<{teachers: number[], rooms: number[]}>(`${Config.API_URL}/v1/timetable/availability?date=${currentDay.format('YYYY-MM-DD')}&hour=${lesson.hour + 1}`)
        .subscribe((availability) => {
           this.unavailable = availability;
           
           const cls = this.scheduleBuilder.classes.find((c: any) => c.class_id === lesson.classId);
           const isTeacherForThisLesson = (lesson.teacherId === cls?.teacher_id || lesson.teacher_id === cls?.teacher_id);
           
           if (cls && cls.teacher_id && this.unavailable.teachers.includes(cls.teacher_id) && !isTeacherForThisLesson) {
               this.types = this.types.filter(t => t !== 'classroom_lesson');
               if (this.selected_type === 'classroom_lesson') {
                   this.selected_type = this.types.length > 0 ? this.types[0] : '';
                   this.selectType(this.selected_type);
               }
           }
        });
    }

    // Fetch rooms
    this.http.get<roomAPI[]>(`${Config.API_URL}/v1/timetable/rooms`)
        .subscribe((rooms) => {
            this.rooms = rooms;
            // Set initial room if lesson has one
            if (lesson && lesson.room) {
              const found = this.rooms.find(r => r.name === lesson.room);
              if (found) {
                this.selectedRoomId = found.room_id;
              }
            }
        });

    // Fetch groups
    this.http.get<groupAPI[]>(`${Config.API_URL}/v1/timetable/groups?classId=${lesson.classId}`)
        .subscribe((groups) => {
            this.groups = groups;
            if (lesson && !lesson.lessonId && this.selected_type === 'classroom_lesson') {
                 const nullGroup = this.groups.find(g => g.name == null && g.num == null);
                 if (nullGroup) {
                     this.selectedGroupId = nullGroup.group_id;
                 }
            } else if (lesson && lesson.group_id) {
                 const found = this.groups.find(g => g.group_id === lesson.group_id);
                 if (found) {
                     this.selectedGroupId = found.group_id;
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
      
      this.selectedSubjectId = lesson.subject_id;
      this.selectedTeacherId = lesson.teacher_id;
      this.selectedTeacher2Id = lesson.teacher2_id || null;
      this.selectedWeek = lesson.week || this.weeks[0];
    }
    
    this.types.push('classroom_lesson', 'change_timetable');
    
    if (lesson && !lesson.lesson_id) {
        this.selected_type = 'classroom_lesson';
        const cls = this.scheduleBuilder.classes.find((c: any) => c.class_id === lesson.classId);
        if (cls && cls.teacher_id) {
          this.selectedTeacherId = cls.teacher_id;
        }
    } else {
        const classSubject = this.scheduleBuilder.all_subjects.find((s: any) => s.is_class_time === 1 || s.is_class_time === true);
        if (classSubject && lesson && lesson.subject_id === classSubject.subject_id) {
            this.selected_type = 'classroom_lesson';
        } else if (this.types.includes('change_timetable')) {
             this.selected_type = 'change_timetable';
        } else {
             this.selected_type = this.types[0];
        }
    }
  }

  public selectType(type: string): void {
    this.selected_type = type;
    if (type === 'classroom_lesson') {
        this.setClassroomLessonDefaults();
    }
  }

  public setClassroomLessonDefaults(): void {
    const cls = this.scheduleBuilder.classes.find((c: any) => c.class_id === this.scheduleBuilder.activeLesson?.classId);
    if (cls && cls.teacher_id) {
      this.selectedTeacherId = cls.teacher_id;
    }
    const nullGroup = this.groups.find(g => g.name == null && g.num == null);
    if (nullGroup) {
      this.selectedGroupId = nullGroup.group_id;
    } else {
      this.selectedGroupId = null;
    }
  }

  public getFilteredSubjects(): any[] {
    const search = this.searchSubject.value?.toLowerCase() || '';
    return this.scheduleBuilder.subjects.filter((s: any) => 
      s.subject_name.toLowerCase().includes(search) || 
      s.subject_shortcut?.toLowerCase().includes(search)
    );
  }

  public getFilteredTeachers(): any[] {
    const search = this.searchTeacher.value?.toLowerCase() || '';
    const activeLesson = this.scheduleBuilder.activeLesson;
    return this.scheduleBuilder.getTeachers().filter((t: any) => 
      t.teacherId != this.selectedTeacher2Id &&
      (!this.unavailable.teachers.includes(t.teacherId) || t.teacherId === activeLesson?.teacherId) && (
      t.teacherName.toLowerCase().includes(search) ||
      t.firstName.toLowerCase().includes(search) ||
      t.lastName.toLowerCase().includes(search)
    ));
  }

  public getFilteredTeachers2(): any[] {
    const search = this.searchTeacher2.value?.toLowerCase() || '';
    const activeLesson = this.scheduleBuilder.activeLesson;
    return this.scheduleBuilder.getTeachers().filter((t: any) => 
      t.teacherId != this.selectedTeacherId &&
      (!this.unavailable.teachers.includes(t.teacherId) || t.teacherId === activeLesson?.teacher2Id) && (
      t.teacherName.toLowerCase().includes(search) ||
      t.firstName.toLowerCase().includes(search) ||
      t.lastName.toLowerCase().includes(search)
    ));
  }

  public getFilteredRooms(): roomAPI[] {
    const search = this.searchRoom.value?.toLowerCase() || '';
    const activeLesson = this.scheduleBuilder.activeLesson;
    return this.rooms.filter((r) => 
      (!this.unavailable.rooms.includes(r.room_id) || r.name === activeLesson?.room) &&
      r.name.toLowerCase().includes(search)
    );
  }

  public getSubjectName(subject_id: number): string {
    return this.scheduleBuilder.subjects.find((subject) => subject.subject_id == subject_id)?.subject_name ?? '';
  }

  public getRoomName(room_id: number): string {
    return this.rooms.find((r) => r.room_id == room_id)?.name ?? '';
  }

  public getGroupName(group_id: number | null): string {
    if (group_id == null) return '';
    const group = this.groups.find((g) => g.group_id == group_id);
    if (!group) return '';
    return (group.name || group.class_name) + ' ' + (group.num || 'Celá třída')
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

    if (this.selected_type === 'classroom_lesson') {
        const classSubject = this.scheduleBuilder.all_subjects.find((s: any) => s.is_class_time === 1 || s.is_class_time === true);
        if (classSubject) {
             this.selectedSubjectId = classSubject.subject_id;
        } else {
             alert('Not class_time subject found!');
             return;
        }
        this.updateSubstitution();
        return;
    }

    // Pokud je vybrána suplování
    if (this.selected_type === 'substitution' || this.selected_type === 'classroom_lesson') {
        this.updateSubstitution();
        return;
    }

    if (this.selected_type === 'cancel') {
        this.updateSubstitution('cancelled');
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
            teacher2Id: this.selectedTeacher2Id,
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
    if (!this.scheduleBuilder.activeLesson?.lesson_id) return;

    this.http.post(
        `${Config.API_URL}/v1/timetable/manage`,
        {
            action: 'delete',
            lessonId: this.scheduleBuilder.activeLesson.lesson_id
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

  public updateSubstitution(type?: string): void {
    if (!this.scheduleBuilder.activeLesson) return;
    const lesson = this.scheduleBuilder.activeLesson;
    const currentWeek = this.scheduleBuilder.selectedDate;
    const currentDay = Utils.getDayOfWeek(currentWeek, lesson.day + 1);

    let subType = type || 'substitution';
    
    // Auto-detect room_change if not explicitly cancelled
    if (subType !== 'cancelled') {
        const isSubjectSame = lesson.subjectId === this.selectedSubjectId;
        const isTeacherSame = lesson.teacherId === this.selectedTeacherId;
        const currentRoomName = this.rooms.find(r => r.room_id === this.selectedRoomId)?.name;
        const isRoomDifferent = lesson.room !== currentRoomName;

        if (isSubjectSame && isTeacherSame && isRoomDifferent) {
            subType = 'room_change';
        }
    }

    this.http.post(
      `${Config.API_URL}/v1/timetable/substitution`,
      {
        group_id: this.selectedGroupId !== null ? this.selectedGroupId : lesson.group_id,
        subject_id: subType === 'cancelled' ? -1 : this.selectedSubjectId,
        teacher_id: subType === 'cancelled' ? -1 : this.selectedTeacherId,
        teacher2_id: subType === 'cancelled' ? -1 : this.selectedTeacher2Id,
        room_id: this.selectedRoomId,
        start_date: currentDay.format('YYYY-MM-DD'),
        start_hour: lesson.hour + 1,
        end_date: currentDay.format('YYYY-MM-DD'),
        end_hour: lesson.hour + 1,
        type: subType
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
    const currentWeek = this.scheduleBuilder.selectedDate;
    const currentDay = Utils.getDayOfWeek(currentWeek, lesson.day + 1);
    this.http.post(
      `${Config.API_URL}/v1/timetable/cancel_substitution`,
      {
        group_id: lesson.group_id,
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
