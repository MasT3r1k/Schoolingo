import { UserPermissions } from "./User.d";

export interface SidebarItem {
    item: string;
    url?: string;
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
            url: 'main',
            permission: ['all']
        }, {
            item: 'sidebar/marks/main',
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
            permission: ['student', 'parent'],
            children: [{
                item: 'sidebar/teach/timetable',
                url: 'teach/timetable'
            }, {
                item: 'sidebar/teach/homeworks',
                url: 'teach/homeworks'
            }, {
                item: 'sidebar/teach/substitution',
                url: 'teach/substitution'
            }, {
                item: 'sidebar/teach/subjects',
                url: 'teach/subjects'
            }]
        }, {
            item: 'sidebar/absence',
            permission: ['student', 'parent'],
            url: 'absence',
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
