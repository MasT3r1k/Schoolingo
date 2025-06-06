import { inject, Injectable } from "@angular/core";

import { HttpClient } from "@angular/common/http";
import { Config } from "@Schoolingo/config";
import { BehaviorSubject, distinctUntilChanged } from "rxjs";
import 'moment/locale/cs';
import 'moment/locale/en-gb';
import { Language } from "./language";

@Injectable()
export class Locale {
    private http = inject(HttpClient);
    public languages: Language[] = [];

    private selectedLanguage = new BehaviorSubject<string>('');
    private locale = new BehaviorSubject<any>({});
    private state: 'loaded' | 'loading' = 'loading';

    constructor() {
        this.http.get(Config.LOCALE_URL)
        .subscribe((languages: any) => {
            for(const language of languages) {
                this.languages.push(language);
            }
            this.setLanguage("Čeština");
        })


        this.selectedLanguage
        .pipe(distinctUntilChanged())
        .subscribe((language) => {
            if (language == "" || language == null) return;
            this.state = 'loading';
            const lng = this.languages.filter((_) => _.name == language)[0];
            this.http.get(Config.LOCALE_URL + lng.file)
            .subscribe((locale) => {
                this.locale.next(locale);
                this.state = 'loaded';
            });
        })
    }

    public getState(): typeof this.state {
        return this.state;
    }

    public getSelectedLanguage(): typeof this.selectedLanguage {
        return this.selectedLanguage;
    }

    public getLanguage(language: string): Language | null {
        return this.languages.filter(lang => lang.name === language)[0];
    }

    public getLocaleData(): typeof this.locale {
        return this.locale;
    }

    public setLanguage(language: string): void {
        const exists = this.languages.some(lang => lang.name === language);
        if (!exists) {
            console.error("Language not found")
            return;
        }
        this.selectedLanguage.next(language);
    }


    /**
     * @returns list of languages in array
     */
    public getLanguages(): string[] {
        let languages: string[] = [];
        this.languages.forEach((lng) => languages.push(lng.name));
        return languages;
    }

    /**
     * Select default language from language in browser
     * @return void 
     */
    public setDefaultLanguage(): void {
        const exists = this.languages.some(lang => lang.name === window.navigator.language);
        if (exists) {
            this.setLanguage(window.navigator.language);
        }else{
            this.setLanguage("Čeština");
        }
    }

    /**
     * Get translated text from locale
     * @param path Path to locale
     * @param locale language (optional)
     * @returns Translate of path
     */
    public s(path: string): string {
        if (path == '') return '[no path]';
        let nextLocale = this.locale.getValue();
        if (!nextLocale) return '[no locale]';
        let pathSplitted = path.split('.');

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