import { NgClass, NgStyle } from '@angular/common';
import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Dropdown } from '@Components/Dropdowns/Dropdown';
import { ModalComponent } from '@Components/Modal/Modal';
import { BookInfo, Substitution } from '@Schoolingo';
import { Absence, ClassbookAPI, Mark } from '@Schoolingo';
import { Schoolingo, TimetableAPI } from '@Schoolingo';
import { alertManager, AlertManagerClass } from '@Schoolingo/Alert';
import { languages } from '@Schoolingo/Locale';
import { Modules } from '@Schoolingo/Modules';
import { School } from '@Schoolingo/School';
import { SidebarItem } from '@Schoolingo/Sidebar';
import { SocketUpdateTheme, SocketUpdateLocale } from '@Schoolingo/Socket';
import { DiaryWeek } from '@Schoolingo/Traineeship';
import { personDetails, user } from '@Schoolingo/User';
import moment from 'moment';
import { Subscription } from 'rxjs';
import { Schoolingo as App } from '@Schoolingo/App';
import { Permission } from '@Schoolingo/Permissions';

interface AbsenceAPI {
  type: number;
  subject: number;
  reason: string;
  minutes: number;
  dayHour: number;
  date: moment.Moment;
}

interface AbsenceSubjectAPI {
  subject: string;
  absence_count: number;
  total_lessons: number;
}

@Component({
  standalone: true,
  imports: [NgClass, NgStyle, RouterLink, RouterLinkActive, RouterOutlet, Dropdown, ModalComponent],
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css', '../Styles/item.css', '../Styles/app.css']
})
export class BoardComponent {

  App = App;

  public alertManager: AlertManagerClass = alertManager;
  private subscribers: Subscription[] = [];
  constructor(
    public school: School,
    public schoolingo: Schoolingo,
    private routerImport: Router,
    public dropdown: Dropdown,
    public modules: Modules,
    public perms: Permission
  ) {
    this.router = this.routerImport;
  }
  private router: Router;

  ngOnInit(): void {
    this.schoolingo.refreshTitle();
    this.subscribers.push(this.router.events.subscribe((url: any): void => {
      if (url instanceof NavigationEnd) {
        if (url.url) {
          this.schoolingo.refreshTitle();
        }
      }
    }));

    this.schoolingo.socketService.connect();
    this.subscribers.push(this.schoolingo.socketService.addFunction("connect").subscribe(() => {
      this.schoolingo.socketService.emit('tokens:getUser', { userId: 'myself' });
    }));

    this.subscribers.push(this.schoolingo.socketService.addFunction("main:updateUser").subscribe((data: user) => {
      if (data.type == "parent" && data.children.length > 0) {
        this.schoolingo.userService.children = data.children;
      }

      this.schoolingo.userService.setUser(data);
      this.schoolingo.sidebar.build();

      let user = this.schoolingo.userService.getUser()!;
      let userId = user.id;
      if (user.type == "parent") {
        userId = this.schoolingo.getStudentId();
      }

      // Get timetable
      this.schoolingo.socketService.emit('timetable:getLessons', {
        userId,
        week: moment().isoWeek(),
        year: moment().year()
      });
      this.schoolingo.socketService.emit("classes:getClassService", {
        userId
      });
      this.schoolingo.socketService.emit("timetable:getClassbook", {
        userId,
        week: this.schoolingo.timetableSelectedWeek.getValue() === -1 ? moment().isoWeek() : this.schoolingo.timetableSelectedWeek.getValue()
      });
      this.schoolingo.socketService.emit("grades:getGrades", {
        userId,
        week: this.schoolingo.timetableSelectedWeek.getValue() === -1 ? moment().isoWeek() : this.schoolingo.timetableSelectedWeek.getValue()
      });
      this.schoolingo.socketService.emit('absence:getAbsence', {
        userId
      });
      this.schoolingo.socketService.emit("absence:getAllAbsence", {
        userId
      });
      if (this.modules.checkModule(["traineeship"])) {
        this.schoolingo.socketService.emit('traineeship:getDiaryWeeks');
        this.schoolingo.socketService.emit('traineeship:getDiaryDays');
      }
      
    }));

    this.subscribers.push(this.schoolingo.socketService.addFunction("main:updateLocale").subscribe((data: SocketUpdateLocale) => {
      this.schoolingo.locale.saveUserLocale(data.lng as languages);
      this.schoolingo.locale.setUserLocale(data.lng as languages);
    }));

    this.subscribers.push(this.schoolingo.socketService.addFunction("main:updateTheme").subscribe((data: SocketUpdateTheme) => {
      this.schoolingo.theme.updateTheme(this.schoolingo.theme.getThemes()[data.theme]);
    }));

    this.subscribers.push(this.schoolingo.socketService.addFunction("system:error").subscribe((data: { status: string, error: number }) => {
      console.log(data)
      switch (data.status) {
        case "error":
          switch(data.error) {
            case 101:
              console.log("System database is not working.")
              break;
            case 102:
              this.schoolingo.userService.logout();
              console.log("Invalid token");
              break;
          }
          break;
      } 
      console.log('ERROR: ' + data.error);
    }));

    this.subscribers.push(this.schoolingo.socketService.addFunction("timetable:getLessons").subscribe((data: TimetableAPI[]) => {
        this.schoolingo.timetableAPI = data;
        this.schoolingo.refreshTimetableHours();
        this.schoolingo.refreshTimetableLessons();
    }));

    this.subscribers.push(this.schoolingo.socketService.addFunction("timetable:getClassbook").subscribe((data: ClassbookAPI[]) => {
      data.forEach((info: ClassbookAPI) => {
        let date = moment(info.date).format("YYYY-MM-DD");

        if (!this.schoolingo.classbookLessons[date]) {
          this.schoolingo.classbookLessons[date] = [];
        }

        this.schoolingo.classbookLessons[date][info.dayHour] = {
          topic: info.topic
        };
      })
    }));

    this.subscribers.push(this.schoolingo.socketService.addFunction("absence:getAbsence").subscribe((data: AbsenceSubjectAPI[]) => {
      data.forEach((data: AbsenceSubjectAPI) => {
        this.schoolingo.absenceSubjects[data.subject] = {
          absence: data.absence_count,
          lessons: data.total_lessons
        };
      });
    }));

    this.subscribers.push(this.schoolingo.socketService.addFunction("grades:getGrades").subscribe((data: Mark[]) => {
      let marks: Mark[] = [];
      data.forEach((mark: Mark) => {
        mark.created = moment(mark.created);
        marks.push(mark);
      });

      this.schoolingo.marks = marks;
    }));

    this.subscribers.push(this.schoolingo.socketService.addFunction("main:updatePersons").subscribe((data: Record<number, personDetails>) => {
      this.schoolingo.addPersons(data);
    }));

    this.subscribers.push(this.schoolingo.socketService.addFunction("main:updateSubjects").subscribe((data: Record<number, string[]>) => {
      this.schoolingo.addSubjects(data);
      this.schoolingo.refreshTimetableLessons();
    }));

    this.subscribers.push(this.schoolingo.socketService.addFunction("absence:getAllAbsence").subscribe((data: AbsenceAPI[]) => {
      let absenceList: Record<string, Absence[]> = {};
      data.forEach((info: AbsenceAPI) => {
        let date = moment(info.date);

        if (!absenceList[date.format('YYYY-MM-DD')]) {
          absenceList[date.format('YYYY-MM-DD')] = [];
        }

        absenceList[date.format('YYYY-MM-DD')][info.dayHour] = {
          type: info.type,
          subject: info.subject,
          reason: info.reason,
          minutes: info.minutes
        }
      })

      this.schoolingo.absence = absenceList;
    }));

    this.subscribers.push(this.schoolingo.socketService.addFunction("timetable:timetableChanges").subscribe((data: Substitution[]) => {
      let substitutions: Record<string, Substitution[]> = {};
      data.forEach((substitution: Substitution) => {
        let date = moment(substitution.date);

        if (!substitutions[date.format('YYYY-MM-DD')]) {
          substitutions[date.format('YYYY-MM-DD')] = [];
        }

        substitutions[date.format('YYYY-MM-DD')][substitution.hour] = {
          substitutionId: substitution.substitutionId,
          teacherId: substitution.teacherId,
          subjectId: substitution.subjectId,
          groupId: substitution.groupId,
          hour: substitution.hour,
          date: moment(substitution.date),
          created: moment(substitution.created)
        };
      });
      this.schoolingo.substitution = substitutions;
      this.schoolingo.refreshTimetableLessons();
    }));

    this.subscribers.push(this.schoolingo.socketService.addFunction("classes:getClassService").subscribe((data: any[]) => {
      if (data.length > 0) {
        this.schoolingo.studentService = {
          status: true,
          start: moment(data[0].start),
          end: moment(data[0].end)
        };
      }
    }));

    this.subscribers.push(this.schoolingo.timetableSelectedWeek.subscribe((val: number) => {
      if (val === -1) return;
      let userId = this.schoolingo.getStudentId();
      this.schoolingo.socketService.emit('timetable:getLessons', {
        userId,
        week: val,
        year: moment().year()
      });
    }));

    if (this.modules.checkModule(["library"])) {
      this.subscribers.push(this.schoolingo.socketService.addFunction("library:getBookInfo").subscribe((data: BookInfo & {[key: string]: Date | moment.Moment} | any) => {
        data.created = moment(data[0].created);
        data.acquisitionDate = moment(data[0].acquisitionDate);
        data.date_loan = moment(data[0].date_loan);
        data.date_has_to_be_returned = moment(data[0].date_has_to_be_returned);
        data.date_return = moment(data[0].date_return);
        this.schoolingo.bookInfo.next(data);
      }));
    }

    if (this.modules.checkModule(["traineeship"])) {
      this.subscribers.push(this.schoolingo.socketService.addFunction("traineeship:getDiaryWeeks").subscribe((data: DiaryWeek[]) => {
        this.schoolingo.traineeship.diaryWeeks.next([]);
        let weeks: DiaryWeek[] = [];
        data.forEach((diary: DiaryWeek) => {
          weeks.push({
            ...diary,
            traineeship: diary.traineeship,
            ignoredDays: (diary.ignoredDays.toString()).split(','),
            start: moment(diary.start),
            end: moment(diary.end)
          });
        })
        this.schoolingo.traineeship.diaryWeeks.next(weeks);
        this.schoolingo.traineeship.refreshDiary();
      }));
    }

    if (this.modules.checkModule(["traineeship"])) {
      this.subscribers.push(this.schoolingo.socketService.addFunction("traineeship:getDiaryDays").subscribe(() => this.schoolingo.traineeship.refreshDiary()));
    }
  }

  ngOnDestroy(): void {
    this.subscribers.forEach((sub: Subscription) => sub.unsubscribe());
    this.schoolingo.subscribers.forEach((sub: Subscription) => sub.unsubscribe());
  }

  public getSidebarBadge(item: SidebarItem): any {
    let a = eval(item.badge)?.(this.schoolingo)?.getValue();
    if (!a)
      return "";
    if (a > 9) {
      return "9+";
    }
    return a || "";
  }

}
