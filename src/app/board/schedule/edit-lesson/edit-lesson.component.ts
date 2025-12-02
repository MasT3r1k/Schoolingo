import { Component, inject, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { ModalManager } from '@Schoolingo/modal';
import { ScheduleBuilder } from '@Schoolingo/schedule_builder';

@Component({
  selector: 'app-edit-lesson',
  standalone: true,
  imports: [IconsModule, FormsModule, ReactiveFormsModule],
  templateUrl: './edit-lesson.component.html',
  styleUrls: ['./edit-lesson.component.css', '../../../Components/modal/modal.css']
})
export class EditLessonComponent implements OnInit {
  public l = inject(Locale);
  private modalManager = inject(ModalManager);
  public scheduleBuilder = inject(ScheduleBuilder);

  public selectedSubjectId: number | null = null;
  public selectedTeacherId: number | null = null;
  public selectedWeek: 'both' | 'odd' | 'even' = 'both';
  public selectedRoom: string = '';

  ngOnInit(): void {
    const lesson = this.scheduleBuilder.activeLesson;
    if (lesson) {
        this.selectedSubjectId = lesson.subjectId;
        this.selectedTeacherId = lesson.teacherId;
        this.selectedWeek = lesson.week || 'both';
        this.selectedRoom = lesson.room || '';
    }
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
}
