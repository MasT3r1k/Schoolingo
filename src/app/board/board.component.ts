import { NgClass, NgStyle } from '@angular/common';
import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Schoolingo, TimetableAPI } from '@Schoolingo';
import { alertManager, AlertManagerClass } from '@Schoolingo/Alert';
import { languages } from '@Schoolingo/Locale';
import { School } from '@Schoolingo/School';
import { SocketUpdateTheme, SocketUpdateLocale } from '@Schoolingo/Socket';
import { child, personDetails } from '@Schoolingo/User';
import { user } from '@Schoolingo/User';
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
  selector: 'app-board',
  standalone: true,
  imports: [NgClass, NgStyle, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './board.component.html',
  styleUrl: './board.component.css'
})
export class BoardComponent {
  public alertManager: AlertManagerClass = alertManager;
  constructor(
    public school: School,
    public schoolingo: Schoolingo,
    private routerImport: Router
  ) {
    this.router = this.routerImport;

  }

  private router: Router;
  private routerSub: Subscription | undefined = undefined;

  ngOnInit(): void {
    
    this.schoolingo.refreshTitle();
    this.routerSub = this.router.events.subscribe((url: any): void => {
      if (url instanceof NavigationEnd) {
        if (url.url) {
          this.schoolingo.refreshTitle();
        }
      }
    });
    this.schoolingo.socketService.connect();
    this.schoolingo.socketService.addFunction("connect").subscribe(() => {
      this.schoolingo.socketService.emit('tokens:getUser', { userId: 'myself' });
    });

    this.schoolingo.socketService.addFunction("main:updateUser").subscribe((data: userAPI) => {
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
    });
    this.schoolingo.socketService.addFunction("main:updateLocale").subscribe((data: SocketUpdateLocale) => {
      this.schoolingo.locale.setUserLocale(data.lng as languages);
    });
    this.schoolingo.socketService.addFunction("main:updateTheme").subscribe((data: SocketUpdateTheme) => {
      this.schoolingo.theme.updateTheme(this.schoolingo.theme.getThemes()[data.theme]);
    });
    this.schoolingo.socketService.addFunction("system:error").subscribe((data: { status: string, error: number }) => {
      switch (data.status) {
        case "error":
          switch(data.error) {
            case 500:
              
              break;
          }
          break;
      }
      console.log('ERROR: ' + data.error);
    });

    this.schoolingo.socketService.addFunction("timetable:getLessons").subscribe((data: TimetableAPI[]) => {
        this.schoolingo.timetableAPI = data;
        this.schoolingo.refreshTimetableHours();
        this.schoolingo.refreshTimetableLessons();
    });
  }

  ngOnDestroy(): void {
    if (this.routerSub != undefined) this.routerSub.unsubscribe();
  }


}
