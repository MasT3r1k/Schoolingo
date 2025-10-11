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
import { Alert } from "./Alert";
import { School } from "./School";

@Injectable({ providedIn: 'root' })
export class Authentication {
    public errors: { [key: string]: Alert } = {};
    public loginStatus = new BehaviorSubject<boolean>(false);

    constructor(
        private router: Router,
        private http: HttpClient,
        private route: ActivatedRoute,
        private userService: UserService,
        private socketService: SocketService,
        private locale: Locale,
        private school: School
    ) {}

    public page: 'login' | '2fa' | 'forgot' = 'login';
    public goPage(page: typeof this.page): void {
        this.page = page;
    }

    public isExecuting = false;
    public getLoginButtonText(): string {
      return this.isExecuting ? "<div class='btn-loader'></div> " + this.locale.getLocale('logining_btn') : this.locale.getLocale('login_btn');
    }

    public username = '';
    public password = '';

    public token2FA = '';
    public check2FA(): void {
        if (this.token2FA.length == 6) {
            this.login();
        }
    }

    public canLogin(): boolean {
        if (this.username === '') {
            this.errors['username'] = new Alert('error', 'required');
        }

        if (this.password === '') {
            this.errors['password'] = new Alert('error', 'required');
        }

        if (this.token2FA == '' && this.page == '2fa') {
            this.errors['token'] = new Alert('error', 'required');
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
                if (this.router.url.startsWith('/login')) {
                    this.router.navigate(['', ...nextURL.split('/')]);
                } else {
                    this.socketService.connect();
                }
                // this.isExecuting = false;
            }
    
            if ('error' in data) {
                switch (data.error) {
                    case 'user_not_found':
                        this.errors['username'] = new Alert('error', data.error);
                        break;
                    case 'wrong_pass':
                        this.errors['password'] = new Alert('error', data.error);
                        break;
                    case 'max_login_attempts':
                        this.errors['auth'] = new Alert('error', data.error);
                        break;
                    case '2fa_required':
                        this.token2FA = '';
                        this.goPage('2fa');
                        break;
                    case 'wrong_2fa':
                        this.errors['token'] = new Alert('error', 'userSettings/wrong_2fa');
                        break;
                    default:
                        console.log('Error: ' + data.error);
                    break;
                }
                this.isExecuting = false;
            }
        });
    }

    public goBackToLogin(): void {
        this.username = '';
        this.password = '';
        this.page = 'login';
    }

    public forgotPassword(): void {
        this.errors = {};

        if (!this.school.schoolInfo.resetPasswordWithEmail) {
            this.errors['auth'] = new Alert('info', 'auth/forgotpass/notAvailable', true);
            return;
        }
        
        if (!this.username || this.username == '') {
            this.errors['username'] = new Alert('error', 'required');
            return;
        }

        this.http.post<errorAPI>(
            Config.API_URL + 'forgotpass',
            { username: this.username },
            { withCredentials: true }
        )
        .subscribe((data: errorAPI) => {
            if ('error' in data) {
                switch (data.error) {
                    case 'no_user_set':
                        this.errors['username'] = new Alert('error', 'required');
                        break;
                    case 'user_not_found':
                        this.errors['username'] = new Alert('error', 'user_not_found');
                        break;
                    case 'email_not_found':
                        this.errors['auth'] = new Alert('error', 'auth/forgotpass/emailNotFound');
                        break;
                    case 'multiple_email':
                        break;
                    case 'email_error':
                        this.errors['auth'] = new Alert('error', 'auth/forgotpass/emailError');
                        break;
                    default:
                        console.log('Error: ' + data.error);
                    break;
                }
            }
        }, () => {
            this.errors['auth'] = new Alert('error', 'auth/forgotpass/httpError');
        });
    }
}