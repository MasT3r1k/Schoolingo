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
import { SettingsComponent as TraineeshipSettings } from './board/Traineeship/settings/settings.component';
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
          path: 'students', component: Students
        },
        {
          path: 'teachers', component: Teachers
        },
        {
          path: 'users', component: Users
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
            },
            {
              path: 'intermrecord', component: MarksIntermRecord
            },
            {
              path: 'educationmeasures', component: MarksEducationMeasures
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
            },
            {
              path: 'manage', component: TraineeshipManage
            },
            {
              path: 'settings', component: TraineeshipSettings
            }
          ]
        },
        {
          path: 'canteen',
          children: [
            {
              path: 'order', component: CanteenOrder
            },
            {
              path: 'dispensing', component: CanteenDispensing
            },
            {
              path: 'meals', component: CanteenMeals
            },
            {
              path: 'settings', component: CanteenSettings
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
