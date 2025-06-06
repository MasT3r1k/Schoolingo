import { Routes } from '@angular/router';
import { AuthComponent } from './auth/auth.component';
import { NotUserGuard, UserGuard } from './guards/auth.guard';
import { BoardComponent } from './board/board.component';
import { MainComponent } from './board/main/main.component';
import { UserComponent } from './board/user/user.component';
import { SettingsComponent } from './board/user/settings/settings.component';
import { AccountComponent } from './board/user/account/account.component';
import { PersonalInformationComponent } from './board/user/personal-information/personal-information.component';
import { ParentsComponent } from './board/user/parents/parents.component';
import { DevicesComponent } from './board/user/devices/devices.component';
import { LoginHistoryComponent } from './board/user/login-history/login-history.component';
import { NotificationsComponent } from './board/user/notifications/notifications.component';
import { ConnectionsComponent } from './board/user/connections/connections.component';
import { GdprComponent } from './board/user/gdpr/gdpr.component';
import { TimetableComponent } from './board/teach/timetable/timetable.component';

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
                path: 'teach', children: [
                    {
                        path: 'timetable', component: TimetableComponent
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
                        path: 'notifications', component: NotificationsComponent
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
