import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '@Schoolingo/icons';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Authentication } from '@Schoolingo/authentication';
import { Config } from '@Schoolingo/config';
import { Utils } from '@Schoolingo/utils';

import { AvatarService } from '@Schoolingo/utils';

interface TeacherInfo {
  name: string;
  email: string | null;
  avatar?: any;
}

interface SubjectTeacher {
  subjectId: number;
  label: string;
  shortcut: string;
  hours_per_week: number;
  is_mandatory: boolean;
  color: string | null;
  /** Can be string[] (legacy) or TeacherInfo[] (new API) */
  teachers: string[] | TeacherInfo[];
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
  subjects: any[];
  className?: string;
  class_name?: string;
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
  public avatarService = inject(AvatarService);
  public Utils = Utils
  public App = Config;

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
          this.studentSubjects = (data.subjects as any[]).map(s => ({
            subjectId: s.subject_id,
            label: s.label,
            shortcut: s.shortcut,
            hours_per_week: s.hours_per_week,
            is_mandatory: s.is_mandatory,
            color: s.color,
            teachers: (s.teachers ?? []).map((t: any) => ({
              ...t,
              avatar: t.avatar ? (typeof t.avatar === 'string' ? JSON.parse(t.avatar) : t.avatar) : null
            }))
          }));
          this.className = data.class_name || data.className || '';
        } else {
          this.teacherSubjects = (data.subjects as any[]).map(s => ({
            subjectId: s.subject_id,
            label: s.label,
            shortcut: s.shortcut,
            totalHoursPerWeek: s.total_hours_per_week,
            classes: (s.classes ?? []).map((c: any) => ({
              classId: c.class_id,
              className: c.class_name,
              hoursPerWeek: c.hours_per_week
            }))
          }));
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

  get mandatoryStudentSubjects(): SubjectTeacher[] {
    return this.studentSubjects.filter(s => s.is_mandatory);
  }

  get optionalStudentSubjects(): SubjectTeacher[] {
    return this.studentSubjects.filter(s => !s.is_mandatory);
  }

  getSubjectColor(color: string | null): string {
    return color || 'var(--primary)';
  }

  /** Normalize teachers array to TeacherInfo[] regardless of API version */
  asTeacherObjects(teachers: string[] | TeacherInfo[]): TeacherInfo[] {
    if (!teachers || teachers.length === 0) return [];
    if (typeof teachers[0] === 'string') {
      return (teachers as string[]).map(name => ({ name, email: null }));
    }
    return teachers as TeacherInfo[];
  }
}
