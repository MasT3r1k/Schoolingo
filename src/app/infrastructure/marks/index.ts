export class MarksManager {
    private student: number | null = null;
    private columnIndex = -1;
    private groupId = -1;
    private subjectId = -1;
    private mark: string | number | null = null;
    private topic = "";

    public setStudent(student: typeof this.student): void { this.student = student }
    public getSelectedStudent(): typeof this.student { return this.student }

    public setSubjectId(subjectId: number): void { this.subjectId = subjectId }
    public getSubjectId(): typeof this.subjectId { return this.subjectId }

    public setMark(mark: typeof this.mark): void { this.mark = mark }
    public getMark(): typeof this.mark { return this.mark }

    public setColumnIndex(columnIndex: number): void { this.columnIndex = columnIndex }
    public getColumnIndex(): typeof this.columnIndex { return this.columnIndex }

    public setTopic(topic: string): void { this.topic = topic }
    public getTopic(): typeof this.topic { return this.topic }
}