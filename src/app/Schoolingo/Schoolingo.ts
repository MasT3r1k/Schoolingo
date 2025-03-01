import { Injectable } from "@angular/core";
import { Locale } from "./Locale";
import { SocketService } from "./Socket";
import { Theme } from "./Theme";
import { personDetails, UserService } from "./User";
import { Sidebar } from "./Sidebar";
import { School } from "./School";
import { Utils } from "@Schoolingo/Utils";
import { BehaviorSubject, Subscription } from "rxjs";
import moment from "moment";
import { AbsenceConfig, absence } from "./Absence";
import { removeDiacritics } from "./SearchFilter";
import { degree } from "./User";
import { MessageManager } from "./Messages";
import { Traineeship } from "./Traineeship";
import { Homeworks } from "./Homeworks";
import { IPManager } from "./IPManager";
import { Alert } from "./Alert";
import { Authentication } from "./Auth";

import { Absence, BookInfo, ClassbookAPI, ClassbookLesson, Mark, studentService, Substitution, TimetableAPI, TimetableHours, TimetableLesson } from './Schoolingo.d';
import { forceCloseAllModals, Modal } from "@Components/Modal/Modal";
import { LoginExpiredComponent } from "../board/modals/loginExpired/loginExpired.component";
import { AppConfig } from "./App";
import { childrenSwitchComponent } from "../board/modals/childrenSwitch/childrenSwitch.component";
import { Classbook } from "./Classbook";
export {
    TimetableAPI,
    ClassbookAPI,
    ClassbookLesson,
    TimetableLesson,
    Mark,
    Absence,
    Substitution,
    studentService,
    BookInfo
}

@Injectable()
export class Schoolingo {
    public resetToDefault(): void {
        this.modal = '';
        this.timetableAPI = [];
        this.timetableSelectedWeek.next(moment());
        this.timetableLessons = [];
        this.timetableSubjects = {};
        this.timetableHours = [];
        this.classbookLessons = {};
        // this.classbookAbsence = {};
        this.todayWeek = moment().isoWeek();
        this.subjects = {};
        this.substitution = {};
        this.isOfflineMode = false;
        this.isLoginExpired = false;
        clearTimeout(this.warnlogoutInterval)
        this.warnlogoutInterval = setTimeout(() => {
            this.loginModal.open();
            this.logoutTime = moment().add(AppConfig.WARN_BEFORE_LOGOUT_MINUTES, 'minutes');
        }, this.school.schoolInfo.loginExpires - (AppConfig.WARN_BEFORE_LOGOUT_MINUTES * 60000));
        this.loginModal.close();
        forceCloseAllModals();
        this.marks = [];
        this.absence = {};
        this.absenceSubjects = {};
        this.studentService = { status: false };
        this.traineeship.diaryWeeks.next([]);
        this.traineeship.diaryDays = {};
        this.traineeship.diary.next([]);
        this.auth.isExecuting = false;
    }

    public subscribers: Subscription[] = [];
    public absenceConfig: AbsenceConfig[] = absence;

    public absenceSubjects: Record<string, { absence: number, lessons: number }> = {};
    public absence: Record<string, Absence[]> = {};
    public hasAccessToPage = true;

    constructor(
        public locale: Locale,
        public socketService: SocketService,
        public theme: Theme,
        public userService: UserService,
        public sidebar: Sidebar,
        public school: School,
        public messages: MessageManager,
        public traineeship: Traineeship,
        public homeworks: Homeworks,
        public ipManager: IPManager,
        public auth: Authentication,
        public classbook: Classbook
    ) {
        this.subscribers.push(
            this.locale.language.subscribe(() => {
                this.refreshTitle();
            })
        );

        this.subscribers.push(
            this.timetableSelectedWeek.subscribe((week: moment.Moment) => {
                this.refreshTimetableLessons();
                this.socketService.emit('timetable:getClassbook', { week, userId: this.getStudentId() });
            })
        );

        this.subscribers.push(
            this.userService.alert.subscribe((alert: Alert | null) => {
                if (alert === null) return;
                this.auth.errors['auth'] = alert;
            })
        );

        this.subscribers.push(
            this.userService.tokenExpiration.subscribe((date: moment.Moment) => {
                if (this.isLoginExpired) return;
                if (date.isAfter(moment())) {
                    this.loginModal.close();
                    clearTimeout(this.warnlogoutInterval)
                    this.warnlogoutInterval = setTimeout(() => {
                        this.loginModal.open();
                        this.logoutTime = moment().add(AppConfig.WARN_BEFORE_LOGOUT_MINUTES, 'minutes');
                    }, this.school.schoolInfo.loginExpires - (AppConfig.WARN_BEFORE_LOGOUT_MINUTES * 60000));
                    // x minutes before because of option to stay logged in
                    // Make modal change to autologout
                } else {
                    this.userService.logout();
                }
            })
        );

        this.subscribers.push(
            this.auth.loginStatus.subscribe((status: boolean) => {
                if (!status) return;

                this.resetToDefault();
                this.auth.loginStatus.next(false);
            })
        );

        this.loginModal.zIndex = 999999; // To show above all modals
    }

    // Login expired
    public isLoginExpired = false;
    public warnlogoutInterval = setTimeout(() => {});
    public logoutTime = moment();
    public loginModal = new Modal({
        title: {
            text: 'modals/loginExpire/title'
        },
        closeable: false,
        size: 'size-2',
        items: [
        {
            type: "component",
            component: LoginExpiredComponent,
        }
        ]
    });

    public childrenSwitchModal = new Modal({
        title: {
            icon: 'users',
            text: 'dropdowns/switchChildren/title'
        },
        closeable: true,
        size: 'size-2',
        items: [
        {
            type: "component",
            component: childrenSwitchComponent
        }
        ]
    });

    public loginExpired(): void {
        // this.isLoginExpired = true;
        // this.modal = 'login';
        // this.loginModal.open();
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
    public todayWeek = moment().isoWeek();

    public modal = '';

    public getUserRole(): string {
        let user = this.userService.getUser();

        if (user == null) {
            return "";
        }

        let text = this.locale.getLocale('roles/' + user.type);
        switch(user.type) {
            case "student":
                text += ' - ' + user.class;
                break;
            default:
                if (user.manager === -1) {
                    text += " - " + this.locale.getLocale('roles/manager');
                }
                if (user.isPrincipal) {
                    text += " - " + this.locale.getLocale('roles/principal');
                }
                break;
        }
        return text;
    }

    public refreshTitle(): void {
        this.sidebar.updateTitle(window.location.pathname);
    }


    // Timetable
    public timetableAPI: TimetableAPI[] = [];
    public timetableSelectedLesson = new BehaviorSubject<{ lesson: TimetableLesson, day: number, hour: number, sub: number } | null>(null);
    public timetableSelectedWeek = new BehaviorSubject<moment.Moment>(moment());
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

    // Absence
    public getAbsence(day: number, hour: number): number {
        let date = Utils.getDayOfWeek(this.timetableSelectedWeek.getValue().isoWeek(), day).format('YYYY-MM-DD');
        if (!this.absence[date]?.[hour]) {
            return -1
        }
        let absence: number = this.absence[date][hour].type;
        return absence ?? -1;
    }

    public isClassbook(day: number, hour: number): boolean {
        let date = Utils.getDayOfWeek(this.timetableSelectedWeek.getValue().isoWeek(), day).format('YYYY-MM-DD');
        if (!this.classbookLessons[date]) return false;
        return this.classbookLessons[date][hour] !== undefined;
    }

    public getTimetableLessons(): typeof this.timetableLessons {
        return this.timetableLessons;
    }

    private timetableHours: TimetableHours[] = [];
    public refreshTimetableHours(hourMax: number = 0): void {
        // School is not set
        if (!this.school.schoolInfo) {
            return;
        }

        /*
        * @default: 0
        */
        let maxHours = hourMax;
        for(const x of this.timetableAPI) {
            if (x.hour > maxHours) {
                maxHours = x.hour;
            }
        }

        let hours: TimetableHours[] = [];
        let time = moment()
        .set('hours', this.school.schoolInfo.startHour[0])
        .set('minutes', this.school.schoolInfo.startHour[1]);

        for(let i = 1;i <= maxHours;i++) {
            let startHour = time.clone();
            time.add(this.school.schoolInfo.lessonHour, 'minutes');
            hours.push(
                {
                    startMoment: startHour.clone(),
                    start: startHour.format('HH:mm'),
                    endMoment: time.clone(),
                    end: time.format('HH:mm')
                }
            );
            time.add(this.school.schoolInfo.breaks[i + 1] || this.school.schoolInfo.breakTime, 'minutes');
        }

        this.timetableHours = hours;
    }

    public getTimetableHours(): typeof this.timetableHours {
        return this.timetableHours;
    }

    public getTimetableHour(hour: number): string {
        if (this.timetableHours[hour]) {
            return this.timetableHours[hour].start + ':' + this.timetableHours[hour].end;
        } 
        this.refreshTimetableHours(hour);
        return '';
    }

    public refreshTimetableLessons(): void {
        this.timetableLessons = [];
        this.timetableSubjects = {};
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

            if (lesson.type !== 0 && this.timetableSelectedWeek.getValue().isValid()) {
                if (lesson.type === 1 && Utils.isOdd(this.timetableSelectedWeek.getValue().isoWeek()) || lesson.type === 2 && !Utils.isOdd(this.timetableSelectedWeek.getValue().isoWeek())) {
                    return;
                }
            }

            let date = this.timetableSelectedWeek.getValue()
            .startOf('isoWeek')
            .add(lesson.day, 'day');

            let subjectName = lesson.subjectName;
            let subjectShortcut = lesson.subjectShortcut;
            let teacher = lesson.teacher;
            let substitution = this.substitution?.[date.format('YYYY-MM-DD')];
            if (substitution?.[lesson.hour - 1]) {
                if (substitution[lesson.hour - 1].subjectId == -1) {
                    subjectName = "";
                    subjectShortcut = "";
                } else {
                    subjectName = this.subjects?.[substitution[lesson.hour - 1].subjectId]?.[0];
                    subjectShortcut = this.subjects?.[substitution[lesson.hour - 1].subjectId]?.[1];
                }
                teacher = substitution[lesson.hour - 1].teacherId;
                if (substitution[lesson.hour - 1].subjectId == -1 && teacher == -1) {
                    lesson.groupName = "";
                    lesson.groupNum = "";
                    lesson.room = "";
                }
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
                    subject: lesson.subject,
                    className: lesson.className,
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
                        subject: -1,
                        className: "",
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

    public formatPerson(personId: number | undefined | personDetails): string {
        if (personId == -1 || personId == undefined) {
            return '';
        }

        let person!: personDetails;
        if (typeof personId == 'number') {
            person = this.getPerson(personId)!;
        } else {
            person = personId;
        }

        if (person == null) {
            return '';
        }

        let text = '';
        let degrees = person.degrees.sort((a, b) => a.weight - b.weight);
        degrees.forEach((degree: degree): void => {
            if (degree.isBefore) {
                text += `${degree.shortcut} `;
            }
        });
        text += `${person.firstName} ${person.lastName}`
        degrees.forEach((degree: degree): void => {
            let i = 0;
            if (!degree.isBefore) {
                text += `, ${degree.shortcut}`;
                i++;
            }
        })
        return text;
    }

    public getStudentId(): number {
        let user = this.userService.getUser()!;
        let userId = user?.id;
    
        if (user && user.type == 'parent' && this.userService.selectedChild !== null) {
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

    public studentService: studentService = { status: false };

    /** LIBRARY */
    public bookInfo = new BehaviorSubject<BookInfo | null>(null);
    public showBook(id: any[], type: 'book' | 'copy'): void {
        this.socketService.emit("library:getBookInfo", { type, id: id[0], loan: id[1] });
    }

}