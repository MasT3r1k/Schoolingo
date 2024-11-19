import { Injectable } from "@angular/core";
import { languages, Locale } from "./Locale";
import { SocketService } from "./Socket";
import { Theme } from "./Theme";
import { personDetails, user, UserService } from "./User";
import { Sidebar } from "./Sidebar";
import { Absence, ClassbookAPI, ClassbookLesson, Mark, Substitution, TimetableAPI, TimetableHours, TimetableLesson } from './Schoolingo.d';
import { School } from "./School";
import { addZeros, isOdd } from "./Utils";
import { BehaviorSubject, Subscription } from "rxjs";
import moment from "moment";
import { AbsenceConfig, absence } from "./Absence";
import * as utils from "@Schoolingo/Utils";
import { removeDiacritics } from "./SearchFilter";
import { degree } from "./User";
export { TimetableAPI, ClassbookAPI, ClassbookLesson, TimetableLesson, Mark, Absence, Substitution }

@Injectable()
export class Schoolingo {

    public resetToDefault(): void {
        this.modal = '';
        this.timetableAPI = [];
        this.timetableLessons = [];
        this.timetableSubjects = {};
        this.timetableHours = [];
        this.classbookLessons = {};
        this.classbookAbsence = {};
        this.todayWeek = moment().isoWeek();
        this.isOfflineMode = false;
        this.marks = [];
    }

    public subscribers: Subscription[] = [];
    public absenceConfig: AbsenceConfig[] = absence;

    public absence: Record<string, Absence[]> = {};

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
                data.child = this.userService.children[this.userService.selectedChild].personId;
            }
            this.socketService.emit('timetable:getClassbook', data);
        }));
    }

    // Offline mode
    private isOfflineMode = false;

    public getOfflineMode(): boolean {
        return this.isOfflineMode;
    }

    public setOfflineMode(status: boolean): void {
        this.isOfflineMode = status;
    }

    // Today's data
    public todayWeek: number = moment().isoWeek();

    public modal = '';

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
    public timetableSelectedWeek = new BehaviorSubject(moment().week());
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
        let date = utils.getDayOfWeek(this.timetableSelectedWeek.getValue(), day).format('YYYY-MM-DD');
        if (!this.classbookAbsence[date]) {
            return -1
        }
        let absence: number = this.classbookAbsence[date][hour];
        if (absence === undefined || absence == -1) {
            return -1;
        }
        return absence;
    }

    public isClassbook(day: number, hour: number): boolean {
        let date = utils.getDayOfWeek(this.timetableSelectedWeek.getValue(), day).format('YYYY-MM-DD');
        if (!this.classbookLessons[date]) return false;
        return this.classbookLessons[date][hour] !== undefined;
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
        let maxHours = 0;

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

            if (!this.subjects[lesson.subject] && lesson.subject != -1) {
                this.subjects[lesson.subject] = [lesson.subjectName, lesson.subjectShortcut];
            }

            if (lesson.subjectName != undefined) {
                if (!this.timetableSubjects[lesson.subjectName]) {
                    this.timetableSubjects[lesson.subjectName] = [];
                }
    
                if (!this.timetableSubjects[lesson.subjectName].includes(lesson.teacher) && lesson.subjectName != undefined) {
                    this.timetableSubjects[lesson.subjectName].push(lesson.teacher);
                }
            }

            if (lesson.type !== 0 && this.timetableSelectedWeek.getValue() !== -1) {
                if (lesson.type === 1 && isOdd(this.timetableSelectedWeek.getValue()) || lesson.type === 2 && !isOdd(this.timetableSelectedWeek.getValue())) {
                    return;
                }
            }

            let date = moment().set('isoWeeks', this.timetableSelectedWeek.getValue()).add(lesson.day - 1, 'day');
            let subjectName: string = lesson.subjectName;
            let subjectShortcut: string = lesson.subjectShortcut;
            let teacher: number = lesson.teacher;
            let substitution = this.substitution?.[date.format('YYYY-MM-DD')];

            if (substitution?.[lesson.hour]) {
                if (this.subjects[substitution[lesson.hour].subjectId]) {
                    subjectName = this.subjects[substitution[lesson.hour].subjectId]?.[0];
                    subjectShortcut = this.subjects[substitution[lesson.hour].subjectId]?.[1];
                }
                teacher = substitution[lesson.hour].teacherId;
            }

            this.timetableLessons[lesson.day][lesson.hour - 1].push(
                {
                    subjectName: subjectName,
                    subjectShortcut: subjectShortcut,
                    oldSubject: [lesson.subjectName, lesson.subjectShortcut],
                    oldTeacher: lesson.teacher,
                    teacher: teacher,
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

            if (!this.timetableLessons[i]) {
                this.timetableLessons[i] = [];
            }

            for(let y = 0;y < this.timetableHours.length;y++) {

                if (!this.timetableLessons[i][y]) {
                    this.timetableLessons[i][y] = [];
                }

                if (this.timetableLessons[i][y].length == 0) {
                    this.timetableLessons[i][y].push({
                        subjectName: "",
                        subjectShortcut: "",
                        oldSubject: [],
                        teacher: -1,
                        oldTeacher: -1,
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

    public formatPerson(personId: number | undefined): string {

        if (personId == -1 || personId == undefined) {
            return '';
        }

        let person: personDetails = this.getPerson(personId)!;

        if (person == null) {
            return '';
        }

        let text = '';
        let degrees: degree[] = person.degrees.sort((a, b) => a.weight - b.weight);
        degrees.forEach((degree: degree): void => {
            if (degree.isBefore) {
                text += `${degree.shortcut} `;
            }
        });
        text += `${person.firstName} ${person.lastName}`
        degrees.forEach((degree: degree): void => {
            let i = 0;
            if (!degree.isBefore) {
                if (i > 0) {
                    text += ",";
                }
                text += ` ${degree.shortcut}`;
                i++;
            }
        })
        return text;
    }

    public getStudentId(): number {
        let user: user = this.userService.getUser()!;
        let userId = user?.id;
    
        if (user && user.type == 'parent') {
          userId = this.userService.children[this.userService.selectedChild].personId;
        }
        
        return userId;
    }

    public subjects: Record<number, string[]> = {};
    public addSubjects(subjects: Record<number, string[]>): void {
        Object.entries(subjects).forEach((value: [string, string[]]) => {
            this.subjects[parseInt(value[0])] = value[1];
        });
    }
    public marks: Mark[] = [];

    public substitution: Record<string, Substitution[]> = {};

}