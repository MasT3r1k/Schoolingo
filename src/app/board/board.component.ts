import { NgClass, NgStyle } from '@angular/common';
import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Dropdown } from '@Components/Dropdowns/Dropdown';
import { TabsComponent } from '@Components/Tabs/Tabs';
import { Substitution } from '@Schoolingo';
import { Absence, ClassbookAPI, Mark } from '@Schoolingo';
import { Schoolingo, TimetableAPI } from '@Schoolingo';
import { alertManager, AlertManagerClass } from '@Schoolingo/Alert';
import { languages } from '@Schoolingo/Locale';
import { School } from '@Schoolingo/School';
import { SocketUpdateTheme, SocketUpdateLocale } from '@Schoolingo/Socket';
import { child, personDetails } from '@Schoolingo/User';
import { user } from '@Schoolingo/User';
import { Country } from 'country-state-city';
import moment from 'moment';
import { Subscription } from 'rxjs';

type userAPI = ({
  type: 'student';
  person: personDetails;
  class: string;
} | {
  type: 'teacher';
  person: personDetails;
  class: string[];
} | {
  type: 'parent',
  person: personDetails;
  children: child[];
}) & {
  id: number;
}

interface AbsenceAPI {
  type: number;
  subject: number;
  reason: string;
  minutes: number;
  dayHour: number;
  date: moment.Moment;
}

@Component({
  standalone: true,
  imports: [NgClass, NgStyle, RouterLink, RouterLinkActive, RouterOutlet, Dropdown, TabsComponent],
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css', '../Styles/item.css']
})
export class BoardComponent {
  public alertManager: AlertManagerClass = alertManager;
  private subscribers: Subscription[] = [];
  constructor(
    public school: School,
    public schoolingo: Schoolingo,
    private routerImport: Router,
    public dropdown: Dropdown
  ) {

    this.router = this.routerImport;

  }

  private router: Router;

  ngOnInit(): void {
    console.log(Country.getCountryByCode("CZ")?.flag)
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

    this.subscribers.push(this.schoolingo.socketService.addFunction("main:updateUser").subscribe((data: userAPI) => {
      if (data.type == "parent" && data.children.length > 0) {
        this.schoolingo.userService.children = data.children;
      }

      this.schoolingo.userService.setUser(data);
      this.schoolingo.sidebar.build();

      let userId = 0;
      let user: user = this.schoolingo.userService.getUser()!;

      if (user && user.type == 'parent') {
        userId = this.schoolingo.userService.children[this.schoolingo.userService.selectedChild].personId;
      } else if (user) {
        userId = user?.id;
      }

      this.schoolingo.socketService.emit("timetable:getLessons", { userId });
      this.schoolingo.socketService.emit("timetable:getClassbook", { userId, week: this.schoolingo.timetableSelectedWeek.getValue() });
      this.schoolingo.socketService.emit("grades:getGrades", { userId, week: this.schoolingo.timetableSelectedWeek.getValue() });
      this.schoolingo.socketService.emit("absence:getAllAbsence", { userId });
    }));

    this.subscribers.push(this.schoolingo.socketService.addFunction("main:updateLocale").subscribe((data: SocketUpdateLocale) => {
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
        this.schoolingo.classbookLessons[date][info.dayHour] = { topic: info.topic };
        if (!this.schoolingo.classbookAbsence[date]) {
          this.schoolingo.classbookAbsence[date] = [];
        }
        this.schoolingo.classbookAbsence[date][info.dayHour] = info.absence || -1;
      })
    }));

    this.subscribers.push(this.schoolingo.socketService.addFunction("grades:getGrades").subscribe((data: Mark[]) => {
      let marks: Mark[] = [];
      data.forEach((mark: Mark) => {
        mark.created = moment(mark["created"]);
        marks.push(mark);
      });

      this.schoolingo.marks = marks;
    }));

    this.subscribers.push(this.schoolingo.socketService.addFunction("main:updatePersons").subscribe((data: Record<number, personDetails>) => {
      this.schoolingo.addPersons(data);
    }));

    this.subscribers.push(this.schoolingo.socketService.addFunction("main:updateSubjects").subscribe((data: Record<number, string[]>) => {
      this.schoolingo.addSubjects(data);
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
      data.forEach((substitution: any) => {
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

  }

  ngOnDestroy(): void {
    // Unsubscribe all listeners
    this.subscribers.forEach((sub: Subscription) => sub.unsubscribe());
    this.schoolingo.subscribers.forEach((sub: Subscription) => sub.unsubscribe());
  }


}
