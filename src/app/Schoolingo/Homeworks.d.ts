export enum HomeworkTypes {
    CLASSIC,
    REQUIREREPLY
}

export interface Homework {
    subjectId: number;
    homework: string;
    type: HomeworkTypes;
}