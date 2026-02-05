import { NgClass } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { absence } from '@Schoolingo/absence';
import { Config } from '@Schoolingo/config';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { ModalManager } from '@Schoolingo/modal';
import { HomeworkModal } from './modals/add-homework/homework';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoteModal } from './modals/add-note/note';
import { Classbook } from '@Schoolingo/classbook';
import { ClassbookAbsenceComponent } from './modals/absence/absence.component';
import { BehaviorSubject } from 'rxjs';
import { Authentication } from '@Schoolingo/authentication';
import moment from 'moment';
import { TimetableHours } from '../timetable/timetable.component';
import { School } from '@Schoolingo/school';
import { Utils } from '@Schoolingo/utils';

interface ClassbookLesson {
  subjectName: string;
  className: string;
  groupName: string | null;
  topic: string;
  lockClassAfterLesson: boolean;
}

@Component({
  selector: 'app-classbook',
  imports: [IconsModule, NgClass, FormsModule, ReactiveFormsModule],
  templateUrl: './classbook.component.html',
  styleUrl: './classbook.component.css'
})
export class ClassbookComponent implements OnInit {
  private http = inject(HttpClient);
  private modalManager = inject(ModalManager);
  private school = inject(School);
  private u = inject(Authentication);
  public l = inject(Locale);
  public absenceConfig = absence;
  public classbook = inject(Classbook);
  Utils = Utils;

  public max_hours = 8;

  // === Absence stats ===
  public get_total_students(): number {
    return this.classbook.students.length;
  }

  public get_present_students(): number {
    return this.classbook.students.filter((student) => student.absence[this.selected_lesson.getValue()] == undefined).length;
  }

  public get_missing_students(): number {
    return this.classbook.students.filter((student) => student.absence[this.selected_lesson.getValue()] !== undefined).length;
  }

  // === New Homework ===
  public newHomework(): void {
    this.modalManager.openModal('add_homework')
  }

  // === New Note ===
  public newNote(): void {
    this.modalManager.openModal('add_note')
  }

  public selected_lesson = new BehaviorSubject<number>(0);
  public selected_tab = 0;
  public selected_absence = 0;
  public timetable: any[] = [];
  public selected_date = moment().format('YYYY-MM-DD');
  public hours: TimetableHours[] = [];

  public updateLessons(): void {
    this.http.post(
      `${Config.API_URL}/v1/timetable`,
      {
        type: "person",
        id: this.u.getId(),
        time: this.selected_date
      },
      { withCredentials: true }
    )
    .subscribe((data: any) => {
      this.timetable = (data.timetable as any[]).filter((tt) => tt.day == moment(this.selected_date).isoWeekday());

      let schoolConfig = this.school.config.getValue();
      let time = moment()
      .set('hours', schoolConfig?.startHour!)
      .set('minutes', schoolConfig?.startMinute!);

      for(let i = 1;i <= this.max_hours;i++) {
        let startHour = time.clone();
        time.add(schoolConfig?.lessonHour, 'minutes');
        this.hours.push(
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
    })
  }

  ngOnInit(): void {
    this.updateLessons();

    this.modalManager.addModal(
      'add_homework',
      {
        title: 'classbook.add_homework.title',
        closeable: true,
        items: [
          {
            type: 'component',
            component: HomeworkModal
          }
        ]
      }
    )

    this.modalManager.addModal(
      'add_note',
      {
        title: 'classbook.add_note.title',
        closeable: true,
        items: [
          {
            type: 'component',
            component: NoteModal
          }
        ]
      }
    )

    this.modalManager.addModal(
      'add_absence',
      {
        title: 'classbook.add_absence.title',
        closeable: true,
        items: [
          {
            type: 'component',
            component: ClassbookAbsenceComponent
          }
        ]
      }
    )

    this.selected_lesson.subscribe(() => {
      this.http.get(
        `${Config.API_URL}/v1/classbook/lesson?groupId=${this.timetable[this.selected_lesson.getValue()].groupId}&date=${this.selected_date}&hour=${this.selected_lesson.getValue()}`,
        { withCredentials: true }
      )
      .subscribe((data: any) => {
        this.classbook.classbook = {
          ...data.classbook,
          lessonNumber: data.lessonNumber,
          lessonTotal: data.lessonTotal,
          classService: data.classService
        };

        this.classbook.students = data.students.map((student: any) => ({
          ...student,
          absence: Array.isArray(student.absence)
            ? student.absence.map((a: any) => (a?.type ?? undefined))
            : [],
          absence_data: student.absence
        }));
      });

      this.http.get<any[]>(
        `${Config.API_URL}/v1/classbook/homework?groupId=${this.timetable[this.selected_lesson.getValue()].groupId}&subjectId=${this.timetable[this.selected_lesson.getValue()].subjectId}`,
        { withCredentials: true }
      )
      .subscribe((data: any[]) => {
        this.classbook.homeworks = data;
      })

      this.http.get<any[]>(
        `${Config.API_URL}/v1/classbook/notes?groupId=${this.timetable[this.selected_lesson.getValue()].groupId}&subjectId=${this.timetable[this.selected_lesson.getValue()].subjectId}`,
        { withCredentials: true }
      )
      .subscribe((data: any[]) => {
        this.classbook.notes = data;
      })
    });
  }

  // === Apply Absence ===
  public applyAbsence(student_id: number, hour: number): void {
    if (this.selected_lesson.getValue() !== hour) return;
    this.classbook.selectedHour = hour;
    this.classbook.selectedAbsence = this.selected_absence;
    this.classbook.selectedStudent = student_id;

    if (this.absenceConfig[this.selected_absence] && this.absenceConfig[this.selected_absence].reasons.length) {
      this.modalManager.openModal('add_absence');
      return;
    }

    this.classbook.applyAbsence();
  }

  public is_loading = false;
  public is_lesson_loading = false;
}
