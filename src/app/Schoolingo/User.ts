import { Injectable } from "@angular/core";
import { User, UserMain } from './User.d';
import { Cache } from "./Cache";
import { Router } from "@angular/router";
import { SocketService } from "./Socket";
import { ToastService } from "@Components/Toast";

@Injectable()
export class UserService {
    constructor(
        private cache: Cache,
        private router: Router,
        private socketService: SocketService,
        private toast: ToastService
    ) {
        let user = this.cache.get(this.cache.userCacheName) as UserMain;
        if (user) { this.setUser(user) }

        let token = this.cache.get(this.cache.tokenCacheName);
        if (token !== false && token?.token && token?.expiration) { this.setToken(token.token, token.expiration) }
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
        user ? this.cache.save(this.cache.userCacheName, user) : this.cache.remove(this.cache.userCacheName);
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

    /**
     * Set token to User Service and save it to the storage
     * 
     * @param token Token received from server, to future access to the server
     * @param expiration Date of token
     *  
     */
    public setToken(token: string, expiration: Date): void {
        this.token = token;
        this.tokenExpiration = expiration;
        this.cache.save(this.cache.tokenCacheName, { token: token, expiration: expiration });
    }

    /**
     * Disconnect from socket, remove user from memory, remove token from memory and storage and redirect to login page
     */
    public logout(): void {
        this.socketService.getSocket().Socket?.emit('removeToken');
        this.socketService.getSocket().Socket?.disconnect();
        this.setUser(null);
        this.setToken('', new Date());
        this.toast.closeAll();
        this.router.navigate(['login']);
    }


}
export { User, UserMain };

