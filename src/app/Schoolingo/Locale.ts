import { Injectable } from "@angular/core";
import { Storage } from "./Storage";
import { Logger } from "./Logger";

import CzechLanguage from '../locales/Czech';
import EnglishLanguage from '../locales/English';

export type languages = 'cs' | 'en';

@Injectable()
export class Locale {

    public declare translatedLanguages: Record<languages, number>;

    public highestTexts: number = 0;
    public defaultLanguage: languages = 'en';

    public getLanguageTranslated(): void {
        this.getLanguages().forEach((lng: languages) => {
            if (!this.translatedLanguages) {
                (this.translatedLanguages as any) = {};
            }
            let num = 0;
            let objEntries = Object.values(this.locales[lng]);
            function entryCountTest(obj: any): void {
                let a = obj?.filter((o: any) => typeof o == 'object');
                a.forEach((b: any) => entryCountTest(Object.values(b)));
                num += obj.length - a.length;
            }

            entryCountTest(objEntries);
            this.translatedLanguages[lng] = num;
            if (num > this.highestTexts) {
                this.defaultLanguage = lng;
                this.highestTexts = num;
            }
        });
    }

    public getTranslated(lng: languages): number {
        return 1 - (this.highestTexts - this.translatedLanguages[lng]) / (this.highestTexts);
    }

    constructor(
        // Imports
        private storage: Storage,
        private logger: Logger
        ) {

            this.getLanguageTranslated();

        }
    private logName: string = 'Locale';

    private locales: Record<languages, any> = {
        cs: CzechLanguage,
        en: EnglishLanguage
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

    /**
     * Select language for system and save to memory and storage
     * @param lng user's new language
     */
    public setUserLocale(lng: languages) {
        this.logger.send(this.logName, 'Language ' + lng + ' was loaded and saved.');
        this.storage.save(this.storage.settingsCacheName, {locale: lng});
    }

    /**
     * Get User's selected language
     * @returns user's language
     */
    public getUserLocale(): languages {
        return this.storage.get(this.storage.settingsCacheName, 'locale') as languages;
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
            this.logger.send(this.logName, 'Language: ' + window.navigator.language + ' is not found. Loading default language: en')
            this.setUserLocale(this.defaultLanguage);
        }
    }

    /**
     * Get translated text from locale
     * @param path Path to locale
     * @param locale language (optional)
     * @returns Translate of path
     */
    public getLocale(path: string, locale?: languages): string {
        if (!path) return '[unknown]';
        if (!this.getUserLocale()) {
            this.setDefaultLocale();
        }
        let pathSplitted = path.split('/');
        let _locale = this.locales[locale || this.getUserLocale()];

        pathSplitted.forEach(p => {
            if (_locale?.[p]) {
                _locale = _locale[p];
            }else{
                _locale =
                (locale == 'cs' || this.getUserLocale() == 'cs') ?
                '[' + path + ']' : this.getLocale(path, 'cs');
            }
        })
        return _locale;
    }

}