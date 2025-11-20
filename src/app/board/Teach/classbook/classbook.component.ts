import { NgClass } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { absence } from '@Schoolingo/absence';
import { Config } from '@Schoolingo/config';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { ModalManager } from '@Schoolingo/modal';
import { HomeworkModal } from './modals/add-homework/homework';

interface ClassbookLesson {
  subjectName: string;
  className: string;
  groupName: string | null;
  topic: string;
  lockClassAfterLesson: boolean;
}

@Component({
  selector: 'app-classbook',
  imports: [IconsModule, NgClass],
  templateUrl: './classbook.component.html',
  styleUrl: './classbook.component.css'
})
export class ClassbookComponent implements OnInit {
  private http = inject(HttpClient);
  private modalManager = inject(ModalManager);
  public l = inject(Locale);
  public absenceConfig = absence;

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

    this.http.get(
      `${Config.API_URL}/v1/classbook/lesson?groupId=10&date=2025-11-18&hour=2`,
      { withCredentials: true }
    )
    .subscribe((data) => console.log(data))

    this.http.get(
      `${Config.API_URL}/v1/classbook/homework?groupId=0&subjectId=0`,
      { withCredentials: true }
    )
    .subscribe((data) => console.log(data))
  }

  public is_loading = false;
  public is_lesson_loading = false;
}
