import { ApplicationConfig } from '@angular/core';
import { PreloadAllModules, provideRouter, withPreloading } from '@angular/router';
import { routes } from './app.routes';
import { UserService } from '@Schoolingo/User';
import { Storage } from '@Schoolingo/Storage';
import { CookieService } from '@Schoolingo/Cookie';
import { SocketService } from '@Schoolingo/Socket';
import { School } from '@Schoolingo/School';
import { Logger } from '@Schoolingo/Logger';
import { Locale } from '@Schoolingo/Locale';
import { FormManager } from './Components/Forms/FormManager';
import { Schoolingo } from '@Schoolingo';
import { Theme } from '@Schoolingo/Theme';
import { Sidebar } from '@Schoolingo/Sidebar';
import { Permission } from '@Schoolingo/Permissions';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { TabsComponent } from '@Components/Tabs/Tabs';
import { Dropdown } from '@Components/Dropdowns/Dropdown';
import { MessageManager } from '@Schoolingo/Messages';
import { MainModules } from './board/main/Modules/Modules';
import { Modules } from '@Schoolingo/Modules';
import { Traineeship } from '@Schoolingo/Traineeship';
import { Homeworks } from '@Schoolingo/Homeworks';
import { IPManager } from '@Schoolingo/IPManager';
import { Authentication } from '@Schoolingo/Auth';
import { IconsModule } from './Modules/Icons.module';
import { Discord } from '@Schoolingo/Discord';
import { Classbook } from '@Schoolingo/Classbook';
import { LevelSystem } from '@Schoolingo/LevelSystem';
import { Avatar } from '@Schoolingo/Avatar';
import { teacherMarks } from '@Schoolingo/Marks';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    UserService,
    Storage,
    CookieService,
    SocketService,
    School,
    Logger,
    Locale,
    FormManager,
    Schoolingo,
    Theme,
    Sidebar,
    Permission,
    HttpClient,
    TabsComponent,
    Dropdown,
    MessageManager,
    Modules,
    MainModules,
    Homeworks,
    IPManager,
    Traineeship,
    Authentication,
    IconsModule,
    Discord,
    Classbook,
    LevelSystem,
    Avatar,
    teacherMarks
  ],
  
};
