import { Injectable } from "@angular/core";
import { Storage } from "@Schoolingo/Storage";
import { Logger } from "@Schoolingo/Logger";

import CzechLanguage from '../locales/Czech';
import EnglishLanguage from '../locales/English';
import { HttpClient } from "@angular/common/http";
import { Config } from "@Schoolingo/Config";
import { BehaviorSubject } from "rxjs";
import * as moment from 'moment';
import 'moment/locale/cs';
import 'moment/locale/en-gb';
export type languages = 'cs' | 'en-gb' | "null";

@Injectable()
export class Locale {

    public isLoadedLanguage = new BehaviorSubject<boolean>(false);
    public defaultLanguage: languages = 'en-gb';
    public language: BehaviorSubject<languages> = new BehaviorSubject("null" as languages);

    constructor(
        // Imports
        private storage: Storage,
        private logger: Logger,
        private http: HttpClient,
        ) {
            let lng = this.storage.get(this.storage.settingsCacheName)["locale"];
            if (!lng) {
                lng = this.defaultLanguage;
            }
            this.setUserLocale(lng);
        }
    private logName = 'Locale';

    // Big future problem with more languages and locales :(
    public locales: Record<languages, typeof CzechLanguage | {} | any> = {
        cs: CzechLanguage,
        'en-gb': EnglishLanguage,
        null: {}
    }

    /**
     * List of all available languages
     * @returns List of available languages
     */
    public getLanguages(): languages[] {
        let list: languages[] = [];
        Object.keys(this.locales).forEach((value) => {
            if (value == "null") return;
            list.push(value as languages)
        });
        return list;
    }


    private locale = new BehaviorSubject<any>({});
    public getLocaleConfig(): typeof this.locale {
        return this.locale;
    }


    public saveUserLocale(lng: languages): void {
        this.storage.save(this.storage.settingsCacheName, {locale: lng});
    }

    /**
     * Select language for system and save to memory and storage
     * @param lng user's new language
     */
    public setUserLocale(lng: languages): void {
        this.http.get(Config.localeURL + this.locales[lng].file).subscribe((data: any) => {
            this.isLoadedLanguage.next(true);
            this.locale.next(data);
            this.language.next(lng);
            if (lng != "null") {
                moment.locale(lng);
            }
            this.logger.send(this.logName, 'Language ' + lng + ' was loaded and saved.');
        }, (err: any): void => {
            // this.locale.next({});
            this.isLoadedLanguage.next(false);
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
        if (!path) return '[no path]';
        if (!this.getUserLocale()) {
            this.setDefaultLocale();
        }
        let pathSplitted = path.split('/');
        let nextLocale = this.locale.getValue();

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