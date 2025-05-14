import { Schoolingo } from "@Schoolingo";
import { personDetails } from "./User";
import { inject } from "@angular/core";

export class teacherMarks {
    private student: personDetails | null = null;
    private columnIndex = -1;
    private groupId = -1;
    private subjectId = -1;
    private mark: string | number | null = null;

    public setStudent(student: personDetails): void { this.student = student }
    public getSelectedStudent(): typeof this.student { return this.student }

    public setSubjectId(subjectId: number): void { this.subjectId = subjectId }
    public getSubjectId(): typeof this.subjectId { return this.subjectId }

    public setMark(mark: typeof this.mark): void { this.mark = mark }
    public getMark(): typeof this.mark { return this.mark }
}