import { Routes } from '@angular/router';
import { AuthComponent } from './Auth/auth.component';
import { NotUserGuard, UserGuard } from './Guards/Auth.guard';
import { DemoGuard } from './Guards/Demo.guard';
import { BoardComponent } from './board/board.component';
import { MainComponent } from './board/main/main.component';
import { SetupComponent } from './setup/setup.component';
import { UnsavedChangesGuard } from './Guards/unsaved-changes.guard';

export const routes: Routes = [
    {
        path: 'setup',
        component: SetupComponent
    },
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'login'
    },
    {
        path: 'login',
        component: AuthComponent,
        canActivate: [NotUserGuard]
    },
    {
        path: '',
        component: BoardComponent,
        canActivate: [UserGuard],
        canActivateChild: [DemoGuard],
        children: [
            {
                path: 'main',
                component: MainComponent
            },
            {
                path: 'dashboard',
                loadComponent: () => import('./board/Admin/dashboard/dashboard.component').then(m => m.DashboardComponent)
            },
            {
                path: 'students',
                children: [
                    {
                        path: '',
                        loadComponent: () => import('./board/students/students.component').then(m => m.StudentsComponent)
                    },
                    {
                        path: ':id',
                        loadComponent: () => import('./board/students/detail/detail.component').then(m => m.DetailComponent)
                    }
                ]
            },
            {
                path: 'classes',
                children: [
                    {
                        path: '',
                        loadComponent: () => import('./board/classes/classes.component').then(m => m.ClassesComponent)
                    },
                    {
                        path: ':id',
                        loadComponent: () => import('./board/classes/detail/detail.component').then(m => m.DetailComponent)
                    }
                ]
            },
            {
                path: 'employees',
                children: [
                    {
                        path: '',
                        loadComponent: () => import('./board/Employees/employees/employees.component').then(m => m.EmployeesComponent)
                    },
                    {
                        path: ':id',
                        loadComponent: () => import('./board/Employees/employees/detail/detail.component').then(m => m.DetailComponent)
                    }
                ]
            },
            {
                path: 'schedule',
                children: [
                    {
                        path: 'builder',
                        loadComponent: () => import('./board/schedule/builder/builder.component').then(m => m.BuilderComponent)
                    },
                    {
                        path: 'template_timetable',
                        loadComponent: () => import('./board/schedule/template-timetable/template-timetable.component').then(m => m.TemplateTimetableComponent)
                    },
                    {
                        path: 'template_subject',
                        loadComponent: () => import('./board/schedule/template-subject/template-subject.component').then(m => m.TemplateSubjectComponent)
                    },
                    {
                        path: 'supervision',
                        loadComponent: () => import('./board/schedule/supervision-builder/supervision-builder.component').then(m => m.SupervisionBuilderComponent)
                    }
                ]
            },
            {
                path: 'calendar',
                loadComponent: () => import('./board/calendar/calendar.component').then(m => m.CalendarComponent)
            },
            {
                path: 'online',
                loadComponent: () => import('./board/online/online.component').then(m => m.OnlineComponent)
            },
            {
                path: 'documents',
                loadComponent: () => import('./board/documents/documents.component').then(m => m.DocumentsComponent)
            },
            {
                path: 'tests',
                children: [
                    {
                        path: '',
                        loadComponent: () => import('./board/polls/polls.component').then(m => m.PollsComponent)
                    },
                    {
                        path: 'create',
                        loadComponent: () => import('./board/polls/poll-create/poll-create.component').then(m => m.PollCreateComponent)
                    },
                    {
                        path: ':id/assign',
                        loadComponent: () => import('./board/polls/poll-assign/poll-assign.component').then(m => m.PollAssignComponent)
                    },
                    {
                        path: ':id/edit',
                        loadComponent: () => import('./board/polls/poll-edit/poll-edit.component').then(m => m.PollEditComponent)
                    },
                    {
                        path: ':id/vote',
                        loadComponent: () => import('./board/polls/poll-vote/poll-vote.component').then(m => m.PollVoteComponent)
                    },
                    {
                        path: ':id/manage',
                        loadComponent: () => import('./board/polls/poll-manage/poll-manage.component').then(m => m.PollManageComponent)
                    },
                    {
                        path: ':id/results',
                        loadComponent: () => import('./board/polls/poll-results/poll-results.component').then(m => m.PollResultsComponent)
                    },
                    {
                        path: ':id/shares',
                        loadComponent: () => import('./board/polls/poll-shares/poll-shares.component').then(m => m.PollSharesComponent)
                    }
                ]
            },
            {
                path: 'marks', children: [
                    {
                        path: '',
                        pathMatch: 'full',
                        redirectTo: '/marks/interm'
                    },
                    {
                        path: 'interm',
                        loadComponent: () => import('./board/marks/interm/interm.component').then(m => m.IntermComponent)
                    },
                    {
                        path: 'intermrecord',
                        loadComponent: () => import('./board/marks/interm-record/interm-record.component').then(m => m.IntermRecordComponent)
                    },
                    {
                        path: 'midterm',
                        loadComponent: () => import('./board/marks/midterm/midterm.component').then(m => m.MidtermComponent)
                    },
                    {
                        path: 'educationmeasures',
                        loadComponent: () => import('./board/Teach/measures/measures.component').then(m => m.MeasuresComponent)
                    },
                    {
                        path: '**',
                        redirectTo: '/marks/interm'
                    },
                ]
            },
            {
                path: 'teach', children: [
                    {
                        path: '',
                        pathMatch: 'full',
                        redirectTo: '/teach/timetable'
                    },
                    {
                        path: 'timetable',
                        loadComponent: () => import('./board/Teach/timetable/timetable.component').then(m => m.TimetableComponent)
                    },
                    {
                        path: 'homeworks',
                        loadComponent: () => import('./board/Teach/homework/homework.component').then(m => m.HomeworkComponent)
                    },
                    {
                        path: 'absence',
                        loadComponent: () => import('./board/Teach/absence/absence.component').then(m => m.AbsenceComponent)
                    },
                    {
                        path: 'topics',
                        loadComponent: () => import('./board/Teach/topics/topics.component').then(m => m.TopicsComponent)
                    },
                    {
                        path: 'classbook',
                        loadComponent: () => import('./board/Teach/classbook/classbook.component').then(m => m.ClassbookComponent)
                    },
                    {
                        path: 'rewards',
                        loadComponent: () => import('./board/Teach/rewards/rewards.component').then(m => m.RewardsComponent)
                    },
                    {
                        path: 'subjects',
                        loadComponent: () => import('./board/Teach/subjects/subjects.component').then(m => m.SubjectsComponent)
                    },
                    {
                        path: 'substitution',
                        loadComponent: () => import('./board/Teach/substitution/substitution.component').then(m => m.SubstitutionComponent)
                    },
                    {
                        path: 'tutoring',
                        loadComponent: () => import('./board/Teach/tutoring/tutoring.component').then(m => m.TutoringComponent)
                    },
                    {
                        path: 'my-class',
                        loadComponent: () => import('./board/Teach/MyClass/my-class.component').then(m => m.MyClassComponent)
                    },
                    {
                        path: 'thematic-plans',
                        loadComponent: () => import('./board/Teach/thematic-plans/thematic-plans.component').then(m => m.ThematicPlansComponent)
                    },
                    {
                        path: '**',
                        redirectTo: '/teach/timetable'
                    },
                ]
            },
            {
                path: 'traineeship',
                children: [
                    {
                        path: '',
                        pathMatch: 'full',
                        redirectTo: '/traineeship/overview'
                    },
                    {
                        path: 'overview',
                        loadComponent: () => import('./board/Traineeship/overview/overview.component').then(m => m.OverviewComponent)
                    },
                    {
                        path: 'diary',
                        loadComponent: () => import('./board/Traineeship/diary/diary.component').then(m => m.DiaryComponent)
                    },
                    {
                        path: 'diary/:id',
                        loadComponent: () => import('./board/Traineeship/diary/diary.component').then(m => m.DiaryComponent)
                    },
                    {
                        path: 'companies',
                        loadComponent: () => import('./board/Traineeship/companies/companies.component').then(m => m.CompaniesComponent)
                    },
                    {
                        path: 'companies/:id',
                        loadComponent: () => import('./board/Traineeship/companies/companies.component').then(m => m.CompaniesComponent)
                    },
                    {
                        path: 'manage',
                        loadComponent: () => import('./board/Traineeship/manage/manage.component').then(m => m.ManageComponent)
                    },
                    {
                        path: '**',
                        redirectTo: '/traineeship/overview'
                    }
                ]
            },
            {
                path: 'fleetvehicles',
                children: [
                    {
                        path: '',
                        pathMatch: 'full',
                        redirectTo: '/fleetvehicles/overview'
                    },
                    {
                        path: 'overview',
                        loadComponent: () => import('./board/FleetVehicles/overview/overview.component').then(m => m.FleetVehiclesOverviewComponent)
                    },
                    {
                        path: 'vehicles',
                        loadComponent: () => import('./board/FleetVehicles/vehicles/vehicles.component').then(m => m.FleetVehiclesComponent)
                    },
                    {
                        path: 'vehicles/:id',
                        loadComponent: () => import('./board/FleetVehicles/vehicles/vehicles.component').then(m => m.FleetVehiclesComponent)
                    },
                    {
                        path: 'reservations',
                        loadComponent: () => import('./board/FleetVehicles/reservations/reservations.component').then(m => m.FleetVehiclesReservationsComponent)
                    },
                    {
                        path: 'settings',
                        loadComponent: () => import('./board/FleetVehicles/settings/settings.component').then(m => m.FleetVehiclesSettingsComponent)
                    },
                    {
                        path: '**',
                        redirectTo: '/fleetvehicles/overview'
                    }
                ]
            },
            {
                path: 'payments', children: [
                    {
                        path: '',
                        pathMatch: 'full',
                        redirectTo: '/payments/overview'
                    },
                    {
                        path: 'overview',
                        loadComponent: () => import('./board/payments/overview/overview.component').then(m => m.PaymentOverviewComponent)
                    },
                    {
                        path: 'class_fund',
                        loadComponent: () => import('./board/payments/class-fund/class-fund.component').then(m => m.ClassFundComponent)
                    },
                    {
                        path: 'graduate_class_fund',
                        loadComponent: () => import('./board/payments/graduate-class-fund/graduate-class-fund.component').then(m => m.GraduateClassFundComponent)
                    },
                    {
                        path: 'listing',
                        loadComponent: () => import('./board/payments/listing/listing.component').then(m => m.ListingComponent)
                    },
                    {
                        path: 'unaccounted_documents',
                        loadComponent: () => import('./board/payments/unaccounted-documents/unaccounted-documents.component').then(m => m.UnaccountedDocumentsComponent)
                    },
                    {
                        path: 'documents',
                        loadComponent: () => import('./board/payments/documents/documents.component').then(m => m.DocumentsComponent)
                    },
                    {
                        path: 'regular_payments',
                        loadComponent: () => import('./board/payments/regular-payments/regular-payments.component').then(m => m.RegularPaymentsComponent)
                    },
                    {
                        path: 'new_payment',
                        loadComponent: () => import('./board/payments/new-payment/new-payment.component').then(m => m.NewPaymentComponent)
                    },
                    {
                        path: 'new_deposit',
                        loadComponent: () => import('./board/payments/new-deposit/new-deposit.component').then(m => m.NewDepositComponent)
                    },
                    {
                        path: 'accounts',
                        loadComponent: () => import('./board/payments/accounts/accounts.component').then(m => m.AccountsComponent)
                    },
                    {
                        path: 'settings',
                        loadComponent: () => import('./board/payments/settings/settings.component').then(m => m.SettingsComponent)
                    },
                    {
                        path: 'manage',
                        loadComponent: () => import('./board/payments/manage/manage.component').then(m => m.ManageComponent)
                    },
                    {
                        path: '**',
                        redirectTo: '/payments/overview'
                    }
                ]
            },
            {
                path: 'canteen',
                loadComponent: () => import('./board/canteen/canteen.component').then(m => m.CanteenComponent),
                children: [
                    {
                        path: '',
                        pathMatch: 'full',
                        redirectTo: 'orders'
                    },
                    {
                        path: 'orders',
                        loadComponent: () => import('./board/canteen/orders/orders.component').then(m => m.OrdersComponent)
                    },
                    {
                        path: 'meals',
                        loadComponent: () => import('./board/canteen/meals/meals.component').then(m => m.MealsComponent)
                    },
                    {
                        path: 'history',
                        loadComponent: () => import('./board/canteen/history/history.component').then(m => m.HistoryComponent)
                    },
                    {
                        path: 'issues',
                        loadComponent: () => import('./board/canteen/issues/issues.component').then(m => m.IssuesComponent)
                    },
                    {
                        path: 'settings',
                        loadComponent: () => import('./board/canteen/settings/settings.component').then(m => m.SettingsComponent)
                    }
                ]
            },
            {
                path: 'messages', children: [
                    {
                        path: '',
                        pathMatch: 'full',
                        redirectTo: '/messages/send'
                    },
                    {
                        path: 'send',
                        loadComponent: () => import('./board/messages/send/send.component').then(m => m.SendComponent),
                        canDeactivate: [UnsavedChangesGuard]
                    },
                    {
                        path: 'received',
                        loadComponent: () => import('./board/messages/received/received.component').then(m => m.ReceivedComponent)
                    },
                    {
                        path: 'sent',
                        loadComponent: () => import('./board/messages/sent/sent.component').then(m => m.SentComponent)
                    },
                    {
                        path: 'drafts',
                        loadComponent: () => import('./board/messages/drafts/drafts.component').then(m => m.DraftsComponent)
                    },
                    {
                        path: 'noticeboard',
                        loadComponent: () => import('./board/messages/noticeboard/noticeboard.component').then(m => m.NoticeboardComponent)
                    },
                    {
                        path: 'groups',
                        loadComponent: () => import('./board/messages/groups/groups.component').then(m => m.GroupsComponent)
                    },
                    {
                        path: '**',
                        redirectTo: '/messages/send'
                    }
                ]
            },
            {
                path: 'user', children: [
                    {
                        path: '',
                        pathMatch: 'full',
                        redirectTo: '/user/main'
                    },
                    {
                        path: 'main',
                        loadComponent: () => import('./board/User/account/account.component').then(m => m.AccountComponent)
                    },
                    {
                        path: 'settings',
                        loadComponent: () => import('./board/User/settings/settings.component').then(m => m.SettingsComponent)
                    },
                    {
                        path: 'personal',
                        loadComponent: () => import('./board/User/personal-information/personal-information.component').then(m => m.PersonalInformationComponent)
                    },
                    {
                        path: 'parents',
                        loadComponent: () => import('./board/User/parents/parents.component').then(m => m.ParentsComponent)
                    },
                    {
                        path: 'devices',
                        loadComponent: () => import('./board/User/devices/devices.component').then(m => m.DevicesComponent)
                    },
                    {
                        path: 'logins',
                        loadComponent: () => import('./board/User/login-history/login-history.component').then(m => m.LoginHistoryComponent)
                    },
                    {
                        path: 'connections',
                        loadComponent: () => import('./board/User/connections/connections.component').then(m => m.ConnectionsComponent)
                    },
                    {
                        path: 'gdpr',
                        children: [
                            {
                                path: '',
                                loadComponent: () => import('./board/User/gdpr/gdpr.component').then(m => m.GdprComponent)
                            },
                            {
                                path: ':tab',
                                loadComponent: () => import('./board/User/gdpr/gdpr.component').then(m => m.GdprComponent)
                            }
                        ]
                    },
                    {
                        path: 'notifications',
                        loadComponent: () => import('./board/User/notifications/notifications.component').then(m => m.NotificationsComponent)
                    },
                    {
                        path: 'cookies',
                        loadComponent: () => import('./board/User/cookies/cookies.component').then(m => m.CookiesComponent)
                    },
                    {
                        path: '**',
                        redirectTo: '/user/main'
                    }
                ]
            },
            {
                path: 'system', children: [
                    {
                        path: '',
                        pathMatch: 'full',
                        redirectTo: '/system/settings'
                    },
                    {
                        path: 'settings',
                        loadComponent: () => import('./board/system/settings/settings.component').then(m => m.SettingsComponent)
                    },
                    {
                        path: 'manageusers',
                        children: [
                            {
                                path: '',
                                loadComponent: () => import('./board/system/manageusers/manageusers.component').then(m => m.ManageusersComponent)
                            },
                            {
                                path: ':id',
                                loadComponent: () => import('./board/system/manageusers/detail/detail.component').then(m => m.ManageUsersDetailComponent)
                            }
                        ]
                    },
                    {
                        path: 'managefiles',
                        loadComponent: () => import('./board/system/managefiles/managefiles.component').then(m => m.ManagefilesComponent)
                    },
                    {
                        path: 'managemessages',
                        loadComponent: () => import('./board/system/managemessages/managemessages.component').then(m => m.ManagemessagesComponent)
                    },
                    {
                        path: 'auditlog',
                        loadComponent: () => import('./board/system/auditlog/auditlog.component').then(m => m.AuditlogComponent)
                    },
                    {
                        path: 'reports',
                        loadComponent: () => import('./board/system/reports/reports.component').then(m => m.ReportsComponent)
                    },
                    {
                        path: '**',
                        redirectTo: '/system/settings'
                    },
                ]
            },
            {
                path: 'archive',
                loadComponent: () => import('./board/Admin/archive/archive.component').then(m => m.ArchiveComponent)
            },
            {
                path: 'admin', children: [
                    {
                        path: '',
                        pathMatch: 'full',
                        redirectTo: '/admin/backup'
                    },
                    {
                        path: 'backup',
                        loadComponent: () => import('./board/Admin/backup/backup.component').then(m => m.BackupComponent)
                    },
                    {
                        path: 'seasonal',
                        loadComponent: () => import('./board/Admin/seasonal/seasonal.component').then(m => m.SeasonalAdminComponent)
                    },
                    {
                        path: 'monitoring',
                        loadComponent: () => import('./board/Admin/monitoring/monitoring.component').then(m => m.MonitoringComponent)
                    },
                    {
                        path: 'svp',
                        loadComponent: () => import('./board/Admin/svp/svp.component').then(m => m.SvpComponent)
                    },
                    {
                        path: 'school-years',
                        loadComponent: () => import('./board/Admin/school-years/school-years.component').then(m => m.SchoolYearsComponent)
                    },
                    {
                        path: 'architecture',
                        children: [
                            {
                                path: '',
                                pathMatch: 'full',
                                redirectTo: '/admin/architecture/overview'
                            },
                            {
                                path: 'overview',
                                loadComponent: () => import('./board/Admin/architecture/dashboard/dashboard.component').then(m => m.ArchitectureDashboardComponent)
                            },
                            {
                                path: 'buildings',
                                loadComponent: () => import('./board/Admin/architecture/buildings/buildings.component').then(m => m.ArchitectureBuildingsComponent)
                            },
                            {
                                path: 'buildings/:id',
                                loadComponent: () => import('./board/Admin/architecture/buildings/detail/detail.component').then(m => m.ArchitectureBuildingDetailComponent)
                            },
                            {
                                path: 'rooms',
                                loadComponent: () => import('./board/Admin/architecture/rooms/rooms.component').then(m => m.ArchitectureRoomsComponent)
                            },
                            {
                                path: 'inventory',
                                loadComponent: () => import('./board/Admin/inventory/inventory.component').then(m => m.InventoryComponent)
                            },
                            {
                                path: '**',
                                redirectTo: '/admin/architecture/overview'
                            }
                        ]
                    },
                    {
                        path: '**',
                        redirectTo: '/admin/backup'
                    }
                ]
            },
            {
                path: 'library',
                children: [
                    {
                        path: '',
                        pathMatch: 'full',
                        redirectTo: '/library/catalog'
                    },
                    {
                        path: 'catalog',
                        loadComponent: () => import('./board/library/pages/catalog/catalog.component').then(m => m.CatalogComponent)
                    },
                    {
                        path: 'manage',
                        loadComponent: () => import('./board/library/pages/manager/manager.component').then(m => m.ManagerComponent)
                    },
                    {
                        path: '**',
                        pathMatch: 'full',
                        redirectTo: '/library/catalog'
                    },
                ]
            },
            {
                path: 'no-permission',
                loadComponent: () => import('./board/error/no-permission/no-permission.component').then(m => m.NoPermissionComponent)
            }
        ]
    }
];
