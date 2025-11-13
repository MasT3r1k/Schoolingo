import { NgStyle } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Config } from '@Schoolingo/config';
import { IconsModule } from '@Schoolingo/icons';
import { Locale } from '@Schoolingo/locale';
import { ModalManager } from '@Schoolingo/modal';
import { ScheduleBuilder } from '@Schoolingo/schedule_builder';

@Component({
  selector: 'app-add-subject',
  imports: [IconsModule, FormsModule, ReactiveFormsModule, NgStyle],
  templateUrl: './add-subject.component.html',
  styleUrls: ['./add-subject.component.css', '../../../Components/modal/modal.css']
})
export class AddSubjectComponent {
  public l = inject(Locale)
  private http = inject(HttpClient);
  private modalManager = inject(ModalManager);
  public scheduleBuilder = inject(ScheduleBuilder);
  public page: 'main' | 'subject' | 'new_subject' | 'teacher' | 'new_teacher' = 'main'

  public subjectName = '';
  public subjectSearch = '';
  public hoursPerWeek = 3;
  public exerciseHours = 0;
  public defaultRoom = '';

  public newSubject = {
    subjectName: "",
    subjectShort: ""
  }

  public teachers: string[] = [];
  public teacherSearch = '';
  public teacherIndex = -1;
  public addTeacherInput(): void {
    this.teachers.push('');
  }

  public removeTeacherInput(index: number): void {
    this.teachers.splice(index, 1);
  }

  public chooseTeacher(index: number): void {
    this.page = 'teacher';
    this.teacherSearch = '';
    this.teacherIndex = index;
  }

  public custom_color = '#212121';
  public supported_colors: string[] = [
    '#5865f2',
    '#2ecc71',
    '#f1c40f',
    '#e74c3c',
    '#9b59b6',
    'custom'
  ];
  public selected_color: string = this.supported_colors[0];

  public getSubjectColor(): string {
    if (this.selected_color == 'custom') {
      return this.custom_color;
    }

    if (this.selected_color == '' && this.supported_colors[0] != '') {
      return this.supported_colors[0];
    }

    return this.selected_color;
  }

  ngOnInit(): void {
    this.addTeacherInput();
  }

  public to_select_subject(): void {
    this.page = 'subject';
    this.subjectSearch = '';
  }

  public createSubject(): void {
    this.http.post(
      `${Config.API_URL}/v1/schedule/create_subject`,
      { name: this.newSubject.subjectName, short: this.newSubject.subjectShort },
      { withCredentials: true }
    )
    .subscribe((data) => {
      if ('status' in data && data.status == true && 'subjectId' in data && 'name' in data && 'short' in data) {
        this.scheduleBuilder.all_subjects.push({
          subjectId: data.subjectId,
          subjectName: data.name,
          subjectShort: data.short,
          teachers: []
        });
        this.page = 'subject';
        this.newSubject = {
          subjectName: "",
          subjectShort: ""
        }
      }
    })
  }

  public add_subject(): void {
    const name = this.subjectName;
    const teachers: number[] = [];
    const hours = this.hoursPerWeek;
    const room = this.defaultRoom;
    const color = this.getSubjectColor();

    if (name == '' || teachers.length == 0 || hours == 0 || room == '' || color == '') {
      return;
    }
  }

  public getSubjects(): any[] {
    const search = (this.subjectSearch || '').toLowerCase().trim();
    const subjects = this.scheduleBuilder.all_subjects || [];

    if (!search) {
      return subjects;
    }

    return subjects.filter((subject: any) =>
      subject.subjectName.toLowerCase().includes(search)
    );
  }

  public getTeachers(): any[] {
    const search = (this.teacherSearch || '').toLowerCase().trim();
    const teachers = this.scheduleBuilder.getSubject(this.scheduleBuilder.selectedSubject)?.teachers || [];
    const assigned = this.teachers || []; // obsahuje teacherId

    const filtered = teachers.filter((teacher: any) =>
      !assigned.includes(teacher.teacherId) && // vyřadíme již přiřazené
      teacher.teacherName.toLowerCase().includes(search)
    );

    return filtered;
  }

  public closeModal(): void {
    this.modalManager.closeModal('schedule_add_subject');
  }
}
