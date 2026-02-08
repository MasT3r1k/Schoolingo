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
                icon: 'home',
                permission: ['all']
            },
            {
                item: "sidebar.students",
                url: 'students',
                icon: 'users',
                permission: ['teacher']
            },
            {
                item: "sidebar.employees",
                url: 'employees',
                icon: 'user-screen',
                permission: ['manager:admin', 'principal']
            },
            {
                item: "sidebar.management",
                url: 'dashboard',
                icon: 'dashboard',
                permission: ['manager:admin', 'principal']
            },
            {
                item: 'sidebar.schedule.main',
                icon: 'calendar-plus',
                permission: ['manager:system:admin'],
                children: [
                    {
                        item: 'sidebar.schedule.template_timetable',
                        url: 'schedule/template_timetable',
                        icon: ''
                    },
                    {
                        item: 'sidebar.schedule.template_subject',
                        url: 'schedule/template_subject',
                        icon: ''
                    },
                    {
                        item: 'sidebar.schedule.builder',
                        url: 'schedule/builder'
                    }
                ]
            },
            {
                item: 'sidebar.marks.main',
                icon: 'award',
                permission: ['teacher', 'student', 'parent'],
                children: [{
                    item: 'sidebar.marks.interm',
                    url: 'marks/interm',
                    icon: 'percentage',
                    permission: ['student', 'parent'],
                }, {
                    item: 'sidebar.marks.midterm',
                    url: 'marks/midterm',
                    icon: 'chart-bar',
                    permission: ['student', 'parent'],
                }, {
                    item: 'sidebar.marks.marks_record',
                    url: 'marks/intermrecord',
                    icon: 'edit',
                    permission: ['teacher'],
                }, {
                    item: 'sidebar.marks.education_measures',
                    url: 'marks/educationmeasures',
                    icon: 'gavel',
                    permission: ['teacher', 'student', 'parent']
                }]
            },
            {
                item: 'sidebar.teach.main',
                icon: 'book',
                children: [{
                    item: 'sidebar.teach.timetable',
                    url: 'teach/timetable',
                    icon: 'calendar-time',
                    permission: ['student', 'parent', 'teacher']
                }, {
                    item: 'sidebar.teach.homeworks',
                    url: 'teach/homeworks',
                    icon: 'notebook',
                    permission: ['student', 'parent']
                }, {
                    item: 'sidebar.absence',
                    permission: ['student', 'parent'],
                    url: 'teach/absence',
                    icon: 'clock-cancel',
                }, {
                    item: 'sidebar.teach.substitution',
                    url: 'teach/substitution',
                    icon: 'arrows-exchange',
                    permission: ['student', 'parent', 'teacher']
                }, {
                    item: 'sidebar.teach.tutoring',
                    url: 'teach/tutoring',
                    icon: 'user-check',
                    permission: ['student', 'parent', 'teacher']
                }, {
                    item: 'sidebar.teach.classbook',
                    url: 'teach/classbook',
                    icon: 'book-2',
                    permission: ['teacher']
                }, {
                    item: 'sidebar.teach.subjects',
                    url: 'teach/subjects',
                    icon: 'books',
                    permission: ['student', 'parent']
                }, {
                    item: 'sidebar.teach.rewards',
                    url: 'teach/rewards',
                    icon: 'trophy',
                    permission: ['student', 'teacher']
                }, {
                    item: 'sidebar.teach.tests',
                    url: 'tests',
                    icon: 'clipboard-check',
                    permission: ['student', 'teacher', 'admin']
                }]
            },
            {
                item: 'sidebar.messages.main',
                icon: 'message',
                children: [
                {
                    item: 'sidebar.messages.send',
                    url: 'messages/send',
                    icon: 'send',
                }, {
                    item: 'sidebar.messages.received',
                    url: 'messages/received',
                    icon: 'inbox',
                    badge: (api: any) => {
                        if (api.unreadMessages == 0) return '';
                        if (api.unreadMessages >= 10) return '9+';
                        return api.unreadMessages;
                    }
                }, {
                    item: 'sidebar.messages.sent',
                    url: 'messages/sent',
                    icon: 'mail-forward',
                },
                // {
                //     item: 'sidebar.messages.groups',
                //     url: 'messages/groups',
                //     icon: 'users-group',
                // },
                {
                    item: 'sidebar.messages.noticeboard',
                    url: 'messages/noticeboard',
                    icon: 'clipboard-list',
                }]
            },
            {
                item: 'sidebar/payments/main',
                icon: 'wallet',
                modules: ['payments'],
                children: [
                {
                    item: 'sidebar/payments/classFund',
                    url: 'payments/classfund',
                    icon: 'piggy-bank',
                }, {
                    item: 'sidebar/payments/graduateClassFund',
                    url: 'payments/graduateclassfund',
                    icon: 'school',
                }, {
                    item: 'sidebar/payments/listing',
                    url: 'payments/listing',
                    icon: 'list-details',
                }, {
                    item: 'sidebar/payments/unaccountedDocuments',
                    url: 'payments/unaccounteddocuments',
                    icon: 'file-alert',
                }, {
                    item: 'sidebar/payments/documents',
                    url: 'payments/documents',
                    icon: 'files',
                }, {
                    item: 'sidebar/payments/regularPayments',
                    url: 'payments/regularpayments',
                    icon: 'repeat',
                }, {
                    item: 'sidebar/payments/newPayment',
                    url: 'payments/newpayment',
                    icon: 'plus',
                }, {
                    item: 'sidebar/payments/newDeposit',
                    url: 'payments/newdeposit',
                    icon: 'cash',
                }, {
                    item: 'sidebar/payments/accounts',
                    url: 'payments/accounts',
                    icon: 'building-bank',
                }, {
                    item: 'sidebar/payments/settings',
                    url: 'payments/settings',
                    icon: 'settings',
                }]
            },
            {
                item: "sidebar.traineeship.main",
                icon: 'briefcase',
                modules: ['traineeship'],
                children: [{
                    item: "sidebar.traineeship.overview",
                    url: "traineeship/overview",
                    icon: 'dashboard',
                    permission: ['student', 'teacher']
                },
                {
                    item: "sidebar.traineeship.diary",
                    url: "traineeship/diary",
                    icon: 'notebook',
                    permission: ['student']
                },
                {
                    item: "sidebar.traineeship.companies",
                    url: "traineeship/companies",
                    icon: 'building',
                    permission: ['student', 'teacher']
                },
                {
                    item: "sidebar.traineeship.manage",
                    url: "traineeship/manage",
                    icon: 'settings',
                    permission: ['manager:traineeship:manage']
                }]
            },
            {
                item: "sidebar.fleetVehicles.main",
                icon: 'car',
                modules: ['fleetVehicles'],
                children: [{
                    item: "sidebar.fleetVehicles.overview",
                    url: "fleetvehicles/overview",
                    icon: 'dashboard',
                    permission: ['teacher']
                },
                {
                    item: "sidebar.fleetVehicles.vehicles",
                    url: "fleetvehicles/vehicles",
                    icon: 'car',
                    permission: ['teacher']
                },
                {
                    item: "sidebar.fleetVehicles.reservations",
                    url: "fleetvehicles/reservations",
                    icon: 'calendar-event',
                    permission: ['teacher']
                },
                {
                    item: "sidebar.fleetVehicles.settings",
                    url: "fleetvehicles/settings",
                    icon: 'settings',
                    permission: ['manager:fleetVehicles:settings']
                }]
            },
            {
                item: 'sidebar.library.main',
                icon: 'books',
                modules: ['library'],
                permission: ['all'],
                children: [{
                    item: 'sidebar.library.catalog',
                    url: 'library',
                    icon: 'book',
                    permission: ['all']
                }, {
                    item: 'sidebar.library.manage',
                    url: 'library/manage',
                    icon: 'edit',
                    permission: ['manager:library:manage']
                }]
            },
            {
                item: 'sidebar/canteen/main',
                icon: 'tools-kitchen-2',
                modules: ['canteen'],
                permission: ['all'],
                children: [{
                    item: 'sidebar/canteen/order',
                    url: 'canteen/order',
                    icon: 'click',
                }, {
                    item: 'sidebar/canteen/dispensing',
                    url: 'canteen/dispensing',
                    icon: 'chef-hat',
                }, {
                    item: 'sidebar/canteen/meals',
                    url: 'canteen/meals',
                    icon: 'soup',
                }, {
                    item: 'settings',
                    url: 'canteen/settings',
                    icon: 'settings',
                }]
            },
            {
                item: 'sidebar.calendar',
                icon: 'calendar',
                permission: ['student', 'parent', 'teacher'],
                url: 'calendar',
            },
            {
                item: 'sidebar.documents',
                icon: 'file-text',
                permission: ['all'],
                url: 'documents',
            },
            {
                item: 'sidebar.account',
                icon: 'user-circle',
                permission: ['all'],
                children: [{
                    item: 'sidebar.account',
                    url: 'user',
                    icon: 'user',
                }, {
                    item: 'user.login_history',
                    url: 'user/logins',
                    icon: 'history',
                }, {
                    item: 'user.devices',
                    url: 'user/devices',
                    icon: 'device-desktop',
                }, {
                    item: 'sidebar.user.notifications',
                    url: 'user/notifications',
                    icon: 'bell',
                }, {
                    item: 'sidebar.user.gdpr',
                    url: 'user/gdpr',
                    icon: 'shield-check',
                }, {
                    item: 'sidebar.user.cookies',
                    url: 'user/cookies',
                    icon: 'cookie',
                }, {
                    item: 'sidebar.settings',
                    url: 'user/settings',
                    icon: 'settings',
                }]
            },
            {
                item: 'sidebar.archive',
                icon: 'archive',
                permission: ['principal', 'manager:system:admin'],
                url: 'archive'
            },
            {
                item: 'sidebar.system.main',
                icon: 'settings',
                permission: ['manager:system:admin'],
                children: [
                    {
                        item: 'sidebar.system.settings',
                        url: "system/settings",
                        icon: 'settings',
                        permission: ['manager:system:admin']
                    },
                    {
                        item: 'sidebar.system.manage_users',
                        url: "system/manageusers",
                        icon: 'users-group',
                        permission: ['manager:system:admin']
                    },
                    {
                        item: 'sidebar.system.manage_files',
                        url: "system/managefiles",
                        icon: 'files',
                        permission: ['manager:system:admin']
                    },
                    {
                        item: 'sidebar.system.manage_messages',
                        url: "system/managemessages",
                        icon: 'messages',
                        permission: ['manager:system:admin']
                    },
                    {
                        item: 'sidebar.system.auditlog',
                        url: "system/auditlog",
                        icon: 'file-analytics',
                        permission: ['manager:system:admin']
                    },
                    {
                        item: 'sidebar.system.monitoring',
                        url: "admin/monitoring",
                        icon: 'chart-bar',
                        permission: ['manager:system:admin']
                    }
                ]
            }
        ]
    }
];