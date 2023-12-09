import { UserPermissions } from "./User.d";

export interface SidebarItem {
    item: string;
    url?: string;
    icon?: string;
    permission?: UserPermissions[];
    children?: SidebarItem[];
}

export interface SidebarGroup {
    label: string;
    permission?: UserPermissions[];
    items: SidebarItem[];
}


export class Sidebar {
    public data: SidebarGroup[] =
    [{
        label: "sidebar/main",
        items: [{
            item: 'sidebar/home',
            icon: 'dashboard',
            url: 'main',
            permission: ['all']
        }, {
            item: 'sidebar/pupilcard',
            icon: 'user-pentagon',
            url: 'pupilcard',
            permission: ['teacher']
        }, {
            item: 'sidebar/marks/main',
            icon: 'number-1',
            permission: ['student', 'parent'],
            children: [{
                item: 'sidebar/marks/interm',
                url: 'marks/interm',
            }, {
                item: 'sidebar/marks/midterm',
                url: 'marks/midterm',
            }]
        }, {
            item: 'sidebar/teach/main',
            permission: ['student', 'parent', 'teacher'],
            children: [{
                item: 'sidebar/teach/timetable',
                url: 'teach/timetable',
                permission: ['student', 'parent', 'teacher']
            }, {
                item: 'sidebar/teach/homeworks',
                url: 'teach/homeworks',
                icon: 'home-edit',
                permission: ['student', 'parent']
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
        }, {
            item: 'sidebar/messages/main',
            children: [{
                item: 'sidebar/messages/send',
                url: 'messages/send',
            }, {
                item: 'sidebar/messages/received',
                url: 'messages/received',
            }, {
                item: 'sidebar/messages/sent',
                url: 'messages/sent',
            }, {
                item: 'sidebar/messages/noticeboard',
                url: 'messages/noticeboard',
            }]
        }, {
            item: 'sidebar/absence',
            permission: ['student', 'parent'],
            url: 'absence',
        }, {
            item: 'sidebar/actionPlan',
            permission: ['student', 'parent', 'teacher'],
            url: 'actionplan',
        }, {
            item: 'sidebar/calendar',
            permission: ['student', 'parent', 'teacher'],
            url: 'calendar',
        }, {
            item: 'sidebar/user/main',
            permission: ['all'],
            children: [{
                item: 'sidebar/user/devices',
                url: 'user/devices'
            }, {
                item: 'sidebar/user/settings',
                url: 'user/settings'
            }]
        }, {
            item: 'sidebar/person/main',
            permission: ['systemadmin', 'principal'],
            children: [{
                item: 'sidebar/person/list',
                url: 'person/list',
            }, {
                item: 'sidebar/person/create',
                url: 'person/create',
            }]
        }, {
            item: 'sidebar/teachers/main',
            permission: ['systemadmin', 'principal'],
            children: [{
                item: 'sidebar/teachers/list',
                url: 'teachers/list',
            }, {
                item: 'sidebar/teachers/create',
                url: 'teachers/create',
            }]
        }, {
            item: 'sidebar/students/main',
            permission: ['systemadmin', 'principal'],
            children: [{
                item: 'sidebar/students/list',
                url: 'students/list',
            }, {
                item: 'sidebar/students/create',
                url: 'students/create',
            }]
        }, {
            item: 'sidebar/rooms/main',
            permission: ['systemadmin', 'principal'],
            children: [{
                item: 'sidebar/rooms/list',
                url: 'rooms/list',
            }, {
                item: 'sidebar/rooms/create',
                url: 'rooms/create',
            }]
        }, {
            item: 'sidebar/class/main',
            url: 'class',
            permission: ['systemadmin', 'principal'],
        }, {
            item: 'sidebar/subjects/main',
            permission: ['systemadmin', 'principal'],
            children: [{
                item: 'sidebar/subjects/list',
                url: 'subjects/list',
            }, {
                item: 'sidebar/subjects/create',
                url: 'subjects/create',
            }]
        }]
    }];

    public visibleDropdown: number | null = null;

    /**
     * Get page information by page's url
     * @param url url of page
     * @returns information of page
     */
    public getItem(url: string): SidebarItem[] {
        let gotItem: SidebarItem[] = [];
        this.data.forEach((group) => {
            group.items.forEach((item: SidebarItem | any) => {
                if (item?.url == url) {gotItem[0] = item}
                item.children?.forEach((nItem: SidebarItem | any) => {
                    if (nItem?.url == url) {gotItem[0] = item;gotItem[1] = nItem};
                })
            });
        })
        return gotItem;
    }

}
