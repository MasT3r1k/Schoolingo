import { SidebarGroup } from "./Sidebar";

let config: SidebarGroup[] = [
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

export default config as SidebarGroup[];