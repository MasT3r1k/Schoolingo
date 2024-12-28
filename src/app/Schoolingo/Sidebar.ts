import { Injectable } from '@angular/core';
import { Permission } from './Permissions';
import { SidebarGroup, SidebarItem } from './Sidebar.d';
import { Locale } from './Locale';
import * as SidebarConfig from "@Schoolingo/Sidebar.config";

import { Title } from '@angular/platform-browser';
import { Modules } from './Modules';
import { AppConfig } from '@Schoolingo/App';
import { Subscription } from 'rxjs';
export type { SidebarGroup, SidebarItem };

@Injectable()
export class Sidebar {
  public listeners: Subscription[] = [];
    constructor(
        private Permissions: Permission,
        private locale: Locale,
        private title: Title,
        private modules: Modules
    ) {
        this.build();
        this.listeners.push(this.locale.language.subscribe(() => {
          this.updateTitle(window.location.pathname.slice(1));
        }));
    }

    public sidebarToggled = false;
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
        let boardSidebar = JSON.parse(JSON.stringify(SidebarConfig.default));
        let newSidebar: SidebarGroup[] = [];
    
        boardSidebar.forEach((section: SidebarGroup): void => {
          if (section.permission && !this.Permissions.checkPermission(section.permission) || section.items.length == 0) return;

          let items: SidebarItem[] = [];
          section.items.forEach((item: SidebarItem): void => {
            if (item.permission && !this.Permissions.checkPermission(item.permission) || (item.modules && !this.modules.checkModule(item.modules))) return;
            if (item.children) {
              let delC = 0;
              let children = JSON.parse(JSON.stringify(item.children)) as SidebarItem[];
              children.forEach((child: SidebarItem, index: number) => {
                if (!(child.permission && !this.Permissions.checkPermission(child.permission)) || (child.modules && !this.modules.checkModule(child.modules)))
                  return;
                item.children?.splice(index - delC, 1);
                delC++;
              });
            }
            if (!item.children || item.children && item.children.length != 0) {
              items.push(item);
            }
          });
          newSidebar.push({ label: section.label, items: items });
        });

        this.data = newSidebar;

        // Load data from storage
        if (localStorage.getItem('sidebar')) {
          this.toggledDropdowns = JSON.parse(localStorage.getItem('sidebar')!);
        }

    }

    /**
     * Get page information by page's url
     * @param url url of page
     * @returns information of page
     */
    public getItem(url: string): SidebarItem[] {
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
            let pageTitle = `${this.locale.getLocale(x.item)} - ${AppConfig.APP_NAME}`;
            this.title.setTitle(pageTitle);
          }
        }
    }

}