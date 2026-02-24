import { HttpClient } from "@angular/common/http";
import { inject } from "@angular/core";
import { Config } from "@Schoolingo/config";
import { ModalManager } from "@Schoolingo/modal";
import { BehaviorSubject } from "rxjs";

export class Classbook {
    private modalManager = inject(ModalManager);
    private http = inject(HttpClient);

    public selectedAbsence = -1;
    public selectedHour = -1;
    public isInfoAboutAbsence = new BehaviorSubject<boolean>(false);
    public selectedStudent: number | null = null;
    public classbook: any;
    public students: any[] = [];

    public homeworks: any[] = [];
    public notes: any[] = [];

    public getStudent(student_id: number | null): any {
        if (student_id == null) return {};
        return this.students.find((student) => student.student_id == student_id);
    }
    
    public reason = '';
    public minutes = 0;
    public note = '';

    public applyAbsence(): void {
        const student_id = this.selectedStudent;
        const hour = this.selectedHour;
        const absence = this.selectedAbsence;
        console.log(this.classbook)
        const student = this.students.find((student) => student.student_id == student_id);

        if (this.selectedAbsence == -1 && student.absence[hour] != undefined) {
            student.total_absence -= 1;
        }
        if (this.selectedAbsence != -1 && student.absence[hour] == undefined) {
            student.total_absence += 1;
        }

        student.absence[hour] = absence == -1 ? undefined : absence;

        this.http.post(
            `${Config.API_URL}/v1/classbook/absence`,
            { student_id, classbook_id: this.classbook.classbook_id, type: absence, reason: this.reason, minutes: this.minutes, note: this.note },
            { withCredentials: true }
        )
        .subscribe((data) => {
            console.log(data)
        });
        this.modalManager.closeModal('add_absence');
    }
}