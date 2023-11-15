import { Injectable } from "@angular/core";
import { UserService } from "./User";
import { Teacher, UserMain, UserPermissions } from "./User.d";
import { Holiday, Lesson, ScheduleLessonHour, SchoolBreaks, SchoolSettings, Subject, TTableDay, TTableLesson, grade } from "./Board.d";
import { Sidebar, SidebarGroup, SidebarItem } from "./Sidebar";
import { SocketService } from "./Socket";
import { Tabs } from "@Components/Tabs/Tabs";

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
        private socketService: SocketService,
        private tabs: Tabs
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

        this.refreshTimetable();
    }

    //?-- Functions
    ///.-- Add Day To Date
    public addDayToDate(date: Date, days: number): Date {
        date.setDate(date.getDate() + days);
        return date;
    }

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

    public isDayWeekend(date: Date): boolean {
        return (date.getDay() === 0 || date.getDay() === 6);
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
    ];

    public getSubjects(): Subject[] {
        return this.subjects;
    }

    public getSubject(id: number): Subject | null {
        if (this.subjects[id]) return this.subjects[id];
        return null;
    }

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

    public getTeacher(id: number): Teacher | null {
        if (this.teachers[id]) return this.teachers[id];
        return null;
    }


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
                start = hours + ':' + this.addZeros(minutes, 2);
            } else start = this.SchoolSettings.startTime[0] + ':' + this.addZeros(this.SchoolSettings.startTime[1], 2);

            let ssp = start.split(':');
            let hours = parseInt(ssp[0]);
            let minutes = (parseInt(ssp[1]) + this.SchoolSettings.lessonHour);
            while (minutes >= 60) {
                hours += 1;
                minutes -= 60;
            }

            end = hours + ':' + this.addZeros(minutes, 2); 
        
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

    private selectedWeek: number | null = this.thisWeek;
    public selectWeek(week: number | null) {
        this.selectedWeek = week;
    }
    public isTimetableWeek(): boolean {
        return this.selectedWeek != null;
    }
    public getTimetableWeek(): number {
        return this.selectedWeek as number;
    }

    public getFirstDayOfWeek(week: number): Date {
        let firstDayOfSchool = new Date(this.today.getFullYear(),8,1);
        let lastDayOfSchool = new Date(this.today.getFullYear()+1,5,30);

        let monday = new Date(this.today.getFullYear(),0,1);
        monday.setDate(monday.getDate() + week * 7 + (monday.getDay() == 0 ? -6:0));
        if (monday.getTime() < firstDayOfSchool.getTime()) {
            monday.setFullYear(lastDayOfSchool.getFullYear());
            monday.setDate(monday.getDate() - 1);
        }
        return monday;
    }

    private timetable: TTableDay[] = [];
    public getTimetable(): TTableDay[] {
        return this.timetable;
    }

    public refreshTimetable(): void {

        let week = this.getTimetableWeek();

        let tTable: TTableDay[] = [];
        let monday = this.getFirstDayOfWeek(week);

        this.lessons.forEach((_: Lesson[], index: number) => {
            let dda = this.addDayToDate(monday, (index < 1) ? index : 1);

            let day: TTableDay = {
                date: [dda.getDate(),dda.getMonth() + 1,dda.getFullYear()],
                day: this.days[index],
                lessons: [],
                isFullDay: false
            };

            // Check holidays
            let holidays = this.filterHoliday(dda.getDate(), dda.getMonth(), dda.getFullYear());
            if (holidays.length > 0 && this.selectedWeek !== null) {
                day.holiday = holidays[0];
            }

            if (!day.holiday) {
                _.forEach((lesson: Lesson, index) => {
                    let { ...subject } = this.getSubject(lesson.subject) as Subject ?? {};
                    let { ...teacher } = this.getTeacher(lesson.teacher) as Teacher ?? {};
    
                    if (this.selectedWeek == null && lesson.type && lesson.type !== 0 && subject) {
                        subject[0] = ((lesson.type === 1) ? 'L:' : 'S:') + subject[0];
                    }
    
                    if (!subject || !teacher ||
                        (
                            lesson.type &&
                            this.selectedWeek !== null &&
                            (
                                (week % 2 === 0 && lesson.type === 1) ||
                                (week % 2 === 1 && lesson.type === 2)
                            )
                        )
                    ) {
                        day.lessons.push({ isEmpty: true });
                    } else {
                        day.lessons.push({ subject: subject as Subject, teacher: teacher as Teacher })
                    }
    
                    if (index == _.length - 1 && index <= this.getScheduleHours().length) {
                        for(let i = 0;i < (this.getScheduleHours().length - 1) - index;i++) {
                            day.lessons.push({ isEmpty: true })
                        }
                    }
                });
            } else {
                day.isFullDay = true;
            }

            tTable.push(day);
        });
        this.timetable = tTable;
    }

    // Klasifikace
    private grades: grade[] = [
        {
            subjectId: 11,
            title: 'T01 BA',
            weight: 10,
            date: new Date(2023, 9, 14),
            grade: 1
        }, {
            subjectId: 3,
            title: 'Srovnávací test',
            weight: 10,
            date: new Date(2023, 9, 18),
            grade: 2
        }, {
            subjectId: 8,
            title: 'Nepravidelná slovesa',
            weight: 10,
            date: new Date(2023, 9, 19),
            grade: 1
        }, {
            subjectId: 4,
            title: 'T1',
            weight: 10,
            date: new Date(2023, 9, 20),
            grade: 1
        }, {
            subjectId: 6,
            title: 'Seminární práce_1',
            weight: 10,
            date: new Date(2023, 9, 26),
            grade: 1
        }, {
            subjectId: 8,
            title: 'Gramatické cvičení',
            weight: 10,
            date: new Date(2023, 9, 27),
            grade: 1
        }, {
            subjectId: 8,
            title: 'Doplňování slov do vět',
            weight: 10,
            date: new Date(2023, 9, 27),
            grade: 3
        }, {
            subjectId: 8,
            title: 'Poslech',
            weight: 10,
            date: new Date(2023, 9, 27),
            grade: 1
        }, {
            subjectId: 10,
            title: 'test',
            weight: 3,
            date: new Date(2023, 9, 27),
            grade: 1
        }, {
            subjectId: 4,
            title: 'T2',
            weight: 10,
            date: new Date(2023, 10, 2),
            grade: 1
        },
    ];

    public getGrades(): grade[] {
        return this.grades;
    }

    public getPrumerBySubject(subject: number): string {
        let grades = this.getGradesBySubject(subject);
        let total = 0;
        let total_devide = 0;
        grades.forEach(_ => {
            total += _.grade * _.weight;
            total_devide += _.weight;
        });
        return Number(total / total_devide).toFixed(2).replace('.', ',');
    }

    public getGradesBySubject(subject: number): grade[] {
        return this.grades.filter(_ => _.subjectId == subject);
    }

    public getListOfGradesBySubject(): any[] {
        let a: any[] = [];
        
        this.getSubjects().forEach((subject, index) => {
            if (this.getGradesBySubject(index).length == 0) return;
            a.push({
                subjectIndex: index,
                subject: subject,
                grades: this.getGradesBySubject(index)
            });
        });

        return a;
    }

    public listOfGradesOrderedBySubject: any[] = this.getListOfGradesBySubject();

    /// Holidays
    private holidays: Holiday[] = [{
        date: { day: 1, month: 1 },
        name: "Nový rok"
    }, {
        date: { day: 28, month: 9 },
        name: "Den české státnosti"
    }, {
        date: { day: 28, month: 10 },
        name: "Den vzniku samostatného československého státu"
    }, {
        date: { day: 17, month: 11 },
        name: "Den boje za svobodu a demokracii"
    }, {
        date: { day: 24, month: 12 },
        name: "Štedrý den"
    }, {
        date: { day: 25, month: 12 },
        name: "1. svátek vánoční"
    }, {
        date: { day: 26, month: 12 },
        name: "2. svátek vánoční"
    }];
    public getHolidays(): Holiday[] {
        return this.holidays;
    }
    public filterHoliday(day: number, month: number, year: number = new Date().getFullYear()): Holiday[] {
        let hol = this.holidays.filter((holiday) => holiday.date?.day == day && holiday.date.month == month + 1);
        if (hol.length > 0) return hol;
        return [];
    }


}