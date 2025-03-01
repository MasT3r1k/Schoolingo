import { NgClass } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { dataAPI } from '@Components/Datalist/Datalist';
import { Schoolingo } from '@Schoolingo';
import { BehaviorSubject, Subscription } from 'rxjs';

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
  imports: [NgClass],
  templateUrl: './interm-record.component.html',
  styleUrls: ['./interm-record.component.css', '../../../Styles/card.css', '../../../Styles/input.css']
})
export class IntermRecordComponent implements OnInit {
  public showSelect: 'groupSelect' | null = null;
  public listeners: Subscription[] = [];
  public groups: teacherGroup[] = [];
  public selectedGroup = new BehaviorSubject(-1);
  public selectedSubject = new BehaviorSubject(-1);

  public columns: any = [
    {
      topic: "Průběžný test"
    },
    {
      topic: "Zkouška zdatnosti"
    },
    {
      topic: "Zkoušení u tabule"
    },
    {
      topic: "Aktivita v hodině"
    },
    {
      topic: "Průběžný test"
    },
    {
      topic: "Zkouška zdatnosti"
    },
    {
      topic: "Zkouška zdatnosti"
    },
    {
      topic: ""
    },
    {
      topic: ""
    },
    {
      topic: ""
    },
    {
      topic: ""
    },
    {
      topic: ""
    },
    {
      topic: ""
    },
    {
      topic: ""
    },
    {
      topic: ""
    },
    {
      topic: ""
    },
    {
      topic: ""
    },
    {
      topic: ""
    },
    {
      topic: ""
    },
    {
      topic: ""
    }
  ]

  public students: {student: string, grades: (string | number | null)[]}[] = [
    {
      student: "Numax Marcelos",
      grades: [1,2,3,4,null,5,'+']
    },
    {
      student: "Marcel Obecný",
      grades: [3,4,1,1,null,2,'-']
    },
    {
      student: "Marcel Divočák",
      grades: [1,1,1,1,1,1,'N']
    }
  ];

  constructor(
    public schoolingo: Schoolingo,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.schoolingo.socketService.emit("grades:getTeacherGroups");
    this.listeners.push(this.schoolingo.socketService.addFunction("connect").subscribe(() => {
      this.schoolingo.socketService.emit("grades:getTeacherGroups");
    }));

    this.listeners.push(this.schoolingo.socketService.addFunction("grades:getTeacherGroups").subscribe((data: dataAPI | any) => {
      if (data.error) return;
      this.groups = data;
    }));

    // this.listeners.push(this.selectedGroup.subscribe((groupId: number) => {
    //   if (groupId === -1) {
    //     this.router.navigate([]);
    //     return;
    //   }
    //   this.router.navigate([], { queryParams: { groupId, subjectId } });
    // }));

    this.listeners.push(this.route.queryParamMap.subscribe((param: Params) => {
      // Show company
      if (param.params.groupId != undefined && param.params.subjectId != undefined) {
        this.selectGroup(param.params.groupId, param.params.subjectId);
      }
    }));
  }

  ngOnDestroy(): void {
    this.listeners.forEach((sub: Subscription) => sub.unsubscribe());
  }

  public getColumnAverage(columnIndex: number): string {
    let gradeTotal = 0;
    let gradeCount = 0;
    this.students.forEach((student: any) => {
      if (['+', '-', 'A', 'N', '?', null, undefined].includes(student.grades[columnIndex])) return;
      gradeTotal += student.grades[columnIndex];
      gradeCount++;
    })
    let average = Number(gradeTotal / gradeCount);
    if (isNaN(average)) return "";
    return average.toFixed(2);
  }

  public getStudentAverage(grades: (string | number | null)[]): string {
    let gradeTotal = 0;
    let gradeCount = 0;
    grades.forEach((grade: any) => {
      if (['+', '-', 'A', 'N', '?', null].includes(grade)) return;
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

  public selectGroup(groupId: number, subjectId: number): void {
    this.gotoGroup(groupId, subjectId);
    if (this.getGroupFromId(groupId, subjectId)) {
      this.selectedGroup.next(groupId);
      this.selectedSubject.next(subjectId);
    } else {
      this.selectedGroup.next(-1);
      this.selectedSubject.next(-1);
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
