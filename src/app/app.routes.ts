import { Routes } from '@angular/router';
import { AuthComponent } from './Auth/auth.component';
import { NotUserGuard, UserGuard } from './Guards/Auth.guard';
import { BoardComponent } from './board/board.component';
import { MainComponent } from './board/main/main.component';
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
import { DetailComponent } from './board/students/detail/detail.component';
import { TemplateSubjectComponent } from './board/schedule/template-subject/template-subject.component';
import { TemplateTimetableComponent } from './board/schedule/template-timetable/template-timetable.component';
import { MonitoringComponent } from './board/Admin/monitoring/monitoring.component';
import { SeasonalAdminComponent } from './board/Admin/seasonal/seasonal.component';


export const routes: Routes = [
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
                        component: DetailComponent
                    }
                ]
            },
            {
                path: 'employees',
                component: EmployeesComponent
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
                    }
                ]
            },
            {
                path: 'calendar',
                component: CalendarComponent
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
                        path: ':id/results',
                        component: PollResultsComponent
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
                        component: SendComponent
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
                        path: '',
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
                        component: GdprComponent
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
            }
        ]
    }
];
