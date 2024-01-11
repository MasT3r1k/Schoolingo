import { Tabs } from '@Components/Tabs/Tabs';
import { Calendar } from '@Components/calendar/calendar';
import { CalendarComponent, CalendarOptions } from '@Components/calendar/calendar.component';
import { Schoolingo } from '@Schoolingo';
import { Locale } from '@Schoolingo/Locale';
import { SocketService } from '@Schoolingo/Socket';
import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  templateUrl: './classbook.component.html',
  styleUrls: ['./classbook.component.css', '../../board.css', '../../../Components/Tabs/tabs.component.css']
})
export class ClassbookComponent {
  public tabName: string = 'TridniKniha_TABS';
  public declare calendarEl: CalendarComponent;

  constructor(
    public locale: Locale,
    public schoolingo: Schoolingo,
    public tabs: Tabs,
    public socketService: SocketService,
    public calendarService: Calendar
  ) {}

  public selectedLesson: number | undefined = undefined;
  public students: any[] = [];
  lessonNumber = new FormControl('');
  lessonTopic = new FormControl('');
  lessonNote = new FormControl('');
  internalNote = new FormControl('');
  public calendarName: string = 'Calendar_Classbook';
  public calendarOptions: CalendarOptions = {  };
  public classInfo: any = {};
  public lesson: any = {};

  public selectLesson(lesson: number): void {
    if (!this.calendarEl) return;
    if (
      this.selectedLesson == lesson ||
      this.schoolingo.getTimetable()[this.calendarEl.date.getDay() - 1].lessons[lesson][0].isEmpty == true
      ) return;

    this.calendarEl.date.setHours(12);
    this.selectedLesson = lesson;
    this.tabs.setTabValue(this.tabName, 0);

    this.socketService.getSocket().Socket?.emit('getLesson', {
      group: this.schoolingo.getTimetable()[this.calendarEl.date.getDay() - 1].lessons[this.selectedLesson][0]?.group?.id,
      date: this.calendarEl.date,
      lesson: this.selectedLesson
    });

  }

  public saveLesson(): void {
    if (this.selectedLesson == undefined) return;
    this.socketService.getSocket().Socket?.emit('saveLesson', {
      lessonHour: this.lessonNumber.value,
      subject: this.schoolingo.getTimetable()[this.calendarEl.date.getDay() - 1].lessons[this.selectedLesson][0].subject?.[0],
      room: this.schoolingo.getTimetable()[this.calendarEl.date.getDay() - 1].lessons[this.selectedLesson][0].room?.roomId,
      topic: this.lessonTopic.value,
      note: this.lessonNote.value,
      internalNote: this.internalNote.value,

      group: this.schoolingo.getTimetable()[this.calendarEl.date.getDay() - 1].lessons[this.selectedLesson][0]?.group?.id,
      date: this.calendarEl.date,
      lesson: this.selectedLesson
    })
  }

  public getService(): string[] {
    let studentList: string[] = [];
    this.students.filter((st: any) => st.service == true).forEach((st: any) => {
      studentList.push(st.firstName + ' ' + st.lastName);
    });
    return studentList;
  }

  ngOnInit(): void {
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

    this.socketService.addFunction("getClassInfo", (classInfo: any) => {
      this.classInfo = classInfo.classInfo;
      this.classInfo['maxHours'] = classInfo.maxHours;
    })

    this.socketService.addFunction("getClassStudents", (students: any[]) => {
      this.students = students.sort((a, b): any => {
        if (a.lastName < b.lastName) {
          return -1;
        }
        if (a.lastName > b.lastName) {
          return 1;
        }});
    });

    this.socketService.addFunction("getLesson", (lesson: any) =>{
      this.lessonTopic.setValue(lesson[0].topic);
      this.lessonNote.setValue(lesson[0].note);
      this.internalNote.setValue(lesson[0].internalNote);
      this.lesson = lesson[0];
    })

  }

}
