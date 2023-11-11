import { Injectable } from "@angular/core";
import { User, UserMain } from './User.d';
import { Cache } from "./Cache";
import { Router } from "@angular/router";
import { SocketService } from "./Socket";

@Injectable()
export class UserService {
    constructor(
        private cache: Cache,
        private router: Router,
        private socketService: SocketService
    ) {
        let user = this.cache.get(this.cache.userCacheName);
        if (user) { this.setUser(user) }

        let token = this.cache.get(this.cache.tokenCacheName);
        if (token !== false && token?.token && token?.expiration) { this.setToken(token.token, token.expiration) }
    }

    // Main
    //* Users
    private user: User = null;
    public getUser(): User {
        return this.user;
    }
    public setUser(user: User) {
        if (user) (user as UserMain).class = "B2.I";
        if (user) {
            this.cache.save(this.cache.userCacheName, user);
        }else{
            this.cache.remove(this.cache.userCacheName)
        }
        this.user = user;
    }

    //* Tokens
    private token: string = '';
    private tokenExpiration: Date = new Date();

    public getToken(): string {
        return this.token;
    }

    /**
     * Set token to User Service and save it to the storage
     * 
     * @token Token received from server, to future access to the user content
     * @expiration Expiration Date of token
     *  
     */
    public setToken(token: string, expiration: Date): void {
        this.token = token;
        this.tokenExpiration = expiration;
        this.cache.save(this.cache.tokenCacheName, { token: token, expiration: expiration });
    }

    public logout(): void {
        this.socketService.getSocket().Socket?.emit('removeToken');
        this.socketService.getSocket().Socket?.disconnect();
        this.setUser(null);
        this.setToken('', new Date());
        this.router.navigate(['login']);
    }


}
