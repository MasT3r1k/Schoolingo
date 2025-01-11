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
import { ProfileComponent as UserProfile } from './board/User/profile/profile.component';
import { LoginHistoryComponent as UserLoginHistory } from './board/User/login-history/login-history.component';
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
import { IntermRecordComponent as MarksIntermRecord } from './board/Marks/interm-record/interm-record.component';
import { studentsComponent as Students } from './board/students/students.component';
import { TeachersComponent as Teachers } from './board/teachers/teachers.component';
import { ManageUsersComponent as Users } from './board/manage-users/manage-users.component';
import { DiscordConnectComponent } from './board/discord-connect/discord-connect.component';
import { LoansComponent as LibraryLoans } from './board/library/loans/loans.component';
import { BooksComponent as LibraryBooks } from './board/library/books/books.component';
import { OverviewComponent as TraineeshipOverview } from './board/Traineeship/overview/overview.component';
import { DiaryComponent as TraineeshipDiary } from './board/Traineeship/diary/diary.component';
import { CompaniesComponent as TraineeshipCompanies } from './board/Traineeship/companies/companies.component';
import { ManageComponent as TraineeshipManage } from './board/Traineeship/manage/manage.component';
import { OrderComponent as CanteenOrder } from './board/Canteen/order/order.component';
import { DispensingComponent as CanteenDispensing } from './board/Canteen/dispensing/dispensing.component';
import { MealsComponent as CanteenMeals } from './board/Canteen/meals/meals.component';
import { SettingsComponent as CanteenSettings } from './board/Canteen/settings/settings.component';
import { ClassFundComponent as PaymentClassFund } from './board/payments/class-fund/class-fund.component';
import { GraduateClassFundComponent as PaymentGraduateClassFund } from './board/payments/graduate-class-fund/graduate-class-fund.component';
import { ListingComponent as PaymentListing } from './board/payments/listing/listing.component';
import { UnaccountedDocumentsComponent as PaymentUnaccountedDocuments } from './board/payments/unaccounted-documents/unaccounted-documents.component';
import { DocumentsComponent as PaymentDocuments } from './board/payments/documents/documents.component';
import { RegularPaymentsComponent as PaymentRegularPayments } from './board/payments/regular-payments/regular-payments.component';
import { NewPaymentComponent as PaymentNewPayment } from './board/payments/new-payment/new-payment.component';
import { NewDepositComponent as PaymentNewDeposit } from './board/payments/new-deposit/new-deposit.component';
import { AccountsComponent as PaymentAccounts } from './board/payments/accounts/accounts.component';
import { SettingsComponent as PaymentSettings } from './board/payments/settings/settings.component';
import { SystemComponent } from './board/system/system.component';
import { SettingsComponent as ToolsSettings } from './board/Tools/settings/settings.component';
import { ManageUsersComponent as ToolsManageUsers } from './board/Tools/manage-users/manage-users.component';
import { DocumentsComponent } from './board/documents/documents.component';
import { CalendarComponent } from './board/calendar/calendar.component';
import { EducationMeasuresComponent as MarksEducationMeasures } from './board/Marks/education-measures/education-measures.component';
import { VehiclesComponent as FleetVehiclesVehicles } from './board/fleetVehicles/vehicles/vehicles.component';

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
          loadComponent: () => import('./board/main/main.component').then(m => m.MainComponent)
        },
        {
          path: 'students',
          loadComponent: () => import('./board/students/students.component').then(m => m.studentsComponent)
        },
        {
          path: 'teachers',
          loadComponent: () => import('./board/teachers/teachers.component').then(m => m.TeachersComponent)
        },
        {
          path: 'users',
          loadComponent: () => import('./board/manage-users/manage-users.component').then(m => m.ManageUsersComponent)
        },
        {
          path: 'discordconnect',
          loadComponent: () => import('./board/discord-connect/discord-connect.component').then(m => m.DiscordConnectComponent)
        },
        {
          path: 'marks',
          children: [
            {
              path: 'interm',
              loadComponent: () => import('./board/Marks/interm/interm.component').then(m => m.IntermComponent)
            },
            {
              path: 'midterm',
              loadComponent: () => import('./board/Marks/midterm/midterm.component').then(m => m.MidtermComponent)
            },
            {
              path: 'intermrecord',
              loadComponent: () => import('./board/Marks/interm-record/interm-record.component').then(m => m.IntermRecordComponent)
            },
            {
              path: 'educationmeasures',
              loadComponent: () => import('./board/Marks/education-measures/education-measures.component').then(m => m.EducationMeasuresComponent)
            }
          ]
        },
        {
          path: 'teach',
          children: [
            {
              path: 'timetable',
              loadComponent: () => import('./board/Teach/timetable/timetable.component').then(m => m.TimetableComponent)
            },
            {
              path: 'homeworks',
              loadComponent: () => import('./board/Teach/homeworks/homeworks.component').then(m => m.HomeworksComponent)
            },
            {
              path: 'absence',
              loadComponent: () => import('./board/Teach/absence/absence.component').then(m => m.AbsenceComponent)
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
              path: 'classbook',
              loadComponent: () => import('./board/Teach/classbook/classbook.component').then(m => m.ClassbookComponent)
            },
            {
              path: 'subjects',
              loadComponent: () => import('./board/Teach/subjects/subjects.component').then(m => m.SubjectsComponent)
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
          path: 'messages',
          children: [
            {
              path: 'send',
              loadComponent: () => import('./board/Messages/send/send.component').then(m => m.SendComponent)
            },
            {
              path: 'received',
              loadComponent: () => import('./board/Messages/received/received.component').then(m => m.ReceivedComponent)
            },
            {
              path: 'sent',
              loadComponent: () => import('./board/Messages/sent/sent.component').then(m => m.SentComponent)
            },
            {
              path: 'groups',
              loadComponent: () => import('./board/Messages/groups/groups.component').then(m => m.GroupsComponent)
            },
            {
              path: 'noticeboard',
              loadComponent: () => import('./board/Messages/noticeboard/noticeboard.component').then(m => m.NoticeboardComponent)
            }
          ]
        },
        {
          path: 'traineeship',
          children: [
            {
              path: 'overview',
              loadComponent: () => import('./board/Traineeship/overview/overview.component').then(m => m.OverviewComponent)
            },
            {
              path: 'diary',
              loadComponent: () => import('./board/Traineeship/diary/diary.component').then(m => m.DiaryComponent)
            },
            {
              path: 'companies',
              loadComponent: () => import('./board/Traineeship/companies/companies.component').then(m => m.CompaniesComponent)
            },
            {
              path: 'manage',
              loadComponent: () => import('./board/Traineeship/manage/manage.component').then(m => m.ManageComponent)
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
          path: 'fleetvehicles',
          children: [
            {
              path: 'vehicles', component: FleetVehiclesVehicles
            }
          ]
        },
        {
          path: 'payments',
          children: [
            {
              path: 'classfund', component: PaymentClassFund
            },
            {
              path: 'graduateclassfund', component: PaymentGraduateClassFund
            },
            {
              path: 'listing', component: PaymentListing
            },
            {
              path: 'unaccounteddocuments', component: PaymentUnaccountedDocuments
            },
            {
              path: 'documents', component: PaymentDocuments
            },
            {
              path: 'regularpayments', component: PaymentRegularPayments
            },
            {
              path: 'newpayment', component: PaymentNewPayment
            },
            {
              path: 'newdeposit', component: PaymentNewDeposit
            },
            {
              path: 'accounts', component: PaymentAccounts
            },
            {
              path: 'settings', component: PaymentSettings
            }
          ]
        },
        {
          path: 'user',
          children: [
            {
              path: 'profile', component: UserProfile
            },
            {
              path: 'loginhistory', component: UserLoginHistory
            },
            {
              path: 'devices', component: UserDevices
            },
            {
              path: 'settings', component: UserSettings
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
          path: 'system',
          component: SystemComponent
        },
        {
          path: 'tools',
          children: [
            {
              path: 'settings',
              component: ToolsSettings
            },
            {
              path: 'manageusers',
              component: ToolsManageUsers
            }
          ]
        },
        {
          path: '**', component: Error404Component
        }
      ]
    }
];
