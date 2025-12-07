import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@Schoolingo/icons';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Authentication } from '@Schoolingo/authentication';
import { Config } from '@Schoolingo/config';
import { Utils } from '@Schoolingo/utils';

interface SubjectTeacher {
  subjectId: number;
  label: string;
  shortcut: string;
  hours_per_week: number;
  is_mandatory: boolean;
  color: string | null;
  teachers: string[];
}

interface SubjectClass {
  classId: number;
  className: string;
  hoursPerWeek: number;
}

interface TeacherSubject {
  subjectId: number;
  label: string;
  shortcut: string;
  totalHoursPerWeek: number;
  classes: SubjectClass[];
}

interface SubjectsResponse {
  role: 'student' | 'teacher';
  subjects: SubjectTeacher[] | TeacherSubject[];
  className?: string;
}

@Component({
  selector: 'app-subjects',
  standalone: true,
  imports: [CommonModule, IconsModule, RouterModule],
  templateUrl: './subjects.component.html',
  styleUrl: './subjects.component.css'
})
export class SubjectsComponent implements OnInit {
  private http = inject(HttpClient);
  private auth = inject(Authentication);
  public Utils = Utils
  
  loading = true;
  role: 'student' | 'teacher' = 'student';
  className = '';
  
  studentSubjects: SubjectTeacher[] = [];
  teacherSubjects: TeacherSubject[] = [];
  
  ngOnInit() {
    this.loadSubjects();
  }
  
  loadSubjects() {
    this.loading = true;
    this.http.get<SubjectsResponse>(
      Config.API_URL + '/v1/subjects',
      { withCredentials: true }
    ).subscribe({
      next: (data) => {
        this.role = data.role;
        if (data.role === 'student') {
          this.studentSubjects = data.subjects as SubjectTeacher[];
          this.className = data.className || '';
        } else {
          this.teacherSubjects = data.subjects as TeacherSubject[];
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load subjects', err);
        this.loading = false;
      }
    });
  }
  
  get totalHours(): number {
    if (this.role === 'student') {
      return this.studentSubjects.reduce((sum, s) => sum + (s.hours_per_week || 0), 0);
    }
    return this.teacherSubjects.reduce((sum, s) => sum + s.totalHoursPerWeek, 0);
  }
  
  getSubjectColor(color: string | null): string {
    return color || 'var(--primary)';
  }
}
