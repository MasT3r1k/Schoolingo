import { NgModule, Renderer2, RendererFactory2 } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Locale } from '@Schoolingo/Locale';
import { UserService } from '@Schoolingo/User';
import { Schoolingo } from '@Schoolingo';
import { SocketService } from '@Schoolingo/Socket';
import { QRCodeModule } from 'angularx-qrcode';
import { BoardComponent } from './Board/board.component';
import { Dropdowns } from './Components/Dropdown/Dropdown';
import { Sidebar } from '@Schoolingo/Sidebar';
import { ToastService } from '@Components/Toast/';
import { Tabs } from '@Components/Tabs/Tabs';
import { TabsComponent } from '@Components/Tabs/tabs.component';
import { MainComponent as BoardMain } from './Board/main/main.component';
import { TimetableComponent as BoardTimetable } from './Board/teach/timetable/timetable.component';
import { HttpClientModule } from '@angular/common/http';
import { Theme } from '@Schoolingo/Theme';
import { Logger } from '@Schoolingo/Logger';
import { SubjectsComponent as BoardTeachSubjects } from './Board/teach/subjects/subjects.component';
import { IntermComponent as BoardMarksInterm } from './Board/marks/interm/interm.component';
import { DatePipe } from '@angular/common';
import { TimetableComponent as TimeTableModule } from './Board/main/timetable/timetable.component';
import { MarksComponent as MarksModule } from './Board/main/marks/marks.component';
import { ToastComponent } from '@Components/Toast/toast.component';
import { DevicesComponent as BoardDevices } from './Board/user/devices/devices.component';
import { SettingsComponent as BoardSettings } from './Board/user/settings/settings.component';
import { ClassbookComponent } from './Board/teach/classbook/classbook.component';
import { TableComponent as ComponentTable } from '@Components/table/table.component';
import { PupilcardComponent } from './Board/pupilcard/pupilcard.component';
import { Table } from '@Components/table/Table';
import { CalendarComponent } from '@Components/calendar/calendar.component';
import { Calendar } from '@Components/calendar/calendar';
import { SendComponent as MessagesSend } from './Board/messages/send/send.component';
import { SentComponent as MessagesSent } from './Board/messages/sent/sent.component';
import { ReceivedComponent as MessagesReceived } from './Board/messages/received/received.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { MidtermComponent  as BoardMarksMidterm} from './Board/marks/midterm/midterm.component';
import { ModalsComponent } from "./Components/modals/modals.component";
import { Modals } from '@Components/modals/modals';
import { HomeworksComponent as Homeworks } from './Board/teach/homeworks/homeworks.component';
import { ThemeComponent as ThemeSelector } from './Board/user/settings/theme/theme.component';
import { NotifiesComponent as SchoolingoNotifies } from '@Components/notifies/notifies.component';
import { AbsenceComponent as Absence } from './Board/absence/absence.component';
import { CookieService } from '@Schoolingo/Cookie';
import { CompaniesComponent as TraineeCompanies } from './Board/traineeships/companies/companies.component';
import { DiaryComponent as TraineeDiary } from './Board/traineeships/diary/diary.component';
import { ManageComponent as TraineeManage } from './Board/traineeships/manage/manage.component';
import { OverviewComponent as TraineeOverview } from './Board/traineeships/overview/overview.component';
import { SettingsComponent as TraineeSettings } from './Board/traineeships/settings/settings.component';
import { FormList, FormManager } from '@Schoolingo/FormManager';
import { IntermRecordComponent } from './Board/marks/interm-record/interm-record.component';
import { MessageManager } from '@Schoolingo/Messages';
import { SchoolSettingsComponent } from './Board/school/settings/school-settings.component';

@NgModule({
    declarations: [
        AppComponent,
        LoginComponent,
        BoardComponent,
        TabsComponent,
        ComponentTable,
        BoardMain,
        BoardTimetable,
        BoardTeachSubjects,
        BoardMarksInterm,
        BoardMarksMidterm,
        TimeTableModule,
        MarksModule,
        ToastComponent,
        BoardDevices,
        BoardSettings,
        ClassbookComponent,
        PupilcardComponent,
        CalendarComponent,
        MessagesSend,
        MessagesSent,
        MessagesReceived,
        ModalsComponent,
        Homeworks,
        ThemeSelector,
        SchoolingoNotifies,
        Absence,
        TraineeCompanies,
        TraineeDiary,
        TraineeManage,
        TraineeOverview,
        TraineeSettings,
        CalendarComponent,
        IntermRecordComponent,
        SchoolSettingsComponent,
    ],
    providers: [
        Locale,
        UserService,
        Schoolingo,
        SocketService,
        Dropdowns,
        Sidebar,
        ToastService,
        Tabs,
        Theme,
        Logger,
        DatePipe,
        Table,
        Calendar,
        Modals,
        CookieService,
        FormList,
        MessageManager
    ],
    bootstrap: [AppComponent],
    imports: [
        BrowserModule,
        AppRoutingModule,
        NgSelectModule,
        FormsModule,
        ReactiveFormsModule,
        QRCodeModule,
        HttpClientModule,
        FormManager,
    ]
})
export class AppModule { }
