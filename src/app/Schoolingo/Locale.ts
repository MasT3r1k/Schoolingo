import { Injectable } from "@angular/core";
import { Storage } from "./Storage";
import { Logger } from "./Logger";

import CzechLanguage from '../locales/Czech';

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
        en: {
            // Language settings
            name: "English",
            flag: "data:image/webp;base64,UklGRnACAABXRUJQVlA4TGMCAAAv/gAmAMegJpIkxcn798SUfcS8dzbUNpLU9N8hnpQIovcGRY0kKf4d3usUMPP0/Ad/woU/KFHuRAkE0o4Q8k1sdcqb4oqefhOOtCNKwCWfBi6bHv4QxZBirVwAOZIkRVIvM6P+qsJRRnblay6i/3DYRnIkqXChzr//6eq4/S6j9fkGSfsi9+fvcm9f5AbJZTNp0ky3176znzd5FoeOc1q1P8rvJU9ollxyhGURJENIFkWyA2SBJDMwFkvyAmLxJCcYFlLygWBRJRv0FlkyQWVZZLbrFLtZs8ni4IDU8pD4MCz41x46Ll9nxk2X5bEbHJdNeDmttBIaD2txeH2HopXc0T9rhNfNHMrHjFqiYmCR3rtOMJ8rgoSEbvEeBxAXiyThMLFYEg2yBX5ELMgW+v1MAm9hX1UQdIssYWBbdAkC2uJLDMCWh0QAa/lIeqiWkySHablJYoiWoyQFaHlKSnCWr6QDZnlLKliWuySCZPVAksCx+iBJwFidkBRQLJ7kA8RiSh5QLKzEhmSRJTQciy6BwVgGEhY/q8nCxS6DPdzt8vglj7tdntXn338G8in/L8vl/1vFYA/FnCEK4ARZAOcH6z89GsDZ4QBOjtc/NyCAqREBzAypf2JMAPOCApgWVf+ssAAmxQUwJ7D+KZEBzAgNYEJs/fOBA5gOHcBs8PonwwfQCxBAK0T9nSABNMIE0AdUfxtUAF1gATTB1d8DWH4LZPkdoOU3wFbS/xtA+3MA3d/1N78H0PsfwNYH9e/8EMDGFwHs+1H/ticB7PoSwKY39e/5E8CWRwHs+JTNhlfV7/fVAAA=",

            // Sidebar
            sidebar: {
                home: "My overview",
                marks: {
                    main: "Classification",
                    interm: "Interim classification",
                    midterm: "Midterm classification"
                },
                teach: {
                    main: "Teaching",
                    timetable: "Timetable",
                    homeworks: "Homeworks",
                    substitution: "Substitution",
                    subjects: "Subjects"

                },

                absence: "Absence",
                calendar: "Calendar",
                user: {
                    main: "User",
                },
                class: {
                    main: "Classes",
                    list: "List of classes",
                    create: "Create class"
                }
            },
            // System roles
            roles: {
                systemadmin: "System Manager",
                manager: "Administrator",
                principal: "Principal",
                teacher: "Teacher",
                parent: "Parent",
                student: "Student"
            },
            // Dashboard
            change_is_instant: "The change is immediate",
            changepassword: "Change password",
            oldpassword: "Old password",
            newpassword: "New password",
            againNewpassword: "Again new password",
            language: "Language",
            theme: "Themes",
            logout: "Logout",
            print: "Print",
            settings: "Settings",

            timetable: {
                thisWeek: "This week",
                nextWeek: "Next week",
                permanent: "Permanent"
            },
            subjects: "Subjects",
            chronologically: "Chronologically",


            // Dropdowns
            dropdowns: {
                user: {
                    linkedUsers: "Linked accounts",
                    noLinked: "You have no other accounts linked"
                }
            },

            or: "or",

            // Authentication
            login_title: "Login",
            forgot_pass: "Forgot password?",
            login_btn: "Login",
            login_formTitle: "Login to the school system",
            login_qrcodeTitle: "log in with QR code",
            scan_qrcode: "Scan QR code in the <b>mobile app</b> for quick login",
            username: "Username",
            password: "Password",
            required: "Required",
            not_same: "It doesn't match",
            is_same: "The new password is the same as the old one",
            wrong_password: "Wrong password",
            user_not_found: "User not found"

        }

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