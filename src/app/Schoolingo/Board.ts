import { Injectable } from "@angular/core";
import { UserService } from "./User";
import { Teacher, UserMain, UserPermissions } from "./User.d";
import { Lesson, ScheduleLessonHour, SchoolBreaks, SchoolSettings, Subject } from "./Board.d";
import { Sidebar, SidebarGroup, SidebarItem } from "./Sidebar";
import { SocketService } from "./Socket";

// Add getWeek function to Date
declare global {
    interface Date {
        getWeek: Function;
    }
}

Date.prototype.getWeek = function() {
    var d: Date = new Date(+this);
    d.setHours(0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    return Math.ceil((((d.getTime() - new Date(d.getFullYear(), 0, 1).getTime()) / 8.64e7) + 1) / 7);
};


@Injectable()
export class Schoolingo {

    //?-- Main
    ///.-- SCHOOL SETTINGS
    // Days
    public days: string[] = ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'];
    public full_days: string[] = ['Pondělí', 'Úterý', 'Středa', 'Čtvrtek', 'Pátek', 'Sobota', 'Neděle'];

    // School options
    public SchoolSettings: SchoolSettings = {
        startTime: [8, 0],
        lessonHour: 45,
        breakTimeMinutes: 5
    }

    public SchoolBreaks: SchoolBreaks[] = [
        {
            beforeHour: 3,
            minutes: 10
        }, {
            beforeHour: 4,
            minutes: 20
        }
    ];
    

    ///.-- INTERVALS
    private intervals: Record<string, any> = {};
    private tempData: Record<string, any> = {};
    constructor(
        private userService: UserService,
        private sidebar: Sidebar,
        private socketService: SocketService
    ) {
        // Listening for changes of connection to network
        window.addEventListener("offline", (e) => {
            this.wifiConnection = false;
        });
            
        window.addEventListener("online", (e) => {
            this.wifiConnection = true;
        });

        setInterval(() => {
            // Updating this today :)
            this.today = new Date();
            this.thisWeek = this.today.getWeek();
        }, 1000);
    }

    //?-- Functions

    ///.-- Refresh connection
    public refreshConnection(): void {
        let firstIntervalName  = 'refreshConnectionFirstInterval';
        let secondIntervalName = 'refreshConnectionSeconInterval';

        clearInterval(this.intervals?.[firstIntervalName ]);
        clearInterval(this.intervals?.[secondIntervalName]);

        this.tempData['refreshingConnection'] = true;
        this.intervals[firstIntervalName] = setInterval(() => {
            if (this.socketService.getSocket().Socket?.connected !== true) {
                this.tempData['refreshingConnection'] = 'error';
                this.intervals[secondIntervalName] = setInterval(() => {
                    this.tempData['refreshingConnection'] = undefined;
                    clearInterval(this.intervals[secondIntervalName]);
                }, 2000)
            }else{
                this.tempData['refreshingConnection'] = undefined;
            }
            clearInterval(this.intervals[firstIntervalName]);
        }, 5000);

    }

    public getRefreshingText(): string {
        if (this.wifiConnection == false) {
            return '<i class=\'fa-solid fa-xmark\'></i> Nepřipojeno k internetu';
        }
        if (this.tempData['refreshingConnection'] == true) {
            return '<i class=\'fa fa-circle-notch fa-spin\'></i> Aktualizuji..';
        }
        if (this.tempData['refreshingConnection'] == 'error') {
            return '<i class=\'fa-solid fa-xmark\'></i> Selhalo';
        }
        return 'Aktualizovat';
    }

    /**
     * @returns username output with placeholders its used in user dropdown in board
     */
    public getUsernamePlaceholders(): string {
        let user = this.userService.getUser() as UserMain;
        let output = '';
        if (!user) {
            return 'Načítání';
        }

        if (user.type == 'student') {
            output += "%class% ";
        }
        output += "%first-name% %last-name% ";

        return output;

    }

    /**
     * This function change %placeholder% to value of placeholder
     * @param text text including %placeholder%
     * @returns 
     */
    public formatPlaceholders(text: string): string {
        let user = this.userService?.getUser();
        if (!user) return text;
        let changedText = text
        .replaceAll('%first-name%', (user as UserMain)?.firstName)
        .replaceAll('%last-name%', (user as UserMain)?.lastName)
        .replaceAll('%username%', (user as UserMain)?.username)
        .replaceAll('%locale%', (user as UserMain)?.locale)
        .replaceAll('%sex%', (user as UserMain)?.sex)
        .replaceAll('%class%', (user as UserMain)?.class)
        .replaceAll('%role%', (user as UserMain)?.type)
        return changedText;
    }

    /**
     * Adds zeros in front of number based on length
     * @param number number where you want change length
     * @param len length of number
     * @returns number 128 to length 5 is set to 00128
     */
    public addZeros(number: number, len: number = 2): string {
        if (number.toString().length >= len) return number.toString();
        let num: string = '';
        for(let i = 0;i <= len;i++) {
            if (number.toString().length >= len - i) {
                return num + number.toString();
            }
            num += '0';
        }
        return number.toString();
    }


    //?-- Connection
    private wifiConnection: boolean = window.navigator.onLine;

    //?-- Permission system
    /**
     * Check if user has access to somewhere
     * @param required here you put required permissions needed to access this page/card/section
     * @returns 
     */
    public checkPermissions(required: UserPermissions[]): boolean {
        let user = this.userService.getUser() as UserMain;
        if (!user && (required.includes('onlynonlogged') || required.includes('nonlogged'))) return true;
        if (!user) return false;
        if (user && required.includes('onlynonlogged')) return false;
        return (required.includes('all') || (required.includes(user.type)));
    }

    //?-- Sidebar system
    public sidebarToggled: boolean = false;
    
    /**
     * Returns dashboard's sidebar in array
     * @returns visible sidebar to user
     */
    public getBoardSidebar(): SidebarGroup[] {
        let boardSidebar = this.sidebar.data as SidebarGroup[];
        let newSidebar: SidebarGroup[] = [];

        boardSidebar.forEach((section: SidebarGroup) => {
            if (section.permission && this.checkPermissions(section.permission as UserPermissions[]) == false) return;
            if (section.items.length == 0) return;
            let items: SidebarItem[] = [];
            section.items.forEach((item: SidebarItem) => {
                if (item.permission && this.checkPermissions(item.permission as UserPermissions[]) == false) return;
                items.push(item);
            })
            newSidebar.push({ label: section.label, items: items });
        })
        return newSidebar;
    }

    public boardSidebar = this.getBoardSidebar();


    //?-- Calendar
    private today: Date = new Date();
    private thisWeek: number = this.today.getWeek();

    /**
     * @returns Today's date
     */
    public getToday(): Date {
        return this.today;
    }

        /**
     * @returns Today's Week number
     */
    public getThisWeek(): number {
        return this.thisWeek;
    }


    //?-- Timetable
    private subjects: Subject[] = [
        ['CJL', 'Český jazyk a Literatura'],                // 0
        ['OSY', 'Operační systémy'],                        // 1
        ['HW', 'Hardware'],                                 // 2
        ['MAT', 'Matematika'],                              // 3
        ['FYZI', 'Fyzika'],                                 // 4
        ['APS', 'Aplikační software'],                      // 5
        ['OBN', 'Občanská nauka'],                          // 6
        ['PS', 'Počítačové sítě'],                          // 7
        ['AJ1', 'Anglický jazyk'],                          // 8
        ['NJ2', 'Německý jazyk'],                           // 9
        ['CHI', 'Chemie a materiály'],                      // 10
        ['PRAI', 'Praktická cvičení'],                      // 11
        ['ICT', 'Informační a komunikační technologie'],    // 12
        ['PVA', 'Programování a vývoj aplikací'],           // 13
        ['TEV', 'Tělesná výchova']                          // 14
    ]

    private teachers: Teacher[] = [
        {                           // 0
            firstName: "Pavel",
            lastName: "Englický",
            sex: "muž",
        }, {                        // 1
            firstName: "Milan",
            lastName: "Průdek",
            sex: "muž",
        }, {                        // 2
            firstName: "Milan",
            lastName: "Janoušek",
            sex: "muž",

        }, {                        // 3
            firstName: "Olga",
            lastName: "Procházková",
            sex: "žena"
        }, {                        // 4
            firstName: "Luboš",
            lastName: "Vejvoda",
            sex: "muž",

        }, {                        // 5
            firstName: "Jakub",
            lastName: "Pizinger",
            sex: "muž",

        }, {                        // 6
            firstName: "Ludmila",
            lastName: "Klavíková",
            sex: "žena"
        }, {                        // 7
            firstName: "Radka",
            lastName: "Pecková",
            sex: "žena"
        }, {                        // 8
            firstName: "Milena",
            lastName: "Koudová",
            sex: "žena"
        }, {                        // 9
            firstName: "Kornelie",
            lastName: "Třeštíková",
            sex: "žena"
        }, {                        // 10
            firstName: "Václava",
            lastName: "Novotná",
            sex: "žena"
        }, {                        // 11
            firstName: "Břetislav",
            lastName: "Bakala",
            sex: "muž",

        }, {                        // 12
            firstName: "Luděk",
            lastName: "Štěpán",
            sex: "muž",

        }
    ];


    public getScheduleHours(): ScheduleLessonHour[] {
        let hours: number = 0;
        let les: ScheduleLessonHour[] = [];

        this.lessons.forEach(_ => {
            if (_.length > hours) {
                hours = _.length;
            }
        })

        for(let i=0;i < hours;i++) {
            let start;
            let end;
            if (les[i - 1]?.end) {
                let sp = les[i - 1].end.split(':');
                let hours = parseInt(sp[0]);
                let breakTime = this.SchoolBreaks.find((_) => _.beforeHour == i + 1)?.minutes ?? this.SchoolSettings.breakTimeMinutes
                let minutes = (parseInt(sp[1]) + breakTime);
                while (minutes >= 60) {
                    hours += 1;
                    minutes -= 60;
                }
                start = hours + ':' + this.addZeros(minutes);
            } else start = this.SchoolSettings.startTime[0] + ':' + this.addZeros(this.SchoolSettings.startTime[1], 2);

            let ssp = start.split(':');
            let hours = parseInt(ssp[0]);
            let minutes = (parseInt(ssp[1]) + this.SchoolSettings.lessonHour);
            while (minutes >= 60) {
                hours += 1;
                minutes -= 60;
            }

            end = hours + ':' + this.addZeros(minutes); 
        
            les.push({ start, end });
        }
        return les;
    }    


    private lessons: Lesson[][] = [
        [               // Monday
            {
                subject: 1,
                teacher: 1
            },
            {
                subject: 2,
                teacher: 2
            },
            {
                subject: 3,
                teacher: 3
            },
            {
                subject: 4,
                teacher: 4
            },
            {
                subject: 5,
                teacher: 5,
                type: 1
            },
            {
                subject: 5,
                teacher: 5,
                type: 1
            },
        ],
        [               // Tuesday
            {
                subject: 6,
                teacher: 6
            },
            {
                subject: 7,
                teacher: 7
            },
            {
                subject: 0,
                teacher: 0
            },
            {
                subject: 8,
                teacher: 8
            },
            {
                subject: 3,
                teacher: 3
            },
            {
                subject: 9,
                teacher: 9
            },
            {
                subject: -1,
                teacher: -1
            },
            {
                subject: 10,
                teacher: 10
            },
        ],
        [               // Wednesday
            {
                subject: 3,
                teacher: 3
            },
            {
                subject: 0,
                teacher: 0
            },
            {
                subject: 1,
                teacher: 1
            },
            {
                subject: 13,
                teacher: 7
            },
            {
                subject: 2,
                teacher: 2
            },
            {
                subject: 4,
                teacher: 4
            },
            {
                subject: -1,
                teacher: -1
            },
            {
                subject: 9,
                teacher: 9
            }
        ],
        [               // Thursday
            {
                subject: 11,
                teacher: 11
            },
            {
                subject: 11,
                teacher: 11
            },
            {
                subject: 12,
                teacher: 5
            },
            {
                subject: 12,
                teacher: 5
            },
            {
                subject: 8,
                teacher: 8
            },
            {
                subject: 8,
                teacher: 8
            },
            {
                subject: -1,
                teacher: -1
            },
            {
                subject: 0,
                teacher: 0
            },
        ],
        [               // Friday
            {
                subject: 13,
                teacher: 5
            },
            {
                subject: 13,
                teacher: 5
            },
            {
                subject: 7,
                teacher: 7
            },
            {
                subject: 7,
                teacher: 7
            },
            {
                subject: 14,
                teacher: 12
            },
            {
                subject: 14,
                teacher: 12
            },
        ]
    ];

    public getTimetableLessons(): Lesson[][] {
        return this.lessons;
    }

}