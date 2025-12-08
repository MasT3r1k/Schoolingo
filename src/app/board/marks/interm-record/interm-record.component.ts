import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Config } from '@Schoolingo/config';
import { Locale } from '@Schoolingo/locale';
import { EditColumnComponent } from './modals/edit-column/edit-column.component';
import { ModalManager } from '@Schoolingo/modal';
import { MarksManager } from '@Schoolingo/marks';
import { distinctUntilChanged } from 'rxjs';
import { EditMarkComponent } from './modals/edit-mark/edit-mark.component';
import { IconsModule } from '@Schoolingo/icons';
import { EditMarkingScaleComponent } from './modals/edit-marking-scale/edit-marking-scale.component';
import { EditMidtermComponent } from './modals/edit-midterm/edit-midterm.component';
import { DropdownManager } from '@Schoolingo/dropdown';

interface Group {
  groupId: number;
  className: string;
  subjectId: number;
  shortSubject: string;
  subject: string;
  studentCount: number;
}

interface GradeColumn {
  columnId: number;
  topic: string;
  weight: number;
  type: number;
  created: Date;
  isExist: boolean;
}

interface Student {
  studentId: number;
  name: string;
  quarter: number | null;
  marks: (string | null)[];
}

@Component({
  imports: [FormsModule, ReactiveFormsModule, IconsModule],
  templateUrl: './interm-record.component.html',
  styleUrl: './interm-record.component.css'
})
export class IntermRecordComponent {
  EditColumnComponent = EditColumnComponent;
  private modalManager = inject(ModalManager);
  private marksManager = inject(MarksManager);
  public dropdownManager = inject(DropdownManager);

  public add_more_columns = 16;
  public isDropdownOpen = false;

  public selected_group: number = -1;
  public l = inject(Locale);

  private http = inject(HttpClient);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  public groups: Group[] = [];
  public gradeColumns: GradeColumn[] = []
  public students: Student[] = [];

  public openColumn(columnIndex: number): void {
    const column = this.gradeColumns[columnIndex];

    // === Set Data ==
    this.marksManager.setAction(column.isExist ? "edit" : "create");
    this.marksManager.setTopic(column.topic);
    this.marksManager.setWeight(column.weight);
    this.marksManager.setColumnId(column.columnId);
    this.marksManager.setColumnIndex(columnIndex);
    this.marksManager.setGroupId(this.groups[this.selected_group].groupId);
    this.marksManager.setSubjectId(this.groups[this.selected_group].subjectId);
    this.marksManager.setType(column.type)

    // === Update Modal Title ===
    this.modalManager.updateModal("edit_column", "title", column.isExist ? "marks.edit_column" : "marks.create_column")

    // === Open Modal ===
    this.modalManager.openModal("edit_column");
  }

  public updateMark(columnIndex: number, studentIndex: number): void {
    const column = this.gradeColumns[columnIndex];
    const mark = this.students[studentIndex].marks[columnIndex]
    if (!column.isExist) return;

    // === Set Data ==
    console.log(column);
    this.marksManager.setAction(mark ? "edit" : "create");
    this.marksManager.setTopic(column.topic);
    this.marksManager.setWeight(column.weight);
    this.marksManager.setColumnId(column.columnId);
    this.marksManager.setColumnIndex(columnIndex);
    this.marksManager.setGroupId(this.groups[this.selected_group].groupId);
    this.marksManager.setSubjectId(this.groups[this.selected_group].subjectId);
    this.marksManager.setSubjectName(this.groups[this.selected_group].subject);
    this.marksManager.setType(column.type)
    this.marksManager.setStudent(this.students[studentIndex].name);
    this.marksManager.setMark(this.students[studentIndex].marks[columnIndex]);

    // === Open Modal ===
    this.modalManager.openModal("edit_mark");
  }

  public getStudentAverage(student_index: number): string {
    if (!this.students[student_index]) return "";
    const student = this.students[student_index];

    let total = 0;
    let totalDivide = 0;

    for (let i = 0;i < student.marks.length;i++) {
      if (student.marks[i]) {
        const weight = this.gradeColumns[i].weight;
        total += (parseInt(student.marks[i]!) || 0) * weight;
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
      total += parseInt(student.marks[columnIndex]! ?? 0);
    })

    return (total / students.length).toFixed(2);
  }

  public updateGroup(): void {
    const group = this.getSelectedGroup();
    if (group) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { subject_id: group.subjectId, group_id: group.groupId },
        queryParamsHandling: 'merge',
      });
      this.http.post(
        `${Config.API_URL}/v1/marks/teacher/group`,
        { group_id: group.groupId, subject_id: group.subjectId },
        { withCredentials: true }
      ).subscribe((data) => {
        if ('columns' in data && 'students' in data) {
          this.gradeColumns = (data.columns as GradeColumn[]).map((column: GradeColumn) => ({ ...column, isExist: true }));
          for(let i = 0;i < this.add_more_columns;i++) {
            this.gradeColumns.push({
              columnId: -1,
              topic: "",
              weight: 1,
              type: 0,
              created: new Date(),
              isExist: false
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
  }

  public getSelectedGroup(): Group | null {
    if (this.selected_group == -1) return null;
    const group = this.groups[this.selected_group];
    return group ?? null;
  }

  ngOnInit(): void {
    // === Create modals ===
    this.modalManager.addModal(
      "edit_column",
      {
        title: "marks.edit_column",
        items: [
          { type: 'component', component: EditColumnComponent }
        ],
        closeable: true
      }
    );

    this.modalManager.addModal(
      "edit_mark",
      {
        title: "marks.edit_mark",
        items: [
          { type: 'component', component: EditMarkComponent }
        ],
        closeable: true
      }
    );

    this.modalManager.addModal(
      'edit_marking_scale',
      {
        title: 'marks.edit_marking_scale.title',
        items: [
          { type: 'component', component: EditMarkingScaleComponent }
        ],
        closeable: true
      }
    )

    this.modalManager.addModal(
      'edit_midterm',
      {
        title: 'marks.edit_midterm.title_midterm',
        closeable: true,
        items: [
          { type: 'component', component: EditMidtermComponent }
        ]
      }
    )

    // === Listen to query params ===
    this.route.queryParams.subscribe(() => {
      const subject_id = this.route.snapshot.queryParamMap.get('subject_id');
      const group_id = this.route.snapshot.queryParamMap.get('group_id');
      if (subject_id != null && group_id != null) {
        this.selected_group = this.groups.findIndex(
          (group) =>
            group.groupId === parseInt(group_id, 10) &&
            group.subjectId === parseInt(subject_id, 10)
        );
      } else {
        this.selected_group = -1;
      }
      this.updateGroup();
    });

    // === Update column info ===
    this.marksManager.updateColumn$
    .pipe(distinctUntilChanged())
    .subscribe((data) => {
      if (!Object.keys(data).length) return;
      this.gradeColumns[data.columnIndex].isExist = true;
      this.gradeColumns[data.columnIndex].topic = data.topic;
      this.gradeColumns[data.columnIndex].type = data.type;
      this.gradeColumns[data.columnIndex].weight = data.weight;
      this.marksManager.updateColumn$.next({});
      console.log(data)
    });

    // === Get teacher groups ===
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

  public openMarkingScale(): void {
    this.modalManager.openModal('edit_marking_scale');
  }

  public openMidterm(studentIndex: number): void {
    const student = this.students[studentIndex];
    if (!student) return;

    // Set data for modal
    this.marksManager.setStudent(student.name);
    this.marksManager.setStudentId(student.studentId);
    this.marksManager.setMark(student.quarter?.toString() || null);
    this.marksManager.setGroupId(this.groups[this.selected_group].groupId);
    this.marksManager.setSubjectId(this.groups[this.selected_group].subjectId);
    this.marksManager.setSubjectName(this.groups[this.selected_group].subject);
    this.marksManager.setStudentAverage(this.getStudentAverage(studentIndex));

    this.modalManager.openModal('edit_midterm');
  }

  public toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }
}
