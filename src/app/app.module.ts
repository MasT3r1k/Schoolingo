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
import { TimetableComponent } from './Board/teach/timetable/timetable.component';
import { ToastComponent } from '@Components/Toast/toast.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    BoardComponent,
    TabsComponent,
    ToastComponent,
    TimetableComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    QRCodeModule
  ],
  providers: [Locale, UserService, Schoolingo, SocketService, Dropdowns, Sidebar, ToastService, Tabs],
  bootstrap: [AppComponent]
})
export class AppModule { }
