import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';

export const httpInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    tap({
      error: (error) => {
        if (error.error?.error === 'no_user') {
          router.navigate(['/login']);
        }
      }
    })
  );
}; 