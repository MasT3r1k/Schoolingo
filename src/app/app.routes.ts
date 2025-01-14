import { Routes } from '@angular/router';
import { AuthComponent } from './Auth/auth.component';
import { NotUserGuard, UserGuard } from '@Guards/Auth.guard';
import { BoardComponent } from './board/board.component';
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
          path: 'main',
          loadComponent: () => import('./board/main/main.component')
                                .then(m => m.MainComponent)
        },
        {
          path: 'students',
          loadComponent: () => import('./board/students/students.component')
                                .then(m => m.studentsComponent)
        },
        {
          path: 'teachers',
          loadComponent: () => import('./board/teachers/teachers.component')
                                .then(m => m.TeachersComponent)
        },
        {
          path: 'users',
          loadComponent: () => import('./board/manage-users/manage-users.component')
                                .then(m => m.ManageUsersComponent)
        },
        {
          path: 'discordconnect',
          loadComponent: () => import('./board/discord-connect/discord-connect.component')
                                .then(m => m.DiscordConnectComponent)
        },
        {
          path: 'marks',
          children: [
            {
              path: 'interm',
              loadComponent: () => import('./board/Marks/interm/interm.component')
                                    .then(m => m.IntermComponent)
            },
            {
              path: 'midterm',
              loadComponent: () => import('./board/Marks/midterm/midterm.component')
                                    .then(m => m.MidtermComponent)
            },
            {
              path: 'intermrecord',
              loadComponent: () => import('./board/Marks/interm-record/interm-record.component')
                                    .then(m => m.IntermRecordComponent)
            },
            {
              path: 'educationmeasures',
              loadComponent: () => import('./board/Marks/education-measures/education-measures.component')
                                    .then(m => m.EducationMeasuresComponent)
            }
          ]
        },
        {
          path: 'teach',
          children: [
            {
              path: 'timetable',
              loadComponent: () => import('./board/Teach/timetable/timetable.component')
                                    .then(m => m.TimetableComponent)
            },
            {
              path: 'homeworks',
              loadComponent: () => import('./board/Teach/homeworks/homeworks.component')
                                    .then(m => m.HomeworksComponent)
            },
            {
              path: 'absence',
              loadComponent: () => import('./board/Teach/absence/absence.component')
                                    .then(m => m.AbsenceComponent)
            },
            {
              path: 'substitution',
              loadComponent: () => import('./board/Teach/substitution/substitution.component')
                                    .then(m => m.SubstitutionComponent)
            },
            {
              path: 'tutoring',
              loadComponent: () => import('./board/Teach/tutoring/tutoring.component')
                                    .then(m => m.TutoringComponent)
            },
            {
              path: 'classbook',
              loadComponent: () => import('./board/Teach/classbook/classbook.component')
                                    .then(m => m.ClassbookComponent)
            },
            {
              path: 'subjects',
              loadComponent: () => import('./board/Teach/subjects/subjects.component')
                                    .then(m => m.SubjectsComponent)
            }
          ]
        },
        {
          path: 'messages',
          children: [
            {
              path: 'send',
              loadComponent: () => import('./board/Messages/send/send.component')
                                    .then(m => m.SendComponent)
            },
            {
              path: 'received',
              loadComponent: () => import('./board/Messages/received/received.component')
                                    .then(m => m.ReceivedComponent)
            },
            {
              path: 'sent',
              loadComponent: () => import('./board/Messages/sent/sent.component')
                                    .then(m => m.SentComponent)
            },
            {
              path: 'groups',
              loadComponent: () => import('./board/Messages/groups/groups.component')
                                    .then(m => m.GroupsComponent)
            },
            {
              path: 'noticeboard',
              loadComponent: () => import('./board/Messages/noticeboard/noticeboard.component')
                                    .then(m => m.NoticeboardComponent)
            }
          ]
        },
        {
          path: 'traineeship',
          children: [
            {
              path: 'overview',
              loadComponent: () => import('./board/Traineeship/overview/overview.component')
                                    .then(m => m.OverviewComponent)
            },
            {
              path: 'diary',
              loadComponent: () => import('./board/Traineeship/diary/diary.component')
                                    .then(m => m.DiaryComponent)
            },
            {
              path: 'companies',
              loadComponent: () => import('./board/Traineeship/companies/companies.component')
                                    .then(m => m.CompaniesComponent)
            },
            {
              path: 'manage',
              loadComponent: () => import('./board/Traineeship/manage/manage.component')
                                    .then(m => m.ManageComponent)
            }
          ]
        },
        {
          path: 'library',
          children: [
            {
              path: 'loans',
              loadComponent: () => import('./board/library/loans/loans.component')
                                    .then(m => m.LoansComponent)
            },
            {
              path: 'books',
              loadComponent: () => import('./board/library/books/books.component')
                                    .then(m => m.BooksComponent)
            }
          ]
        },
        {
          path: 'fleetvehicles',
          children: [
            {
              path: 'vehicles',
              loadComponent: () => import('./board/fleetVehicles/vehicles/vehicles.component')
                                    .then(m => m.VehiclesComponent)
            }
          ]
        },
        {
          path: 'payments',
          children: [
            {
              path: 'classfund',
              loadComponent: () => import('./board/payments/class-fund/class-fund.component')
                                    .then(m => m.ClassFundComponent)
            },
            {
              path: 'graduateclassfund',
              loadComponent: () => import('./board/payments/graduate-class-fund/graduate-class-fund.component')
                                    .then(m => m.GraduateClassFundComponent)
            },
            {
              path: 'listing',
              loadComponent: () => import('./board/payments/listing/listing.component')
                                    .then(m => m.ListingComponent)
            },
            {
              path: 'unaccounteddocuments',
              loadComponent: () => import('./board/payments/unaccounted-documents/unaccounted-documents.component')
                                    .then(m => m.UnaccountedDocumentsComponent)
            },
            {
              path: 'documents',
              loadComponent: () => import('./board/payments/documents/documents.component')
                                    .then(m => m.DocumentsComponent)
            },
            {
              path: 'regularpayments',
              loadComponent: () => import('./board/payments/regular-payments/regular-payments.component')
                                    .then(m => m.RegularPaymentsComponent)
            },
            {
              path: 'newpayment',
              loadComponent: () => import('./board/payments/new-payment/new-payment.component')
                                    .then(m => m.NewPaymentComponent)
            },
            {
              path: 'newdeposit',
              loadComponent: () => import('./board/payments/new-deposit/new-deposit.component')
                                    .then(m => m.NewDepositComponent)
            },
            {
              path: 'accounts',
              loadComponent: () => import('./board/payments/accounts/accounts.component')
                                    .then(m => m.AccountsComponent)
            }
          ]
        },
        {
          path: 'user',
          children: [
            {
              path: 'profile',
              loadComponent: () => import('./board/User/profile/profile.component')
                                    .then(m => m.ProfileComponent)
            },
            {
              path: 'loginhistory',
              loadComponent: () => import('./board/User/login-history/login-history.component')
                                    .then(m => m.LoginHistoryComponent)
            },
            {
              path: 'devices',
              loadComponent: () => import('./board/User/devices/devices.component')
                                    .then(m => m.DevicesComponent)
            },
            {
              path: 'settings',
              loadComponent: () => import('./board/User/settings/settings.component')
                                    .then(m => m.SettingsComponent)
            }
          ]
        },
        {
          path: 'calendar',
          loadComponent: () => import('./board/calendar/calendar.component')
                                .then(m => m.CalendarComponent)
        },
        {
          path: 'documents',
          loadComponent: () => import('./board/documents/documents.component')
                                .then(m => m.DocumentsComponent)
        },
        {
          path: 'system',
          loadComponent: () => import('./board/system/system.component')
                                .then(m => m.SystemComponent)
        },        
        {
          path: 'tools',
          children: [
            {
              path: 'settings',
              loadComponent: () => import('./board/Tools/settings/settings.component')
                                    .then(m => m.SettingsComponent)
            },
            {
              path: 'manageusers',
              loadComponent: () => import('./board/Tools/manage-users/manage-users.component')
                                    .then(m => m.ManageUsersComponent)
            }
          ]
        },
        {
          path: '**', component: Error404Component
        }
      ]
    }
];
