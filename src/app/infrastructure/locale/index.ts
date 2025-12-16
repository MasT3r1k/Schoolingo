import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Config } from "@Schoolingo/config";
import { BehaviorSubject, distinctUntilChanged } from "rxjs";
import { Language } from "./language";
import { Authentication } from "@Schoolingo/authentication";

@Injectable()
export class Locale {
    private http = inject(HttpClient);
    private auth = inject(Authentication);

    public languages: Language[] = [];
    private selectedLanguage$ = new BehaviorSubject<string>('');
    private locale$ = new BehaviorSubject<any>({});
    private state: 'loaded' | 'loading' | 'error' = 'loading';

    constructor() {
        this.loadLanguages();
        this.handleLanguageChanges();
        this.loadUserLanguageOnLogin();
    }

    /** 1️⃣ Načti seznam jazyků a nastav výchozí */
    private loadLanguages(): void {
        this.http.get<Language[]>(Config.LOCALE_URL).subscribe({
            next: (languages) => {
                this.languages = languages;
                const initialLang = this.selectedLanguage$.value || this.languages[0]?.name;
                this.setLanguage(initialLang);
            },
            error: () => this.state = 'error'
        });
    }

    /** 2️⃣ Sleduj změnu jazyka a načítej locale */
    private handleLanguageChanges(): void {
        this.selectedLanguage$
            .pipe(distinctUntilChanged())
            .subscribe((language) => {
                if (!language) return;

                const lng = this.getLanguage(language);
                if (!lng || !lng.file) return;

                this.state = 'loading';
                this.http.get(Config.LOCALE_URL + lng.file).subscribe({
                    next: (locale) => {
                        this.locale$.next(locale);
                        this.state = 'loaded';
                    },
                    error: () => this.state = 'error'
                });
            });
    }

    /** 3️⃣ Načti jazyk přihlášeného uživatele */
    private loadUserLanguageOnLogin(): void {
        this.auth.getAuthState().subscribe((logged) => {
            if (logged) {
                const user = this.auth.getUser();
                if (user?.locale) {
                    this.setLanguage(user.locale);
                }
            }
        });
    }

    /** ✅ Ulož jazyk do API */
    public saveLanguage(): void {
        const lng = this.getLanguage(this.selectedLanguage$.value);
        if (!lng) return;

        this.state = 'loading';
        this.http.post(Config.API_URL + '/v1/user/update', {
            method: "UPDATE_LANGUAGE",
            language: lng.iso
        }, { withCredentials: true })
        .subscribe({
            next: (data: any) => this.state = data?.status ? 'loaded' : 'error',
            error: () => this.state = 'error'
        });
    }

    /** ✅ Nastavení jazyka (bez ukládání do API) */
    public setLanguage(language: string): void {
        const lng = this.getLanguage(language);
        if (!lng) return console.error("Language not found:", language);
        this.selectedLanguage$.next(lng.name);
    }

    /** ✅ Veřejné getry */
    public getState() { return this.state; }
    public getSelectedLanguage() { return this.selectedLanguage$; }
    public getLocaleData() { return this.locale$; }

    public getLanguage(language: string): Language | null {
        return this.languages.find(lang => lang.name === language || lang.iso === language) || null;
    }

    public getLanguages(): string[] {
        return this.languages.map(l => l.name);
    }

    /** ✅ Výchozí jazyk podle prohlížeče */
    public setDefaultLanguage(): void {
        const browserLang = window.navigator.language;
        const target = this.languages.some(lang => lang.name === browserLang)
            ? browserLang
            : this.languages[0]?.name;
        this.setLanguage(target);
    }

    /** ✅ Překlad podle path (safety) */
    public s(path: string, args: Record<string, string | number> = {}): string {
        if (!path) return '[no path]';
        let current = this.locale$.value;
        for (const key of path.split('.')) {
            if (current && current[key] !== undefined) {
                current = current[key];
            } else {
                return `[${path}]`;
            }
        }

        // Replace all args in text
        Object.entries(args).forEach((arg) => current.replaceAll(`%${arg[0]}%`, `${arg[1]}`));

        return current;
    }
}
