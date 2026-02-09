import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { Config } from '@Schoolingo/config';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { ModalManager } from '@Schoolingo/modal';
import { ScheduleBuilder } from '@Schoolingo/schedule_builder';
import { AddSubjectComponent } from '../../add-subject/add-subject.component';
import { AddEventComponent } from '../../add-event/add-event.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {CdkDrag, CdkDropList, CdkDropListGroup, CdkDragDrop, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
import { EditLessonComponent } from '../../edit-lesson/edit-lesson.component';

import { DropdownManager } from '@Schoolingo/dropdown';

@Component({
  selector: 'app-builder',
  imports: [IconsModule, FormsModule, ReactiveFormsModule, CdkDrag, CdkDropList, CdkDropListGroup],
  templateUrl: './builder.component.html',
  styleUrl: './builder.component.css'
})
export class BuilderComponent implements OnInit {
  public l = inject(Locale);
  public scheduleBuilder = inject(ScheduleBuilder);
  private http = inject(HttpClient);
  public dropdownManager = inject(DropdownManager);
  private modalManager = inject(ModalManager);
  public selected_class = 0;

  ngOnInit(): void {
    this.scheduleBuilder.isTimetableLoading = false;

    this.modalManager.addModal(
      'schedule_add_subject',
      {
        title: 'schedule.builder.add_subject',
        closeable: true,
        items: [
          {
            type: 'component',
            component: AddSubjectComponent
          }
        ]
      }
    )

    this.modalManager.addModal(
      'schedule_add_event',
      {
        title: 'schedule.builder.add_event',
        closeable: true,
        items: [
          {
            type: 'component',
            component: AddEventComponent
          }
        ]
      }
    )

    this.modalManager.addModal(
      'schedule_edit_lesson',
      {
        title: 'schedule.builder.edit_lesson',
        closeable: true,
        items: [
          {
            type: 'component',
            component: EditLessonComponent
          }
        ]
      }
    )

    this.http.get(
      `${Config.API_URL}/v1/schedule/all_subjects`,
      { withCredentials: true }
    )
    .subscribe((data) => {
      if ('subjects' in data) {
        this.scheduleBuilder.all_subjects = (data.subjects as any[])
        .sort((a, b) => {
          return ('' + a.subjectName).localeCompare(b.subjectName);
        });
      }
      if ('teachers' in data) {
        this.scheduleBuilder.teachers = data.teachers as any;
      }
    });

    this.scheduleBuilder.selectedClass.subscribe((data) => {
      this.scheduleBuilder.isTimetableLoading = true;
      this.scheduleBuilder.isSubjectsLoading = true;
      this.http.get(
        `${Config.API_URL}/v1/schedule/subjects?classId=${data}`,
        { withCredentials: true }
      )
      .subscribe((data) => {
        console.log(data)
        if ('subjects' in data) {
          this.scheduleBuilder.subjects = data.subjects as any[];
          this.scheduleBuilder.isTimetableLoading = false;
          this.scheduleBuilder.isSubjectsLoading = false;
        }
      })
    })

    this.http.get(
      `${Config.API_URL}/v1/schedule/classes`,
      { withCredentials: true }
    )
    .subscribe((data) => {
      if ('classes' in data) {
        this.scheduleBuilder.classes = data.classes as any[];
        console.log(this.scheduleBuilder.classes)
      }
      console.log(data)
    })
  }

  public selectClass(class_id: number): void {
    this.scheduleBuilder.selectedClass.next(class_id);
  }

  public openAddSubjectModal(): void {
    this.modalManager.openModal('schedule_add_subject');
  }

  public openAddEventModal(): void {
    this.modalManager.openModal('schedule_add_event');
  }

  public drop(event: CdkDragDrop<any[]>, dayIndex: number, hourIndex: number): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      // If dropping from available subjects (which might not be a connected drop list in the same way)
      // We need to handle it. 
      // Assuming the sidebar list is a connected drop list or we just use the data from the drag
      
      const subject = event.item.data;
      if (subject) {
          // Add new lesson to the schedule
          this.scheduleBuilder.timetable[dayIndex][hourIndex].push({
              subjectId: subject.subjectId,
              teacherId: null, // Default or select later
              week: 'both',
              room: ''
          });
      }
    }
  }

  public editLesson(lesson: any): void {
    this.scheduleBuilder.activeLesson = lesson;
    this.modalManager.openModal('schedule_edit_lesson');
  }
}
