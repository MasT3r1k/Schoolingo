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
import { IntermComponent as MarksInterm } from './board/Marks/interm/interm.component';
import { MidtermComponent as MarksMidterm } from './board/Marks/midterm/midterm.component';
import { PersonsComponent as Persons } from './board/persons/persons.component';
import { DiscordConnectComponent } from './board/discord-connect/discord-connect.component';
import { LoansComponent as LibraryLoans } from './board/library/loans/loans.component';
import { BooksComponent as LibraryBooks } from './board/library/books/books.component';
import { OverviewComponent as TraineeshipOverview } from './board/Traineeship/overview/overview.component';
import { DiaryComponent as TraineeshipDiary } from './board/Traineeship/diary/diary.component';
import { CompaniesComponent as TraineeshipCompanies } from './board/Traineeship/companies/companies.component';

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
          path: 'persons', component: Persons
        },
        {
          path: 'discordconnect', component: DiscordConnectComponent
        },
        {
          path: 'marks',
          children: [
            {
              path: 'interm', component: MarksInterm
            },
            {
              path: 'midterm', component: MarksMidterm
            }
          ]
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
          path: 'traineeship',
          children: [
            {
              path: 'overview', component: TraineeshipOverview
            },
            {
              path: 'diary', component: TraineeshipDiary
            },
            {
              path: 'companies', component: TraineeshipCompanies
            }
          ]
        },
        {
          path: 'library',
          children: [
            {
              path: 'loans', component: LibraryLoans
            },
            {
              path: 'books', component: LibraryBooks
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
