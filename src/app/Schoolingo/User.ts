import { NgModule } from "@angular/core";
import { Router } from "@angular/router";
import { user } from "@Schoolingo/User.d";
import { CookieService } from "@Schoolingo/Cookie";

@NgModule()
export class UserService {
    private user: user | null = null;

    constructor(
        private storage: Storage,
        private router: Router,
        private cookieService: CookieService
    ) {}



}