import moment from "moment";
import { BehaviorSubject } from "rxjs";

export class ScheduleBuilder {
    public isTimetableLoading: boolean = true;
    public isSubjectsLoading: boolean = true;
    public hours: any[] = [
        { start: '8:00', end: '8:45' },
        { start: '8:50', end: '9:35' },
        { start: '8:45', end: '10:30' },
        { start: '10:50', end: '11:35' },
        { start: '11:40', end: '12:25' },
        { start: '12:30', end: '13:15' },
        { start: '13:20', end: '14:05' },
        { start: '14:10', end: '14:55' },
        { start: '15:00', end: '15:45' },
    ];

    public all_subjects: any[] = [];
    public subjects: any[] = [];
    public teachers: { [key: string]: any } = {};
    public getTeachers(): any[] {
        return Object.values(this.teachers).sort((a, b) => {
            const ln = a.lastName.localeCompare(b.lastName, 'cs');
            if (ln !== 0) return ln;
            return a.firstName.localeCompare(b.firstName, 'cs');
        });
    }

    public getSubject(subjectId: number): any {
        return this.all_subjects.find((subject) => subject.subject_id == subjectId);
    }
    
    public selectedSubject = 0;
    public classes: any[] = [];
    public selectedClass = new BehaviorSubject<number>(0);

    public getClassName(class_id: number): string {
        return this.classes.find((item) => item.class_id == class_id)?.class_name ?? '';
    }
    
    // Timetable structure: Day -> Hour -> Lessons
    public timetable: any[][][] = []; 
    public activeLesson: any = null;

    public getTimetableUsedHours(): number {
        let used = 0;
        this.timetable.forEach((day) => {
            day.forEach((hour) => {
                if (hour.length) {
                    used += 1;
                }
            })
        })
        return used;
    }

    public getTimetableTotalHours(): number {
        return this.timetable.length * this.hours.length;
    }

    public selectedDate: moment.Moment = moment();

    constructor() {
        // Initialize empty timetable (5 days, 8 hours)
        for (let i = 0; i < 5; i++) {
            this.timetable[i] = [];
            for (let j = 0; j < this.hours.length; j++) {
                this.timetable[i][j] = [];
            }
        }
    }
}