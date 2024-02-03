import { Injectable } from "@angular/core";
import { UserService } from "./User";
import { Teacher, UserMain, UserPermissions } from "./User.d";
import { Absence, Holiday, Lesson, Room, ScheduleLessonHour, SchoolBreaks, SchoolSettings, Subject, TTableDay, TTableLesson, grade } from "./Board.d";
import { Sidebar, SidebarGroup, SidebarItem } from "./Sidebar";
import { SocketService } from "./Socket";
import { Cache } from "./Cache";
import { Locale } from "./Locale";
import { Logger } from "./Logger";

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

export type SECURITY_modals = 'autologout' | '';


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

    private offlineMode: boolean = false;
    public getOfflineMode(): boolean {
        return this.offlineMode;
    }

    public toggleOfflineMode(): void {
        this.setOfflineMode(!this.getOfflineMode());
    }

    public setOfflineMode(status: boolean): void {
        this.offlineMode = status;
    }
    

    ///.-- INTERVALS
    private intervals: Record<string, any> = {};
    private tempData: Record<string, any> = {};
    constructor(
        private userService: UserService,
        private sidebar: Sidebar,
        private socketService: SocketService,
        private storage: Cache,
        private locale: Locale,
        private logger: Logger
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

    /**
     * Output of connecting to server
     * @returns status of connection to server
     */

        public getRefreshingText(): string {
            if (this.getOfflineMode() && this.SECURITY_modal != 'autologout') {
                return this.locale.getLocale('login_btn');
            }
            if (this.SECURITY_modal == 'autologout') {
                return '<div class=\'btn-loader mr\'></div> ' + this.locale.getLocale('logining_btn');
            }
            if (this.wifiConnection == false) {
                return '<i class=\'ti ti-x\'></i> ' + this.locale.getLocale('buttons/noInternetConnection');
            }
            if (this.tempData['refreshingConnection'] == true) {
                return '<div class=\'btn-loader mr\'></div>' + this.locale.getLocale('buttons/updating');
            }
            if (this.tempData['refreshingConnection'] == 'error') {
                return '<i class=\'ti ti-x\'></i> ' + this.locale.getLocale('buttons/failed');
            }
            return this.locale.getLocale('buttons/update');
        }
    

    ///.-- Refresh connection
    /** 
     *  Refresh connection to server, with updating output text
     * @linkcode getRefreshingText() 
     */
    public refreshConnection(): void {
        let firstIntervalName  = 'refreshConnectionFirstInterval';
        let secondIntervalName = 'refreshConnectionSeconInterval';

        clearInterval(this.intervals?.[firstIntervalName ]);
        clearInterval(this.intervals?.[secondIntervalName]);

        if (this.getOfflineMode()) {
            this.SECURITY_modal = 'autologout';
            return;
        }

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

    public SECURITY_modal: SECURITY_modals = '';

    public hideModal(): void {
      this.SECURITY_modal = '';
    }

    public setupSocket(): void {

        this.socketService.addFunction('token', (data: any) => {
          if (!data.status || data?.user == undefined || data.status == 401) {
            this.SECURITY_modal = 'autologout';
            this.logger.send('User', 'Logging out due problem with token.');
            this.socketService.getSocket().Socket?.disconnect();
            this.socketService.connectAnon();
            return;
          }
          if (data.status === 1) {
            console.log(data.user);
    
            data.user.class = JSON.parse(data.user.class as string);
            data.user.teacherId = data.teacherId ?? null;
            data.user.studentId = data.studentId ?? null;
            this.userService.setUser(data.user as UserMain);
            this.boardSidebar = this.getBoardSidebar();

            this.logger.send('Socket', 'Updated user data');
          }
        });
    
    
        this.socketService.addFunction('subjects', (subjects: any[]) => {
          let subjectList: Subject[] = [];
          for(let i = 0;i < subjects.length;i++) {
            subjectList.push([subjects[i].subjectId, subjects[i].shortcut, subjects[i].label])
          }
          this.setSubjects(subjectList);
          this.logger.send('Socket', 'Updated list of subjects');
        });
    
        this.socketService.addFunction('rooms', (rooms: any[]) => {
          this.setRooms(rooms);
          this.logger.send('Socket', 'Updated list of rooms');
        });
    
    
        this.socketService.addFunction('teachers', (teachers: any[]) => {
          this.setTeachers(teachers);
          this.logger.send('Socket', 'Updated list of teachers');
        });
    
        this.socketService.addFunction('timetable', (timetable: any[]) => {
          let lessons: Lesson[][][] = [];
      
          for(let i = 0;i < timetable.length;i++) {
            if (!lessons[timetable[i].day]) lessons[timetable[i].day] = [];
            let d0: number = 1;
            let d1: number = 1;
            while(timetable[i].day != 0 && !lessons[timetable[i].day - 1 - d0] && d0 < this.days.length && (timetable[i].day - 1 - d0) >= 0) {
              lessons[timetable[i].day - 1 - d0] = [];
              d0++;
            }
            while(timetable[i].hour != 0 && lessons[timetable[i].day] && (timetable[i].hour - 1 - d1 >= 0) && !lessons[timetable[i].day]?.[timetable[i].hour - 1 - d1] && d1 < timetable[i].hour) {
              lessons[timetable[i].day][timetable[i].hour - 1 - d1] = [{ 
                subject: -1,
                teacher: -1
              }];
              d1++;
            }
    
            if (!lessons[timetable[i].day][timetable[i].hour - 1]) {
              lessons[timetable[i].day][timetable[i].hour - 1] = [];
            }
    
            if (lessons?.[timetable[i].day]?.[timetable[i].hour -1]?.[0]?.subject == -1 && lessons?.[timetable[i].day]?.[timetable[i].hour -1]?.[0]?.teacher == -1) {
              lessons[timetable[i].day][timetable[i].hour - 1] = [];
            }
            lessons[timetable[i].day][timetable[i].hour - 1].push({
              subject: timetable[i].subject,
              teacher: timetable[i].teacherId,
              room: timetable[i].room,
              class: timetable[i]?.class,
              group: {
                id: timetable[i].groupId,
                text: timetable[i].groupName,
                num: timetable[i].groupNum
              },
              type: timetable[i].type
            });
          }
          this.setLessons(lessons);
          this.logger.send('Socket', 'Updated timetable');
        });    
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
            output += "%class%, ";
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
        let user = this.userService?.getUser() as UserMain;
        if (!user) return text;
        let changedText = text
        .replaceAll('%first-name%', user.firstName)
        .replaceAll('%last-name%', user.lastName)
        .replaceAll('%username%', user.username)
        .replaceAll('%locale%', user.locale)
        .replaceAll('%sex%', user.sex)
        .replaceAll('%class%', (user.class) ? user.class.join(', ') : '')
        .replaceAll('%role%', user.type)
        return changedText;
    }

    /**
     * Adds zeros in front of number based on length
     * @param number number where you want change length 
     * @param len length of number
     * @returns number 128 to length 5 is set to 00128
     */

    public addZeros(num: number, len: number = 2): string {
        if (num.toString().length >= len) {
            return num.toString();
        }
        return new Array(len - num.toString().length).fill('0').join('') + num.toString();
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
        return (required.includes('all') || (required.includes('classteacher') && user.type == 'teacher' && user?.class != undefined) || required.includes(user.type));
    }

    //?-- Sidebar system
    public sidebarToggled: boolean = false;
    
    /**
     * Returns dashboard's sidebar in array
     * @returns visible sidebar to user
     */
    public getBoardSidebar(): SidebarGroup[] {
        let boardSidebar = JSON.parse(JSON.stringify(this.sidebar.data));
        let newSidebar: SidebarGroup[] = [];

        boardSidebar.forEach((section: SidebarGroup) => {
            if (section.permission && !this.checkPermissions(section.permission)) return;
            if (section.items.length == 0) return;
            let items: SidebarItem[] = [];
            section.items.forEach((item: SidebarItem) => {
                if (item.permission && !this.checkPermissions(item.permission)) return;
                if (item.children) {
                    let delC: number = 0;
                    let children = JSON.parse(JSON.stringify(item.children)) as SidebarItem[];
                    children.forEach((child: SidebarItem, index: number) => {
                        if (!(child.permission && !this.checkPermissions(child.permission))) return;
                        item.children?.splice(index - delC, 1);
                        delC++;
                    })
                }
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

    /**
     * Check if day is weekend
     * @param date date of day
     * @returns boolean if day is weekend
     */
    public isDayWeekend(date: Date): boolean {
        return (date.getDay() === 0 || date.getDay() === 6);
    }


    //?-- Timetable
    private timetableLessonsLast: Lesson[][][] = [];
    private declare timetableSelectedWeekLast: number;
    private subjects: Subject[] = [];
    /**
     * Set subjects to memory, save to storage and refresh timetable
     * @param subjects Subjects from server
     */
    public setSubjects(subjects: Subject[]): void {
        this.subjects = subjects;
        this.storage.save('subjects', subjects);
        this.refreshTimetable();
    }

    /**
     * Get list of all subjects
     * @returns Subjects
     */
    public getSubjects(): Subject[] {
        return this.subjects;
    }

    /**
     * Search subject and return data about it
     * @param id Id of Subject
     * @returns Subject information or null if subject not found
     */
    public getSubject(id: number): Subject | null {
        let subject = this.subjects.filter(_ => _[0] == id)[0];
        return subject ? subject : null;
    }

    private teachers: Teacher[] = [];
    /**
     * Set teachers to memory, save to storage and refresh timetable
     * @param teachers Teachers from server
     */
    public setTeachers(teachers: Teacher[]): void {
        this.teachers = teachers;
        this.storage.save('teachers', teachers);
        this.refreshTimetable();
    }

    /**
     * @returns all saved teachers
     */
    public getTeachers(): Teacher[] {
        return this.teachers;
    }
    /**
     * Look for teacher and return data
     * @param id Id of Teacher
     * @returns Teacher information or null if teacher not found
     */

    public getTeacher(id: number): Teacher | null {
        let teacher = this.teachers.filter(_ => _.teacherId == id)[0];
        return teacher ? teacher : null;
    }

    private rooms: Room[] = [];
    /**
     * Set rooms to memory, save to storage and refresh timetable
     * @param rooms Rooms from server
     */
    public setRooms(rooms: Room[]): void {
        this.rooms = rooms;
        this.storage.save('rooms', rooms);
        this.refreshTimetable();
    }
    
    /**
     * Get room information and return data
     * @param id Id of Room
     * @returns Room information or null if room not found
     */
    public getRoom(id: number): Room | null {
        let room = this.rooms.filter(_ => _.roomId == id)[0];
        return room ? room : null;
    }

    private lessons: Lesson[][][] = [];
    /**
     * Set timetable lessons to memory, save to storage and refresh timetable
     */
    public setLessons(lessons: Lesson[][][]): void {
        if (lessons.length < 5) {
            for(let i = 0;i < 5;i++) {
                if (!lessons[i]) lessons[i] = [];
            }
        }
        this.lessons = lessons;
        this.storage.save('lessons', lessons);
        this.refreshTimetable();
    }

    /**
     * Get timetable lessons from memory
     * @returns Timetable lessons
     */
    public getTimetableLessons(): Lesson[][][] {
        return this.lessons;
    }

    /**
     * Calculate Schedule Hours from Timetable
     * @returns Array with hours of lessons (updated)
     * TODO: save to storage
     */
    public getScheduleHours(): ScheduleLessonHour[] {
        let hours: number = 0;
        let les: ScheduleLessonHour[] = [];

        if (this.lessons.length == 0) {
            return [];
        }

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

    private scheduleHours: ScheduleLessonHour[] = this.getScheduleHours();
    /**
     * Get schledule hours from memory
     * @returns Array with hours of lessons (outdated)
     */
    public getSHours(): ScheduleLessonHour[] {
        return this.scheduleHours;
    }

    private selectedWeek: number | null = this.thisWeek;
    /**
     * Select week to display on timetable page
     * @param week number of week in year
     */
    public selectWeek(week: number | null) {
        this.selectedWeek = week;
    }
    /**
     * @returns boolean if week on timetable page is selected and is not showed permanent
     */
    public isTimetableWeek(): boolean {
        return this.selectedWeek != null;
    }
    /**
     * @returns Number of selected week in year
     */
    public getTimetableWeek(): number {
        return this.selectedWeek as number;
    }

    /**
     * Get Monday of week week
     * @param week Number of week in year
     * @returns Date of monday of the week
     */
    public getFirstDayOfWeek(week: number): Date {
        let firstDayOfSchool = new Date(this.today.getFullYear(),8,1);
        let lastDayOfSchool = new Date(this.today.getFullYear()+1,5,30);
        if (this.today.getMonth() <= 5) {
            firstDayOfSchool = new Date(this.today.getFullYear()-1,8,1);
            lastDayOfSchool = new Date(this.today.getFullYear(),5,30);
        }
        
        let monday = new Date(this.today.getFullYear(),0,1);
        monday.setDate(monday.getDate() + week * 7 + (monday.getDay() == 0 ? -6:0));
        if (monday.getTime() < firstDayOfSchool.getTime()) {
            monday.setFullYear(lastDayOfSchool.getFullYear());
            monday.setDate(monday.getDate() - 1);
        }
        return monday;
    }

    private timetable: TTableDay[] = [];
    /**
     * Get Timetable days from memory
     * @returns Timetable days with all attributes like holidays, lessons, day information and more.
     */
    public getTimetable(): TTableDay[] {
        return this.timetable;
    }

    public getTimetableDay(date: number, month: number, year: number): Lesson[] {
        let dat = new Date();
        dat.setDate(date);
        dat.setMonth(month);
        dat.setFullYear(year);
        let lessons: Lesson[] = [];
        this.lessons?.[((dat.getDay() == 0) ? 6 : dat.getDay() - 1)]?.forEach((les: Lesson[]) => {
            for(let i = 0;i < les.length;i++) {
                if (les[i].type == 0 || (les[i].subject == -1 && les[i].teacher == -1) || (les[i].type == 1 && (dat.getWeek() % 2)) || (les[i].type == 2 && !(dat.getWeek() % 2))) {
                    lessons.push(les[i]);
                }
            }
        });

        return lessons as Lesson[];
    }

    /**
     * Look for previous studying day
     * @param date Day from it will get calculated
     * @returns Previous studying day
     */
    public getLastStudyDay(date: Date = new Date()): Date {
        let day = date;
        if (this.getTimetableLessons()?.[(day.getDay() == 0) ? 6 : day.getDay() - 1]) {
            let checkhour = this.getScheduleHours()?.[this.getTimetableLessons()[(day.getDay() == 0) ? 6 : day.getDay() - 1].length - 1]?.end?.split(':');
            if (!checkhour || (day.getHours() == parseInt(checkhour[0]) && day.getMinutes() < parseInt(checkhour[1]) || day.getHours() < parseInt(checkhour[0]))) {
                day = this.addDayToDate(day, -1);
            }
        }
    
        while(this.isStudyingDay(day) == false || this.isDayWeekend(day)) {
            day = this.addDayToDate(day, -1);
        }
        return day;
    }

        /**
     * Look for next studying day
     * @param date Day from it will get calculated
     * @returns Next studying day
     */
    public getNextStudyDay(date: Date = new Date()): Date {
        let day = date;
        if (this.getTimetableLessons()?.[(day.getDay() == 0) ? 6 : day.getDay() - 1]) {

            let checkhour = this.getScheduleHours()?.[this.getTimetableLessons()?.[(day.getDay() == 0) ? 6 : day.getDay() - 1].length - 1]?.end?.split(':');
            if (!checkhour || (day.getHours() == parseInt(checkhour[0]) && day.getMinutes() >= parseInt(checkhour[1]) || day.getHours() > parseInt(checkhour[0]))) {
                day = this.addDayToDate(day, 1);
            }
        }
        
        
        while(this.isStudyingDay(day) == false || this.isDayWeekend(day)) {
            day = this.addDayToDate(day, 1);
        }
        return day;
    }

    /**
     * Check if day is not holiday or weekend
     * @param day Date of day you want to check
     * @returns if day is studying
     */
    public isStudyingDay(day: Date): boolean {
        if (
            this.isDayWeekend(day) ||
            this.filterHoliday(day.getDate(), day.getMonth()).length > 0
        ) return false;
        return true;
    }

    /**
     * Refresh timetable, refresh timetable days and lessons
     */
    public refreshTimetable(): void {
        // Hours
        this.scheduleHours = this.getScheduleHours();
        // Week
        let week = this.getTimetableWeek();

        if (this.lessons == this.timetableLessonsLast && week == this.timetableSelectedWeekLast) {
            return;
        }

        if (this.lessons.length == 0) {
            this.timetable = [];
            return;
        }

        // Lessons
        let tTable: TTableDay[] = [];
        let monday = this.getFirstDayOfWeek(week);

        this.lessons.forEach((_: Lesson[][], index: number) => {
            let dda = this.addDayToDate(monday, (index < 1) ? index : 1);

            let day: TTableDay = {
                date: [dda.getDate(), dda.getMonth() + 1, dda.getFullYear()],
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
                _.forEach((lesson: Lesson[], index) => {

                    if (!lesson) return;
                    if (lesson.length == 0) {
                        day.lessons.push([{ isEmpty: true }]);
                    }

                    let l: TTableLesson[] = [];

                    for(let i = 0;i < lesson.length;i++) {
                        let { ...subject } = this.getSubject(lesson[i].subject) as Subject ?? false;
                        let { ...teacher } = this.getTeacher(lesson[i].teacher) as Teacher ?? false;
                        let { ...room } = lesson[i].room ? this.getRoom(lesson[i].room as number) as Room ?? false : {};

                        if (lesson[i].subject == -1 || lesson[i].teacher == -1) {
                            day.lessons.push([{ isEmpty: true }]);
                            return;
                        }

                        if (this.selectedWeek == null && lesson[i].type && lesson[i].type !== 0 && subject) {
                            subject[1] = ((lesson[i].type === 1) ? 'L:' : 'S:') + subject[1];
                        }
        
                        if (!subject || !subject[1] || !teacher || !teacher.lastName ||
                            (
                                lesson.length == 1 &&
                                lesson[i].type &&
                                this.selectedWeek !== null &&
                                (
                                    (week % 2 === 0 && lesson[i].type === 1) ||
                                    (week % 2 === 1 && lesson[i].type === 2)
                                )
                            )
                        ) {
                            // day.lessons.push([{ isEmpty: true }]);
                        } else {
                            if ((lesson.length >= 1 &&
                                (
                                (
                                    this.selectedWeek != null && (
                                    (week % 2 === 0 && lesson[i].type === 2) ||
                                    (week % 2 === 1 && lesson[i].type === 1) ||
                                    (lesson[i].type === 0))
                                ) || this.selectedWeek == null
                                ) || lesson.length == 1)
                            ) {
                                l.push({ subject: subject as Subject, teacher: teacher as Teacher, room: room as Room, group: lesson[i].group, class: lesson[i].class });
                            }
                            if (i + 1 == lesson.length) {
                                day.lessons.push(l);
                                l = [];
                            }
                        }
        
                        if (index == _.length - 1 && index <= this.getScheduleHours().length) {
                            for(let i = 0;i < (this.getScheduleHours().length - 1) - index;i++) {
                                day.lessons.push([{ isEmpty: true }])
                            }
                        }
                    }
                    
                    // To fill empty day
                    if (_.length == 0) {
                        for(let i = 0;i < this.getScheduleHours().length;i++) {
                            day.lessons.push([{ isEmpty: true }])
                        }
                    }
                });
            } else {
                day.isFullDay = true;
            }
            let rozdil = this.getSHours().length - day.lessons.length;
            if (rozdil > 0 && day.isFullDay != true) {
                for(let i = 0;i< rozdil;i++) {
                    day.lessons.push([{ isEmpty: true }]);
                }
            }
            tTable.push(day);
        });

        tTable.slice(0, 4);

        this.timetableSelectedWeekLast = week;
        this.timetableLessonsLast = this.lessons;
        this.timetable = tTable;

    }

    // Klasifikace
    private grades: grade[] = [
        {
            subjectId: 11,
            title: 'T01 BA',
            weight: 10,
            date: new Date(2023, 8, 14),
            grade: 1
        }, {
            subjectId: 3,
            title: 'Srovnávací test',
            weight: 10,
            date: new Date(2023, 8, 18),
            grade: 2
        }, {
            subjectId: 8,
            title: 'Nepravidelná slovesa',
            weight: 10,
            date: new Date(2023, 8, 19),
            grade: 1
        }, {
            subjectId: 4,
            title: 'T1',
            weight: 10,
            date: new Date(2023, 8, 20),
            grade: 1
        }, {
            subjectId: 6,
            title: 'Seminární práce_1',
            weight: 10,
            date: new Date(2023, 8, 26),
            grade: 1
        }, {
            subjectId: 8,
            title: 'Gramatické cvičení',
            weight: 10,
            date: new Date(2023, 8, 27),
            grade: 1
        }, {
            subjectId: 8,
            title: 'Doplňování slov do vět',
            weight: 10,
            date: new Date(2023, 8, 27),
            grade: 3
        }, {
            subjectId: 8,
            title: 'Poslech',
            weight: 10,
            date: new Date(2023, 8, 27),
            grade: 1
        }, {
            subjectId: 10,
            title: 'test',
            weight: 3,
            date: new Date(2023, 8, 27),
            grade: 1
        }, {
            subjectId: 4,
            title: 'T2',
            weight: 10,
            date: new Date(2023, 9, 2),
            grade: 1
        }, {
            subjectId: 0,
            title: 'test',
            weight: 10,
            date: new Date(2023, 9, 6),
            grade: 3
        }, {
            subjectId: 9,
            title: 'L6 - časy',
            weight: 10,
            date: new Date(2023, 9, 6),
            grade: 3
        }, {
            subjectId: 3,
            title: 'Kvadratická funkce',
            weight: 5,
            date: new Date(2023, 9, 9),
            grade: 2
        }, {
            subjectId: 13,
            title: 'test',
            weight: 10,
            date: new Date(2023, 9, 9),
            grade: 1
        }, {
            subjectId: 6,
            title: 'Aktuality',
            weight: 10,
            date: new Date(2023, 9, 11),
            grade: 1
        }, {
            subjectId: 2,
            title: 'T zákonyBA',
            weight: 1,
            date: new Date(2023, 9, 12),
            grade: 5
        }, {
            subjectId: 2,
            title: 'T AV+SCH',
            weight: 1,
            date: new Date(2023, 9, 12),
            grade: 1
        }, {
            subjectId: 13,
            title: 'ERD',
            weight: 10,
            date: new Date(2023, 9, 13),
            grade: 1
        }
    ];

    /**
     * @returns Get all grades from memory
     */
    public getGrades(): grade[] {
        return this.grades;
    }

    /**
     * Calculate average of subject with data of grades from memory
     * @param subject Subject ID of which subject you want to get average grades
     * @returns Average number of subject
     */
    public getAverageBySubject(subject: number): string {
        let grades = this.getGradesBySubject(subject);
        let total = 0;
        let total_devide = 0;
        grades.forEach(_ => {
            total += _.grade * _.weight;
            total_devide += _.weight;
        });
        return Number(total / total_devide).toFixed(2).replace('.', ',');
    }

    /**
     * List all grades of selected subject
     * @param subject Subject ID of which subject you want to get grades
     * @returns Grades of subject
     */
    public getGradesBySubject(subject: number): grade[] {
        return this.grades.filter(_ => _.subjectId == subject);
    }

    /**
     * Get all grades and order by subject to []
     * @returns Grades ordered by subject
     */
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
    /**
     * Get all holidays saved in memory
     * @returns All holidays
     */
    public getHolidays(): Holiday[] {
        return this.holidays;
    }

    /**
     * Look for holiday in specific date
     * @param day day of month
     * @param month month of year
     * @param year year
     * @returns Holidays in that date
     */
    public filterHoliday(day: number, month: number, year: number = new Date().getFullYear()): Holiday[] {
        let hol = this.holidays.filter((holiday) => holiday.date?.day == day && holiday.date.month == month + 1);
        if (hol.length > 0) return hol;
        return [];
    }

    /**
     * Compare lessons of 2 days
     * @param day1 List of lessons of first day
     * @param day2 List of lessons of second day
     * @returns List of lessons that day1 has and day2 don't
     */
    public compareLessons(day1: TTableLesson[][], day2: TTableLesson[][]): TTableLesson[] {
        if (!day1 || !day2) return [];
        let les: TTableLesson[] = [];
        day1.forEach((_: TTableLesson[]) => {
            if (!_[0]) return;
            if (
              day2.filter(__ => __[0].subject?.[2] == _[0]?.subject?.[2]).length == 0 &&
              les.filter(__ => __.subject?.[2] == _?.[0]?.subject?.[2]).length == 0
            ) {
                les.push(_[0]);
            }
        });
        
        return les;
    }


    // Absence 
    public absence: Absence[] = [
        {locale: 'absence', icon: 'slash'},
        {locale: 'excused', icon: 'x'},
        {locale: 'unexcused'},
        {locale: 'non_count', icon: 'minus'},
        {locale: 'late'},
        {locale: 'early'}, 
        {locale: 'distance'}];


}