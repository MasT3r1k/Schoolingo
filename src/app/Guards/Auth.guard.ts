import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot,  RouterStateSnapshot, Router, CanActivate} from '@angular/router';
import { Authentication } from '../infrastructure/authentication';
import { filter, map, Observable, take } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserGuard implements CanActivate {
  constructor(private router: Router, private auth: Authentication) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.auth.getAuthState().pipe(
      filter((val): val is boolean => val !== null),
      take(1),
      map((isAuthenticated: boolean) => {
        if (isAuthenticated) {
          return true;
        } else {
          this.router.navigate(['', 'login'], { queryParams: { returnUrl: state.url } });
          return false;
        }
      })
    );
  }
}

@Injectable({ providedIn: 'root' })
export class NotUserGuard implements CanActivate {
    constructor(private router: Router, private auth: Authentication) {}

  canActivate(): Observable<boolean> {
    return this.auth.getAuthState().pipe(
      filter((val): val is boolean => val !== null),
      take(1),
      map((isAuthenticated: boolean) => {
        if (!isAuthenticated) {
          return true;
        } else {
          this.router.navigate(['', 'main']);
          return false;
        }
      })
    );
  }
}