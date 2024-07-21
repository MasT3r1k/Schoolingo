import { NgClass, NgStyle } from '@angular/common';
import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Schoolingo } from '@Schoolingo';
import { name } from '@Schoolingo/Config';
import { School } from '@Schoolingo/School';
import { SidebarItem } from '@Schoolingo/Sidebar';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [NgClass, NgStyle, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './board.component.html',
  styleUrl: './board.component.css'
})
export class BoardComponent {
  constructor(
    public school: School,
    public schoolingo: Schoolingo,
    private routerImport: Router,
    private title: Title
  ) {
    this.router = routerImport as Router;
  }

  private router: Router;
  private routerSub: Subscription | undefined = undefined;

  ngOnInit(): void {
    this.routerSub = this.router.events.subscribe((url: any): void => {
      if (url instanceof NavigationEnd) {
        if (url.url) {
          let item: SidebarItem[] = this.schoolingo.sidebar.getItem(url.url.split('?')[0].split('#')[0]?.slice(1));
          for(const x of item) {
            if (!x.children || x.children?.length == 0) {
              let pageTitle = `${this.schoolingo.locale.getLocale(x.item)} - ${name}`;
              this.title.setTitle(pageTitle);
            }
          }
        }
      }
    });
  }

  ngOnDestroy(): void {
    if (this.routerSub != undefined) this.routerSub.unsubscribe();
  }


}
