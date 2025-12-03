import { Dashboard } from "@Schoolingo/dashboard";
import { SidebarGroup } from "./index";

export const config: SidebarGroup[] = [
    {
        label: "sidebar.main",
        permission: ["all"],
        items: [
            {
                item: "sidebar.home",
                url: 'main',
                permission: ['all']
            },
            {
                item: "sidebar.students",
                url: 'students',
                permission: ['teacher']
            },
            {
                item: "sidebar.teachers.list",
                url: 'teachers',
                permission: ['student', 'teacher', 'parent']
            },
            {
                item: 'sidebar.manage_class',
                url: 'manageclass',
                permission: ['teacher']
            },
            {
                item: 'sidebar.manage_users',
                url: 'users',
                permission: ['manager:system:admin']
            },
            {
                item: 'sidebar.schedule_builder',
                url: 'schedule/builder',
                permission: ['manager:system:admin']
            },
            {
                item: 'sidebar.marks.main',
                permission: ['teacher', 'student', 'parent'],
                children: [{
                    item: 'sidebar.marks.interm',
                    url: 'marks/interm',
                    permission: ['student', 'parent'],
                }, {
                    item: 'sidebar.marks.midterm',
                    url: 'marks/midterm',
                    permission: ['student', 'parent'],
                }, {
                    item: 'sidebar.marks.marks_record',
                    url: 'marks/intermrecord',
                    permission: ['teacher'],
                }, {
                    item: 'sidebar.marks.education_measures',
                    url: 'marks/educationmeasures',
                    permission: ['teacher', 'student', 'parent']
                }]
            },
            {
                item: 'sidebar.teach.main',
                children: [{
                    item: 'sidebar.teach.timetable',
                    url: 'teach/timetable',
                    permission: ['student', 'parent', 'teacher']
                }, {
                    item: 'sidebar.teach.homeworks',
                    url: 'teach/homeworks',
                    permission: ['student', 'parent']
                }, {
                    item: 'sidebar.absence',
                    permission: ['student', 'parent'],
                    url: 'teach/absence',
                }, {
                    item: 'sidebar.teach.substitution',
                    url: 'teach/substitution',
                    permission: ['student', 'parent', 'teacher']
                }, {
                    item: 'sidebar.teach.tutoring',
                    url: 'teach/tutoring',
                    permission: ['student', 'parent', 'teacher']
                }, {
                    item: 'sidebar.teach.classbook',
                    url: 'teach/classbook',
                    permission: ['teacher']
                }, {
                    item: 'sidebar.teach.subjects',
                    url: 'teach/subjects',
                    permission: ['student', 'parent']
                }, {
                    item: 'sidebar.teach.rewards',
                    url: 'teach/rewards',
                    permission: ['student', 'teacher']
                }]
            },
            {
                item: 'sidebar.messages.main',
                children: [
                {
                    item: 'sidebar.messages.send',
                    url: 'messages/send',
                }, {
                    item: 'sidebar.messages.received',
                    url: 'messages/received',
                    badge: (api: any) => {
                        if (api.unreadMessages == 0) return '';
                        if (api.unreadMessages >= 10) return '9+';
                        return api.unreadMessages;
                    }
                }, {
                    item: 'sidebar.messages.sent',
                    url: 'messages/sent',
                }, {
                    item: 'sidebar.messages.groups',
                    url: 'messages/groups',
                }, {
                    item: 'sidebar.messages.noticeboard',
                    url: 'messages/noticeboard',
                }]
            },
            {
                item: 'sidebar/payments/main',
                modules: ['payments'],
                children: [
                {
                    item: 'sidebar/payments/classFund',
                    url: 'payments/classfund',
                }, {
                    item: 'sidebar/payments/graduateClassFund',
                    url: 'payments/graduateclassfund'
                }, {
                    item: 'sidebar/payments/listing',
                    url: 'payments/listing',
                }, {
                    item: 'sidebar/payments/unaccountedDocuments',
                    url: 'payments/unaccounteddocuments',
                }, {
                    item: 'sidebar/payments/documents',
                    url: 'payments/documents',
                }, {
                    item: 'sidebar/payments/regularPayments',
                    url: 'payments/regularpayments',
                }, {
                    item: 'sidebar/payments/newPayment',
                    url: 'payments/newpayment',
                }, {
                    item: 'sidebar/payments/newDeposit',
                    url: 'payments/newdeposit',
                }, {
                    item: 'sidebar/payments/accounts',
                    url: 'payments/accounts',
                }, {
                    item: 'sidebar/payments/settings',
                    url: 'payments/settings',
                }]
            },
            {
                item: "sidebar.traineeship.main",
                modules: ['traineeship'],
                children: [{
                    item: "sidebar.traineeship.overview",
                    url: "traineeship/overview",
                    permission: ['student', 'teacher']
                },
                {
                    item: "sidebar.traineeship.diary",
                    url: "traineeship/diary",
                    permission: ['student']
                },
                {
                    item: "sidebar.traineeship.companies",
                    url: "traineeship/companies",
                    permission: ['student', 'teacher']
                },
                {
                    item: "sidebar.traineeship.manage",
                    url: "traineeship/manage",
                    permission: ['manager:traineeship:manage']
                }]
            },
            {
                item: "sidebar/fleetVehicles/main",
                modules: ['fleetVehicles'],
                children: [{
                    item: "sidebar/fleetVehicles/overview",
                    url: "fleetvehicles/overview",
                    permission: ['teacher']
                },
                {
                    item: "sidebar/fleetVehicles/vehicles",
                    url: "fleetvehicles/vehicles",
                    permission: ['teacher']
                }]
            },
            {
                item: 'sidebar/library/main',
                permission: ['all'],
                modules: ['library'],
                children: [{
                    item: 'sidebar/library/loans',
                    url: 'library/loans'
                }, {
                    item: 'sidebar/library/books',
                    url: 'library/books'
                }, {
                    item: 'sidebar/library/managebooks',
                    url: 'library/managebooks',
                    permission: ['manager:library:managebooks']
                }, {
                    item: 'settings',
                    url: 'library/settings',
                    permission: ['manager:library:settings']
                }]
            },
            {
                item: 'sidebar/canteen/main',
                modules: ['canteen'],
                permission: ['all'],
                children: [{
                    item: 'sidebar/canteen/order',
                    url: 'canteen/order'
                }, {
                    item: 'sidebar/canteen/dispensing',
                    url: 'canteen/dispensing'
                }, {
                    item: 'sidebar/canteen/meals',
                    url: 'canteen/meals'
                }, {
                    item: 'settings',
                    url: 'canteen/settings'
                }]
            },
            {
                item: 'sidebar.calendar',
                permission: ['student', 'parent', 'teacher'],
                url: 'calendar',
            },
            {
                item: 'sidebar.documents',
                permission: ['all'],
                url: 'documents',
            },
            {
                item: 'sidebar.account',
                permission: ['all'],
                children: [{
                    item: 'sidebar.account',
                    url: 'user'
                }, {
                    item: 'user.login_history',
                    url: 'user/logins'
                }, {
                    item: 'user.devices',
                    url: 'user/devices'
                }, {
                    item: 'sidebar.user.notifications',
                    url: 'user/notifications'
                }, {
                    item: 'sidebar.settings',
                    url: 'user/settings'
                }]
            },
            {
                item: 'sidebar.archive',
                permission: ['principal'],
                url: 'archive'
            },
            {
                item: 'sidebar.system.main',
                permission: ['manager:system:admin'],
                children: [
                    {
                        item: 'sidebar.system.settings',
                        url: "system/settings",
                        permission: ['manager:system:admin']
                    },
                    {
                        item: 'sidebar.system.manage_users',
                        url: "system/manageusers",
                        permission: ['manager:system:admin']
                    },
                    {
                        item: 'sidebar.system.auditlog',
                        url: "system/auditlog",
                        permission: ['manager:system:admin']
                    }
                ]
            }
        ]
    }
];