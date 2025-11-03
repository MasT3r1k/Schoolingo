import { APP_INITIALIZER, ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { Authentication } from './infrastructure/authentication';
import { Locale } from '@Schoolingo/locale';
import { Theme } from '@Schoolingo/theme';
import { School } from '@Schoolingo/school';
import { AuthAlertManager } from './infrastructure/alert/auth.alert.manager';
import { BoardAlertManager } from './infrastructure/alert/board.alert.manager';
import { Sidebar } from '@Schoolingo/sidebar';
import { Permission } from '@Schoolingo/permission';
import { Modules } from '@Schoolingo/modules';
import { Settings } from '@Schoolingo/settings';
import { Passkey } from '@Schoolingo/passkey';
import { httpInterceptor } from './infrastructure/http/http.interceptor';
import { Homeworks } from '@Schoolingo/homeworks';
import { MessageManager } from '@Schoolingo/messages';
import { IconsModule } from '@Schoolingo/icons';
import { BaseAlertManager } from './infrastructure/alert/alert.manager';
import { ModalManager } from '@Schoolingo/modal';
import { MarksManager } from '@Schoolingo/marks';
import { CalendarManager } from '@Components/calendar-dropdown';

export function initAuth(auth: Authentication): () => void {
  return () => auth.loadState(); // např. HTTP požadavek + setAuthState()
}

export const appConfig: ApplicationConfig = {
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: initAuth,
      deps: [Authentication, Locale, Theme],
      multi: true
    },
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([httpInterceptor])),
    Authentication,
    Locale,
    Theme,
    School,
    AuthAlertManager,
    BaseAlertManager,
    BoardAlertManager,
    Sidebar,
    Permission,
    Modules,
    Settings,
    Passkey,
    Homeworks,
    MessageManager,
    IconsModule,
    ModalManager,
    MarksManager,
    CalendarManager
  ]
};
