import { Routes } from '@angular/router';
import { AuthComponent } from './Auth/auth.component';

export const routes: Routes = [
    {
        path: '', redirectTo: 'login', pathMatch: 'full'
      },
      {
        path: 'login', canActivate: [NotUserGuard], component: AuthComponent
      },
];
