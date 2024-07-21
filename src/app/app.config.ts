import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { UserService } from '@Schoolingo/User';
import { Storage } from '@Schoolingo/Storage';
import { CookieService } from '@Schoolingo/Cookie';
import { SocketService } from '@Schoolingo/Socket';
import { School } from '@Schoolingo/School';
import { Logger } from '@Schoolingo/Logger';
import { Locale } from '@Schoolingo/Locale';
import { FormManager } from './Components/Forms/FormManager';
import { Tabs } from '@Components/Tabs/Tabs';
import { Schoolingo } from '@Schoolingo';
import { Theme } from '@Schoolingo/Theme';
import { Sidebar } from '@Schoolingo/Sidebar';
import { Permission } from '@Schoolingo/Permissions';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    UserService,
    Storage,
    CookieService,
    SocketService,
    School,
    Logger,
    Locale,
    FormManager,
    Tabs,
    Schoolingo,
    Theme,
    Sidebar,
    Permission
  ]
};
