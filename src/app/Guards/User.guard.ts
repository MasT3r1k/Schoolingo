import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot,  RouterStateSnapshot, Router, CanActivate} from '@angular/router';
import { UserService } from '@Schoolingo/User';

@Injectable({ providedIn: 'root' })
export class UserGuard implements CanActivate {
    constructor(private router: Router, private userService: UserService) {}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        if (this.userService.getToken() != "" && this.userService.getToken() != null) {return true;}
        this.router.navigate(['login'], { queryParams: { returnUrl: state.url } });
        return false;
    }

}

@Injectable({ providedIn: 'root' })
export class NotUserGuard implements CanActivate {
    constructor(private router: Router, private userService: UserService) {}

    canActivate(): boolean {
        if (this.userService.getToken() == "" || this.userService.getToken() == null) {return true;}
        this.router.navigate(['', 'main']);
        return false;
    }

}