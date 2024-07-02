import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { UserService } from '@Schoolingo/User';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), Storage, UserService]
};
