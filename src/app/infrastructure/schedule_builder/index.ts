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
    ];

    public all_subjects: any[] = [];
    public subjects: any[] = [];
    public teachers: { [key: string]: any } = {};
    public getSubject(subjectId: number): any {
        return this.all_subjects.find((subject) => subject.subjectId == subjectId);
    }
    public selectedSubject = -1;
    public classes: any[] = [];
    public selectedClass = new BehaviorSubject<number>(0);
}