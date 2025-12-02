import { BehaviorSubject } from 'rxjs';
import { MarkConfig } from './index.d';
export type { MarkConfig }

export class MarksManager {
    private config!: MarkConfig;
    public getConfig(): typeof this.config {
        return this.config;
    }

    public setConfig(config: typeof this.config): void {
        this.config = config;
    }

    private action: 'edit' | 'create' | '' = '';
    private student: string | null = null;
    private columnIndex = -1;
    private columnId = -1;
    private groupId = -1;
    private subjectId = -1;
    private subjectName = '';
    private mark: string | null = null;
    private topic = "";
    private weight = 1;
    private mark_types: string[] = ['marks', 'points'];
    private type: string | null = null;

    public updateColumn$ = new BehaviorSubject<any>({});
    public updateMark$ = new BehaviorSubject<any>({});

    public setAction(action: typeof this.action): void { this.action = action }
    public getAction(): typeof this.action { return this.action }

    public setStudent(student: typeof this.student): void { this.student = student }
    public getSelectedStudent(): typeof this.student { return this.student }

    public setGroupId(groupId: number): void { this.groupId = groupId }
    public getGroupId(): typeof this.groupId { return this.groupId }

    public setSubjectId(subjectId: number): void { this.subjectId = subjectId }
    public getSubjectId(): typeof this.subjectId { return this.subjectId }

    public setSubjectName(subjectName: typeof this.subjectName): void { this.subjectName = subjectName }
    public getSubjectName(): typeof this.subjectName { return this.subjectName }

    public setMark(mark: typeof this.mark): void { this.mark = mark }
    public getMark(): typeof this.mark { return this.mark }

    public setColumnIndex(columnIndex: number): void { this.columnIndex = columnIndex }
    public getColumnIndex(): typeof this.columnIndex { return this.columnIndex }

    public setColumnId(columnId: number): void { this.columnId = columnId }
    public getColumnId(): typeof this.columnId { return this.columnId }

    public setTopic(topic: string): void { this.topic = topic }
    public getTopic(): typeof this.topic { return this.topic }

    public setWeight(weight: number): void { this.weight = weight }
    public getWeight(): typeof this.weight { return this.weight }

    public setType(type: string | number | null): void {
        if (typeof type == "number") {
            this.type = this.mark_types[type];
        } else {
            this.type = type;
        }
    }
    public getType(): typeof this.type {
        return this.type;
    }
}
