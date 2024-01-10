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
import { Logger } from '@Schoolingo/Logger';

@Component({
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css', '../Components/Dropdown/dropdown.css', './board.css']
})
export class BoardComponent implements OnInit {

  private routerSub;
  config = config;


  constructor(
    public socketService: SocketService,
    public userService: UserService,
    public locale: Locale,
    public schoolingo: Schoolingo,
    public dropdown: Dropdowns,
    private router: Router,
    private title: Title,
    private sidebar: Sidebar,
    private toast: ToastService,
    private tabs: Tabs,
    private storage: Cache,
    public logger: Logger
  ) {

    // Register dropdowns
    this.dropdown.addDropdown('user');



    // Change title on page change
    this.routerSub = this.router.events.subscribe((url: any) => {
      if (url?.routerEvent) return;
      if (url?.type != 16) this.tabs.clearTabs();
      if (url?.type != 1) {return;}
      if (url?.url == '/login') return;

      let item = this.sidebar.getItem(url.url?.slice(1));
    
      if (!item?.[item.length - 1] ||
        (item[item.length - 1] && (item[item.length - 1].permission && schoolingo.checkPermissions(item[item.length - 1].permission as UserPermissions[]) == false) ||
        (item[0].permission && schoolingo.checkPermissions(item[0].permission as UserPermissions[]) == false))
        ) {
          this.router.navigateByUrl('main');
          this.toast.showToast('Nepodařilo se zobrazit požadovanou stránku.', 'error')
          return;
      }

      // Setup page 
      setTimeout(() => {
        this.schoolingo.sidebarToggled = false;
        this.title.setTitle(this.locale.getLocale(item[item.length - 1].item) + ' | SCHOOLINGO');
      })

      this.schoolingo.selectWeek(this.schoolingo.getThisWeek());
      this.schoolingo.refreshTimetable();


    });

    

  }


  public setupSocket(): void {

    this.socketService.addFunction('token', (data: any) => {
      if (!data.status || data?.user == undefined || data.status == 401) {
        this.userService.logout();
        this.logger.send('User', 'Logging out due problem with token.');
        return;
      }
      switch(data.status) {
        case 1:
          data.user.class = JSON.parse(data.user.class as string);
          data.user.teacherId = data.teacherId ?? null;
          data.user.studentId = data.studentId ?? null;
          this.userService.setUser(data.user as UserMain);
          this.logger.send('Socket', 'Updated user data');
          break;
      }
    });


    this.socketService.addFunction('subjects', (subjects: any[]) => {
      let subjectList: Subject[] = [];
      for(let i = 0;i < subjects.length;i++) {
        subjectList.push([subjects[i].subjectId, subjects[i].shortcut, subjects[i].label])
      }
      this.schoolingo.setSubjects(subjectList);
      this.logger.send('Socket', 'Updated list of subjects');
    });

    this.socketService.addFunction('rooms', (rooms: any[]) => {
      this.schoolingo.setRooms(rooms);
      this.logger.send('Socket', 'Updated list of rooms');
    });


    this.socketService.addFunction('teachers', (teachers: any[]) => {
      this.schoolingo.setTeachers(teachers);
      this.logger.send('Socket', 'Updated list of teachers');
    });

    this.socketService.addFunction('timetable', (timetable: any[]) => {
      let lessons: Lesson[][][] = [];
  
      for(let i = 0;i < timetable.length;i++) {
        if (!lessons[timetable[i].day]) lessons[timetable[i].day] = [];
        let d0: number = 1;
        let d1: number = 1;
        while(timetable[i].day != 0 && !lessons[timetable[i].day - 1 - d0] && d0 < this.schoolingo.days.length && (timetable[i].day - 1 - d0) >= 0) {
          lessons[timetable[i].day - 1 - d0] = [];
          d0++;
        }
        while(timetable[i].hour != 0 && lessons[timetable[i].day] && (timetable[i].hour - 1 - d1 >= 0) && !lessons[timetable[i].day]?.[timetable[i].hour - 1 - d1] && d1 < timetable[i].hour) {
          lessons[timetable[i].day][timetable[i].hour - 1 - d1] = [{ 
            subject: -1,
            teacher: -1
          }];
          d1++;
        }

        if (!lessons[timetable[i].day][timetable[i].hour - 1]) {
          lessons[timetable[i].day][timetable[i].hour - 1] = [];
        }

        if (lessons?.[timetable[i].day]?.[timetable[i].hour -1]?.[0]?.subject == -1 && lessons?.[timetable[i].day]?.[timetable[i].hour -1]?.[0]?.teacher == -1) {
          lessons[timetable[i].day][timetable[i].hour - 1] = [];
        }
        lessons[timetable[i].day][timetable[i].hour - 1].push({
          subject: timetable[i].subject,
          teacher: timetable[i].teacherId,
          room: timetable[i].room,
          class: timetable[i]?.class,
          group: {
            text: timetable[i].groupName,
            num: timetable[i].groupNum
          },
          type: timetable[i].type
        });
      }
      this.schoolingo.setLessons(lessons);
      this.logger.send('Socket', 'Updated timetable');
    });    
  }


  ngOnInit(): void {
    let token = this.userService.getToken();
    if (!token) {
      this.router.navigate(['login']);
      return;
    }
    
    // Close all dropdown
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
    let lesssons = Object.values(this.storage.get('lessons')) as Lesson[][][];
    if (lesssons) {
      this.schoolingo.setLessons(lesssons);
    }

    // Socket service
    this.socketService.connectUser();
    this.setupSocket();


    let _sidebarUpdateInt = setInterval(() => {
      if (this.userService.getUser() && (this.userService?.getUser() as UserMain)?.type != undefined) {
        this.schoolingo.boardSidebar = this.schoolingo.getBoardSidebar();
        clearInterval(_sidebarUpdateInt);
      }
    }, 50);

  }

  ngOnDestroy(): void {
    this.routerSub.unsubscribe();
    this.socketService?.getSocket()?.Socket?.disconnect();
  }

}
