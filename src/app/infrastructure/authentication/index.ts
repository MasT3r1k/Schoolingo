import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { Config } from '../config';
import { handleHttpException } from '../http/http';
import { User } from './user';
import { TokenExpirationService } from '../token-expiration/token-expiration.service';
import { AuthConfig } from './config';
import { AvatarService } from '../utils/avatar.service';
import { Router } from '@angular/router';
import moment from 'moment';

export class Authentication {
    private http = inject(HttpClient);
    private router = inject(Router);
    private tokenExpirationService = inject(TokenExpirationService);
    private avatarService = inject(AvatarService);
    private authState$ = new BehaviorSubject<boolean | 'offline' | null>(null);
    private passwordExpires = new BehaviorSubject(new Date());
    private declare user: User;
    public selectedChild = new BehaviorSubject(0);

    public setAuthState(state: typeof this.authState$.value): void {
        this.authState$.next(state);
    }

    public isAuthenticated(): boolean {
        return this.authState$.value === true;
    }

    public loadState(): void {
        this.http.get<User | { error: string }>(Config.API_URL + '/v1/user', { withCredentials: true })
            .subscribe((user: User | { error: string }) => {
                if ('username' in user) {
                    this.user = user as User;
                    this.user.emails = user.emails.map((email) => ({ ...email, is_created: true }))
                    this.user.phones = user.phones.map((phone) => ({ ...phone, is_created: true }))
                    if (this.user.children) {
                        this.user.children.sort((a, b) => {
                            const nameA = `${a.last_name} ${a.first_name}`;
                            const nameB = `${b.last_name} ${b.first_name}`;
                            return nameA.localeCompare(nameB, 'cs');
                        });
                    }
                    this.passwordExpires.next(user.expires);

                    // Initialize token expiration tracking
                    this.tokenExpirationService.setTokenExpiration(user.expires);

                    // user.children = [];
                    this.user.birthday = moment(user.birthday);
                    this.setAuthState(true);
                }
            }, (err) => {
                if (err.status === 401) {
                    this.setAuthState(false);
                    // this.tokenExpirationService.clearExpiration();
                    
                    if (window.location.pathname.startsWith('/setup')) return;

                    const url = this.router.url;
                    if (AuthConfig.ignored_redirect.includes(url)) {
                        this.router.navigate(['', 'login']);
                    } else {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        this.router.navigate(['', 'login'], { queryParams: { returnUrl: url } });
                    }
                    return;
                }

                if (err.status === 400 && (err.error?.error === 'invalid_school' || err.error?.error === 'no_school')) {
                    this.setAuthState(false);
                    this.tokenExpirationService.clearExpiration();
                    this.router.navigate(['', 'login']);
                    return;
                }

                this.setAuthState('offline')
                handleHttpException(err);
            })
    }

    public logout(reason: string = 'user_logout', returnUrl?: string): void {
        const queryParams = returnUrl ? { returnUrl } : {};
        this.http.get(Config.API_URL + '/logout', { withCredentials: true })
            .subscribe({
                next: () => {
                    sessionStorage.setItem('logoutReason', reason);
                    this.setAuthState(false);
                    this.tokenExpirationService.clearExpiration();
                    this.router.navigate(['', 'login'], { queryParams });
                },
                error: () => {
                    sessionStorage.setItem('logoutReason', reason);
                    this.setAuthState(false);
                    this.tokenExpirationService.clearExpiration();
                    this.router.navigate(['', 'login'], { queryParams });
                }
            });
    }

    public refreshToken(): Observable<void> {
        return this.http.post<{ success: boolean; expires: string }>(
            Config.API_URL + '/v1/sessionexpand',
            {},
            { withCredentials: true }
        ).pipe(
            tap(response => {
                this.tokenExpirationService.setTokenExpiration(response.expires);
                if (this.user) {
                    this.user.expires = new Date(response.expires);
                }
            }),
            map(() => void 0)
        );
    }

    public getUser(): typeof this.user {
        return this.user;
    }

    public getAvatar(): string {
        if (!this.user) return '';
        return this.avatarService.getAvatar(this.user.avatar, this.user.full_name);
    }

    public getRole(): string {
        const user = this.getUser();

        if (user == null) {
            return "";
        }

        return user.role;
    }

    public getId(): number {
        const user = this.getUser();

        if (user == null) {
            return 0;
        }

        if (user.role == "parent") {
            return this.user.children[this.selectedChild.getValue()].childId;
        }
        return this.user.person_id;
    }

    public getAuthState(): typeof this.authState$ {
        return this.authState$;
    }

    public getAuthStateValue(): typeof this.authState$.value {
        return this.authState$.getValue();
    }
}