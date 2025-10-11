import { Injectable } from "@angular/core";

@Injectable()
export class Storage {

    public userCacheName = 'user';
    public tokenCacheName = 'token';
    public settingsCacheName = 'settings';

    constructor() {}
    /**
     * Save to storage
     * @param key Name of storage item
     * @param value Value of storage item
     * @returns if save was successful
    */
    public save(key: string, value: Record<string, any>): boolean {
        let saved: string = localStorage.getItem(key)!;
        let json: Record<string, string> = JSON.parse(saved);
        let data: Record<string, string> = json || {};
        Object.keys(value).forEach((dataKey: string) => {
            data[dataKey.toString()] = value[dataKey];
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
            let saved: string = localStorage.getItem(key)!;
            try {
                let json: Record<string, string> = JSON.parse(saved);

                if (!json) return false;
                if (!value) return json;
                if (!json[value]) return false; 
                return json[value];
            } catch(e) {
                return "";
            }

        } catch(e) {
            return "";
        }
    }

    /**
     * Check if storage item exists
     * @param key Name of storage item
     * @returns if storage item exists
    */
        public has(key: string): boolean {
            let saved: string | null = localStorage.getItem(key);
            return saved ? true : false;
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