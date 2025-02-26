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
import { AbsenceConfig, AbsenceType } from '@Schoolingo/Absence';
import { Utils } from '@Schoolingo/Utils';

interface Absence {
  hour: number;
  type: number;
}

interface lastLesson {
  cbId: number;
  number: number;
  date: string;
  dayHour: number;
  subject: number;
  teacher: number;
  groupId: number;
  room: number;
  topic: string;
  note: string;
  internalNote: string;
  absence: number;
}

@Component({
  standalone: true,
  imports: [NgClass, IconsModule, AlertComponent, TabsComponent, FormsModule, ReactiveFormsModule],
  templateUrl: './classbook.component.html',
  styleUrls: ['./classbook.component.css', '../../../Styles/card.css', '../../../Styles/item.css']
})

export class ClassbookComponent implements OnInit {
  Utils = Utils;

  private subscribers: Subscription[] = [];
  public calendarCalendarName = 'classbookCalendar';
  public selectedDate = new BehaviorSubject<moment.Moment>(moment());
  public selectedHour = new BehaviorSubject<number | null>(null);
  public selectedTab = new BehaviorSubject(0);
  public selectedAbsence = new BehaviorSubject<number>(0);
  public alerts: { [key: string]: Alert } = {
    "noLessons": new Alert('error', 'timetable/notStudyDay'),
    "firstLesson": new Alert('error', 'classbook/firstLesson'),
    "emptyLesson": new Alert('info', 'classbook/emptyLesson'),
    "notWrittenLesson": new Alert('error', 'classbook/notWrittenLesson')
  }

  // Lesson Data
  public students: personDetails[] = [];
  public lesson: any = {};
  public lastLesson: lastLesson[] = [];
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

  public getAbsenceList(): AbsenceConfig[] {
    let config = this.schoolingo.absenceConfig;
    let isClassTeacher = this.schoolingo.userService.getUser()!.id === this.lesson.classInfo.teacher;
    let list: AbsenceConfig[] = [];
    for(let i = 0;i < config.length;i++) {
      if ([AbsenceType.EXCUSED, AbsenceType.DISTANCE, AbsenceType.UNEXCUSED, AbsenceType.NON_COUNT].includes(i) && !isClassTeacher) {
        continue;
      }
      list.push(config[i]);
    }
    return list;
  }

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

  public applyAbsence(studentId: number): void {
    let date = this.selectedDate.getValue();
    let hour = this.selectedHour.getValue();
    let selectedAbsence = this.selectedAbsence.getValue();
    if (!date.isValid()
      || hour == null
      || selectedAbsence == null
    ) {
      this.alerts["absence"] = new Alert("error", "classbook/absence/unknownError");
      return;
    }

    this.resetAlerts();

    let isClassTeacher = this.schoolingo.userService.getUser()!.id === this.lesson.classInfo.teacher;
    let absence = this.getAbsence(studentId, hour);

    if (absence === selectedAbsence &&
       [AbsenceType.ABSENCE, AbsenceType.UNEXCUSED, AbsenceType.DISTANCE].includes(absence)) {
      this.alerts["absence"] = new Alert("error", "classbook/absence/alreadySet");
      return;
    }

    if ([AbsenceType.EXCUSED, AbsenceType.NON_COUNT].includes(absence) && !isClassTeacher) {
      this.alerts["absence"] = new Alert("error", this.selectedAbsence.getValue() == -1 ? "classbook/absence/noDeletePerm" : "classbook/absence/noPerm");
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

  public getMissingStudents(): number {
    if (this.selectedHour.getValue() === null || !this.absence || this.absence.length == 0) return 0;
    let count = 0;
    for (let i = 0;i < this.absence.length;i++) {
      let absence = this.absence[i]?.[this.selectedHour.getValue()!];
      if (absence != undefined) {
        count++;
      }
    }
    return count;
  }

  ngOnInit(): void {
    if (!this.perms.checkPermission(['teacher'])) {
      this.schoolingo.hasAccessToPage = false;
    }

    this.subscribers.push(
      this.schoolingo.socketService.addFunction('classbook:getStudentsList').subscribe((students: personDetails[]) => {
        this.students = students
      })
    );

    this.subscribers.push(
      this.schoolingo.socketService.addFunction('classbook:getLastLesson').subscribe((lastLesson) => {
        if (!lastLesson) {
          this.lastLesson = [];
          return;
        }
        console.log(lastLesson);
        this.lastLesson = lastLesson;
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
        this.absence = [];
      })
    );

    this.subscribers.push(
      this.selectedHour.subscribe(() => {
        this.selectedTab.next(0);
        this.selectedAbsence.next(0);
        this.resetAlerts();
        this.lastLesson = [];
        this.lessonNumber = 0;
        this.lessonTopic = '';
        this.lessonNote = '';
        this.lessonInternalNote = '';

        let lesson = this.schoolingo.getTimetableLessons()?.[this.selectedDate.getValue().isoWeekday() - 1]?.[this.selectedHour.getValue()!]?.[0];
        if (!lesson || lesson.empty) return;
        
        this.schoolingo.socketService.emit('classbook:getLesson', {
          date: this.selectedDate.getValue().format("YYYY-MM-DD"),
          hour: this.selectedHour.getValue()! + 1,
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
