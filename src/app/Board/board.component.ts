import { Schoolingo } from '@Schoolingo';
import { Locale } from '@Schoolingo/Locale';
import { UserService } from '@Schoolingo/User';
import { Component, OnInit } from '@angular/core';
import * as config from '@config';
import { Dropdowns } from '@Components/Dropdown/Dropdown';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Sidebar } from '@Schoolingo/Sidebar';
import { SocketService } from '@Schoolingo/Socket';
import { UserMain } from '@Schoolingo/User';
import { ToastService } from '@Components/Toast';
import { Tabs } from '@Components/Tabs/Tabs';
import { Lesson, Room, Subject } from '@Schoolingo/Board.d';
import { Cache } from '@Schoolingo/Cache';
import { LoginData, Teacher, UserPermissions } from '@Schoolingo/User.d';
import { Logger } from '@Schoolingo/Logger';
import { formError } from '../login/login.component';
import { FormControl } from '@angular/forms';

@Component({
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css', '../Components/Dropdown/dropdown.css', './board.css', '../input.css', '../Components/modals/modals.component.css']
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
    private route: ActivatedRoute,
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

  public getLoginButtonText(): string {
    if (this.tryingToLogin == true) return '<div class=\'btn-loader\'></div> ' + this.locale.getLocale('logining_btn');
    return this.locale.getLocale('login_btn');
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
    if (this.userService?.getUser()?.username) {
      this.username.setValue(this.userService.getUser()?.username as string);
    }

    this.socketService.connectUser();
    this.schoolingo.setupSocket();


    let _sidebarUpdateInt = setInterval(() => {
      if (this.userService.getUser() && (this.userService?.getUser() as UserMain)?.type != undefined) {
        this.schoolingo.boardSidebar = this.schoolingo.getBoardSidebar();
        clearInterval(_sidebarUpdateInt);
      }
    }, 50);


    this?.socketService.addFunctionNotConnected('login', (data: LoginData) => {
      this.tryingToLogin = false;
      if (data.status == 1 && data?.token && data?.expires) {
        this.logger.send('Login', 'Successful logged in.');
        this.storage.removeAll();
        this.toast.showToast(this.locale.getLocale('successfulLogin'), 'success', 5000);
        this.userService.setToken(data.token, data.expires);
        this.socketService.getSocket().Socket?.disconnect();
        this.socketService.connectUser();
        this.schoolingo.setupSocket();
        this.schoolingo.SECURITY_modal = '';
      }else{
        if (!data.message) return;
        switch(data.message) {
          case "user_not_found":
            this.formErrors = [{ input: 'username', locale: data.message }];
            break;
          case "wrong_password":
            this.formErrors = [{ input: 'password', locale: data.message }];
            break;
          default:
            this.logger.send('Login', 'Error: ' + data.message);
            break;
        } 
      }
    })

  }

  ngOnDestroy(): void {
    this.routerSub.unsubscribe();
    this.socketService?.getSocket()?.Socket?.disconnect();
  }

  // Main login code
  username: FormControl<string | null> = new FormControl<string>('');
  password: FormControl<string | null> = new FormControl<string>('');
  public tryingToLogin: boolean = false;

  formErrors: formError[] = [];
  public errorFilter(name: string): boolean | string {
    let filter = this.formErrors.filter((err) => err.input == name);
    return (filter.length == 0) ? false : filter[0].locale;
  }

  public login(): void {
    this.formErrors = [];
    if (this.canLogin() == false) {
      if (this.username.value == null || this.username.value == '') {
        this.formErrors.push({ input: 'username', locale: 'required' });
      }
      if (this.password.value == null || this.password.value == '') {
        this.formErrors.push({ input: 'password', locale: 'required' });

      }
      return;
    }
    this.tryingToLogin = true;
    this.logger.send('Login', 'Trying to login.')
    this.socketService?.getSocket().Socket?.emit('login', { username: this.username.value, password: this.password.value });
  }

  

  public canLogin(): boolean {
    return !(this.username.value == null || this.username.value == '' || this.password.value == null || this.password.value == '');
  }

}
