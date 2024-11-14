import { Injectable } from "@angular/core";
import { languages, Locale } from "./Locale";
import { SocketService } from "./Socket";
import { Theme } from "./Theme";
import { personDetails, UserService } from "./User";
import { Sidebar } from "./Sidebar";
import { ClassbookAPI, ClassbookLesson, TimetableAPI, TimetableHours, TimetableLesson } from './Schoolingo.d';
import { School } from "./School";
import { addZeros, isOdd } from "./Utils";
import { BehaviorSubject, Subscription } from "rxjs";
import moment from "moment";
import { Absence, absence } from "./Absence";
import * as utils from "@Schoolingo/Utils";
import { removeDiacritics } from "./SearchFilter";
export { TimetableAPI, ClassbookAPI, ClassbookLesson, TimetableLesson }

@Injectable()
export class Schoolingo {

    public subscribers: Subscription[] = [];
    public absence: Absence[] = absence;

    constructor(

        public locale: Locale,
        public socketService: SocketService,
        public theme: Theme,
        public userService: UserService,
        public sidebar: Sidebar,
        public school: School
    ) {
        this.subscribers.push(this.locale.language.subscribe((value: languages) => {
            this.refreshTitle();
        }));

        this.subscribers.push(this.timetableSelectedWeek.subscribe((week: number) => {
            this.refreshTimetableLessons();

            let data = { week, child: -1 };
            if (userService.getUser()?.type == 'parent') {
                data["child"] = this.userService.children[this.userService.selectedChild].personId;
            }
            this.socketService.emit('timetable:getClassbook', data);
        }));
    }

    // Offline mode
    private isOfflineMode: boolean = false;

    public getOfflineMode(): boolean {
        return this.isOfflineMode;
    }

    public setOfflineMode(status: boolean): void {
        this.isOfflineMode = status;
    }

    // Today's data
    public todayWeek: number = moment().isoWeek();

    public modal: string = '';

    public getUserRole(): string {
        let user = this.userService.getUser();

        if (user == null) {
            return "";
        }

        switch(user.type) {
            case "student":
                return this.locale.getLocale('roles/' + user.type) + ' - ' + user.class;
            default:
                return this.locale.getLocale('roles/' + user.type);
        }
    }

    public refreshTitle(): void {

        this.sidebar.updateTitle(window.location.pathname);

    }


    // Timetable
    public timetableAPI: TimetableAPI[] = [];
    public timetableSelectedWeek: BehaviorSubject<number> = new BehaviorSubject(moment().week());
    private timetableLessons: TimetableLesson[][][] = [];
    private timetableSubjects: Record<string, number[]> = {};
    public getSubjects(): string[] {
        return Object.keys(this.timetableSubjects).sort((a: string, b: string) => 
            removeDiacritics(a).localeCompare(removeDiacritics(b))
        );
    }
    public getTeachersFromSubject(subject: string): number[] {
        return this.timetableSubjects[subject];
    }
    public classbookLessons: Record<string, ClassbookLesson[]> = {};
    public classbookAbsence: Record<string, number[]> = {};

    // Absence
    public getAbsence(day: number, hour: number): number {
        let absence: number = this.classbookAbsence[utils.getDayOfWeek(this.timetableSelectedWeek.getValue(), day).format('YYYY-MM-DD').toString()]?.[hour];
        if (absence === undefined || absence == -1) {
            return -1;
        }
        return absence;
    }

    public isClassbook(day: number, hour: number): boolean {
        return this.classbookLessons?.[utils.getDayOfWeek(this.timetableSelectedWeek.getValue(), day).format('YYYY-MM-DD').toString()]?.[hour] === undefined ? false : true;
    }

    public getTimetableLessons(): TimetableLesson[][][] {

        return this.timetableLessons;

    }

    private timetableHours: TimetableHours[] = [];
    public refreshTimetableHours(): void {

        // School is not set
        if (!this.school.schoolInfo) {
            return;
        }

        /*
        * @default: 0
        */
        let maxHours: number = 0;

        for(let i = 0;i < this.timetableAPI.length;i++) {
            if (this.timetableAPI[i].hour > maxHours) {
                maxHours = this.timetableAPI[i].hour;
            }
        }

        let hours: TimetableHours[] = [];
        let startHour: [number, number] = JSON.parse(JSON.stringify(this.school.schoolInfo.startHour));
        let endHour: [number, number] = JSON.parse(JSON.stringify(startHour));

        for(let i = 1;i <= maxHours;i++) {
            endHour[1] += this.school.schoolInfo.lessonHour;

            while(endHour[1] >= 60) {
                endHour[0]++;
                endHour[1] -= 60;
            }
            
            let startTime: string = startHour[0] + ':' + addZeros(startHour[1], 2);
            let endTime: string = endHour[0] + ':' + addZeros(endHour[1], 2);

            hours.push({ start: startTime, end: endTime })
            endHour[1] += this.school.schoolInfo.breaks[i + 1] || this.school.schoolInfo.breakTime;
            startHour = JSON.parse(JSON.stringify(endHour));
        }
        this.timetableHours = hours;
    }
    public getTimetableHours(): TimetableHours[] {
        return this.timetableHours;
    }
    public refreshTimetableLessons(): void {

        this.timetableLessons = [];
        // Get hours
        this.refreshTimetableHours();

        // Fill lessons
        this.timetableAPI.forEach((lesson: TimetableAPI): void => {

            if (!this.timetableLessons[lesson.day]) {
                this.timetableLessons[lesson.day] = [];
            }

            if (!this.timetableLessons[lesson.day][lesson.hour - 1]) {
                this.timetableLessons[lesson.day][lesson.hour - 1] = [];
            }

            if (lesson.type !== 0 && this.timetableSelectedWeek.getValue() !== -1) {
                if (lesson.type === 1 && isOdd(this.timetableSelectedWeek.getValue()) || lesson.type === 2 && !isOdd(this.timetableSelectedWeek.getValue())) {
                    return;
                }
            }

            if (!this.timetableSubjects[lesson.subjectName]) {
                this.timetableSubjects[lesson.subjectName] = [];
            }

            if (!this.timetableSubjects[lesson.subjectName].includes(lesson.teacher)) {
                this.timetableSubjects[lesson.subjectName].push(lesson.teacher);
            }

            this.timetableLessons[lesson.day][lesson.hour - 1].push(
                {
                    subjectName: lesson.subjectName,
                    subjectShortcut: lesson.subjectShortcut,
                    teacher: lesson.teacher,
                    room: lesson.room,
                    type: lesson.type,
                    group: {
                        id: lesson.groupId,
                        text: lesson.groupName,
                        num: lesson.groupNum
                    },
                    empty: false
                }
            )
        });

        // Fill empty lessons
        for(let i = 0;i < this.timetableLessons.length;i++) {

            if (!this.timetableLessons?.[i]) {
                this.timetableLessons[i] = [];
            }

            for(let y = 0;y < this.timetableHours.length;y++) {

                if (!this.timetableLessons[i]?.[y]) {
                    this.timetableLessons[i][y] = [];
                }

                if (this.timetableLessons[i][y].length == 0) {
                    this.timetableLessons[i][y].push({
                        subjectName: "",
                        subjectShortcut: "",
                        teacher: -1,
                        room: "",
                        type: 0,
                        group: {
                            id: 0,
                            text: '',
                            num: ''
                        },
                        empty: true
                    })
                }
            }
        }
    }


    // Person information
    private persons: Record<number, personDetails> = {};

    public addPersons(persons: Record<number, personDetails>): void {

        Object.entries(persons).forEach((value: [string, personDetails]) => {

            this.persons[parseInt(value[0])] = value[1];

        });

    }

    public getPerson(personId: number): personDetails | null {
        if (personId === -1) return null;
        return this.persons[personId];
    }

    public formatPerson(personId: number): string {
        let person: personDetails = this.getPerson(personId) as personDetails;
        return person.firstName + ' ' + person.lastName;
    }

}