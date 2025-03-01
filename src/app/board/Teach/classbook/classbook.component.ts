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
import { Modal } from '@Components/Modal/Modal';
import { ClassbookAbsenceComponent } from './modals/absence/absence.component';
import { errorAPI } from '@Components/Datalist/Datalist';

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
  private isChangingLesson = false;
  public alerts: { [key: string]: Alert } = {
    "noLessons": new Alert('error', 'timetable/notStudyDay'),
    "firstLesson": new Alert('error', 'classbook/firstLesson'),
    "emptyLesson": new Alert('info', 'classbook/emptyLesson'),
    "notWrittenLesson": new Alert('error', 'classbook/notWrittenLesson')
  }

  // Lesson Data
  public lesson: any = {};
  public lastLesson: lastLesson[] = [];
  public absence: number[][] = [];

  /** Write lesson */
  public lessonNumber = 0;
  public lessonTopic = '';
  public lessonNote = '';
  public lessonInternalNote = '';

  /* Modals */
  public absenceModal = new Modal({
    size: 'size-2',
    closeable: true,
    title: {
      text: 'classbook/absence/title'
    },
    items: [
      {
        type: 'component',
        component: ClassbookAbsenceComponent
      }
    ]
  });

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
    let checkDay = this.schoolingo.getTimetableLessons()[this.schoolingo.classbook.selectedDate.getValue().isoWeekday() - 1];
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
    delete this.alerts.absence;

  }

  public applyAbsence(studentId: number): void {
    let date = this.schoolingo.classbook.selectedDate.getValue();
    let hour = this.schoolingo.classbook.selectedHour.getValue();
    let selectedAbsence = this.schoolingo.classbook.selectedAbsence.getValue();
    if (!date.isValid()
      || hour == null
      || selectedAbsence == null
    ) {
      this.alerts.absence = new Alert("error", "classbook/absence/unknownError");
      return;
    }

    this.resetAlerts();

    let isClassTeacher = this.schoolingo.userService.getUser()!.id === this.lesson.classInfo.teacher;
    let absence = this.getAbsence(studentId, hour);

    if (selectedAbsence == -1 && absence == -1) {
      return;
    }

    if (absence === selectedAbsence) {
      this.alerts.absence = new Alert("error", "classbook/absence/alreadySet");
      return;
    }

    if ([AbsenceType.EXCUSED, AbsenceType.NON_COUNT].includes(absence) && !isClassTeacher) {
      this.alerts.absence = new Alert("error", this.schoolingo.classbook.selectedAbsence.getValue() == -1 ? "classbook/absence/noDeletePerm" : "classbook/absence/noPerm");
      return;
    }

    this.schoolingo.classbook.selectedStudent.next(this.schoolingo.classbook.students.find((student) => student.personId === studentId)!);

    if ([AbsenceType.EXCUSED, AbsenceType.NON_COUNT, AbsenceType.EARLY, AbsenceType.LATE].includes(selectedAbsence)) {
      this.absenceModal.open();
      return;
    }
    this.schoolingo.classbook.applyAbsence.next(true);
    // this.addAbsence(studentId, [{ hour: hour, type: selectedAbsence }]);

  }

  public addAbsence(studentId: number, absence: Absence[]): void {
    if (!this.absence[studentId]) {
      this.absence[studentId] = [];
    }

    absence.forEach((ab: Absence) => {
      if (ab.type == -1) {
        delete this.absence[studentId][ab.hour];
        return;
      }
      this.absence[studentId][ab.hour] = ab.type;
    });
  }

  public getAbsence(studentId: number, hour: number): number {
    if (this.absence[studentId] === undefined) return -1;
    if (this.absence[studentId][hour] === undefined) return -1;
    return this.absence[studentId][hour];
  }

  public getMissingStudents(): number {
    if (this.schoolingo.classbook.selectedHour.getValue() === null || !this.absence || this.absence.length == 0) return 0;
    let count = 0;
    for (let i = 0;i < this.absence.length;i++) {
      let absence = this.absence[i]?.[this.schoolingo.classbook.selectedHour.getValue()!];
      if (absence != undefined && ![AbsenceType.LATE, AbsenceType.EARLY, -1].includes(absence)) {
        count++;
      }
    }
    return count;
  }

  ngOnInit(): void {
    // Add buttons to the alert
    this.alerts.notWrittenLesson.addButton("classbook/writeLesson/editLastLesson", () => {
      this.isChangingLesson = true;
      this.schoolingo.classbook.selectedDate.next(moment(this.lastLesson[0].date));
      this.schoolingo.classbook.selectedHour.next(this.lastLesson[0].dayHour - 1);
    });

    if (!this.perms.checkPermission(['teacher'])) {
      this.schoolingo.hasAccessToPage = false;
    }

    this.subscribers.push(
      this.schoolingo.classbook.applyAbsence.subscribe((status: boolean) => {
        if (!status) return;
        status = false;
        this.schoolingo.socketService.emit('classbook:addAbsence', {
          classbookId: this.lesson.lesson.cbId,
          studentId: this.schoolingo.classbook.selectedStudent.getValue()!.personId,
          absence: this.schoolingo.classbook.selectedAbsence.getValue()!,
          minutes: this.schoolingo.classbook.absenceMinutes,
          reason: this.schoolingo.classbook.absenceReason,
          note: this.schoolingo.classbook.absenceNote
        })
      })
    )

    this.subscribers.push(
      this.schoolingo.socketService.addFunction('classbook:addAbsence').subscribe((absence: errorAPI | any) => {
        this.resetAlerts();
        this.absenceModal.close();
        if ('error' in absence) {
          let locale = absence.error;
          switch(absence.error) {
            case 'no_token':
              locale = 'NO ACCEESSS';
              break;
            case 'no_permission':
              locale = 'classbook/absence/noPerm';
              break;
            case 'minutes_cant_be_smaller_than_1':
              locale = 'classbook/absence/minutesCantBeSmallerThan1';
              break;
            case 'no_classbook_found':
              locale = 'classbook/absence/noClassbookFound';
              break;
            case 'absence_is_same':
              locale = 'classbook/absence/isSame';
              break;
            case 'student_not_found':
              locale = 'classbook/absence/studentNotFound';
              break;
          }
          this.alerts.absence = new Alert("error", locale);
          return;
        }

        if ('status' in absence && absence.status == 'success') {
          if (this.lesson.lesson.cbId !== absence.data.classbookId) {
            return;
          }
          this.addAbsence(absence.data.studentId, [
            { type: absence.data.absence, hour: this.schoolingo.classbook.selectedHour.getValue()! }
          ])
        }
        console.log(absence);
      })
    );

    this.subscribers.push(
      this.schoolingo.socketService.addFunction('classbook:getStudentsList').subscribe((students: personDetails[]) => {
        this.schoolingo.classbook.students = students
      })
    );

    this.subscribers.push(
      this.schoolingo.socketService.addFunction('classbook:getLastLesson').subscribe((lastLesson) => {
        if (!lastLesson) {
          this.lastLesson = [];
          return;
        }
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
          date: this.schoolingo.classbook.selectedDate,
          selectedMonth: this.schoolingo.classbook.selectedDate.getValue().clone(),
          isActive: true
        }]
      }
    );

    this.subscribers.push(
      this.schoolingo.classbook.selectedDate.subscribe(() => {
        if (!this.isChangingLesson) this.schoolingo.classbook.selectedHour.next(null);
      })
    );

    this.subscribers.push(
      this.schoolingo.classbook.selectedHour.subscribe((hour: number | null) => {
        this.isChangingLesson = false;
        this.schoolingo.classbook.selectedTab.next(0);
        this.schoolingo.classbook.selectedAbsence.next(0);
        this.resetAlerts();
        this.absence = [];
        this.lastLesson = [];
        this.lessonNumber = 0;
        this.lessonTopic = '';
        this.lessonNote = '';
        this.lessonInternalNote = '';

        let lesson = this.schoolingo.getTimetableLessons()?.[this.schoolingo.classbook.selectedDate.getValue().isoWeekday() - 1]?.[this.schoolingo.classbook.selectedHour.getValue()!]?.[0];
        if (!lesson || lesson.empty) return;
        
        this.schoolingo.socketService.emit('classbook:getLesson', {
          date: this.schoolingo.classbook.selectedDate.getValue().format("YYYY-MM-DD"),
          hour: this.schoolingo.classbook.selectedHour.getValue()!,
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
    this.schoolingo.classbook.selectedDate.next(moment());
    this.dropdown.remove(this.calendarCalendarName);
    this.subscribers.forEach(sub => sub.unsubscribe());
  }

}
