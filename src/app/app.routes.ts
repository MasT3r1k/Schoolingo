import { Routes } from '@angular/router';
import { AuthComponent } from './Auth/auth.component';
import { NotUserGuard, UserGuard } from './Guards/Auth.guard';
import { DemoGuard } from './Guards/Demo.guard';
import { BoardComponent } from './board/board.component';
import { MainComponent } from './board/main/main.component';
import { MyClassComponent } from './board/Teach/MyClass/my-class.component';
import { SettingsComponent } from './board/User/settings/settings.component';
import { AccountComponent } from './board/User/account/account.component';
import { PersonalInformationComponent } from './board/User/personal-information/personal-information.component';
import { ParentsComponent } from './board/User/parents/parents.component';
import { DevicesComponent } from './board/User/devices/devices.component';
import { LoginHistoryComponent } from './board/User/login-history/login-history.component';
import { ConnectionsComponent } from './board/User/connections/connections.component';
import { GdprComponent } from './board/User/gdpr/gdpr.component';
import { CookiesComponent } from './board/User/cookies/cookies.component';
import { NotificationsComponent } from './board/User/notifications/notifications.component';
import { TimetableComponent } from './board/Teach/timetable/timetable.component';
import { HomeworkComponent } from './board/Teach/homework/homework.component';
import { SendComponent } from './board/messages/send/send.component';
import { ReceivedComponent } from './board/messages/received/received.component';
import { AbsenceComponent } from './board/Teach/absence/absence.component';
import { IntermComponent } from './board/marks/interm/interm.component';
import { IntermRecordComponent } from './board/marks/interm-record/interm-record.component';
import { ManageComponent } from './board/Traineeship/manage/manage.component';
import { CompaniesComponent } from './board/Traineeship/companies/companies.component';
import { DiaryComponent } from './board/Traineeship/diary/diary.component';
import { OverviewComponent } from './board/Traineeship/overview/overview.component';
import { BuilderComponent } from './board/schedule/builder/builder.component';
import { CalendarComponent } from './board/calendar/calendar.component';
import { ClassbookComponent } from './board/Teach/classbook/classbook.component';
import { NoticeboardComponent } from './board/messages/noticeboard/noticeboard.component';
import { GroupsComponent } from './board/messages/groups/groups.component';
import { SettingsComponent as SystemSettings } from './board/system/settings/settings.component';
import { DocumentsComponent } from './board/documents/documents.component';
import { MidtermComponent } from './board/marks/midterm/midterm.component';
import { StudentsComponent } from './board/students/students.component';
import { ClassesComponent } from './board/classes/classes.component';
import { DashboardComponent } from './board/Admin/dashboard/dashboard.component';
import { PollsComponent } from './board/polls/polls.component';
import { FleetVehiclesComponent } from './board/FleetVehicles/vehicles/vehicles.component';
import { FleetVehiclesReservationsComponent } from './board/FleetVehicles/reservations/reservations.component';
import { FleetVehiclesOverviewComponent } from './board/FleetVehicles/overview/overview.component';
import { FleetVehiclesSettingsComponent } from './board/FleetVehicles/settings/settings.component';
import { TutoringComponent } from './board/Teach/tutoring/tutoring.component';
import { SubstitutionComponent } from './board/Teach/substitution/substitution.component';
import { SubjectsComponent } from './board/Teach/subjects/subjects.component';
import { RewardsComponent } from './board/Teach/rewards/rewards.component';
import { MeasuresComponent } from './board/Teach/measures/measures.component';
import { SentComponent } from './board/messages/sent/sent.component';
import { DraftsComponent } from './board/messages/drafts/drafts.component';
import { ArchiveComponent } from './board/Admin/archive/archive.component';
import { BackupComponent } from './board/Admin/backup/backup.component';
import { CatalogComponent } from './board/library/pages/catalog/catalog.component';
import { ManagerComponent } from './board/library/pages/manager/manager.component';
import { PollCreateComponent } from './board/polls/poll-create/poll-create.component';
import { PollVoteComponent } from './board/polls/poll-vote/poll-vote.component';
import { PollResultsComponent } from './board/polls/poll-results/poll-results.component';
import { EmployeesComponent } from './board/Employees/employees/employees.component';
import { ManageusersComponent } from './board/system/manageusers/manageusers.component';
import { AuditlogComponent } from './board/system/auditlog/auditlog.component';
import { ManagefilesComponent } from './board/system/managefiles/managefiles.component';
import { ManagemessagesComponent } from './board/system/managemessages/managemessages.component';
import { PollAssignComponent } from './board/polls/poll-assign/poll-assign.component';
import { PollEditComponent } from './board/polls/poll-edit/poll-edit.component';
import { DetailComponent as StudentsDetailComponent } from './board/students/detail/detail.component';
import { TemplateSubjectComponent } from './board/schedule/template-subject/template-subject.component';
import { TemplateTimetableComponent } from './board/schedule/template-timetable/template-timetable.component';
import { SupervisionBuilderComponent } from './board/schedule/supervision-builder/supervision-builder.component';
import { MonitoringComponent } from './board/Admin/monitoring/monitoring.component';
import { SeasonalAdminComponent } from './board/Admin/seasonal/seasonal.component';
import { PollManageComponent } from './board/polls/poll-manage/poll-manage.component';
import { SchoolYearsComponent } from './board/Admin/school-years/school-years.component';
import { OnlineComponent } from './board/online/online.component';
import { PollSharesComponent } from './board/polls/poll-shares/poll-shares.component';
import { ArchitectureDashboardComponent } from './board/Admin/architecture/dashboard/dashboard.component';
import { ArchitectureBuildingsComponent } from './board/Admin/architecture/buildings/buildings.component';
import { ArchitectureBuildingDetailComponent } from './board/Admin/architecture/buildings/detail/detail.component';
import { ArchitectureRoomsComponent } from './board/Admin/architecture/rooms/rooms.component';
import { InventoryComponent } from './board/Admin/inventory/inventory.component';
import { SetupComponent } from './setup/setup.component';
import { ThematicPlansComponent } from './board/Teach/thematic-plans/thematic-plans.component';
import { SvpComponent } from './board/Admin/svp/svp.component';

import { NoPermissionComponent } from './board/error/no-permission/no-permission.component';
import { DetailComponent as ClassesDetailComponent } from './board/classes/detail/detail.component';
import { ReportsComponent } from './board/system/reports/reports.component';

import { DetailComponent as EmployeesDetailComponent } from './board/Employees/employees/detail/detail.component';
import { TopicsComponent } from './board/Teach/topics/topics.component';
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
                component: DashboardComponent
            },
            {
                path: 'students',
                children: [
                    {
                        path: '',
                        component: StudentsComponent
                    },
                    {
                        path: ':id',
                        component: StudentsDetailComponent
                    }
                ]
            },
            {
                path: 'classes',
                children: [
                    {
                        path: '',
                        component: ClassesComponent
                    },
                    {
                        path: ':id',
                        component: ClassesDetailComponent
                    }
                ]
            },
            {
                path: 'employees',
                children: [
                    {
                        path: '',
                        component: EmployeesComponent
                    },
                    {
                        path: ':id',
                        component: EmployeesDetailComponent
                    }
                ]
            },
            {
                path: 'schedule',
                children: [
                    {
                        path: 'builder',
                        component: BuilderComponent
                    },
                    {
                        path: 'template_timetable',
                        component: TemplateTimetableComponent
                    },
                    {
                        path: 'template_subject',
                        component: TemplateSubjectComponent
                    },
                    {
                        path: 'supervision',
                        component: SupervisionBuilderComponent
                    }
                ]
            },
            {
                path: 'calendar',
                component: CalendarComponent
            },
            {
                path: 'online',
                component: OnlineComponent
            },
            {
                path: 'documents',
                component: DocumentsComponent
            },
            {
                path: 'tests',
                children: [
                    {
                        path: '',
                        component: PollsComponent
                    },
                    {
                        path: 'create',
                        component: PollCreateComponent
                    },
                    {
                        path: ':id/assign',
                        component: PollAssignComponent
                    },
                    {
                        path: ':id/edit',
                        component: PollEditComponent
                    },
                    {
                        path: ':id/vote',
                        component: PollVoteComponent
                    },
                    {
                        path: ':id/manage',
                        component: PollManageComponent
                    },
                    {
                        path: ':id/results',
                        component: PollResultsComponent
                    },
                    {
                        path: ':id/shares',
                        component: PollSharesComponent
                    }
                ]
            },
            {
                path: 'marks', children: [
                    {
                        path: 'interm',
                        component: IntermComponent
                    },
                    {
                        path: 'intermrecord',
                        component: IntermRecordComponent
                    },
                    {
                        path: 'midterm',
                        component: MidtermComponent
                    },
                    {
                        path: 'educationmeasures',
                        component: MeasuresComponent
                    }
                ]
            },
            {
                path: 'teach', children: [
                    {
                        path: 'timetable',
                        component: TimetableComponent
                    },
                    {
                        path: 'homeworks',
                        component: HomeworkComponent
                    },
                    {
                        path: 'absence',
                        component: AbsenceComponent
                    },
                    {
                        path: 'topics',
                        component: TopicsComponent
                    },
                    {
                        path: 'classbook',
                        component: ClassbookComponent
                    },
                    {
                        path: 'rewards',
                        component: RewardsComponent
                    },
                    {
                        path: 'subjects',
                        component: SubjectsComponent
                    },
                    {
                        path: 'substitution',
                        component: SubstitutionComponent
                    },
                    {
                        path: 'tutoring',
                        component: TutoringComponent
                    },
                    {
                        path: 'my-class',
                        component: MyClassComponent
                    },
                    {
                        path: 'thematic-plans',
                        component: ThematicPlansComponent
                    }
                ]
            },
            {
            path: 'traineeship',
            children: [
                {
                    path: 'overview',
                    component: OverviewComponent
                },
                {
                    path: 'diary',
                    component: DiaryComponent
                },
                {
                    path: 'diary/:id',
                    component: DiaryComponent
                },
                {
                    path: 'companies',
                    component: CompaniesComponent
                },
                {
                    path: 'companies/:id',
                    component: CompaniesComponent
                },
                {
                    path: 'manage',
                    component: ManageComponent
                }
            ]
            },
            {
                path: 'fleetvehicles',
                children: [
                    {
                        path: 'overview',
                        component: FleetVehiclesOverviewComponent
                    },
                    {
                        path: 'vehicles',
                        component: FleetVehiclesComponent
                    },
                    {
                        path: 'vehicles/:id',
                        component: FleetVehiclesComponent
                    },
                    {
                        path: 'reservations',
                        component: FleetVehiclesReservationsComponent
                    },
                    {
                        path: 'settings',
                        component: FleetVehiclesSettingsComponent
                    }
                ]
            },
            {
                path: 'messages', children: [
                    {
                        path: 'send',
                        component: SendComponent,
                        canDeactivate: [UnsavedChangesGuard]
                    },
                    {
                        path: 'received',
                        component: ReceivedComponent
                    },
                    {
                        path: 'sent',
                        component: SentComponent
                    },
                    {
                        path: 'drafts',
                        component: DraftsComponent
                    },
                    {
                        path: 'noticeboard',
                        component: NoticeboardComponent
                    },
                    {
                        path: 'groups',
                        component: GroupsComponent
                    }
                ]
            },
            {
                path: 'user', children: [
                    {
                        path: 'main',
                        component: AccountComponent
                    },
                    {
                        path: 'settings',
                        component: SettingsComponent
                    },
                    {
                        path: 'personal',
                        component: PersonalInformationComponent
                    },
                    {
                        path: 'parents',
                        component: ParentsComponent
                    },
                    {
                        path: 'devices',
                        component: DevicesComponent
                    },
                    {
                        path: 'logins',
                        component: LoginHistoryComponent
                    },
                    {
                        path: 'connections',
                        component: ConnectionsComponent
                    },
                    {
                        path: 'gdpr',
                        children: [
                            { path: '', component: GdprComponent },
                            { path: ':tab', component: GdprComponent }
                        ]
                    },
                    {
                        path: 'notifications',
                        component: NotificationsComponent
                    },
                    {
                        path: 'cookies',
                        component: CookiesComponent
                    },
                ]
            },
            {
                path: 'system', children: [
                    {
                        path: 'settings',
                        component: SystemSettings
                    },
                    {
                        path: 'manageusers',
                        component: ManageusersComponent
                    },
                    {
                        path: 'managefiles',
                        component: ManagefilesComponent
                    },
                    {
                        path: 'managemessages',
                        component: ManagemessagesComponent
                    },
                    {
                        path: 'auditlog',
                        component: AuditlogComponent
                    },
                    {
                        path: 'reports',
                        component: ReportsComponent
                    }
                ]
            },
            {
                path: 'archive',
                component: ArchiveComponent
            },
            {
                path: 'admin', children: [
                    {
                        path: 'backup',
                        component: BackupComponent
                    },
                    {
                        path: 'seasonal',
                        component: SeasonalAdminComponent
                    },
                    {
                        path: 'monitoring',
                        component: MonitoringComponent
                    },
                    {
                        path: 'svp',
                        component: SvpComponent
                    },
                    {
                        path: 'school-years',
                        component: SchoolYearsComponent
                    },
                    {
                        path: 'architecture',
                        children: [
                            {
                                path: 'overview',
                                component: ArchitectureDashboardComponent
                            },
                            {
                                path: 'buildings',
                                component: ArchitectureBuildingsComponent
                            },
                            {
                                path: 'buildings/:id',
                                component: ArchitectureBuildingDetailComponent
                            },
                            {
                                path: 'rooms',
                                component: ArchitectureRoomsComponent
                            },
                            {
                                path: 'inventory',
                                component: InventoryComponent
                            }
                        ]
                    }
                ]
            },
            {
                path: 'library',
                children: [
                    {
                        path: '',
                        component: CatalogComponent
                    },
                    {
                        path: 'manage',
                        component: ManagerComponent
                    }
                ]
            },
            {
                path: 'no-permission',
                component: NoPermissionComponent
            }
        ]
    }
];
