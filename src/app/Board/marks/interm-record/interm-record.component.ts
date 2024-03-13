import { Component, OnInit } from '@angular/core';
import { Locale } from '@Schoolingo/Locale';
import { Schoolingo } from '@Schoolingo';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { SocketService } from '@Schoolingo/Socket';

@Component({
  templateUrl: './interm-record.component.html',
  styleUrls: ['./interm-record.component.css', '../../board.css',]
})
export class IntermRecordComponent implements OnInit {

  public students: any[] = [];

  private declare groupStudentListListener;

  constructor(
    public locale: Locale,
    private schoolingo: Schoolingo,
    private router: Router,
    private route: ActivatedRoute,
    private socketService: SocketService
  ) {}

  public classes: { group: number, class: string, subjects: number[] }[] = this.schoolingo.getClassesAndSubjects();
  public list: [number, string, string, number][] = [];

  public getGroupId(): number {
    let id = -1;
    this.route.queryParams.forEach((param: Params) => {
      if (param['groupId'])
        id = param['groupId'];
    })
    return id;
  }

  public getSubjectId(): number {
    let id = -1;
    this.route.queryParams.forEach((param: Params) => {
      if (param['subjectId'])
        id = param['subjectId'];
    })
    return id;
  }



  ngOnInit(): void {
    if (this.getGroupId() !== -1 && this.getSubjectId() !== -1) {
      this.socketService.emitEvent('getClassStudents', { group: this.getGroupId() });
    }

    this.classes.forEach((data: { group: number, class: string, subjects: number[] }) => {
      data.subjects.forEach((subject: number) => {
        if (subject === -1) return;
        let subjectInfo = this.schoolingo.getSubject(subject);
        if (!subjectInfo) return;
        this.list.push([data.group, data.class, subjectInfo[2], subjectInfo[0]]);
      });
    });

    this.groupStudentListListener = this.socketService.addFunction('getClassStudents').subscribe((students: any[]) => {
      console.log(students);
      this.students = students.sort((a, b): any => {
        if (a.lastName < b.lastName) {
          return -1;
        }
        if (a.lastName > b.lastName) {
          return 1;
        }
      });

      let studentIds: number[] = [];
      this.students.forEach((st: any) => {
        studentIds.push(st.student);
      });


    });
  }

  ngOnDestroy(): void {
    this.groupStudentListListener.unsubscribe();
  }

  selectItem(index: number): void {
    this.router.navigate(['/marks/intermRecord'], { queryParams: { groupId: this.list[index][0], subjectId: this.list[index][3] } });
    this.socketService.emitEvent('getClassStudents', { group: this.list[index][0] });
  }


}
