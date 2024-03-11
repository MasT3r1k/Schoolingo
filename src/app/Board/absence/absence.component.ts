import { Component, OnInit } from '@angular/core';
import { ToastService } from '@Components/Toast';
import { SocketService } from '@Schoolingo/Socket';
import { UserService } from '@Schoolingo/User';
import { Locale } from '@Schoolingo/Locale';
import { Tabs } from '@Components/Tabs/Tabs';
import { Schoolingo } from '@Schoolingo';

type Subject = {
  subject: number;
  lessons: number;
}

type Absence = {
  type: number;
  subject: number;
  minutes: number;
  date: Date;
}

@Component({
  templateUrl: './absence.component.html',
  styleUrls: ['./absence.component.css', '../board.css']
})
export class AbsenceComponent implements OnInit {
  constructor(
    public toast: ToastService,
    private socketService: SocketService,
    private userService: UserService,
    public locale: Locale,
    public schoolingo: Schoolingo,
    public tabs: Tabs
  ) {}

  public tabName: string = 'ABSENCE_TAB_SELECT';
  public absence: Absence[] = [];
  public subjectLessons: Subject[] = [];

  ngOnInit(): void {
    this.socketService.addFunction("getUserAbsence").subscribe((data: any) => {
      this.subjectLessons = data.allLessons;
      this.absence = data.absence;
      console.log(data);
    });
    this.socketService.getSocket().Socket?.emit('getUserAbsence', this.userService.getUser()?.studentId);
  }

  public getAbsenceBySubject(subject: number): Absence[] {
    return this.absence.filter((absence: Absence) => absence.subject === subject);
  }

  public getLessonsBySubject(subject: number): Subject[] {
    return this.subjectLessons.filter((lesson: Subject) => lesson.subject === subject);
  }

  ngOnDestroy(): void {
    // Reset getUserAbsence
    delete this.socketService.socketFunctions["getUserAbsence"];
  }

}
