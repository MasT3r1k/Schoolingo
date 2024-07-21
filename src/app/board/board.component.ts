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
    private router: Router,
    private title: Title
  ){}

  private routerSub!: Subscription;

  ngOnInit(): void {
    this.routerSub = this.router.events.subscribe((url: any): void => {
      if (url instanceof NavigationEnd) {
        if (url.url) {
          let item: SidebarItem[] = this.schoolingo.sidebar.getItem(url.url.split('?')[0].split('#')[0]?.slice(1));
          for(let i = 0;i < item.length;i++) {
            if (!item[i].children || item[i]?.children?.length == 0) {
              let pageTitle: string = `${this.schoolingo.locale.getLocale(item[i].item)} - ${name}`;
              this.title.setTitle(pageTitle);
            }
          }
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.routerSub.unsubscribe();
  }


}
