import { BehaviorSubject, filter, Subscription } from 'rxjs';
import { Permission, permType, UserRoles } from '../permission';
import { Modules, modules } from '@Schoolingo/modules';
import { inject, Injectable } from '@angular/core';
import { Locale } from '@Schoolingo/locale';
import { Title } from '@angular/platform-browser';
import { config } from './config';
import { Config } from '@Schoolingo/config';
import { NavigationEnd, Router } from '@angular/router';

export interface SidebarItem {
    item: string;
    url?: string;
    icon?: string;
    permission?: permType[];
    children?: SidebarItem[];
    badge?: any;
    modules?: modules[];
    setting?: string;
}

export interface SidebarGroup {
    label: string;
    permission?: permType[];
    modules?: modules[];
    setting?: string;
    items: SidebarItem[];
}

@Injectable()
export class Sidebar {
    private listeners: Subscription[] = [];
    private perm = inject(Permission);
    private l = inject(Locale);
    private title = inject(Title);
    private modules = inject(Modules);
    private router = inject(Router);

    constructor() {
      this.build();
      
      this.listeners.push(
        this.router.events.pipe(
          filter(event => event instanceof NavigationEnd)
        ).subscribe(() => { 
          this.updateTitle(window.location.pathname);
        })
      )

      this.listeners.push(
        this.l.getLocaleData().subscribe(() => {
          this.updateTitle(window.location.pathname);
        })
      );
    }

    public sidebarToggled = false;
    public settings: any = null;
    public data: SidebarGroup[] = [];
    public toggledDropdowns: number[] = [];
    public toggleDropdown(id: number): void {
        if (this.toggledDropdowns.includes(id)) {
            this.toggledDropdowns.splice(this.toggledDropdowns.indexOf(id), 1);
        } else {
            this.toggledDropdowns.push(id);

        }
        localStorage.setItem('sidebar', JSON.stringify(this.toggledDropdowns));
    }

    public isToggled(id: number): boolean {
      return this.toggledDropdowns.includes(id);
    }
    
    public build(): void {
        let boardSidebar = config;
        let newSidebar: SidebarGroup[] = [];
    
        boardSidebar.forEach((section: SidebarGroup): void => {
          if (section.permission && !this.perm.checkPermission(section.permission) || section.items.length == 0) return;

          let items: SidebarItem[] = [];
          section.items.forEach((item: SidebarItem): void => {
            let newItem: SidebarItem = {
              item: item.item,
              url: item.url,
              icon: item.icon,
              badge: item.badge
            };
            if ((item.permission && !this.perm.checkPermission(item.permission)) || (item.modules && !this.modules.checkModule(item.modules)) || (item.setting && this.settings && this.settings[item.setting] == false)) return;

            if (this.settings?.demo_enabled) {
              const allowedDemoItems = [
                'sidebar.home', 
                'sidebar.schedule.main', 
                'sidebar.schedule.template_timetable',
                'sidebar.schedule.template_subject',
                'sidebar.schedule.builder',
                'sidebar.schedule.supervision',
                'sidebar.marks.main',  
                'sidebar.marks.interm',
                'sidebar.marks.midterm',
                'sidebar.marks.marks_record',
                'sidebar.marks.education_measures',
                'sidebar.teach.main',
                'sidebar.teach.timetable',
                'sidebar.messages.main', 
                'sidebar.messages.send',
                'sidebar.messages.received',
                'sidebar.messages.sent',
                'sidebar.messages.drafts',
                'sidebar.messages.noticeboard',
                'sidebar.account',
                'user.login_history',
                'user.devices',
                'sidebar.user.notifications',
                'sidebar.user.cookies',
                'sidebar.settings',
                'sidebar.system.main',
                'sidebar.system.settings',
                'sidebar.system.manage_users',
                'sidebar.system.manage_files',
                'sidebar.system.manage_messages',
                'sidebar.system.auditlog',
                'sidebar.system.monitoring',
                'admin.schoolYears.title'
              ];
              // Block if not in allowed list
              if (!allowedDemoItems.includes(item.item)) {
                return;
              }
            }
            

            if (item.children && item.children.length) {
              newItem.children = [];
              item.children.forEach((child: SidebarItem, index: number) => {
                if ((child.permission && !this.perm.checkPermission(child.permission)) || (child.modules && !this.modules.checkModule(child.modules)) || (child.setting && this.settings && this.settings[child.setting] == false)) {
                  return;
                }

                newItem.children?.push({
                    item: child.item,
                    url: child.url,
                    icon: child.icon,
                    badge: child.badge,
                    setting: child.setting,
                    children: child.children
                })
              });
            }

            if (!newItem.children || newItem.children && newItem.children.length != 0) {
              items.push(newItem);
            }
          });

          newSidebar.push({ label: section.label, items });
        });

        this.data = newSidebar;

        // Load data from storage
        if (localStorage.getItem('sidebar')) {
          this.toggledDropdowns = JSON.parse(localStorage.getItem('sidebar')!);
        }

        this.updateTitle(window.location.pathname);
    }

    /**
     * Get page information by page's url
     * @param urlParam url of page
     * @returns information of page
     */
    public getItem(urlParam: string = window.location.pathname): SidebarItem[] {
      const url = urlParam.startsWith('/') ? urlParam.slice(1) : urlParam;
      let gotItem: SidebarItem[] = [];
      this.data.forEach((group) => {
          group.items.forEach((item: SidebarItem) => {
              if (item.url == url) {
                  gotItem[0] = item;
              }
              item.children?.forEach((nItem: SidebarItem) => {
                  if (nItem.url == url) {
                      gotItem[0] = item;
                      gotItem[1] = nItem;
                  };
              })
          });
      })
      return gotItem;
    }

    public updateTitle(url: string): void {
        let item: SidebarItem[] = this.getItem(url.split('?')[0].split('#')[0]?.slice(1));
        for(const x of item) {
          if (!x.children || x.children.length == 0) {
            let pageTitle = `${this.l.s(x.item)} - ${Config.APP_NAME}`;
            this.title.setTitle(pageTitle);
          }
        }
    }

}