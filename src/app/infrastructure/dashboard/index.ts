import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Config } from '../config';

@Injectable({
    providedIn: 'root'
})
export class Dashboard {
    private http = inject(HttpClient);
    public unreadMessages = signal<number>(0);
    public newNotifications = signal<number>(0);
    public cookies = signal<number>(1);
    public password_last_change = signal<Date>(new Date());
    public password_recommend_change = signal<boolean>(false);
    public hide_password_notification = signal<boolean>(false);
    public modulePositions = signal<{ module_id: string; position: number }[]>([]);

    public fetchDashboard(): void {
        this.http.get<any>(Config.API_URL + '/v1/dashboard', { withCredentials: true })
            .subscribe((data) => {
                this.unreadMessages.set(data.unreadMessages);
                this.newNotifications.set(data.newNotifications);
                this.cookies.set(data.cookies);
                this.modulePositions.set(data.modulePositions);
                this.password_last_change.set(data.last_password_changed);
                this.password_recommend_change.set(data.recommend_change_password);
            });
    }

    public savePositions(positions: { module_id: string; position: number }[]): void {
        this.modulePositions.set(positions);
        this.http.post(Config.API_URL + '/v1/dashboard/positions', { positions }, { withCredentials: true })
            .subscribe();
    }
}