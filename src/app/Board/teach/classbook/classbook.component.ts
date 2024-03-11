import { Tabs } from '@Components/Tabs/Tabs';
import { Calendar } from '@Components/calendar/calendar';
import {
  CalendarComponent,
  CalendarOptions,
} from '@Components/calendar/calendar.component';
import { Modals } from '@Components/modals/modals';
import { Lesson } from '@Schoolingo/Board.d';
import { Schoolingo } from '@Schoolingo';
import { Locale } from '@Schoolingo/Locale';
import { SocketService } from '@Schoolingo/Socket';
import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';

type Absence = {
  lesson: number;
  type: number;
};

@Component({
  templateUrl: './classbook.component.html',
  styleUrls: [
    './classbook.component.css',
    '../../board.css',
    '../../../Components/Tabs/tabs.component.css',
    '../../../input.css',
  ],
})
export class ClassbookComponent {
  public tabName: string = 'TridniKniha_TABS';
  public declare calendarEl: CalendarComponent;

  constructor(
    public locale: Locale,
    public schoolingo: Schoolingo,
    public tabs: Tabs,
    public socketService: SocketService,
    public calendarService: Calendar,
    public modals: Modals
  ) {
    this.socketService.addFunction('getClassInfo').subscribe((classInfo: any) => {
      this.classInfo = classInfo.classInfo;
      this.classInfo['maxHours'] = classInfo.maxHours;
    });

    this.socketService.addFunction('getClassStudents').subscribe((students: any[]) => {
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

      this.socketService
        .getSocket()
        .Socket?.emit('getAbsence', {
          students: studentIds,
          date: this.calendarEl.date,
        });
    });

    this.socketService.addFunction('getLesson').subscribe((lesson: any) => {
      if (!lesson[0]) return;
      this.lessonTopic.setValue(lesson?.[0]?.topic);
      this.lessonNote.setValue(lesson[0].note);
      this.internalNote.setValue(lesson[0].internalNote);
      this.lesson = lesson[0];
    });

    this.socketService.addFunction('setAbsence').subscribe((data: any) => {
      let dataDate = new Date(data[0].date);
      if (
        !(
          dataDate.getDate() == this.calendarEl.date.getDate() &&
          dataDate.getMonth() == this.calendarEl.date.getMonth() &&
          dataDate.getFullYear() == this.calendarEl.date.getFullYear()
        )
      ) {
        return;
      }

      for (let i = 0; i < data[0].absence.length; i++) {
        this.addAbsence(data[0].absence[i].student, [
          { lesson: data[0].lesson, type: data[0].absence[i].absence },
        ]);
      }
    });

    this.socketService.addFunction('getAbsence').subscribe((data: any) => {
      for (let i = 0; i < data.length; i++) {
        this.addAbsence(data[i].student, [
          { lesson: data[i].lesson as number, type: data[i].type as number },
        ]);
      }
    });

    this.socketService.addFunction('getHomeworks').subscribe((homeworks: any[]) => {
      this.homeworks = homeworks;
    });

    this.socketService.addFunction('setHomework').subscribe(() => {
      this.modals.showModal(null);
    });
  }

  public selectedLesson: number | undefined = undefined;
  public students: any[] = [];
  public homeworks: any[] = [];
  lessonNumber = new FormControl('');
  lessonTopic = new FormControl('');
  lessonNote = new FormControl('');
  internalNote = new FormControl('');
  public calendarName: string = 'Calendar_Classbook';
  public calendarOptions: CalendarOptions = {};
  public classInfo: any = {};
  public lesson: any = {};
  public selectedAbsence: number = 0;

  public isCreatingNewHomework: boolean = false;

  public absence: number[][] = [];

  public addAbsence(student: number, absence: Absence[]): void {
    let findUser = this.absence[student];
    if (!findUser) {
      this.absence[student] = [];
      findUser = this.absence[student];
    }
    if (findUser.length == 0) {
      for (let i = 0; i < this.classInfo.maxHours; i++) {
        this.absence[student][i] = -1;
      }
    }
    for (let i = 0; i < absence.length; i++) {
      if (findUser?.[absence[i].lesson] == absence[i].type) {
        return;
      }
      let foundAbsence: boolean = false;
      findUser.forEach((ab: number, index: number): void => {
        if (index == absence[i].lesson) {
          findUser[absence[i].lesson] = absence[i].type;
          foundAbsence = true;
        }
      });
      if (foundAbsence) return;
      findUser.push(absence[i].type);
    }
  }

  public selectLesson(lesson: number): void {
    if (!this.calendarEl) return;
    if (
      this.schoolingo.getTimetable().length == 0 ||
      this.schoolingo.getTimetable()?.[
        (this.calendarEl.date.getDay() == 0)
          ? 6
          : this.calendarEl.date.getDay() - 1
      ]  ||
      (this.calendarEl.date.getDay() == 0)
          ? 6
          : this.calendarEl.date.getDay() - 1
      ) {
      this.schoolingo.refreshTimetable();
    }
    if (
      this.selectedLesson == lesson ||
      this.schoolingo.getTimetable()[
        (this.calendarEl.date.getDay() == 0)
          ? 6
          : this.calendarEl.date.getDay() - 1
      ]?.lessons?.[lesson]?.[0]?.isEmpty == true
    )
      return;

    this.calendarEl.date.setHours(12);
    this.selectedLesson = lesson;
    this.selectedAbsence = 0;
    this.absence = [];
    this.tabs.setTabValue(this.tabName, 0);

    console.log(this.socketService.getSocket().Socket);

    this.socketService.getSocket().Socket?.emit('getLesson', {
      group:
        this.schoolingo.getTimetable()[
          this.calendarEl.date.getDay() == 0
            ? 6
            : this.calendarEl.date.getDay() - 1
        ].lessons[this.selectedLesson][0]?.group?.id,
      subject:
        this.schoolingo.getTimetable()[
          this.calendarEl.date.getDay() == 0
            ? 6
            : this.calendarEl.date.getDay() - 1
        ].lessons[this.selectedLesson][0].subject?.[0],
      date: this.calendarEl.date,
      lesson: this.selectedLesson,
    });

    this.socketService.getSocket().Socket?.emit('getHomeworks', {
      group:
        this.schoolingo.getTimetable()[
          this.calendarEl.date.getDay() == 0
            ? 6
            : this.calendarEl.date.getDay() - 1
        ].lessons[this.selectedLesson][0]?.group?.id,
      subject:
        this.schoolingo.getTimetable()[this.calendarEl.date.getDay() - 1]
          .lessons[this.selectedLesson][0].subject?.[0],
    });
  }

  public saveLesson(): void {
    if (this.selectedLesson == undefined) return;
    this.socketService.getSocket().Socket?.emit('saveLesson', {
      lessonHour: this.lessonNumber.value,
      subject:
        this.schoolingo.getTimetable()[
          this.calendarEl.date.getDay() == 0
            ? 6
            : this.calendarEl.date.getDay() - 1
        ].lessons[this.selectedLesson][0].subject?.[0],
      room: this.schoolingo.getTimetable()[
        this.calendarEl.date.getDay() == 0
          ? 6
          : this.calendarEl.date.getDay() - 1
      ].lessons[this.selectedLesson][0].room?.roomId,
      topic: this.lessonTopic.value,
      note: this.lessonNote.value,
      internalNote: this.internalNote.value,

      group:
        this.schoolingo.getTimetable()[
          this.calendarEl.date.getDay() == 0
            ? 6
            : this.calendarEl.date.getDay() - 1
        ].lessons[this.selectedLesson][0]?.group?.id,
      date: this.calendarEl.date,
      lesson: this.selectedLesson,
    });
  }

  public applyAbsence(
    student: number,
    abType: number = this.selectedAbsence
  ): void {
    if (this.selectedLesson === undefined) return;
    this.socketService.getSocket().Socket?.emit('setAbsence', {
      absence: [
        {
          student: student,
          absence: abType,
        },
      ],

      group:
        this.schoolingo.getTimetable()[
          this.calendarEl.date.getDay() == 0
            ? 6
            : this.calendarEl.date.getDay() - 1
        ].lessons[this.selectedLesson][0]?.group?.id,
      date: this.calendarEl.date,
      lesson: this.selectedLesson,
    });
  }

  public copyAbsenceFromPreviousLesson(): void {
    if (this.selectedLesson === undefined || this.selectedLesson === 0) return;
    this.absence.forEach((ab: number[], index: number) => {
      if (ab[(this.selectedLesson as number) - 1] === -1) return;
      this.applyAbsence(index, ab[(this.selectedLesson as number) - 1]);
    });
  }

  public getService(): string[] {
    let studentList: string[] = [];
    this.students
      .filter((st: any) => st.service == true)
      .forEach((st: any) => {
        studentList.push(st.firstName + ' ' + st.lastName);
      });
    return studentList;
  }

  ngOnInit(): void {
    if (this.schoolingo.getTimetableLessons().length == 0) {
    }

    let i = 0;
    do {
      this.selectLesson(i);
      i++;
    } while (this.selectedLesson == undefined && i < 16);

    setTimeout(() => {
      this.calendarEl = this.calendarService.getCalendar(this.calendarName);
      if (this.calendarEl) {
        this.calendarEl.customPickFunction = (value: string | null): void => {
          this.schoolingo.refreshTimetable();
          let i = 0;
          this.selectedLesson = undefined;
          do {
            this.selectLesson(i);
            i++;
          } while (this.selectedLesson == undefined);
        };
      }
    });
  }

  public getStudent(student: number): any {
    return (
      this.students.filter((st: any) => st.student == student)[0] ?? undefined
    );
  }

  public getHomework(id: number): any {
    return (
      this.homeworks.filter((homework: any) => homework.homeworkID == id)[0] ??
      undefined
    );
  }

  public openHomework(id: number | undefined): void {
    let studentList: number[] = [];
    let serviceList: number[] = [];
    let absenceList: number[] = [];
    let nonAbsenceList: number[] = [];
    let homework = this.getHomework(id as number);

    this.absence.forEach((st: number[], index: number) => {
      if (this.selectedLesson == undefined || st[this.selectedLesson] == -1)
        return;
      absenceList.push(index);
    });
    absenceList.sort((a: number, b: number): any => {
      let stA: any = this.getStudent(a);
      let stB: any = this.getStudent(b);
      if (stA.lastName < stB.lastName) {
        return -1;
      }
      if (stA.lastName > stB.lastName) {
        return 1;
      }
    });

    this.students.forEach((st: any) => {
      studentList.push(st.student);
      if (st.service == true) {
        serviceList.push(st.student);
      }
      if (!absenceList.includes(st.student)) {
        nonAbsenceList.push(st.student);
      }
    });

    nonAbsenceList.sort((a: number, b: number): any => {
      let stA: any = this.getStudent(a);
      let stB: any = this.getStudent(b);
      if (stA.lastName < stB.lastName) {
        return -1;
      }
      if (stA.lastName > stB.lastName) {
        return 1;
      }
    });

    let date: Date = new Date();
    if (id === undefined) {
      date.setDate(this.calendarEl.date.getDate());
      date.setMonth(this.calendarEl.date.getMonth());
      date.setFullYear(this.calendarEl.date.getFullYear());
      let i = 0;
      while (i == 0) {
        date = this.schoolingo.addDayToDate(date, 1);
        let t = this.schoolingo.getTimetableDay(
          date.getDate(),
          date.getMonth(),
          date.getFullYear()
        );
        t.forEach((lesson: Lesson) => {
          if (
            lesson.subject ==
            this.schoolingo.getTimetable()[this.calendarEl.date.getDay() - 1]
              .lessons[this.selectedLesson as number][0].subject?.[0]
          ) {
            i = 1;
          }
        });
      }
    }

    this.modals.showModal('homework', {
      id,
      homework: homework
        ? new FormControl(homework.homework)
        : new FormControl(undefined),
      note: homework
        ? new FormControl(homework.note)
        : new FormControl(undefined),
      start: homework ? new Date(homework.start) : undefined,
      end: homework ? new Date(homework.end) : date,
      students: this.students,
      selectedStudents: studentList,
      serviceList,
      absenceList,
      nonAbsenceList,
      isEditingList: false,
      type: 0,
      isSaving: false,
      lesson: {
        group:
          this.schoolingo.getTimetable()[
            this.calendarEl.date.getDay() == 0
              ? 6
              : this.calendarEl.date.getDay() - 1
          ].lessons[this.selectedLesson as number][0]?.group?.id,
        date: this.calendarEl.date,
        lesson: this.selectedLesson,
      },
    });
  }
}
