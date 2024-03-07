import { Injectable } from "@angular/core";
import { Storage } from "./Storage";
import { Logger } from "./Logger";

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
        cs: {
            // Language settings
            name: "Čeština",

            //! DO NOT TOUCH THIS! ITS ENCODED BASE64!
            flag: "data:image/webp;base64,UklGRuQBAABXRUJQVlA4TNcBAAAv/kAqAFegKJKk5tIzuwgowL8eNGDDTAAyFbRRQWoV1PBZgylqJEn57kpgOvRv7QTc/Mf///Xpu2RAQ8pNQ2RAgQ7N1QE3kWSF0r0LcfDSBQvPAhaQgISVgAQs4PXX5BH9n4D80Z9G5xt0fnhOvNPofIPOD8+Jdxqdb9D54TnxTqPzDTo/PCfeaXS+QeeH58Q7jc436PzwnHin0fkGnR+eE+80Ot+g88Nz4p1G5xt0fnhOvNPofIPOD8+Jdxqdb9D54TnxTqPzDTo/PCfeaXS+QeeH58Q7jc436PzwnHin0fkGnR+eE+80Ot+g88Nz4p1G5xt0fnhOvNPofIPOD8+Jdxqdb9D54TnxTqPzDTo/PCfeaXS+QeeH58Qrff3/tSm41eH2EFwJbgpudbg9BFeCm4JbHW4PwZXgpuBWh9tDcCW4KbjV4fYQXAluCm51uD0EV4Kbglsdbg/BleCm4FaH20NwJbgpuNXh9hBcCW4KbnW4PQRXgpuCWx1uD8GV4KbgVofbQ3AluCm41eH2EFwJbgpudbg9BFeCm4JbHW4PwZXgpuBWh9tDcCW4KbjV4fYQXAluCm51uD0EV4Kbglsdbg/BleCm4FaH20NwJbgpuNXh9hBciQ4A",

            // Themes
            themes: {
                system: "Režim podle systému",
                dark: "Tmavý režim",
                light: "Světlý režím"
            },

            // Sidebar
            sidebar: {
                home: "Můj přehled",
                pupilcard: "Evidence žáků",
                manageclass: "Správa třídy",
                marks: {
                    main: "Klasifikace",
                    interm: "Průběžná klasifikace",
                    midterm: "Pololetní klasifikace",
                    intermRecord: "Zápis známek",
                    midtermRecordTimesheet: "Zápis známek dle skupin",
                    midtermRecordClass: "Zápis známek dle tříd",
                },
                teach: {
                    main: "Výuka",
                    timetable: "Rozvrh",
                    homeworks: "Domácí úkoly",
                    substitution: "Suplování",
                    tutoring: "Doučování",
                    classbook: "Třídní kniha",
                    subjects: "Přehled předmětů",
                },

                messages: {
                    main: "Zprávy",
                    send: "Poslat zprávu",
                    received: "Přijaté zprávy",
                    sent: "Odeslané zprávy",
                    groups: "Skupiny",
                    noticeboard: "Nástěnka",
                },

                absence: "Absence",
                traineeship: {
                    overview: "Můj přehled",
                    main: "Odborná praxe",
                    companies: "Seznam firem",
                    diary: "Deník",
                    manage: "Správa praxí",
                    settings: "Nastavení modulu praxí"
                },
                actionPlan: "Plán akcí",
                calendar: "Kalendář",
                documents: "Dokumenty",
                payments: {
                    main: "Platby",
                    overview: "Přehled plateb",
                    classfund: "Třídní fund",
                },
                library: {
                    main: "Knihovna",
                    overview: "Přehled výpůjček",
                    listbooks: "Seznam knih",
                    managebooks: "Správa knih",
                },
                canteen: {
                    main: "Jídelna",
                    order: "Objednávky",
                    dispensing: "Výdeje",
                    meals: "Jídla",
                },
                printers: {
                    main: "Tiskárna",
                    print: "Vytisknout",
                },
                user: {
                    main: "Uživatel",
                    devices: "Přihlášené zařízení",
                },
                person: {
                    main: "Osoby",
                    list: "Seznam osob",
                    create: "Vytvořit osobu",
                },
                teachers: {
                    main: "Učitelé",
                    list: "Seznam učitelů",
                    create: "Vytvořit učitele",
                },
                students: {
                    main: "Studenti",
                    list: "Seznam studentů",
                    create: "Vytvořit studenta",
                },
                rooms: {
                    main: "Místnosti",
                    list: "Seznam místností",
                    create: "Vytvořit místnost",
                },
                class: {
                    main: "Třídy",
                    scopes: "Obory",
                    list: "Seznam tříd",
                    create: "Vytvořit třídu",
                },
                school: {
                    main: "Škola",
                    information: "Informace o škole",
                    settings: "Nastavení školy"
                },
            },
            settings: "Nastavení",

            // System roles
            roles: {
                systemadmin: "Správce systému",
                isPrincipal: "Ředitelství",
                isClassTeacher: "třídní",
                classteacher: "Třídní učitel",
                manager: "Správce",
                teacher: "Učitel",
                parent: "Rodič",
                student: "Žák",
            },

            toasts: {
                success: "Úspěch!",
                error: "Chyba!",
            },
            errors: {
                noClassOnWeekend: "O víkendu se neučí.",
                noReceiversFound: "Nenalezeni žádní dostupní příjemci.",
            },

            successfulLogin: "Úspěšně ses přihlásil do systému.",

            // Dashboard
            change_is_instant: "Změna je okamžitá",
            changepasswordTitle: "Změna hesla",
            changepassword: "Změnit heslo",
            changingpassword: "Probíhá změna hesla",
            oldpassword: "Staré heslo",
            newpassword: "Nové heslo",
            againNewpassword: "Znova nové heslo",
            settings_main: "Základ",
            language: "Jazyk",
            languageTitle: "Změna jazyku systému",
            offlineModeChange: "Provedené změny budou aplikovány pouze lokálně.",
            theme: "Témata",
            themeTitle: "Změna vzhledu",
            logout: "Odhlásit se",
            print: "Tisk",
            editList: "Upravit seznam",

            alerts: {
                offlineMode: "Nacházíte se v <b>OFFLINE</b> módu. Veškeré informace jsou pouze z historie vaší poslední návštěvy.",
                notAllowedInOfflineMode: "V Offline módu toto není k dispozici.",
            },

            buttons: {
                update: "Aktualizovat",
                updating: "Aktualizuji..",
                failed: "Selhalo!",
                noInternetConnection: "Nepřipojeno k internetu",
                send: "Poslat",
                reply: "Odpovědět",
                replyAll: "Odpovědět všem",
            },

            timetable: {
                thisWeek: "Tento týden",
                nextWeek: "Příští týden",
                permanent: "Stálý",
            },
            
            homeworks: {
                unsubmitted: "Neodevzdané",
                noteForTeacher: "Poznámka pro učitele",
                save: "Zadat úkol",
                saving: "Ukládání úkolu",
                update: "Aktualizovat úkol",
                updating: "Aktualizování úkolu",
                startDate: "Zadáno",
                endDate: "Odevzdat",
            },

            classbook: {
                lessonNotation: "Zápis hodiny",
                attendance: "Docházka",
                assignment: "Zadání úkolu",
                newHomework: "Zadat domácí úkol",
                notes: "Poznámky",
                newNote: "Nová poznámka",
            },

            absence: {
                absence: "Absence",
                excused: "Omluvená absence",
                unexcused: "Neomluvená absence",
                non_count: "Nezapočítaná absence",
                late: "Pozdní příchod",
                early: "Dřívejší odchod",
                distance: "Distanční výuka",
            },

            pupilcard: {
                new: "Nový žák",
                personalDetails: "Osobní údaje",
                residence: "Bydliště",
                relatives: "Příbuzní",
            },

            tutoring: {
                new: "Nové doučování"
            },

            devices: {
                until: "Platné do ",
                notAnotherFound: "Žádné další zařízení nebyly nalezeny.",
            },

            messages: {
                privacy: "Zprávy poslané přes aplikaci Schoolingo se nedají považovat za soukromé. K zprávům mají přístup včetně přijemců i ředistelství školy a správci systému.",
                type: "Typ zprávy",
                message: "Zpráva",
                messagePlaceholder: "Vaše zpráva :)",
                receiver: "Příjemce zprávy",
                findreceiver: "Vyhledejte jméno přijemce",
                findstudent: "Vyhledejte jméno žáka",
                noSelected: "Nevybral jste žádného příjemce",

                types: {
                    message: "Klasická zpráva",
                    homework: "Odevzdání úkolu",
                    excusestudent: "Omluvení žáka",
                    ratestudent: "Ohodnocení žáka",
                    noticeboard: "Zpráva na nástěnku"
                },
            },

            traineeship: {
                companyName: "Název společnosti",
                officeAddress: "Adresa pobočky",
                traineeAddress: "Adresa praxe",
                CIN: "DIČ",
                activity: "Aktivity ve firmě",
                equipment: "Věci potřebné pro práci",

                addCompany: "Přidat firmu",
                addingCompany: "Firma se přidává"
            },

            subjects: "Předměty",
            subject: "Předmět",

            chronologically: "Chronologicky",
            backpack: "Batoh",

            firstName: "Jméno",
            lastName: "Příjmení",
            class: "Třída",
            sex: "Pohlaví",
            city: "Město",
            email: "Email",
            phone: "Telefon",
            web: "Webová stránka",
            contact: "Kontakt",
            description: "Popis",

            
            months: ["leden", "únor", "březen", "duben", "květen", "červen", "červenec", "srpen", "září", "říjen", "listopad", "prosinec"],

            active: "Ativní",
            all: "Všechny",

            // Dropdowns
            dropdowns: {
                user: {
                    linkedUsers: "Propojené účty",
                    noLinked: "Nemáte propojené další účty",
                }
            },

            or: "nebo",
            close: "Zavřít",
            loading: "Načítání..",

            // Authentication
            login_title: "Přihlášení",
            forgot_pass: "Zapomenuté heslo?",
            reset_pass: "Resetovat heslo",
            reseting_pass: "Posílání e-mailu.",
            remembered_pass: "Vzpomněli jste si na heslo?",
            login_btn: "Přihlásit se",
            logining_btn: "Přihlašování..",
            loading_user: "Probíhá načítání vašich dat ze systému..",
            login_formTitle: "Přihlášení do školního systému",
            login_qrcodeTitle: "se přihlaš pomocí QR kódu",
            scan_qrcode: "Naskejnute QR kód v <b>mobilní aplikaci</b> pro rychlé přihlášení",
            username: "Uživatelské jméno",
            password: "Heslo",
            required: "Povinné",
            atleast1student: "Vyber alespoň jednoho studenta",
            cannotbesamedate: "Nemůžeš zadat stejný datum",
            not_same: "Neshoduje se",
            is_same: "Nové heslo je stejné jako staré",
            changePasswordLogout: "Změna hesla Vás automaticky odhlásí ze všech zařízení.",
            wrong_password: "Špatné heslo",
            password_changed: "Heslo bylo úspěšně změněno.",
            cantChangePasswordInOfflineMode: "Nemůžeš změnit heslo v Offline Módu!",
            user_not_found: "Uživatel nenalezen"
        },
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