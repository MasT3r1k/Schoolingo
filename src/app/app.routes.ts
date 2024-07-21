import { Routes } from '@angular/router';
import { AuthComponent } from './Auth/auth.component';
import { NotUserGuard, UserGuard } from '@Guards/Auth.guard';
import { BoardComponent } from './board/board.component';
import { MainComponent as BoardMain } from './board/main/main.component';
import { TimetableComponent as TeachTimetable } from './board/Teach/timetable/timetable.component';
import { HomeworksComponent as TeachHomeworks } from './board/Teach/homeworks/homeworks.component';
import { AbsenceComponent as TeachAbsence } from './board/Teach/absence/absence.component';
import { SubstitutionComponent as TeachSubstitution } from './board/Teach/substitution/substitution.component';
import { TutoringComponent as TeachTutoring } from './board/Teach/tutoring/tutoring.component';
import { ClassbookComponent as TeachClassbook } from './board/Teach/classbook/classbook.component';
import { SubjectsComponent as TeachSubjects } from './board/Teach/subjects/subjects.component';
import { DevicesComponent as UserDevices } from './board/User/devices/devices.component';
import { SettingsComponent as UserSettings } from './board/User/settings/settings.component';
import { SendComponent as MessagesSend } from './board/Messages/send/send.component';
import { ReceivedComponent as MessagesReceived } from './board/Messages/received/received.component';
import { SentComponent as MessagesSent } from './board/Messages/sent/sent.component';
import { GroupsComponent as MessagesGroups } from './board/Messages/groups/groups.component';
import { NoticeboardComponent as MessagesNoticeboard } from './board/Messages/noticeboard/noticeboard.component';
import { Error404Component } from './board/Errors/error404/error404.component';

export const routes: Routes = [
    {
      path: '', redirectTo: 'login', pathMatch: 'full'
    },
    {
      path: 'login', canActivate: [NotUserGuard], component: AuthComponent
    },
    {
      path: '', canActivate: [UserGuard], component: BoardComponent, children: [
        {
          path: 'main', component: BoardMain
        },
        {
          path: 'teach',
          children: [
            {
              path: 'timetable', component: TeachTimetable
            },
            {
              path: 'homeworks', component: TeachHomeworks
            },
            {
              path: 'absence', component: TeachAbsence
            },
            {
              path: 'substitution', component: TeachSubstitution
            },
            {
              path: 'tutoring', component: TeachTutoring
            },
            {
              path: 'classbook', component: TeachClassbook
            },
            {
              path: 'subjects', component: TeachSubjects
            }
          ]
        },
        {
          path: 'messages',
          children: [
            {
              path: 'send', component: MessagesSend
            },
            {
              path: 'received', component: MessagesReceived
            },
            {
              path: 'sent', component: MessagesSent
            },
            {
              path: 'groups', component: MessagesGroups
            },
            {
              path: 'noticeboard', component: MessagesNoticeboard
            }
          ]
        },
        {
          path: 'user',
          children: [
            {
              path: 'devices', component: UserDevices
            },
            {
              path: 'settings', component: UserSettings
            }
          ]
        },
        {
          path: '**', component: Error404Component
        }
      ]
    }
];
