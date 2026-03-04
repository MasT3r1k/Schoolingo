import { NgClass } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { absence, AbsenceType } from '@Schoolingo/absence';
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
import { CalendarComponent } from '@Components/calendar';
import { CalendarManager } from '@Components/calendar-dropdown';
import moment from 'moment';
import { TimetableHours } from '../timetable/timetable.component';
import { School } from '@Schoolingo/school';
import { Utils } from '@Schoolingo/utils';

interface ClassbookLesson {
  subject_name: string;
  class_name: string;
  group_id: number;
  group_name: string | null;
  group_num: number | null;
  topic: string;
  lockClassAfterLesson: boolean;
}

@Component({
  selector: 'app-classbook',
  imports: [IconsModule, NgClass, FormsModule, ReactiveFormsModule, CalendarComponent],
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
  public calendarManager = inject(CalendarManager);
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
  public selected_date = moment();
  public hours: TimetableHours[] = [];

  public updateLessons(): void {
    this.http.post(
      `${Config.API_URL}/v1/timetable`,
      {
        type: "person",
        id: this.u.getId(),
        time: this.selected_date.format('YYYY-MM-DD')
      },
      { withCredentials: true }
    )
    .subscribe((data: any) => {
      this.timetable = (data.timetable as any[]).filter((tt) => tt.day == this.selected_date.isoWeekday());

      let schoolConfig = this.school.config.getValue();
      let time = moment()
      .set('hours', schoolConfig?.start_hour!)
      .set('minutes', schoolConfig?.start_minute!);

      for(let i = 1;i <= this.max_hours;i++) {
        let startHour = time.clone();
        time.add(schoolConfig?.lesson_hour, 'minutes');
        this.hours.push(
          {
            startMoment: startHour.clone(),
            start: startHour.format('HH:mm'),
            endMoment: time.clone(),
            end: time.format('HH:mm')
          }
        );
        let customBreak = schoolConfig?.breaks.filter((_) => _.hour == i + 1)[0]?.minutes;
        time.add(customBreak || schoolConfig?.break_time, 'minutes');
      }
    })
  }

  ngOnInit(): void {
    this.updateLessons();


    this.modalManager.addModal(
      'add_homework',
      {
        icon: 'notebook',
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
        icon: 'text-plus',
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
        icon: 'user-minus',
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
        `${Config.API_URL}/v1/classbook/lesson?groupId=${this.timetable[this.selected_lesson.getValue()].group_id}&date=${this.selected_date.format('YYYY-MM-DD')}&hour=${this.selected_lesson.getValue()}`,
        { withCredentials: true }
      )
      .subscribe((data: any) => {
        this.classbook.classbook = {
          ...data.classbook,
          lessonNumber: data.lessonNumber,
          lessonTotal: data.lessonTotal,
          classService: Object.values(data.classService)
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
        `${Config.API_URL}/v1/classbook/homework?groupId=${this.timetable[this.selected_lesson.getValue()].group_id}&subjectId=${this.timetable[this.selected_lesson.getValue()].subject_id}`,
        { withCredentials: true }
      )
      .subscribe((data: any[]) => {
        this.classbook.homeworks = data;
      })

      this.http.get<any[]>(
        `${Config.API_URL}/v1/classbook/notes?groupId=${this.timetable[this.selected_lesson.getValue()].group_id}&subjectId=${this.timetable[this.selected_lesson.getValue()].subject_id}`,
        { withCredentials: true }
      )
      .subscribe((data: any[]) => {
        this.classbook.notes = data;
      })
    });
  }

  public copyAbsenceFromPreviousHour(): void {
    let previous_selected_absence_type = this.classbook.selectedAbsence;
    Object.values(this.classbook.students).forEach((student) => {
      const previousAbsence = student.absence[this.selected_lesson.getValue() - 1];
      console.log(student, previousAbsence)
      let absenceType = previousAbsence;
      if ([AbsenceType.EXCUSED, AbsenceType.UNEXCUSED].includes(previousAbsence)) {
        absenceType = AbsenceType.ABSENCE;
      } else if ([AbsenceType.LATE].includes(previousAbsence)) {
        absenceType = undefined;
      } else if ([AbsenceType.EARLY].includes(previousAbsence)) {
        absenceType = AbsenceType.ABSENCE;
      }
      if (absenceType == undefined || absenceType == null) return;

      this.classbook.selectedAbsence = absenceType;
      this.classbook.selectedStudent = student.student_id;
      this.classbook.selectedHour = this.selected_lesson.getValue();
      this.classbook.applyAbsence();
    })

    this.classbook.selectedAbsence = previous_selected_absence_type;
    console.log(this.classbook.students);
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
