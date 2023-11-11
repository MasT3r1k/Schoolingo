import { Injectable } from "@angular/core";

export type languages = 'cz' | 'en';

@Injectable()
export class Locale {
    constructor(
        // Imports
        ) {}
    private locales: Record<languages, any> = {
        cz: {
            // Language settings
            name: "čeština",
            flag: "data:image/webp;base64,UklGRuQBAABXRUJQVlA4TNcBAAAv/kAqAFegKJKk5tIzuwgowL8eNGDDTAAyFbRRQWoV1PBZgylqJEn57kpgOvRv7QTc/Mf///Xpu2RAQ8pNQ2RAgQ7N1QE3kWSF0r0LcfDSBQvPAhaQgISVgAQs4PXX5BH9n4D80Z9G5xt0fnhOvNPofIPOD8+Jdxqdb9D54TnxTqPzDTo/PCfeaXS+QeeH58Q7jc436PzwnHin0fkGnR+eE+80Ot+g88Nz4p1G5xt0fnhOvNPofIPOD8+Jdxqdb9D54TnxTqPzDTo/PCfeaXS+QeeH58Q7jc436PzwnHin0fkGnR+eE+80Ot+g88Nz4p1G5xt0fnhOvNPofIPOD8+Jdxqdb9D54TnxTqPzDTo/PCfeaXS+QeeH58Qrff3/tSm41eH2EFwJbgpudbg9BFeCm4JbHW4PwZXgpuBWh9tDcCW4KbjV4fYQXAluCm51uD0EV4Kbglsdbg/BleCm4FaH20NwJbgpuNXh9hBcCW4KbnW4PQRXgpuCWx1uD8GV4KbgVofbQ3AluCm41eH2EFwJbgpudbg9BFeCm4JbHW4PwZXgpuBWh9tDcCW4KbjV4fYQXAluCm51uD0EV4Kbglsdbg/BleCm4FaH20NwJbgpuNXh9hBciQ4A",    // DO NOT TOUCH THIS! ITS ENCODED BASE64!

            // Sidebar
            sidebar: {
                home: "Můj přehled",
                marks: {
                    main: "Klasifikace",
                    interm: "Průběžná klasifikace",
                    midterm: "Pololetní klasifikace"
                },
                teach: {
                    main: "Výuka",
                    timetable: "Rozvrh",
                    homeworks: "Domácí úkoly",
                    substitution: "Suplování",
                    subjects: "Přehled předmětů"
                },

                absence: "Absence",
                calendar: "Kalendář",
                user: {
                    main: "Uživatel",
                    devices: "Přihlášené zařízení",
                    settings: "Nastavení"
                },
                person: {
                    main: "Osoby",
                    list: "Seznam osob",
                    create: "Vytvořit osobu"
                },
                teachers: {
                    main: "Učitelé",
                    list: "Seznam učitelů",
                    create: "Vytvořit učitele"
                },
                students: {
                    main: "Studenti",
                    list: "Seznam studentů",
                    create: "Vytvořit studenta"
                },
                rooms: {
                    main: "Místnosti",
                    list: "Seznam místností",
                    create: "Vytvořit místnost"
                },
                class: {
                    main: "Třídy",
                    scopes: "Obory",
                    list: "Seznam tříd",
                    create: "Vytvořit třídu"
                }
            },
            // System roles
            roles: {
                systemadmin: "Správce systému",
                manager: "Správce",
                principal: "Ředitelství",
                teacher: "Učitel",
                parent: "Rodič",
                student: "Žák"
            },

            toasts: {
                success: "Úspěch!"
            },

            successfulLogin: "Úspěšně ses přihlásil do systému.",

            // Dashboard
            change_is_instant: "Změna je okamžitá",
            changepassword: "Změnit heslo",
            oldpassword: "Staré heslo",
            newpassword: "Nové heslo",
            againNewpassword: "Znova nové heslo",
            language: "Jazyk",
            theme: "Témata",
            logout: "Odhlásit se",
            print: "Tisk",

            timetable: {
                thisWeek: "Tento týden",
                nextWeek: "Příští týden",
                permanent: "Stálý"
            },
            subjects: "Předměty",
            chronologically: "Chronologicky",

            // Dropdowns
            dropdowns: {
                user: {
                    linkedUsers: "Propojené účty",
                    noLinked: "Nemáte propojené další účty"
                }
            },

            // Authentication
            login_title: "Přihlášení",
            required: "Povinné",
            not_same: "Neshoduje se",
            is_same: "Nové heslo je stejné jako staré",
            wrong_password: "Špatné heslo",
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
                    settings: "Settings"
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

            // Authentication
            login_title: "Login",
            required: "Required",
            not_same: "It doesn't match",
            is_same: "The new password is the same as the old one",
            wrong_password: "Wrong password",
            user_not_found: "User not found"

        }

    }

    public getLanguages(): languages[] {
        let list: languages[] = [];
        Object.keys(this.locales).forEach((value) => list.push(value as languages));
        return list;
    }

    public setUserLocale(lng: languages) {
        if (true) {
            // this.socket.socket.emit('updateUser', { user: 'me', language: lng });
        } else {
            console.log('This change is only on this device.')
        }
        // this.cache.save('settings', {locale: lng});
    }

    public getUserLocale(): languages {
        return this.getLanguages()[0];
        // return this.cache.get('settings', 'locale') as languages;
    }

    public setDefaultLocale(): void {
        // this.cache.save('settings', {locale: 'cz'});
    }

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
                (locale == 'cz' || this.getUserLocale() == 'cz') ?
                '[' + path + ']' : this.getLocale(path, 'cz');
            }
        })
        return _locale;
    }

}