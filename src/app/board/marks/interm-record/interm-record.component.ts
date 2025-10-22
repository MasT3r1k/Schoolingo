import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Config } from '@Schoolingo/config';
import { Locale } from '@Schoolingo/locale';
import { EditColumnComponent } from './modals/edit-column/edit-column.component';
import { NgComponentOutlet } from '@angular/common';

interface Group {
  groupId: number;
  className: string;
  subjectId: number;
  shortSubject: string;
  subject: string;
  studentCount: number;
}

interface GradeColumn {
  topic: string;
  weight: number;
}

interface Student {
  name: string;
  quarter: number | null;
  marks: (number | null)[];
}

@Component({
  imports: [FormsModule, ReactiveFormsModule, NgComponentOutlet],
  templateUrl: './interm-record.component.html',
  styleUrl: './interm-record.component.css'
})
export class IntermRecordComponent {
  EditColumnComponent = EditColumnComponent;

  public modal: '' | 'edit_column' = 'edit_column';
  public add_more_columns = 16;

  public selected_group: number = -1;
  public l = inject(Locale);

  private http = inject(HttpClient);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  public groups: Group[] = [];
  public gradeColumns: GradeColumn[] = []
  public students: Student[] = [];

  public getStudentAverage(student_index: number): string {
    if (!this.students[student_index]) return "";
    const student = this.students[student_index];

    let total = 0;
    let totalDivide = 0;

    for (let i = 0;i < student.marks.length;i++) {
      if (student.marks[i]) {
        const weight = this.gradeColumns[i].weight;
        total += (student.marks[i] || 0) * weight;
        totalDivide += weight;
      }
    }
    if (totalDivide === 0) return "";

    const average = total / totalDivide;
    return average < 1 ? "1.00" : average.toFixed(2);
  }

  public getColumnAverage(columnIndex: number): string {
    if (!this.students.length) return "";
    let total = 0;
    const students = this.students.filter((student) => student.marks[columnIndex] != null)
    if (!students.length) return "";

    students.forEach((student) => {
      total += student.marks[columnIndex]!;
    })

    return (total / students.length).toFixed(2);
  }

  public updateGroup(): void {
    const group = this.getSelectedGroup();
    if (group) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { subject_id: group.subjectId, group_id: group.groupId },
        queryParamsHandling: 'merge', // nezruší ostatní parametry v URL
      });
      this.http.post(
        `${Config.API_URL}/v1/marks/teacher/group`,
        { group_id: group.groupId, subject_id: group.subjectId },
        { withCredentials: true }
      ).subscribe((data) => {
        if ('columns' in data && 'students' in data) {
          this.gradeColumns = data.columns as GradeColumn[];
          for(let i = 0;i < this.add_more_columns;i++) {
            this.gradeColumns.push({
              topic: "",
              weight: 1
            })
          }
          this.students = data.students as Student[]; 
        }
      })
    } else {
      this.router.navigate([]);
      this.selected_group = -1;
      this.students = [];
      this.gradeColumns = [];
    }
    console.log(group)
  }

  public getSelectedGroup(): Group | null {
    if (this.selected_group == -1) return null;
    const group = this.groups[this.selected_group];
    return group ?? null;
  }

  ngOnInit(): void {
    this.http
    .get<{ status: boolean; groups?: Group[] }>(
      `${Config.API_URL}/v1/marks/teacher/list`,
      { withCredentials: true }
    )
    .subscribe((data) => {
      if (data.groups) {
        this.groups = data.groups;

        const subject_id = this.route.snapshot.queryParamMap.get('subject_id');
        const group_id = this.route.snapshot.queryParamMap.get('group_id');

        if (subject_id != null && group_id != null) {
          this.selected_group = this.groups.findIndex(
            (group) =>
              group.groupId === parseInt(group_id, 10) &&
              group.subjectId === parseInt(subject_id, 10)
          );
          this.updateGroup();
        }
      }
    });
  }
}
