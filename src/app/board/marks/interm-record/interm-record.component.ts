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
  group_id: number;
  className: string;
  subject_id: number;
  shortSubject: string;
  subject: string;
  studentCount: number;
}

interface GradeColumn {
  column_id: number;
  topic: string;
  weight: number;
  max_points: number | null;
  type: number;
  created: Date;
  isExist: boolean;
}

interface Student {
  student_id: number;
  name: string;
  quarters: {
    quarter: number;
    grade: number;
    verbal_assessment: string;
  }[];
  marks: (string | null)[];
  is_exempted: boolean;
  exemption_note?: string;
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
  public marking_scale: number[] = [];

  public openColumn(columnIndex: number): void {
    const column = this.gradeColumns[columnIndex];

    // === Set Data ==
    this.marksManager.setAction(column.isExist ? "edit" : "create");
    this.marksManager.setTopic(column.topic);
    this.marksManager.setWeight(column.weight);
    this.marksManager.setMaxPoints(column.max_points);
    this.marksManager.setColumnId(column.column_id);
    this.marksManager.setColumnIndex(columnIndex);
    this.marksManager.setGroupId(this.groups[this.selected_group].group_id);
    this.marksManager.setSubjectId(this.groups[this.selected_group].subject_id);
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
    this.marksManager.setMaxPoints(column.max_points);
    this.marksManager.setColumnId(column.column_id);
    this.marksManager.setColumnIndex(columnIndex);
    this.marksManager.setGroupId(this.groups[this.selected_group].group_id);
    this.marksManager.setSubjectId(this.groups[this.selected_group].subject_id);
    this.marksManager.setSubjectName(this.groups[this.selected_group].subject);
    this.marksManager.setType(column.type)
    this.marksManager.setStudent(this.students[studentIndex].name);
    this.marksManager.setStudentId(this.students[studentIndex].student_id);
    this.marksManager.setStudentIndex(studentIndex);
    this.marksManager.setMark(this.students[studentIndex].marks[columnIndex]);

    // === Open Modal ===
    this.modalManager.updateModal("edit_mark", "title", mark ? (column.type === 1 ? "marks.edit_points" : "marks.edit_mark") : (column.type === 1 ? "marks.create_points" : "marks.create_mark"));
    this.modalManager.openModal("edit_mark");
  }

  public getPointGrade(pointsRaw: string | number | null, maxPoints: number): number {
    if (pointsRaw === null || pointsRaw === undefined) return 0;
    const pointsStr = String(pointsRaw);
    const points = parseFloat(pointsStr.replace(',', '.'));
    if (isNaN(points)) return 0;
    if (maxPoints <= 0) return 1;
    const percentage = (points / maxPoints) * 100;
    
    if (this.marking_scale && this.marking_scale.length === 5) {
      for (let i = 0; i < 4; i++) {
        if (percentage >= this.marking_scale[i]) return i + 1;
      }
      return 5;
    }
    if (percentage >= 85) return 1;
    if (percentage >= 70) return 2;
    if (percentage >= 50) return 3;
    if (percentage >= 30) return 4;
    return 5;
  }

  public getStudentAverage(student_index: number): string {
    if (!this.students[student_index]) return "";
    const student = this.students[student_index];

    let totalGrade = 0;
    let totalWeight = 0;

    for (let i = 0; i < student.marks.length; i++) {
      if (student.marks[i] !== null && student.marks[i] !== undefined && student.marks[i] !== "") {
        const markStr = String(student.marks[i]);
        const weight = this.gradeColumns[i].weight;
        
        let markVal = 0;
        if (this.gradeColumns[i].type === 1) {
            markVal = this.getPointGrade(markStr, this.gradeColumns[i].max_points || 1);
        } else {
            markVal = parseInt(markStr) || 0;
        }

        if (markVal > 0) {
            totalGrade += markVal * weight;
            totalWeight += weight;
        }
      }
    }

    if (totalWeight === 0) return "";
    const average = totalGrade / totalWeight;
    return average < 1 ? "1.00" : average.toFixed(2);
  }

  public getColumnAverage(columnIndex: number): string {
    if (!this.students.length) return "";
    let total = 0;
    const students = this.students.filter((student) => student.marks[columnIndex] != null && student.marks[columnIndex] !== "")
    if (!students.length) return "";

    const column = this.gradeColumns[columnIndex];
    if (column.type === 1) {
      students.forEach((student) => {
        total += this.getPointGrade(student.marks[columnIndex], column.max_points || 1);
      });
    } else {
      students.forEach((student) => {
        const markStr = String(student.marks[columnIndex]);
        total += parseInt(markStr) || 0;
      })
    }

    return (total / students.length).toFixed(2);
  }

  public updateGroup(): void {
    const group = this.getSelectedGroup();
    if (group) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { subject_id: group.subject_id, group_id: group.group_id },
        queryParamsHandling: 'merge',
      });
      this.http.post(
        `${Config.API_URL}/v1/marks/teacher/group`,
        { group_id: group.group_id, subject_id: group.subject_id },
        { withCredentials: true }
      ).subscribe((data) => {
        if ('columns' in data && 'students' in data) {
          this.marking_scale = (data as any)['marking_scale'] || [];
          this.gradeColumns = (data.columns as GradeColumn[]).map((column: GradeColumn) => ({ ...column, isExist: true }));
          for (let i = 0; i < this.add_more_columns; i++) {
            this.gradeColumns.push({
              column_id: -1,
              topic: "",
              weight: 1,
              max_points: null,
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
        icon: 'table-row',
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
        icon: 'question-mark',
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
        icon: 'table-options',
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
        icon: 'number-1',
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
            group.group_id === parseInt(group_id, 10) &&
            group.subject_id === parseInt(subject_id, 10)
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
        this.gradeColumns[data.columnIndex].max_points = data.max_points;
        this.marksManager.updateColumn$.next({});
        console.log(data)
      });

    // === Update column info ===
    this.marksManager.updateMark$
      .pipe(distinctUntilChanged())
      .subscribe((data) => {
        if (!Object.keys(data).length) return;
        
        if (data.type === 'midterm') {
          const studentIndex = this.marksManager.getSelectedStudentIndex();
          if (!this.students[studentIndex].quarters) {
            this.students[studentIndex].quarters = [];
          }
          
          if (data.grade === null) {
            this.students[studentIndex].quarters = this.students[studentIndex].quarters.filter(q => q.quarter !== data.quarter);
          } else {
            const quarterIndex = this.students[studentIndex].quarters.findIndex((q: any) => q.quarter === data.quarter);
            if (quarterIndex > -1) {
              this.students[studentIndex].quarters[quarterIndex].grade = data.grade;
            } else {
              this.students[studentIndex].quarters.push({
                quarter: data.quarter,
                grade: data.grade,
                verbal_assessment: ''
              });
            }
          }
        } else {
          this.students[data.studentIndex].marks[data.columnIndex] = data.mark;
        }
        
        this.marksManager.updateMark$.next({});
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
                group.group_id === parseInt(group_id, 10) &&
                group.subject_id === parseInt(subject_id, 10)
            );
            this.updateGroup();
          }
        }
      });
  }

  private getCurrentQuarter(): number {
    const now = new Date();
    const month = now.getMonth() + 1; // 1-12
    const day = now.getDate();

    // September - November = Q1
    if (month >= 9 && month <= 11) {
      return 1;
    }
    // December - January = End of Q2 (semester 1)
    if (month === 12 || month === 1) {
      return 2;
    }
    // February - April = Q3
    if (month >= 2 && month <= 4) {
      return 3;
    }
    // May - June = End of Q4 (semester 2)
    if (month >= 5 && month <= 6) {
      return 4;
    }
    // July - August = Summer break, default to Q4 (last completed)
    return 4;
  }

  public getStudentQuarter(studentIndex: number): number {
    const student = this.students[studentIndex];
    if (!student || !student.quarters || student.quarters.length === 0) return 0;
    return student.quarters?.find((quarter) => quarter.quarter === this.getCurrentQuarter())?.grade || 0;
  }

  public openMarkingScale(): void {
    this.modalManager.openModal('edit_marking_scale');
  }

  public openMidterm(studentIndex: number): void {
    const student = this.students[studentIndex];
    if (!student) return;

    // Set data for modal
    this.marksManager.setStudent(student.name);
    this.marksManager.setStudentId(student.student_id);
    this.marksManager.setStudentIndex(studentIndex);
    this.marksManager.setMark(student.quarters?.find((quarter) => quarter.quarter === this.getCurrentQuarter())?.grade?.toString() || null);
    this.marksManager.setGroupId(this.groups[this.selected_group].group_id);
    this.marksManager.setSubjectId(this.groups[this.selected_group].subject_id);
    this.marksManager.setSubjectName(this.groups[this.selected_group].subject);
    this.marksManager.setStudentAverage(this.getStudentAverage(studentIndex));

    this.modalManager.openModal('edit_midterm');
  }

  public toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }
}
