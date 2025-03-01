import moment, { Moment } from "moment";
import { themes } from "./Theme";
import { AbsenceType } from "./Absence";

export interface Person {
    id: number;
    firstName: string;
    lastName: string;
    gender: number;
}

export interface Room {
    roomId: number;
    label: string;
    type: string;
}

export type Settings = Record<string, boolean>;

export type Subject = [number, string, string]; // [id, shortcut, label]

export interface TimetableAPI {
    day: number;
    hour: number;
    type: number;
    teacher: number;
    room: string;
    subject: number;
    subjectName: string;
    subjectShortcut: string;
    groupId: number;
    groupName: string;
    groupNum: string;
    className: string;
}

export interface TimetableLesson {
    type: number;
    teacher: number;
    room: string;
    subject: number;
    subjectName: string;
    subjectShortcut: string;
    oldTeacher: number;
    oldSubject: string[];
    className: string;
    group: { id: number, text: string, num: string };
    empty: boolean = false;
}

export interface TimetableHours {
    startMoment: moment.Moment;
    start: string;
    endMoment: moment.Moment;
    end: string;
}

export interface ClassbookAPI {
    topic: string;
    date: Date;
    dayHour: number;
    absence: number = -1;
}

export interface ClassbookLesson {
    topic: string;
}

export interface Absence {
    type: number;
    subject: number;
    reason: string;
    minutes: number;
}

export interface Mark {
    mark: string;
    weight: number;
    subject: number;
    teacher: number;
    topic: string;
    description: string;
    type: number;
    created: Moment;
}

export interface Substitution {
    substitutionId: number;
    teacherId: number;
    subjectId: number;
    groupId: number;
    hour: number;
    date: moment.Moment;
    created: moment.Moment;
}

export type studentService = {
    status: false;
} | {
    status: true;
    start: moment.Moment;
    end: moment.Moment;
}

export interface BookInfo {
    name: string;
    subtitle: string;
    year: number;
    isbn: string;
    publisher: string;
    editionNumber: number;
    pages: number;
    annotation: string;
    tags: string;
    keywords: string;
    signature: number;
    language: string;
    description: string;
    acquisitionDate: moment.Moment | Date;
    created: moment.Moment | Date;
    date_loan: moment.Moment | Date;
    date_has_to_be_returned: moment.Moment | Date;
    date_return: moment.Moment | Date;
}