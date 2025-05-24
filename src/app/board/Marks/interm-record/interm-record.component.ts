import { NgClass } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { dataAPI } from '@Components/Datalist/Datalist';
import { Modal } from '@Components/Modal/Modal';
import { Schoolingo } from '@Schoolingo';
import { personDetails } from '@Schoolingo/User';
import { BehaviorSubject, Subscription } from 'rxjs';
import { EditMarkComponent } from '../modals/edit-mark/edit-mark.component';
import { Alert } from '@Schoolingo/Alert';
import { AlertComponent } from '@Components/Alert/Alert';
import { EditColumnComponent } from '../modals/edit-column/edit-column.component';

interface teacherGroup {
  subject: string;
  subjectId: number;
  className: string;
  groupId: number;
  groupName: string;
  groupNum: string;
  students: number;
}

@Component({
  standalone: true,
  imports: [NgClass, AlertComponent],
  templateUrl: './interm-record.component.html',
  styleUrls: ['./interm-record.component.css', '../../../Styles/card.css', '../../../Styles/input.css']
})
export class IntermRecordComponent implements OnInit {
  private readonly ignoreGrade: any[] = ['+', '-', 'A', 'N', '?', null, undefined];

  public showSelect: 'groupSelect' | null = null;
  public listeners: Subscription[] = [];
  public groups: teacherGroup[] = [];
  public selectedGroup = new BehaviorSubject<number>(-1);
  public selectedSubject = new BehaviorSubject<number>(-1);

  public columns: any = []

  public students: {student: personDetails, grades: (string | number | null)[]}[] = [];
  private modals: Record<string, Modal> = {};
  public alert: Alert | null = null;

  constructor(
    public schoolingo: Schoolingo,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.modals['edit-mark'] = new Modal({
      title: {
        text: "marks/editMark",
      },
      size: 'size-2',
      closeable: true,
      items: [
        {
          type: "component",
          component: EditMarkComponent
        }
      ]
    });

    this.modals['edit-column'] = new Modal({
      title: {
        text: "marks/editColumn",
      },
      size: 'size-2',
      closeable: true,
      items: [
        {
          type: "component",
          component: EditColumnComponent
        }
      ]
    });

    setTimeout(() => {
      const url = new URLSearchParams(window.location.search);
      let groupId = +url.get("groupId")!;
      let subjectId = +url.get("subjectId")!;
      if (groupId && subjectId) {
        this.selectGroup(groupId, subjectId);
      }
    }, 500)

    this.schoolingo.socketService.emit("grades:getTeacherGroups");
    this.listeners.push(
      this.schoolingo.socketService.addFunction("connect").subscribe(() => {
        this.schoolingo.socketService.emit("grades:getTeacherGroups");
      })
    );

    this.listeners.push(
      this.schoolingo.socketService.addFunction("grades:getTeacherGroups")
      .subscribe((data: dataAPI | any) => {
        if (data.error) return;
        this.groups = data;
      })
    );

    this.listeners.push(
      this.schoolingo.socketService.addFunction("grades:getTeacherGroupStudents")
      .subscribe((data: any) => {
        if ('error' in data) {
          this.gotoGroup(-1, -1);
          return;
        }
        try {
          if (data.students.filter((st: any) => st.student == null).length > 0) {
            this.schoolingo.socketService.emit("grades:getTeacherGroupStudents", {
              groupId: this.selectedGroup,
              subjectId: this.selectedSubject
            });
            return;
          }
          this.students = data.students;
          this.columns = data.columns;
          for(let i = 0;i < 20;i++) {
            this.columns.push({ topic: "" })
          }
        } catch(e) {
          this.schoolingo.socketService.emit("grades:getTeacherGroupStudents", {
            groupId: this.selectedGroup,
            subjectId: this.selectedSubject
          });
          console.error(e);
        }
      })
    )

    this.listeners.push(
      this.route.queryParamMap.subscribe((param: Params) => {
        // Show company
        if (param.params.groupId != undefined && param.params.subjectId != undefined) {
          this.selectGroup(param.params.groupId, param.params.subjectId);
        } else {
          this.selectGroup(-1, -1)
        }
      })
    );
  }

    public editColumn(columnIndex: number): void {
    this.error(null);
    this.schoolingo.tmarks.setColumnIndex(columnIndex);
    this.schoolingo.tmarks.setTopic(this.columns[columnIndex].topic);
    this.schoolingo.tmarks.setSubjectId(this.selectedSubject.getValue());
    this.modals['edit-column'].open();
  }

  public editMark(student: number, gradeIndex: number): void {
    this.error(null);
    this.schoolingo.tmarks.setStudent(this.students[student].student);
    this.schoolingo.tmarks.setSubjectId(this.selectedSubject.getValue());
    this.schoolingo.tmarks.setMark(this.students[student].grades[gradeIndex]);
    this.modals['edit-mark'].open();
  }

  ngOnDestroy(): void {
    this.listeners.forEach((sub: Subscription) => sub.unsubscribe());
  }

  public getColumnAverage(columnIndex: number): string {
    try {

      let gradeTotal = 0;
      let gradeCount = 0;
      this.students.forEach((student: any) => {
        if (this.ignoreGrade.includes(student.grades[columnIndex])) return;
        gradeTotal += student.grades[columnIndex];
        gradeCount++;
      })
      let average = Number(gradeTotal / gradeCount);
      if (isNaN(average)) return "";
      return average.toFixed(2);
    } catch(e) {
      return "";
    }
  }

  public getStudentAverage(grades: (string | number | null)[]): string {
    let gradeTotal = 0;
    let gradeCount = 0;
    grades.forEach((grade: any) => {
      if (this.ignoreGrade.includes(grade)) return;
      gradeTotal += grade;
      gradeCount++;
    })
    let average = Number(gradeTotal / gradeCount);
    if (isNaN(average)) return "";
    return average.toFixed(2);
  }

  public gotoGroup(groupId: number | null, subjectId: number | null): void {
    if (groupId === null || groupId < 1 || subjectId === null || subjectId < 1) {
      this.router.navigate([], { queryParams: {} });
      return;
    }
    this.router.navigate([], { queryParams: { groupId, subjectId } });
  }

  public error(type: 'firstCreateColumn' | null): void {
    this.alert = null;
    switch(type) {
      case "firstCreateColumn":
        this.alert = new Alert("error", "marks/alerts/firstCreateColumn", true)
        break;
    }
  }

  public selectGroup(groupId: number, subjectId: number): void {
    this.gotoGroup(groupId, subjectId);
    if (this.getGroupFromId(groupId, subjectId)) {
      this.selectedGroup.next(groupId);
      this.selectedSubject.next(subjectId);
      this.schoolingo.socketService.emit("grades:getTeacherGroupStudents", { groupId, subjectId })
    } else {
      this.selectedGroup.next(-1);
      this.selectedSubject.next(-1);
      this.students = [];
      this.columns = [];
    }
  }

  public getGroupFromId(groupId: number, subjectId: number): teacherGroup {
    return this.groups.filter((group: teacherGroup) => group.groupId == groupId && group.subjectId == subjectId)?.[0];
  }

  public getSubject(): string[] {
    return this.schoolingo.subjects[this.selectedSubject.getValue()];
  }

  public getGroupText(group: teacherGroup | null): string {
    let text = "";
    if (group === null) return text;
    if (group?.subject) {
      text += group.subject;
    }
    if (group?.groupName) {
      text += " " + group.groupName
    }
    if (group?.groupNum) {
      text += " " + group.groupNum
    }
    if (group?.className) {
      text += " " + group.className
    }
    if (group?.students) {
      text += ' ( ' + group.students + ' žáků )'
    }
    return text;
  }

}
