import { Injectable } from "@angular/core";

@Injectable()
export class Storage {

    public userCacheName: string = 'user';
    public tokenCacheName: string = 'token';
    public settingsCacheName: string = 'settings';

    constructor() {}
    /**
     * Save to storage
     * @param key Name of storage item
     * @param value Value of storage item
     * @returns if save was successful
     */
    public save(key: string, value: Record<string, string | any>): boolean {
        let saved: string = localStorage.getItem(key) as string;
        let json: Record<string, string> = JSON.parse(saved);
        let data: Record<string, string> = json ?? {};
        Object.keys(value).forEach((dataKey: string) => {
            data[dataKey] = value[dataKey];
        })
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch(e) {
            return false;
        }
    }

    /**
     * Get value from storage
     * @param key Name of storage item
     * @param value Item of JSON (optional)
     * @returns Value from storage or false if is not set
     */
    public get(key: string, value?: string): any {
        try {
            let saved: string = localStorage.getItem(key) as string;
            let json: Record<string, string> = JSON.parse(saved);

            if (json == null) return false;
            if (!value) return json;
            if (!json[value]) return false; 
            return json[value];
        } catch(e) {
            return "";
        }
    }

    /**
     * Remove storage item from storage
     * @param key Name of storage item
     * @returns if remove was successful
     */
    public remove(key: string): boolean {
        try {
            localStorage.removeItem(key);
            return true;
        } catch(e) {
            return false;
        }
    }

    /**
     * Remove all items from storage
     * @returns if removeAll was successful
     * ! No saves !
     */
    public removeAll(): boolean {
        try {
            localStorage.clear();
            return true;
        } catch(e) {
            return false;
        }
    }
}