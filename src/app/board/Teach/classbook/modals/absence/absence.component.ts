import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Schoolingo } from '@Schoolingo';
import { Alert } from '@Schoolingo/Alert';
import { Permission } from '@Schoolingo/Permissions';

@Component({
  standalone: true,
  imports: [NgClass, FormsModule, ReactiveFormsModule],
  templateUrl: './absence.component.html',
  styleUrl: './absence.component.css'
})
export class ClassbookAbsenceComponent {
  constructor(
    public schoolingo: Schoolingo,
    public perms: Permission
  ) {}

  public lesson = this.schoolingo.timetableSelectedLesson.getValue();
  public errors: { [key: string]: Alert } = {};
  public showSelect: null | 'reason' = null;

  ngOnInit(): void {
    this.schoolingo.timetableSelectedLesson.subscribe((lesson) => {
      this.lesson = lesson;
    });
  }

  public submitAbsence(): void {
    this.schoolingo.classbook.applyAbsence.next(true);
  }
}
