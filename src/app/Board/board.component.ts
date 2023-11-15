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
    private tabs: Tabs
  ) {

    // Register dropdowns
    this.dropdown.addDropdown('user');



    // Change title on page change
    this.routerSub = this.router.events.subscribe((url: any) => {
      if (!url.url) { return ; }
      let item = this.sidebar.getItem(url.url?.slice(1));
      if (!item?.[item.length - 1]) return;
      this.tabs.clearTabs();
      this.schoolingo.sidebarToggled = false;
      this.title.setTitle(this.locale.getLocale(item[item.length - 1].item) + ' | SCHOOLINGO');

      // Setup page 
      this.schoolingo.selectWeek(this.schoolingo.getThisWeek());
      this.schoolingo.refreshTimetable();


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
          this.userService.setUser(data.user);
          break;
        case 401:
          this.userService.logout();
          break;
      }
    })

    let _sidebarUpdateInt = setInterval(() => {
      if (this.userService.getUser() && (this.userService?.getUser() as UserMain)?.type != undefined) {
        this.schoolingo.boardSidebar = this.schoolingo.getBoardSidebar();
        clearInterval(_sidebarUpdateInt);
      }
    }, 50)

  }

  ngOnDestroy(): void {
    this.routerSub.unsubscribe();
    this.socketService.getSocket().Socket?.disconnect();
  }


}
