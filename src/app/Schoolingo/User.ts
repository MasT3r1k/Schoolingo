import { NgModule } from "@angular/core";
import { Router } from "@angular/router";
import { child, degree, personDetails, user } from "@Schoolingo/User.d";
import { SocketService } from "./Socket";
import { Storage } from "./Storage";
import { Config } from "./Config";
import { HttpClient } from "@angular/common/http";
import { Moment } from "moment";
import moment from "moment";
import { CookieService } from "./Cookie";
import { School } from "./School";
import { BehaviorSubject } from "rxjs";
export { user, child, personDetails, degree }

@NgModule()
export class UserService {

    constructor(
        private storage: Storage,
        private router: Router,
        private socketService: SocketService,
        private cookieService: CookieService,
        private http: HttpClient,
        private school: School
    ) {

      this.socketService.tokenStatus.subscribe((tokenStatus: string | null): void => {
        if (tokenStatus == null) return;
        if (tokenStatus == 'refresh_token') {
          this.setExpiration(moment().add(this.school.schoolInfo.loginExpires, 'ms'));
        }

        if (tokenStatus == 'invalid_token' && this.user == null && !this.router.url.startsWith('/login')) {
          this.username = '';
          this.setExpiration(moment());
          this.router.navigate(['', 'login'], { queryParams: { returnUrl: this.router.url } })
        }

        if (tokenStatus == 'has_token' && this.router.url.startsWith('/login')) {
          this.setExpiration(moment().add(this.school.schoolInfo.loginExpires, 'ms'));
          this.router.navigate(['', 'main']);
        }
        this.socketService.tokenStatus.next(null);
      });

      try {
        let user: user = this.storage.get(this.storage.userCacheName) as user;
        if (user) {
          this.setUser(user);
        }
      } catch(e) {
        this.storage.remove(this.storage.userCacheName);
        this.setUser(null);
      }
  }

  public tfaSecret = '';
  public tfaQR = '';
  public set2fa(secret: string, qr: string): void {
    this.tfaSecret = secret;
    this.tfaQR = qr;
  }

  /** Children (only parents) */
  public selectedChild: number = 0;
  public children: child[] = [];


  //** Users
  private user: user | null = null;
  public username: string | null = "";

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
  public tokenExpiration: BehaviorSubject<Moment> = new BehaviorSubject(moment());

  public setExpiration(date: moment.Moment): void {
    this.tokenExpiration.next(date);
  }

  public getExpiration(): Moment {
    return this.tokenExpiration.getValue();
  }
  

  /**
   * Set token to User Service and save it to the storage
   *
   * @param useranem Login username from server, to future access to the server
   * @param expiration Date of token
   *
   */
  public setToken(username: string, expiration: Moment): void {
    this.username = username;
    this.setExpiration(expiration);
    this.storage.save(this.storage.tokenCacheName, { expiration });
  }

  /**
   * Disconnect from socket, remove user from memory, remove token from memory and storage and redirect to login page
   */
  public logout(): void {
    this.http.get<{ status: 'success' }>(Config.API_URL + 'logout', { withCredentials: true }).subscribe((data: { status: 'success' }) => {
      if ('status' in data) {
        this.username = "";
        this.socketService.emit('logout');
        this.socketService.socketEvents = new Map<string, Function[]>();
        this.setUser(null);
        this.setExpiration(moment());
        this.router.navigate(['login']);
      }
    });
  }

}