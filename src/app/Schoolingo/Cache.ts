import { Injectable } from "@angular/core";

@Injectable({providedIn: 'root'})
export class Cache {

    public userCacheName: string = 'cache/user';
    public tokenCacheName: string = 'cache/token';

    constructor() {}
    public save(key: string, value: Record<string, string | any>): boolean {
        let saved = localStorage.getItem(key) as string;
        let json = JSON.parse(saved);
        let data = json ?? {};
        Object.keys(value).forEach(dataKey => {
            data[dataKey] = value[dataKey];
        })
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch(e) {
            return false;
        }
    }

    public get(key: string, value?: string): any {
        let saved = localStorage.getItem(key) as string;
        let json = JSON.parse(saved);

        if (json == null) return false;
        if (!value) return json;
        if (!json[value]) return false; 

        return json[value];
    }

    public remove(key: string): boolean {
        try {
            localStorage.removeItem(key);
            return true;
        } catch(e) {
            return false;
        }
    }

    public removeAll(): boolean {
        try {
            localStorage.clear();
            return true;
        } catch(e) {
            return false;
        }
    }
}