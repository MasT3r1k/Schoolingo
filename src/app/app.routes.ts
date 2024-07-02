import { Routes } from '@angular/router';
import { AuthComponent } from './Auth/auth.component';
import { NotUserGuard } from '@Guards/Auth.guard';

export const routes: Routes = [
    {
        path: '', redirectTo: 'login', pathMatch: 'full'
      },
      {
        path: 'login', canActivate: [NotUserGuard], component: AuthComponent
      },
      {
        path: '**', redirectTo: 'login'
      }
];
