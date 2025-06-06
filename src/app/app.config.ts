import { APP_INITIALIZER, ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { Authentication } from './infrastructure/authentication';
import { Locale } from '@Schoolingo/locale';
import { Theme } from '@Schoolingo/theme';
import { School } from '@Schoolingo/school';
import { AlertManager } from '@Schoolingo/alert';
import { Sidebar } from '@Schoolingo/sidebar';
import { Permission } from '@Schoolingo/permission';
import { Modules } from '@Schoolingo/modules';
import { Settings } from '@Schoolingo/settings';
import { Passkey } from '@Schoolingo/passkey';

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
    provideHttpClient(),
    Authentication,
    Locale,
    Theme,
    School,
    AlertManager,
    Sidebar,
    Permission,
    Modules,
    Settings,
    Passkey
  ]
};
