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

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    BoardComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    QRCodeModule
  ],
  providers: [Locale, UserService, Schoolingo, SocketService, Dropdowns, Sidebar, ToastService],
  bootstrap: [AppComponent]
})
export class AppModule { }
