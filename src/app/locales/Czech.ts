export default {
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
        gdpr: "GDPR",
        cookies: "Cookies",
        system: "O systému",
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
        print: "Vytisknout rozvrh"
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

        extendService: "Prodloužit službu"
    },

    absence: {
        absence: "Absence",
        excused: "Omluvená absence",
        unexcused: "Neomluvená absence",
        non_count: "Nezapočítaná absence",
        late: "Pozdní příchod",
        early: "Dřívejší odchod",
        distance: "Distanční výuka",
        writeAbsenceTitle: "Zapisování absence",
        writeAbsenceBtn: "Zapsat absenci"
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
        thisDevice: "Aktuální připojení",
        anotherDevices: "Ostatní zařízení",
        notAnotherFound: "Žádné další zařízení nebylo nalezeno.",
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
        addingCompany: "Firma se přidává",
    },

    school: {
        name: "Název školy",
        startHours: "Začátek školy (formát: Hodin:minut)",
        LessonLength: "Délka vyučovací hodiny v minutách",
        defaultBreakTime: "Základní délka přestávky",
        defaultBreakTimeNote: "Nejčastější délka přestávek na škole",


        saveSettings: "Uložit nastavení",
        savingSettings: "Ukládám nastavení",
    },

    subjects: "Předměty",
    subject: "Předmět",

    chronologically: "Chronologicky",
    backpack: "Batoh",

    firstName: "Jméno",
    lastName: "Příjmení",
    address: "Adresa",
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
    user_not_found: "Uživatel nenalezen",
    tryOnAnotherDevice: "Vyzkoušejte školním systém na také svém chytrém zařízení"
};