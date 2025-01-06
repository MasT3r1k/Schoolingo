import { HttpClient } from '@angular/common/http';
import { IPInformation } from './IPManager.d';
import { Config } from './Config';
import { NgModule } from '@angular/core';
import { Locale } from './Locale';
import { Storage } from './Storage';
export { IPInformation };

@NgModule()
export class IPManager {
    constructor(
        private http: HttpClient,
        private locale: Locale,
        private storage: Storage
    ) {}

    public ip!: string;
    public getMyIP(): string {
        return this.ip || this.locale.getLocale('errors/noIP');
    }
    public ips: Record<string, IPInformation | null> = {};
    public getIPInfo(ip: string): IPInformation | null | void {
        if (this.ips[ip] != null) {
            return this.ips[ip];
        }
        if (Object.keys(this.ips).includes(ip)) {
            this.getIP(ip);
        }
    }


    private saveIP(ip: string | null, data: IPInformation): void {
        if (!ip) {
            this.ip = data.ip;
        }
        if (!this.storage.get(this.storage.settingsCacheName, 'locale')) {
            if (["CZ", "SK"].includes(data.country)) {
                this.locale.setUserLocale("cs");
            }
        }
        this.ips[data.ip] = data;

    }

    public getIP(ip: string | null): void {
        if (ip) {
            this.ips[ip] = null;
        }
        this.http.get<IPInformation>('https://ipinfo.io/' + ip + '/json').subscribe((data: IPInformation): void => {
            this.saveIP(ip, data)
        }, () => {
            this.http.get<IPInformation>(Config.API_URL + 'v1/getIP/' + ip).subscribe((data: IPInformation): void => {
                this.saveIP(ip, data)
            });
        });
    }

}