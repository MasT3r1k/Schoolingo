import { Schoolingo } from '@Schoolingo';
import { Locale } from '@Schoolingo/Locale';
import { UserService } from '@Schoolingo/User';
import { Component, OnInit } from '@angular/core';
import * as config from '@config';
import { Dropdowns } from '@Components/Dropdown/Dropdown';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Sidebar } from '@Schoolingo/Sidebar';
import { SocketService } from '@Schoolingo/Socket';
import { UserMain } from '@Schoolingo/User';
import { ToastService } from '@Components/Toast';
import { Tabs } from '@Components/Tabs/Tabs';
import { Lesson, Room, Subject } from '@Schoolingo/Board.d';
import { Cache } from '@Schoolingo/Cache';
import { Teacher, UserPermissions } from '@Schoolingo/User.d';

@Component({
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css', '../Components/Dropdown/dropdown.css', './board.css']
})
export class BoardComponent implements OnInit {

  private routerSub;
  config = config;


  constructor(
    public userService: UserService,
    public socketService: SocketService,
    public locale: Locale,
    public schoolingo: Schoolingo,
    public dropdown: Dropdowns,
    private router: Router,
    private title: Title,
    private sidebar: Sidebar,
    private toast: ToastService,
    private tabs: Tabs,
    private storage: Cache
  ) {

    // Register dropdowns
    this.dropdown.addDropdown('user');



    // Change title on page change
    this.routerSub = this.router.events.subscribe((url: any) => {
      if (url?.routerEvent) return;
      if (!(url?.code === 0 && url?.type == 16)) this.tabs.clearTabs();

      if ((!url?.routerEvent?.urlAfterRedirects && !url?.url) || (url?.routerEvent?.urlAfterRedirects == '/login' || url?.url == '/login') || url.type != 1) { return; }


      let item = this.sidebar.getItem(url.url?.slice(1));
      console.log(item);
      if (!item?.[item.length - 1] ||
        (item[item.length - 1] && (item[item.length - 1].permission && schoolingo.checkPermissions(item[item.length - 1].permission as UserPermissions[]) == false) ||
        (item[0].permission && schoolingo.checkPermissions(item[0].permission as UserPermissions[]) == false))
        ) {
          this.router.navigateByUrl('main');
          this.toast.showToast('Nepodařilo se zobrazit požadovanou stránku.', 'error')
          return;
        }

      this.schoolingo.sidebarToggled = false;

      // Setup page 
      this.schoolingo.selectWeek(this.schoolingo.getThisWeek());
      this.schoolingo.refreshTimetable();

      this.title.setTitle(this.locale.getLocale(item[item.length - 1].item) + ' | SCHOOLINGO');


    });

  }

  ngOnInit(): void {
    let token = this.userService.getToken();
    if (!token) {
      this.router.navigate(['login']);
      return;
    }

    // Close all dropdowns
    this.dropdown.closeAllDropdowns();

    // Load data from storage
    //* Teachers
    let teachers = Object.values(this.storage.get('teachers')) as Teacher[];
    if (teachers) {
      this.schoolingo.setTeachers(teachers);
    }

    //* Rooms
    let rooms = Object.values(this.storage.get('rooms')) as Room[];
    if (rooms) {
      this.schoolingo.setRooms(rooms);
    }

    //* Subjects
    let subjects = Object.values(this.storage.get('subjects')) as Subject[];
    if (subjects) {
      this.schoolingo.setSubjects(subjects);
    }

    //* Lessons
    let lesssons = Object.values(this.storage.get('lessons')) as Lesson[][];
    if (lesssons) {
      this.schoolingo.setLessons(lesssons);
    }

    // Socket service
    this.socketService.connectUser();

    this.socketService.getSocket().Socket?.on('token', (data: any) => {
      if (!data.status) {
        this.userService.logout();
        return;
      }
      switch(data.status) {
        case 1:
          if (data?.user == undefined) return;
          this.userService.setUser(data.user as UserMain);
          break;
        case 401:
          this.userService.logout();
          break;
      }
    });

    this.socketService.getSocket().Socket?.on('subjects', (subjects: any[]) => {
      let subjectList: Subject[] = [];
      for(let i = 0;i < subjects.length;i++) {
        subjectList.push([subjects[i].subjectId, subjects[i].shortcut, subjects[i].label])
      }
      this.schoolingo.setSubjects(subjectList);
    });

    this.socketService.getSocket().Socket?.on('rooms', (rooms: any[]) => {
      this.schoolingo.setRooms(rooms);
    });


    this.socketService.getSocket().Socket?.on('teachers', (teachers: any[]) => {
      this.schoolingo.setTeachers(teachers);
    });

    this.socketService.getSocket().Socket?.on('timetable', (timetable: any[]) => {
      let lessons: Lesson[][] = [];

      for(let i = 0;i < timetable.length;i++) {
        if (!lessons[timetable[i].day]) lessons[timetable[i].day] = [];
        let d0: number = 1;
        let d1: number = 1;
        while(timetable[i].day != 0 && !lessons[timetable[i].day - 1 - d0] && d0 < this.schoolingo.days.length) {
          lessons[timetable[i].day - 1 - d1] = [];
          d0++;
        }
        while(timetable[i].hour != 0 && lessons[timetable[i].day] && !lessons[timetable[i].day][timetable[i].hour - 1 - d1] && d1 < timetable[i].hour) {
          lessons[timetable[i].day][timetable[i].hour - 1 - d1] = { 
            subject: -1,
            teacher: -1
          }
          d1++;
        }

        lessons[timetable[i].day][timetable[i].hour - 1] = {
          subject: timetable[i].subjectId,
          teacher: timetable[i].teacherId,
          room: timetable[i].roomId,
          group: {
            text: timetable[i].group,
            num: timetable[i].groupNum
          },
          type: timetable[i].type
        }
      }
      this.schoolingo.setLessons(lessons);
      console.log(lessons);
    });

    let _sidebarUpdateInt = setInterval(() => {
      if (this.userService.getUser() && (this.userService?.getUser() as UserMain)?.type != undefined) {
        this.schoolingo.boardSidebar = this.schoolingo.getBoardSidebar();
        clearInterval(_sidebarUpdateInt);
      }
    }, 50);

  }

  ngOnDestroy(): void {
    this.routerSub.unsubscribe();
    this.socketService.getSocket().Socket?.disconnect();
  }

}
