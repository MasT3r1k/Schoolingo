import { BehaviorSubject } from "rxjs";

export class Classbook {
    public classbook: any;

    public selectedAbsence = -1;
    public isInfoAboutAbsence = new BehaviorSubject<boolean>(false);
    public selectedStudent: number | null = null;
    public students: any[] = [];

    public getStudent(student_id: number | null): any {
        if (student_id == null) return {};
        return this.students.find((student) => student.student_id == student_id);
    }
    
    public reason = '';
    public minutes = 0;
    public note = '';
}