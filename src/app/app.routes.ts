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
                path: 'marks', children: [
                    {
                        path: 'interm', component: IntermComponent
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
            }
        ]
    }
];
