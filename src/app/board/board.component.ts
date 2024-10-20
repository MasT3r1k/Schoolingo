import { NgClass, NgStyle } from '@angular/common';
import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Dropdown } from '@Components/Dropdowns/Dropdown';
import { ClassbookAPI } from '@Schoolingo';
import { Schoolingo, TimetableAPI } from '@Schoolingo';
import { alertManager, AlertManagerClass } from '@Schoolingo/Alert';
import { languages } from '@Schoolingo/Locale';
import { School } from '@Schoolingo/School';
import { SocketUpdateTheme, SocketUpdateLocale } from '@Schoolingo/Socket';
import { child, personDetails } from '@Schoolingo/User';
import { user } from '@Schoolingo/User';
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

@Component({
  standalone: true,
  imports: [NgClass, NgStyle, RouterLink, RouterLinkActive, RouterOutlet, Dropdown],
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

      let userId = 0;
      let user: user | null = this.schoolingo.userService.getUser();

      if (user && user.type == 'parent') {

        userId = this.schoolingo.userService.children[this.schoolingo.userService.selectedChild].personId;

      } else if (user) {

        userId = user?.id;

      }

      this.schoolingo.socketService.emit("timetable:getLessons", { userId })
    }));

    this.subscribers.push(this.schoolingo.socketService.addFunction("main:updateLocale").subscribe((data: SocketUpdateLocale) => {

      this.schoolingo.locale.setUserLocale(data.lng as languages);

    }));

    this.subscribers.push(this.schoolingo.socketService.addFunction("main:updateTheme").subscribe((data: SocketUpdateTheme) => {

      this.schoolingo.theme.updateTheme(this.schoolingo.theme.getThemes()[data.theme]);

    }));

    this.subscribers.push(this.schoolingo.socketService.addFunction("system:error").subscribe((data: { status: string, error: number }) => {
      switch (data.status) {
        case "error":
          switch(data.error) {
            case 500:
              
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

    this.subscribers.push(this.schoolingo.socketService.addFunction("timetable:getClassbook").subscribe((data: ClassbookAPI[] | any) => {
      console.log(data);
      for(let i = 0;i < data.length;i++) {
        let date = moment(data[i].date).format("YYYY-MM-DD");
        if (!this.schoolingo.classbookLessons[date]) {
          this.schoolingo.classbookLessons[date] = [];
        }
        this.schoolingo.classbookLessons[date][data[i].dayHour] = { topic: data[i].topic };
        if (!this.schoolingo.classbookAbsence[date]) {
          this.schoolingo.classbookAbsence[date] = [];
        }
        this.schoolingo.classbookAbsence[date][data[i].dayHour] = data[i].absence ?? -1;
      }
    }));

    this.subscribers.push(this.schoolingo.socketService.addFunction("main:updatePersons").subscribe((data: Record<number, personDetails>) => {
      this.schoolingo.addPersons(data);
    }));


  }

  ngOnDestroy(): void {

    this.subscribers.forEach((sub: Subscription) => sub.unsubscribe());
    this.schoolingo.subscribers.forEach((sub: Subscription) => sub.unsubscribe());

  }


}
