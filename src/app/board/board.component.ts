import { NgClass, NgStyle } from '@angular/common';
import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Schoolingo } from '@Schoolingo';
import { alertManager, AlertManagerClass } from '@Schoolingo/Alert';
import { languages } from '@Schoolingo/Locale';
import { School } from '@Schoolingo/School';
import { SocketUpdateTheme, SocketUpdateLocale } from '@Schoolingo/Socket';
import { user } from '@Schoolingo/User';
import { Subscription } from 'rxjs';

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

    this.schoolingo.socketService.addFunction("main:updateUser").subscribe((data: user) => {
      this.schoolingo.userService.setUser(data);
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
  }

  ngOnDestroy(): void {
    if (this.routerSub != undefined) this.routerSub.unsubscribe();
  }


}
