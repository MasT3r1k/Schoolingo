import { HttpClient } from "@angular/common/http";
import { ActivatedRoute, Params, Router } from "@angular/router";
import { errorAPI } from "@Components/Datalist/Datalist";
import { Config } from "./Config";
import moment from "moment";
import { LoginData } from "./Auth.d";
import { Injectable } from "@angular/core";
import { UserService } from "./User";
import { SocketService } from "./Socket";
import { BehaviorSubject } from "rxjs";
import { Locale } from "./Locale";

@Injectable({ providedIn: 'root' })
export class Authentication {
    public errors: { [key: string]: string } = {};
    public loginStatus: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    constructor(
        private router: Router,
        private http: HttpClient,
        private route: ActivatedRoute,
        private userService: UserService,
        private socketService: SocketService,
        private locale: Locale
    ) {}

    public page: 'login' | '2fa' | 'forgot' = 'login';
    public goPage(page: typeof this.page): void {
        this.page = page;
        if (this.router.url.startsWith('/login')) {
            if (['2fa'].includes(page)) return;
            this.router.navigate([''], { queryParams: { page: page } });
        }
    }

    public isExecuting = false;
    public getLoginButtonText(): string {
      return this.isExecuting ? "<div class='btn-loader'></div> " + this.locale.getLocale('logining_btn') : this.locale.getLocale('login_btn');
    }

    public username = '';
    public password = '';

    public token2FA = '';

    public canLogin(): boolean {
        if (this.username === '') {
            this.errors['username'] = 'required';
        }
        if (this.password === '') {
            this.errors['password'] = 'required';
        }
        if (this.token2FA == '' && this.page == '2fa') {
            this.errors['token'] = 'required';
        }

        return (Object.keys(this.errors).length === 0);
    }

    public getValue(value: Function | string | undefined): string {
        if (value === undefined) return '';
        return (typeof value === 'function') ? value() : value;
    }

    public login(): void {
        this.isExecuting = true;
        this.errors = {};
        let canLogin = this.canLogin();
        if (!canLogin) {
            this.isExecuting = false;
            return;
        }

        this.http.post<LoginData | errorAPI>(Config.API_URL + 'login', {
            username: this.username,
            password: this.password,
            token: this.token2FA
        }, { withCredentials: true }).subscribe((data: LoginData | errorAPI): any => {
            if ('username' in data) {
                this.loginStatus.next(true);
                this.userService.setToken(data.username, moment(data.expires));
                this.socketService.disconnect();
                let nextURL = 'main';
                this.route.queryParams.forEach((param: Params) => {
                    if (!param.returnUrl) return;
                    nextURL = param.returnUrl.slice(1);
                });
                this.page = 'login';
                this.password = '';
                this.token2FA = '';
                this.router.navigate(['', ...nextURL.split('/')]);
                this.isExecuting = false;
            }
    
            if ('error' in data) {
                switch (data.error) {
                    case 'user_not_found':
                        this.errors['username'] = data.error;
                        break;
                    case 'wrong_pass':
                        this.errors['password'] = data.error;
                        break;
                    case 'max_login_attempts':
                        this.errors['auth'] = data.error;
                        break;
                    case '2fa_required':
                        this.token2FA = '';
                        this.goPage('2fa');
                        break;
                    case 'wrong_2fa':
                        this.errors['token'] = 'userSettings/wrong_2fa';
                        break;
                    default:
                        console.log('Error: ' + data.error);
                    break;
                }
                this.isExecuting = false;
            }
        });
    }
}