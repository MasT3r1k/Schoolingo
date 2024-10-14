import { booleanAttribute, Injectable } from "@angular/core";
import { languages, Locale } from "./Locale";
import { SocketService } from "./Socket";
import { Theme } from "./Theme";
import { UserService } from "./User";
import { Sidebar } from "./Sidebar";
import { TimetableAPI, TimetableHours, TimetableLesson } from './Schoolingo.d';
import { School } from "./School";
import { addZeros } from "./Utils";
export { TimetableAPI }

@Injectable()
export class Schoolingo {

    constructor(

        public locale: Locale,
        public socketService: SocketService,
        public theme: Theme,
        public userService: UserService,
        public sidebar: Sidebar,
        public school: School

    ) {
        this.locale.language.subscribe((value: languages) => {
            this.refreshTitle();
        });
    }

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
    private timetableLessons: TimetableLesson[][][] = [];
    public getTimetableLessons(): TimetableLesson[][][] {
        return this.timetableLessons;
    }

    private timetableHours: TimetableHours[] = [];
    public refreshTimetableHours(): void {
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
        this.timetableAPI.forEach((lesson: TimetableAPI) => {

            if (!this.timetableLessons[lesson.day]) {
                this.timetableLessons[lesson.day] = [];
            }

            if (!this.timetableLessons[lesson.day][lesson.hour - 1]) {
                this.timetableLessons[lesson.day][lesson.hour - 1] = [];
            }

            this.timetableLessons[lesson.day][lesson.hour - 1].push(
                {
                    subjectName: lesson.subjectName,
                    subjectShortcut: lesson.subjectShortcut,
                    teacher: lesson.teacher,
                    room: lesson.room,
                    type: lesson.type,
                    group: {
                        id: 0,
                        text: '',
                        num: ''
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
                        teacher: "",
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

        console.log(this.timetableLessons)
    }

}