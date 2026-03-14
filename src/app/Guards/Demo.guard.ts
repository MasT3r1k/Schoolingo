import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Router, CanActivateChild, UrlTree } from '@angular/router';
import { School } from '../infrastructure/school';
import { Observable, filter, map, take } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DemoGuard implements CanActivateChild {
  private router = inject(Router);
  private school = inject(School);

  canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
    return this.school.config.pipe(
      filter(config => config !== null),
      take(1),
      map(config => {
        if (!config?.demo_enabled) {
          return true;
        }

        const allowedPaths = [
          '/main',
          '/schedule',
          '/teach/timetable',
          '/marks',
          '/messages',
          '/user',
          '/system',
          '/admin/monitoring',
          '/admin/school-years',
          '/login'
        ];

        const isAllowed = allowedPaths.some(path => state.url.startsWith(path)) || state.url === '/';

        if (isAllowed) {
          return true;
        }

        return this.router.parseUrl('/main');
      })
    );
  }
}
