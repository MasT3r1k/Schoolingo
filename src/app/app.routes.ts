import { Routes } from '@angular/router';
import { AuthComponent } from './Auth/auth.component';
import { NotUserGuard, UserGuard } from '@Guards/Auth.guard';
import { BoardComponent } from './board/board.component';
import { MainComponent as BoardMain } from './board/main/main.component';

export const routes: Routes = [
    {
      path: '', redirectTo: 'login', pathMatch: 'full'
    },
    {
      path: 'login', canActivate: [NotUserGuard], component: AuthComponent
    },
    {
      path: '', canActivate: [UserGuard], children: [
        {
          path: 'main', component: BoardMain
        }
      ], component: BoardComponent
    },
    {
      path: '**', redirectTo: ''
    }
];
