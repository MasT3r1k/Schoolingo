import { NgModule } from '@angular/core';
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

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    BoardComponent,
    TabsComponent,
    BoardMain,
    BoardTimetable,
    BoardTeachSubjects,
    BoardMarksInterm,
    TimeTableModule,
    MarksModule,
    ToastComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    QRCodeModule,
    HttpClientModule
  ],
  providers: [Locale, UserService, Schoolingo, SocketService, Dropdowns, Sidebar, ToastService, Tabs, Theme, Logger, DatePipe],
  bootstrap: [AppComponent]
})
export class AppModule { }
