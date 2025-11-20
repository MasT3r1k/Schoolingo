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
  public l = inject(Locale);
  public absenceConfig = absence;
  public classbook = inject(Classbook);

  public max_hours = 8;

  // === Absence stats ===
  public get_total_students(): number {
    return this.classbook.students.length;
  }

  public get_present_students(): number {
    return this.classbook.students.filter((student) => student.absence[this.selected_lesson] == undefined).length;
  }

  public get_missing_students(): number {
    return this.classbook.students.filter((student) => student.absence[this.selected_lesson] !== undefined).length;
  }

  // === List lessons ===
  public lessons: ClassbookLesson[] = [
    {
      subjectName: "Matematika",
      className: "B4.I",
      groupName: null,
      topic: "",
      lockClassAfterLesson: false
    },
    {
      subjectName: "Anglický jazyk",
      className: "B4.I",
      groupName: "2",
      topic: "",
      lockClassAfterLesson: false
    },
    {
      subjectName: "Anglický jazyk",
      className: "B4.I",
      groupName: "1",
      topic: "Pikoláda v angličtině",
      lockClassAfterLesson: true
    }
  ];

  // === New Homework ===
  public newHomework(): void {
    this.modalManager.openModal('add_homework')
  }

  // === New Note ===
  public newNote(): void {
    this.modalManager.openModal('add_note')
  }

  public selected_lesson = 0;
  public selected_tab = 0;
  public selected_absence = 0;

  ngOnInit(): void {
    this.modalManager.addModal(
      'add_homework',
      {
        title: '',
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
        title: '',
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

    this.http.get(
      `${Config.API_URL}/v1/classbook/lesson?groupId=10&date=2025-11-18&hour=2&subjectId=6`,
      { withCredentials: true }
    )
    .subscribe((data: any) => {
      this.classbook.classbook = {
        ...data.classbook,
        lessonNumber: data.lessonNumber,
        lessonTotal: data.lessonTotal,
      };
      this.classbook.students = data.students;
    })

    this.http.get(
      `${Config.API_URL}/v1/classbook/homework?groupId=0&subjectId=0`,
      { withCredentials: true }
    )
    .subscribe((data) => console.log(data))
  }

  // === Apply Absence ===
  public applyAbsence(student_id: number, hour: number): void {
    if (this.selected_lesson !== hour) return;
    this.classbook.selectedAbsence = this.selected_absence;
    this.classbook.selectedStudent = student_id;
    this.modalManager.openModal('add_absence');
    return;
    this.classbook.students.find((student) => student.student_id == student_id).absence[hour] = this.selected_absence == -1 ? undefined : this.selected_absence;
  }

  public is_loading = false;
  public is_lesson_loading = false;
}
