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
    public modulePositions = signal<{ module_id: string; position: number }[]>([]);

    public fetchDashboard(): void {
        this.http.get<any>(Config.API_URL + '/v1/dashboard', { withCredentials: true })
            .subscribe((data) => {
                this.unreadMessages.set(data.unreadMessages);
                this.newNotifications.set(data.newNotifications);
                this.cookies.set(data.cookies);
                this.modulePositions.set(data.modulePositions);
            });
    }

    public savePositions(positions: { module_id: string; position: number }[]): void {
        this.modulePositions.set(positions);
        this.http.post(Config.API_URL + '/v1/dashboard/positions', { positions }, { withCredentials: true })
            .subscribe();
    }
}