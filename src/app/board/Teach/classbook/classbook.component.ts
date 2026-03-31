import { NgClass } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { absence, AbsenceConfig, AbsenceType } from '@Schoolingo/absence';
import { Config } from '@Schoolingo/config';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { ModalManager } from '@Schoolingo/modal';
import { HomeworkModal } from './modals/add-homework/homework';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoteModal } from './modals/add-note/note';
import { Classbook } from '@Schoolingo/classbook';
import { ClassbookAbsenceComponent } from './modals/absence/absence.component';
import { ClassbookUploadFilesComponent } from './modals/upload-files/upload-files.component';
import { BehaviorSubject } from 'rxjs';
import { Authentication } from '@Schoolingo/authentication';
import { CalendarComponent } from '@Components/calendar';
import { CalendarManager } from '@Components/calendar-dropdown';
import moment from 'moment';
import { TimetableHours } from '../timetable/timetable.component';
import { School } from '@Schoolingo/school';
import { Utils } from '@Schoolingo/utils';
import { Permission } from '@Schoolingo/permission';
import { AlertManager } from '@Schoolingo/alert';

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
  private perms = inject(Permission);
  private school = inject(School);
  private u = inject(Authentication);
  private alertManager = inject(AlertManager);
  public l = inject(Locale);
  public absenceConfig = absence;
  public classbook = inject(Classbook);
  public calendarManager = inject(CalendarManager);
  Utils = Utils;

  public max_hours = -1;

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

  public getSubmittedCount(hw: any): number {
    if (!hw.submissions || !Array.isArray(hw.submissions)) return 0;
    return hw.submissions.filter((s: any) => s.submitted || s.finished).length;
  }

  public selected_lesson = new BehaviorSubject<number>(0);
  public selected_tab = 0;
  public expandedHomework: number | null = null;
  public selected_absence = 0;
  public timetable: any[] = [];
  public selected_date = moment();
  public hours: TimetableHours[] = [];

  public goToPreviousLesson(): void {
    if (!this.classbook.classbook || !this.classbook.classbook.previousLesson) return;
    const prevLesson = this.classbook.classbook.previousLesson;

    this.selected_date = moment(prevLesson.date);
    this.selected_tab = 0;
    this.updateLessons(prevLesson.hour);
  }

  public updateLessons(targetHour?: number): void {
    this.is_loading = true;
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
        const timetableData: any[] = [];

        if ('timetable' in data) {
          data.timetable.forEach((lesson: any) => {
            timetableData.push({ ...lesson, isEmpty: false });
          });
        }

        if ('substitution' in data) {
          data.substitution.forEach((sub: any) => {
            const subDate = moment(sub.start_date);
            const subLesson: any = {
              day: subDate.isoWeekday(),
              hour: sub.start_hour,
              type: 0,
              room: sub.room,
              isEmpty: false,
              subject_id: sub.subject_id,
              subject_name: sub.subject_name || sub.event_name || 'Suplování',
              subjectShortcut: sub.subject_shortcut || 'SUPL',
              class_name: sub.class_name,
              group_name: sub.group_name,
              group_id: sub.group_id,
              lastName: sub.last_name,
              teacher: sub.teacher,
              isSubstitution: true
            };

            for (let h = sub.start_hour; h <= sub.end_hour; h++) {
              const existingIdx = timetableData.findIndex((l: any) => l.day === subLesson.day && l.hour === h);
              if (existingIdx !== -1) {
                timetableData[existingIdx] = { ...timetableData[existingIdx], ...subLesson, hour: h };
              } else {
                timetableData.push({ ...subLesson, hour: h });
              }
            }
          });
        }

        const day = this.selected_date.isoWeekday();
        const dateStr = this.selected_date.format('YYYY-MM-DD');

        if ('classbooks' in data) {
            timetableData.forEach((lesson: any) => {
                lesson.is_recorded = data.classbooks.some((cb: any) => {
                    return moment(cb.date).format('YYYY-MM-DD') === dateStr &&
                        cb.day_hour === (lesson.hour - 1) &&
                        cb.group_id === lesson.group_id &&
                        cb.topic !== null && cb.topic !== '';
                });
            });
        }
        
        const dailyLessons = timetableData.filter(
          (lesson: any) => lesson.day === day && (lesson.type == 0 || (lesson.type == 1 && this.selected_date.isoWeek() % 2) || (lesson.type == 2 && this.selected_date.isoWeek() % 2 == 0))
        );

        this.max_hours = dailyLessons.length > 0 ? Math.max(...dailyLessons.map((tt: any) => tt.hour)) : 0;

        this.timetable = [];
        for (let h = 1; h <= this.max_hours; h++) {
          const foundLesson = dailyLessons.find(tt => tt.hour === h);
          if (foundLesson) {
            this.timetable.push(foundLesson);
          } else {
            this.timetable.push({ hour: h, isEmpty: true });
          }
        }

        let schoolConfig = this.school.config.getValue();
        let time = moment()
          .set('hours', schoolConfig?.start_hour!)
          .set('minutes', schoolConfig?.start_minute!);

        this.hours = [];
        for (let i = 1; i <= this.max_hours; i++) {
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

        for (let i = 0; i < this.max_hours; i++) {
          let lesson = this.timetable[i];
          if (!lesson.isEmpty && !lesson.is_recorded) {
            let lessonEndMoment = this.hours[i].endMoment.clone().year(this.selected_date.year()).month(this.selected_date.month()).date(this.selected_date.date());
            if (moment().isAfter(lessonEndMoment)) {
              lesson.is_past_unrecorded = true;
            }
          }
        }

        this.is_loading = false;
        const firstValidLesson = this.timetable.find(l => !l.isEmpty);
        if (targetHour !== undefined && this.timetable[targetHour] && !this.timetable[targetHour].isEmpty) {
          this.selected_lesson.next(targetHour);
        } else if (firstValidLesson) {
          this.selected_lesson.next(firstValidLesson.hour - 1);
        } else {
          this.classbook.classbook = null as any;
        }
      })
  }

  public saveLesson(): void {
    const cb = this.classbook.classbook;
    if (!cb || !cb.classbook_id) return;

    this.http.post(
      `${Config.API_URL}/v1/classbook/lesson`,
      {
        classbook_id: cb.classbook_id,
        topic: cb.topic,
        note: cb.note,
        internalNote: cb.internal_note
      },
      { withCredentials: true }
    ).subscribe((res: any) => {
      if (res.success) {
        this.alertManager.alert('success', this.l.s('classbook.lesson_saved_success'));
        this.updateLessons(this.selected_lesson.getValue());
      }
    });
  }

  public getAbsenceConfig(): AbsenceConfig[] {
    let absence: AbsenceConfig[] = [];
    this.absenceConfig.forEach((config, index) => {
      if (this.perms.checkPermission(config.perms, this.classbook.classbook.class_name)) {
        absence[index] = config;
      }
    })
    return absence;
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
      'classbook_files',
      {
        title: 'messages.attachments',
        closeable: false,
        items: [
          { type: 'component', component: ClassbookUploadFilesComponent }
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

    this.selected_lesson.subscribe((value) => {
      if (value == undefined || !this.timetable[value]) return;
      if (this.timetable[value].isEmpty) {
        this.classbook.classbook = null as any;
        return;
      }

      this.is_lesson_loading = true;
      this.http.get(
        `${Config.API_URL}/v1/classbook/lesson?groupId=${this.timetable[value].group_id}&date=${this.selected_date.format('YYYY-MM-DD')}&hour=${value}`,
        { withCredentials: true }
      )
        .subscribe({
          next: (data: any) => {
            this.classbook.classbook = {
              ...data.classbook,
              lessonNumber: data.lessonNumber,
              lessonTotal: data.lessonTotal,
              classService: Object.values(data.classService),
              classMaxHours: data.classMaxHours,
              previousLesson: data.previousLesson
            };

            this.classbook.students = data.students.map((student: any) => ({
              ...student,
              exemption: student.exemption,
              absence: Array.isArray(student.absence)
                ? student.absence.map((a: any) => (a?.type ?? undefined))
                : [],
              absence_data: student.absence
            }));
            this.is_lesson_loading = false;
          },
          error: (err) => {
            this.is_lesson_loading = false;
            this.classbook.classbook = null as any;
          }
        });

      this.http.get<any[]>(
        `${Config.API_URL}/v1/classbook/homework?groupId=${this.timetable[value].group_id}&subjectId=${this.timetable[value].subject_id}`,
        { withCredentials: true }
      )
        .subscribe((data: any[]) => {
          this.classbook.homeworks = data;
        })

      this.http.get<any[]>(
        `${Config.API_URL}/v1/classbook/notes?groupId=${this.timetable[value].group_id}&subjectId=${this.timetable[value].subject_id}`,
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
      if (!this.perms.checkPermission(this.absenceConfig[absenceType].perms, this.classbook.classbook.class_name)) {
        absenceType = absenceType.ABSENCE;
      }
      if (absenceType == undefined || absenceType == null) return;

      this.classbook.selectedAbsence = absenceType;
      this.classbook.selectedStudent = student.student_id;
      this.classbook.selectedHour = this.selected_lesson.getValue();
      this.classbook.applyAbsence();
    })

    this.classbook.selectedAbsence = previous_selected_absence_type;
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
