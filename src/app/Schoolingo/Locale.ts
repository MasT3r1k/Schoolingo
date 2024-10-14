import { Injectable } from "@angular/core";
import { Storage } from "@Schoolingo/Storage";
import { Logger } from "@Schoolingo/Logger";

import CzechLanguage from '../locales/Czech';
import EnglishLanguage from '../locales/English';
import { HttpClient } from "@angular/common/http";
import { localeURL } from "@Schoolingo/Config";
import { BehaviorSubject } from "rxjs";

export type languages = 'cs' | 'en' | "null";

@Injectable()
export class Locale {

    public defaultLanguage: languages = 'en';
    public language: BehaviorSubject<languages> = new BehaviorSubject("null" as languages);

    constructor(
        // Imports
        private storage: Storage,
        private logger: Logger,
        private http: HttpClient
        ) {
            let lng = this.storage.get(this.storage.settingsCacheName)["locale"];
            if (!lng) {
                lng = this.defaultLanguage;
            }
            this.setUserLocale(lng ?? this.defaultLanguage);
        }
    private logName = 'Locale';

    // Big future problem with more languages and locales :(
    private locales: Record<languages, any> = {
        cs: CzechLanguage,
        en: EnglishLanguage,
        null: {}
    }

    /**
     * List of all available languages
     * @returns List of available languages
     */
    public getLanguages(): languages[] {
        let list: languages[] = [];
        Object.keys(this.locales).forEach((value) => {
            list.push(value as languages)
        });
        return list;
    }


    private locale: any = {};
    public getLocaleConfig(): any {
        return this.locale;
    }

    /**
     * Select language for system and save to memory and storage
     * @param lng user's new language
     */
    public setUserLocale(lng: languages) {
        this.http.get(localeURL + this.locales[lng].file).subscribe((data: any) => {
            this.locale = data;
            this.language.next(lng);
            this.logger.send(this.logName, 'Language ' + lng + ' was loaded and saved.');
            this.storage.save(this.storage.settingsCacheName, {locale: lng});
        }, (err: any): void => {
            this.locale = {};
            this.language.next("null");
            this.logger.send(this.logName, 'Language ' + lng + ' failed to load.');
            console.error(err);
        });
    }

    /**
     * Get User's selected language
     * @returns user's language
     */
    public getUserLocale(): languages {
        return this.language.getValue();
    }

    /**
     * Set language from browser if language is found or set default language English
     * Is automatic when website is loaded and language is not in storage
     */
    public setDefaultLocale(): void {
        this.logger.send(this.logName, 'Loading language..');
        if (this.getLanguages()[0].includes(window.navigator.language as languages)) {
            this.logger.send(this.logName, 'Found supported language. (' + window.navigator.language + ')')
            this.setUserLocale(window.navigator.language as languages);
        }else{
            this.logger.send(this.logName, 'Language: ' + window.navigator.language + ' is not found. Loading default language: ' + this.defaultLanguage)
            this.setUserLocale(this.defaultLanguage);
        }
    }

    /**
     * Get translated text from locale
     * @param path Path to locale
     * @param locale language (optional)
     * @returns Translate of path
     */
    public getLocale(path: string): string {
        if (!path) return '[unknown]';
        if (!this.getUserLocale()) {
            this.setDefaultLocale();
        }
        let pathSplitted = path.split('/');
        let nextLocale = this.locale;

        pathSplitted.forEach(p => {
            if (nextLocale[p]) {
                nextLocale = nextLocale[p];
            }else{
                nextLocale = '[' + path + ']';
            }
        })
        return nextLocale;
    }

}