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
import { TimetableComponent } from './board/Teach/timetable/timetable.component';
import { HomeworksComponent } from './board/Teach/homeworks/homeworks.component';
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


export const routes: Routes = [
    {
        path: '', pathMatch: 'full', redirectTo: 'login'
    },
    {
        path: 'login', component: AuthComponent, canActivate: [NotUserGuard]
    },
    {
        path: '', component: BoardComponent, canActivate: [UserGuard], children: [
            {
                path: 'main', component: MainComponent
            },
            {
                path: 'schedule/builder', component: BuilderComponent
            },
            {
                path: 'calendar', component: CalendarComponent
            },
            {
                path: 'documents', component: DocumentsComponent
            },
            {
                path: 'marks', children: [
                    {
                        path: 'interm', component: IntermComponent
                    },

                    {
                        path: 'intermrecord', component: IntermRecordComponent
                    }
                ]
            },
            {
                path: 'teach', children: [
                    {
                        path: 'timetable', component: TimetableComponent
                    },
                    {
                        path: 'homeworks', component: HomeworksComponent
                    },
                    {
                        path: 'absence', component: AbsenceComponent
                    },
                    {
                        path: 'classbook', component: ClassbookComponent
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
                path: 'messages', children: [
                    {
                        path: 'send', component: SendComponent
                    },
                    {
                        path: 'received', component: ReceivedComponent
                    },
                    {
                        path: 'noticeboard', component: NoticeboardComponent
                    },
                    {
                        path: 'groups', component: GroupsComponent
                    }
                ]
            },
            {
                path: 'user', children: [
                    {
                        path: '', component: AccountComponent
                    },
                    {
                        path: 'settings', component: SettingsComponent
                    },
                    {
                        path: 'personal', component: PersonalInformationComponent
                    },
                    {
                        path: 'parents', component: ParentsComponent
                    },
                    {
                        path: 'devices', component: DevicesComponent
                    },
                    {
                        path: 'logins', component: LoginHistoryComponent
                    },
                    {
                        path: 'connections', component: ConnectionsComponent
                    },
                    {
                        path: 'gdpr', component: GdprComponent
                    },
                ]
            },
            {
                path: 'system', children: [
                    {
                        path: 'settings', component: SystemSettings
                    },
                ]
            }
        ]
    }
];
