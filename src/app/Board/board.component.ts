import { Schoolingo } from '@Schoolingo';
import { Locale } from '@Schoolingo/Locale';
import { UserService } from '@Schoolingo/User';
import { Component, OnInit, Input } from '@angular/core';
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
import { Storage } from '@Schoolingo/Storage';
import { LoginData, Teacher, UserPermissions } from '@Schoolingo/User.d';
import { Logger } from '@Schoolingo/Logger';
import { FormControl } from '@angular/forms';
import { FormError } from '@Schoolingo/FormManager';

@Component({
  selector: 'schoolingo-board',
  templateUrl: './board.component.html',
  styleUrls: [
    './board.component.css',
    '../Components/Dropdown/dropdown.css',
    './board.css',
    '../input.css',
    '../Components/modals/modals.component.css',
  ],
})
export class BoardComponent implements OnInit {
  private routerSub;
  private declare loginEventListener;
  private declare loginTimeout;
  public isTakingTooLogin: boolean = false;
  config = config;

  constructor(
    public socketService: SocketService,
    public userService: UserService,
    public locale: Locale,
    public schoolingo: Schoolingo,
    public dropdown: Dropdowns,
    public logger: Logger,
    private route: ActivatedRoute,
    private router: Router,
    private title: Title,
    private sidebar: Sidebar,
    private toast: ToastService,
    private tabs: Tabs,
    private storage: Storage,
  ) {
    this.dropdown.addDropdown('user');

    // Change title on page change
    this.routerSub = this.router.events.subscribe((url: any) => {
      if (url?.routerEvent) return;
      if (url?.type != 16) this.tabs.clearTabs();
      if (url?.type != 1) {
        return;
      }
      if (url?.url.startsWith('/login')) return;

      let item = this.sidebar.getItem(url.url.split('?')[0].split('#')[0]?.slice(1));

      if (
        (item && item.length > 0 && item[item.length - 1] &&
          item[item.length - 1].permission &&
          schoolingo.checkPermissions(
            item[item.length - 1].permission as UserPermissions[]
          ) == false) ||
        (item[0] && item[0].permission &&
          schoolingo.checkPermissions(
            item[0].permission as UserPermissions[]
          ) == false)
      ) {
        console.error('No access to this page!')
        this.router.navigateByUrl('main');
        this.toast.showToast(
          'Nepodařilo se zobrazit požadovanou stránku.',
          'error'
        );
        return;
      }

      // Setup page
      setTimeout(() => {
        this.schoolingo.sidebarToggled = false;
        this.title.setTitle(
          item?.[item.length - 1] ? this.locale.getLocale(item[item.length - 1].item) + ' | SCHOOLINGO' : 'SCHOOLINGO'
        );
      });

      this.schoolingo.selectWeek(this.schoolingo.getThisWeek());
      this.schoolingo.refreshTimetable();
    });
  }

  public getLoginButtonText(): string {
    if (this.tryingToLogin == true)
      return (
        "<div class='btn-loader'></div> " +
        this.locale.getLocale('logining_btn')
      );
    return this.locale.getLocale('login_btn');
  }

  ngOnInit(): void {
    let token = this.userService.getToken();
    if (!token) {
      this.router.navigate(['login']);
      return;
    }

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
      if (
        this.userService.getUser() &&
        (this.userService?.getUser() as UserMain)?.type != undefined
      ) {
        this.schoolingo.boardSidebar = this.schoolingo.getBoardSidebar();
        clearInterval(_sidebarUpdateInt);
      }
    }, 50);

    this.loginEventListener = this?.socketService.addFunctionNotConnected('login').subscribe((data: LoginData) => {
      this.tryingToLogin = false;
      clearTimeout(this.loginTimeout);
      if (data.status == 1 && data?.token && data?.expires) {
        this.logger.send('Login', 'Successful logged in.');
        this.password.setValue('');
        this.storage.removeAll();
        this.toast.showToast(
          this.locale.getLocale('successfulLogin'),
          'success',
          5000
        );
        this.userService.setToken(data.token, data.expires);
        this.socketService.getSocket().Socket?.disconnect();
        this.socketService.connectUser();
        this.schoolingo.setupSocket();
        this.schoolingo.SECURITY_modal = '';
        this.schoolingo.setOfflineMode(false);
      } else {
        if (!data.message) return;
        switch (data.message) {
          case 'user_not_found':
            this.formErrors = [{ input: 'username', locale: data.message }];
            break;
          case 'wrong_password':
            this.formErrors = [{ input: 'password', locale: data.message }];
            break;
          default:
            this.logger.send('Login', 'Error: ' + data.message);
            break;
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.routerSub.unsubscribe();
    this.loginEventListener.unsubscribe()
    this.schoolingo.unSetupSocket();
    this.socketService?.getSocket()?.Socket?.disconnect();
  }

  // Main login code
  username: FormControl<string | null> = new FormControl<string>('');
  password: FormControl<string | null> = new FormControl<string>('');
  public tryingToLogin: boolean = false;

  formErrors: FormError[] = [];
  public errorFilter(name: string): boolean | string {
    let filter = this.formErrors.filter((err) => err.input == name);
    return filter.length == 0 ? false : filter[0].locale;
  }

  public login(): void {
    this.formErrors = [];
    this.isTakingTooLogin = false;
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
    this.logger.send('Login', 'Trying to login.');
    this.socketService
      ?.getSocket()
      .Socket?.emit('login', {
        username: this.username.value,
        password: this.password.value,
      });
    this.loginTimeout = setTimeout(() => {
      this.tryingToLogin = false;
      this.isTakingTooLogin = true;
    }, 5000);
  }

  public canLogin(): boolean {
    return !(
      this.username.value == null ||
      this.username.value == '' ||
      this.password.value == null ||
      this.password.value == ''
    );
  }
}
