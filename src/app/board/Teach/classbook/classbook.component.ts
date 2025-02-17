import { NgClass } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Dropdown } from '@Components/Dropdowns/Dropdown';
import { Schoolingo, TimetableLesson } from '@Schoolingo';
import { IconsModule } from '../../../Modules/Icons.module';
import { BehaviorSubject, Subscription } from 'rxjs';
import moment from 'moment';
import { Permission } from '@Schoolingo/Permissions';
import { Alert } from '@Schoolingo/Alert';
import { AlertComponent } from '@Components/Alert/Alert';
import { TabsComponent } from '@Components/Tabs/Tabs';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { personDetails } from '@Schoolingo/User';
import { AbsenceType } from '@Schoolingo/Absence';

interface Absence {
  hour: number;
  type: number;
}

@Component({
  standalone: true,
  imports: [NgClass, IconsModule, AlertComponent, TabsComponent, FormsModule, ReactiveFormsModule],
  templateUrl: './classbook.component.html',
  styleUrls: ['./classbook.component.css', '../../../Styles/card.css', '../../../Styles/item.css']
})

export class ClassbookComponent implements OnInit {
  private subscribers: Subscription[] = [];
  public calendarCalendarName = 'classbookCalendar';
  public selectedDate = new BehaviorSubject<moment.Moment>(moment());
  public selectedHour = new BehaviorSubject<number | null>(null);
  public selectedTab = new BehaviorSubject(0);
  public selectedAbsence = new BehaviorSubject<number>(0);
  public alerts: { [key: string]: Alert } = {
    "noLessons": new Alert('error', 'timetable/notStudyDay'),
    "firstLesson": new Alert('error', 'classbook/firstLesson')
  }

  // Lesson Data
  public students: personDetails[] = [];
  public lesson: any = {};
  public absence: number[][] = [];

  /** Write lesson */
  public lessonNumber = 0;
  public lessonTopic = '';
  public lessonNote = '';
  public lessonInternalNote = '';


  constructor(
    public schoolingo: Schoolingo,
    public dropdown: Dropdown,
    public perms: Permission
  ) {}

  public checkDay(): boolean {
    let checkDay = this.schoolingo.getTimetableLessons()[this.selectedDate.getValue().isoWeekday() - 1];
    if (!checkDay) return false;
    let checkLesson = false;
    checkDay.forEach((lesson: TimetableLesson[]) => {
      for (let i = 0;i < lesson.length;i++) {
        if (!lesson[i].empty) checkLesson = true; 
      }
    })

    return checkLesson;
    
  }

  public resetAlerts(): void {
    delete this.alerts["absence"];

  }

  public applyAbsence(studentId: number, hour: number): void {
    this.resetAlerts();

    let isClassTeacher = this.schoolingo.userService.getUser()!.id === this.lesson.classInfo.teacher;
    let absence = this.getAbsence(studentId, hour);
    if ([AbsenceType.EXCUSED, AbsenceType.NON_COUNT].includes(absence) && !isClassTeacher) {
      this.alerts["absence"] = new Alert("error", "classbook/absence/noPerm")
      return;
    }
  }

  public addAbsence(studentId: number, absence: Absence[]): void {
    if (!this.absence[studentId]) {
      this.absence[studentId] = [];
    }

    absence.forEach((ab: Absence) => {
      this.absence[studentId][ab.hour] = ab.type;
    });
  }

  public getAbsence(studentId: number, hour: number): number {
    if (this.absence[studentId] === undefined) return -1;
    if (this.absence[studentId][hour] === undefined) return -1;
    return this.absence[studentId][hour];
  }

  ngOnInit(): void {
    if (!this.perms.checkPermission(['teacher'])) {
      this.schoolingo.hasAccessToPage = false;
    }

    this.subscribers.push(
      this.schoolingo.socketService.addFunction('classbook:getStudentsList').subscribe((students: personDetails[]) => {
        this.students = students;
      })
    );

    this.subscribers.push(
      this.schoolingo.socketService.addFunction('classbook:getLesson').subscribe((data) => {
        console.log(data);
        for (let i = 0; i < data.absence.length; i++) {
          this.addAbsence(data.absence[i].student, [
            { type: data.absence[i].type, hour: data.absence[i].dayHour }
          ]);
        }
        delete data.absence;
        this.lesson = data;
      })
    )

    // Calendar
    this.dropdown.create(this.calendarCalendarName,
      {
        title: '',
        isOpen: false,
        items: [{
          type: 'calendar',
          date: this.selectedDate,
          selectedMonth: this.selectedDate.getValue().clone(),
          isActive: true
        }]
      }
    );

    this.subscribers.push(
      this.selectedDate.subscribe(() => {
        this.selectedHour.next(null);
      })
    );

    this.subscribers.push(
      this.selectedHour.subscribe(() => {
        this.selectedTab.next(0);
        this.selectedAbsence.next(0);
        this.resetAlerts();

        let lesson = this.schoolingo.getTimetableLessons()?.[this.selectedDate.getValue().isoWeekday() - 1]?.[this.selectedHour.getValue()!]?.[0];
        if (!lesson || lesson.empty) return;
        
        this.schoolingo.socketService.emit('classbook:getLesson', {
          date: this.selectedDate.getValue().format("YYYY-MM-DD"),
          hour: this.selectedHour.getValue(),
          groupId: lesson.group.id,
          subject: lesson.subject
        });

        this.schoolingo.socketService.emit('classbook:getStudentsList', {
          groupId: lesson.group.id
        });
      })
    )
  }

  ngOnDestroy(): void {
    this.selectedDate.next(moment());
    this.dropdown.remove(this.calendarCalendarName);
    this.subscribers.forEach(sub => sub.unsubscribe());
  }

}
