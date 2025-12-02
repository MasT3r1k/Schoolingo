import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { Config } from '@Schoolingo/config';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { ModalManager } from '@Schoolingo/modal';
import { ScheduleBuilder } from '@Schoolingo/schedule_builder';
import { AddSubjectComponent } from '../add-subject/add-subject.component';
import { AddEventComponent } from '../add-event/add-event.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {CdkDrag, moveItemInArray} from '@angular/cdk/drag-drop';

import moment from 'moment';
import { TimetableLesson } from '../../Teach/timetable/timetable.component';
import { NgClass } from '@angular/common';
import { DropdownManager } from '@Schoolingo/dropdown';
import { EditLessonComponent } from '../edit-lesson/edit-lesson.component';

@Component({
  selector: 'app-builder',
  imports: [IconsModule, FormsModule, ReactiveFormsModule, CdkDrag, NgClass],
  templateUrl: './builder.component.html',
  styleUrl: './builder.component.css'
})
export class BuilderComponent implements OnInit {
  public alerts: any = {};
  public l = inject(Locale);
  public scheduleBuilder = inject(ScheduleBuilder);
  private http = inject(HttpClient);
  private modalManager = inject(ModalManager);
  public dropdownManager = inject(DropdownManager);

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

  public clearTimetable(): void {
    this.scheduleBuilder.subjects = [];
    this.scheduleBuilder.isTimetableLoading = false;
    this.scheduleBuilder.isSubjectsLoading = false;
  }

  public openSettings(): void {
    this.modalManager.openModal('schedule_settings');
  }

  public onDrop(event: DragEvent, index: number, index2: number): void {
    moveItemInArray(this.scheduleBuilder.subjects, index, index2);
  }

  public selectClass(class_id: number): void {
    this.scheduleBuilder.selectedClass.next(class_id);

    this.http.get<any[]>(
      Config.API_URL + '/v1/teachers',
      { withCredentials: true }
    )
    .subscribe((teachers: any[]) => {
      teachers.forEach((teacher) => {
        this.scheduleBuilder.teachers[teacher.teacherId] = teacher;
      }); 
    })

    this.http.post(
      Config.API_URL + '/v1/timetable',
      { type: 'class', id: 1, time: (moment()).format("YYYY-MM-DD")},
      { withCredentials: true })
    .subscribe((data: any) => {
      console.log(data)
      let timetableBuild: any[] = [];
      let maxHours = 0;

      if (data.timetable.length == 0 && data.substitution.length == 0) {
        this.scheduleBuilder.timetable = [];
        this.scheduleBuilder.hours = [];
        this.scheduleBuilder.isTimetableLoading = false
        return;
      }

      Object.values(data.timetable).forEach((item: any) => {
        item.color = "";
        item.all_day = false;
        if (item.hour + 1 > maxHours) {
          maxHours = item.hour + 1;
        }

        if (!timetableBuild[item.day]) {
          timetableBuild[item.day] = [];
        }

        if (!timetableBuild[item.day][item.hour - 1]) {
          timetableBuild[item.day][item.hour - 1] = [];
        }

        timetableBuild[item.day][item.hour - 1].push({
          ...item,
          hour: item.hour - 1,
          subjectName: item.subjectName,
          subjectShortcut: item.subjectShortcut,
          empty: false
        });
      });

      this.scheduleBuilder.timetable = timetableBuild;
      this.scheduleBuilder.isTimetableLoading = false;
    }, (err) => {
      this.scheduleBuilder.isTimetableLoading = true;
      this.scheduleBuilder.timetable = [];
    });
  }

  public countUsedSubjectLesson(subject_id: number): number {
    let used = 0;
    this.scheduleBuilder.timetable.forEach((day) => {
        day.forEach((hour) => {
          for(let i = 0;i < hour.length;i++) {
            if (hour[i].subjectId == subject_id) {
              used += hour[i].type == 0 ? 1 : 0.5;
            }
          }
        })
    })
    return used;
  }

  public formatGroupName(lesson: TimetableLesson): string {
    let group = "";
    if (lesson.groupName == null) {
      group = lesson.className;
    } else {
      group = lesson.groupName;
    }
    if (lesson.groupNum == null) {
      group += " celá";
    } else {
      group += " " + lesson.groupNum;
    }
    return group;
  }

  public getLessonClasses(index: number, index2: number, lesson: TimetableLesson): string[] {
  let classes = ['sub-lesson-hour', 'lesson-count-' + this.scheduleBuilder.timetable?.[index]?.[index2]?.length];
  if (lesson.empty) {
    classes.push('empty');
  }

  // if (this.schoolingo.isClassbook(index - 1, index2)) {
  //   classes.push('classbook');
  // }

  // let day = thissubstitution[Utils.getDayOfWeek(this.timetableSelectedWeek.getValue()!, index - 1).format('YYYY-MM-DD')];

  // if (day && day[index2]) {
  //   classes.push('substitution');
  // }

  return classes;
}

  public openAddSubjectModal(): void {
    this.modalManager.openModal('schedule_add_subject');
  }

  public openAddEventModal(): void {
    this.modalManager.openModal('schedule_add_event');
  }

  public openEditLessonModal(lesson: TimetableLesson | null): void {
    this.scheduleBuilder.activeLesson = lesson;
    this.modalManager.openModal('schedule_edit_lesson');
  }
}
