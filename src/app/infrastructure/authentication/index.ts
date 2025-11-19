import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Config } from '../config';
import { handleHttpException } from '../http/http';
import { User } from './user';
import { createAvatar } from '@dicebear/core';
import { avataaarsNeutral } from '@dicebear/collection';
import moment from 'moment';
import { Router } from '@angular/router';

export class Authentication {
    private http = inject(HttpClient);
    private router = inject(Router);
    private authState$ = new BehaviorSubject<boolean | 'offline' | null>(null);
    private declare user: User;
    public selectedChild = new BehaviorSubject(0);

    public setAuthState(state: typeof this.authState$.value): void {
        this.authState$.next(state);
    }

    public loadState(): void {
        this.http.get<User | { error: string }>(Config.API_URL + '/v1/user', { withCredentials: true })
        .subscribe((user: User | { error: string }) => {
            if ('error' in user) {
                switch(user.error) {
                    case "no_user":
                        this.setAuthState(false);
                        break;
                }
            } else if ('username' in user) {
                this.user = user as User;
                this.user.emails = user.emails.map((email) => ({...email, is_created: true}))
                this.user.phones = user.phones.map((phone) => ({...phone, is_created: true}))
                this.setAuthState(true);
                // user.children = [];
                this.user.birthday = moment(user.birthday)
            }
        }, (err) => {
            this.setAuthState('offline')
            handleHttpException(err);
        })
    }

    public logout(): void {
        this.http.get(Config.API_URL + '/logout', { withCredentials: true })
        .subscribe((data) => {
            this.setAuthState(false);
            this.router.navigate(['', 'login']);
        });
    }

    public getUser(): typeof this.user {
        return this.user;
    }

    public getAvatar(): string {
        const avatar = createAvatar(avataaarsNeutral, {
            seed: this.user.avatar.seed
        });

        return avatar.toDataUri();
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
        return this.user.personId;
    }

    public getAuthState(): Observable<typeof this.authState$.value> {
        return this.authState$.asObservable();
    }

    public getAuthStateValue(): typeof this.authState$.value {
        return this.authState$.getValue();
    }
}