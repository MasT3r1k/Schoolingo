import { Injectable } from '@angular/core';
import { Permission } from './Permissions';
import { SidebarGroup, SidebarItem } from './Sidebar.d';
export type { SidebarGroup, SidebarItem };

@Injectable()
export class Sidebar {
    constructor(
        private Permissions: Permission,
    ) {
        this.build();
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
    private config: SidebarGroup[] = [
        {
            label: "sidebar/main",
            permission: ["all"],
            items: [
                {
                    item: "sidebar/home",
                    url: 'main',
                    permission: ['all']
                },
                {
                    item: "sidebar/pupilcard",
                    url: 'pupilcard',
                    permission: ['teacher']
                },
                {
                    item: 'sidebar/manageclass',
                    url: 'manageclass',
                    permission: ['teacher']
                },
                {
                    item: 'sidebar/marks/main',
                    permission: ['teacher', 'student', 'parent'],
                    children: [{
                        item: 'sidebar/marks/interm',
                        url: 'marks/interm',
                        permission: ['student', 'parent'],
                    }, {
                        item: 'sidebar/marks/midterm',
                        url: 'marks/midterm',
                        permission: ['student', 'parent'],
                    }, {
                        item: 'sidebar/marks/intermRecord',
                        url: 'marks/intermRecord',
                        permission: ['teacher'],
                    }, {
                        item: 'sidebar/marks/midtermRecordTimesheet',
                        url: 'marks/midtermRecordTimesheet',
                        permission: ['teacher'],
                    }, {
                        item: 'sidebar/marks/midtermRecordClass',
                        url: 'marks/midtermRecordClass',
                        permission: ['teacher'],
                    }]
                },
                {
                    item: 'sidebar/teach/main',
                    children: [{
                        item: 'sidebar/teach/timetable',
                        url: 'teach/timetable',
                        permission: ['student', 'parent', 'teacher']
                    }, {
                        item: 'sidebar/teach/homeworks',
                        url: 'teach/homeworks',
                        permission: ['student', 'parent']
                    }, {
                        item: 'sidebar/absence',
                        permission: ['student', 'parent'],
                        url: 'teach/absence',
                    }, {
                        item: 'sidebar/teach/substitution',
                        url: 'teach/substitution',
                        permission: ['student', 'parent', 'teacher']
                    }, {
                        item: 'sidebar/teach/tutoring',
                        url: 'teach/tutoring',
                        permission: ['student', 'parent', 'teacher']
                    }, {
                        item: 'sidebar/teach/classbook',
                        url: 'teach/classbook',
                        permission: ['teacher']
                    }, {
                        item: 'sidebar/teach/subjects',
                        url: 'teach/subjects',
                        permission: ['student', 'parent']
                    }]
                },
                {
                    item: 'sidebar/messages/main',
                    children: [
                    {
                        item: 'sidebar/messages/send',
                        url: 'messages/send',
                    }, {
                        item: 'sidebar/messages/received',
                        url: 'messages/received',
                    }, {
                        item: 'sidebar/messages/sent',
                        url: 'messages/sent',
                    }, {
                        item: 'sidebar/messages/groups',
                        url: 'messages/groups',
                    }, {
                        item: 'sidebar/messages/noticeboard',
                        url: 'messages/noticeboard',
                    }]
                },
                {
                    item: 'sidebar/actionPlan',
                    permission: ['student', 'parent', 'teacher'],
                    url: 'actionplan',
                }, {
                    item: 'sidebar/calendar',
                    permission: ['student', 'parent', 'teacher'],
                    url: 'calendar',
                }, {
                    item: 'sidebar/documents',
                    permission: ['all'],
                    url: 'documents',
                },
                {
                    item: 'sidebar/user/main',
                    permission: ['all'],
                    children: [{
                        item: 'sidebar/user/devices',
                        url: 'user/devices'
                    }, {
                        item: 'settings',
                        url: 'user/settings'
                    }]
                },
                {
                    item: 'sidebar/archive',
                    permission: ['principal'],
                    url: 'archive'
                }
            ]
        }
    ];

    public build(): void {
        let boardSidebar = JSON.parse(JSON.stringify(this.config));
        let newSidebar: SidebarGroup[] = [];
    
        boardSidebar.forEach((section: SidebarGroup): void => {
          if (section.permission && !this.Permissions.checkPermission(section.permission))
            return;
          if (section.items.length == 0) return;
          let items: SidebarItem[] = [];
          section.items.forEach((item: SidebarItem): void => {
            if (item.permission && !this.Permissions.checkPermission(item.permission)) return;
            if (item.children) {
              let delC = 0;
              let children = JSON.parse(JSON.stringify(item.children)) as SidebarItem[];
              children.forEach((child: SidebarItem, index: number) => {
                if (!(child.permission && !this.Permissions.checkPermission(child.permission)))
                  return;
                item.children?.splice(index - delC, 1);
                delC++;
              });
            }
            items.push(item);
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

}