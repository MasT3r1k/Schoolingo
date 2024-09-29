import { NgModule } from "@angular/core";
import { Router } from "@angular/router";
import { user } from "@Schoolingo/User.d";
import { CookieService } from "@Schoolingo/Cookie";
import { SocketService } from "./Socket";
import { Storage } from "./Storage";
export { user }

@NgModule()
export class UserService {

    constructor(
        private storage: Storage,
        private router: Router,
        private cookieService: CookieService,
        private socketService: SocketService
    ) {
      try {
        let user: user = this.storage.get(this.storage.userCacheName) as user;
        if (user) {
          this.setUser(user);
        }
      } catch(e) {
        this.storage.remove(this.storage.userCacheName);
        this.setUser(null);
      }
  
      try {
        let token: string = this.cookieService.getCookie('token');
        let date: Date = this.storage.get(this.storage.tokenCacheName, 'expiration') as Date;
        if (token !== '') {
          this.setToken(token, date);
        }
      } catch(e) {
        this.setToken("", new Date());
      }
    }

  //** Users
  private user: user | null = null;

  /**
   * Get user's information if set or null
   * @returns user information or null
   */
  public getUser(): user | null {
    return this.user;
  }

  /**
   * Set User's data from server and save to storage
   * @param user user data from server
   */
  public setUser(user: user | null) {
    user
      ? () => {
        try {
          this.storage.save(this.storage.userCacheName, user);
        } catch(e) {
          this.setUser(null);
          return;
        }
      }
      : this.storage.remove(this.storage.userCacheName);
    this.user = user;
  }

  //* Tokens
  private token: string = '';
  private tokenExpiration: Date = new Date();

  /**
 * Get Token string to access server
 * @returns token string
 */
  public getToken(): string | null {
    return this.token;
  }

  public setExpiration(date: string): void {
    let dat: Date = new Date(date);
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
    this.cookieService.setCookie('token', token, 30);
    this.token = token;
    this.tokenExpiration = expiration;
    this.storage.save(this.storage.tokenCacheName, { expiration });
  }

  /**
   * Disconnect from socket, remove user from memory, remove token from memory and storage and redirect to login page
   */
  public logout(): void {
    if (this.socketService.getSocket()) {
      this.socketService.getSocket()?.emit('logout');
    }
    this.socketService.socketEvents = new Map<string, Function[]>();
    this.setUser(null);
    this.setToken('', new Date());
    // this.toast.closeAll();
    this.router.navigate(['login']);
  }

}