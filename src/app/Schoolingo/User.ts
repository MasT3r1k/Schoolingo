import { Injectable, NgModule } from "@angular/core";
import { User, UserMain } from './User.d';
import { Storage } from "./Storage";
import { Router } from "@angular/router";
import { ToastService } from "@Components/Toast";
import { SocketService } from "./Socket";
import { Schoolingo } from "@Schoolingo";
import { CookieService } from "./Cookie";

@NgModule()
export class UserService {
    constructor(
        private storage: Storage,
        private router: Router,
        private toast: ToastService,
        private socketService: SocketService,
        private cookieService: CookieService
    ) {
        let user = this.storage.get(this.storage.userCacheName) as UserMain;
        if (user) { this.setUser(user) }

        let token = this.cookieService.getCookie("token");
        let date = new Date();
        date.setTime(new Date().getTime() + 300000)
        if (token !== '') { this.setToken(token, date) }
    }

    // Main
    //* Users
    private user: UserMain | null = null;
    /**
     * Get user's information if set or null
     * @returns user information or null
     */
    public getUser(): UserMain | null {
        return this.user;
    }

    /**
     * Set User's data from server and save to storage
     * @param user user data from server
     */
    public setUser(user: UserMain | null) {
        user ? this.storage.save(this.storage.userCacheName, user) : this.storage.remove(this.storage.userCacheName);
        this.user = user;
    }

    //* Tokens
    private token: string = '';
    private tokenExpiration: Date = new Date();

    /**
     * Get Token string to access server
     * @returns token string
     */
    public getToken(): string {
        return this.token;
    }

    public setExpiration(date: string): void {
        let dat = new Date(date);
        this.tokenExpiration = dat;
    }

    public getExpiration(): Date {
        return this.tokenExpiration;
    }

    /**
     * Set token to User Service and save it to the storage
     * 
     * @param token Token received from server, to future access to the server
     * @param expiration Date of token
     *  
     */
    public setToken(token: string, expiration: Date): void {
        this.cookieService.setCookie("token", token, 30);
        this.token = token;
        this.tokenExpiration = expiration;
        this.storage.save(this.storage.tokenCacheName, { expiration });
    }

    /**
     * Disconnect from socket, remove user from memory, remove token from memory and storage and redirect to login page
     */
    public logout(): void {
        if (this.socketService.getSocket().Socket) {
            this.socketService.getSocket().Socket?.emit('logout');
        }
        this.socketService.socketFunctions = {};
        this.setUser(null);
        this.setToken('', new Date());
        this.toast.closeAll();
        this.router.navigate(['login']);
    }


}
export { User, UserMain };

