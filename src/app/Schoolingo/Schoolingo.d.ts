import moment, { Moment } from "moment";
import { themes } from "./Theme";

export type Person = {
    id: number;
    firstName: string;
    lastName: string;
    gender: number;
}

export type Room = {
    roomId: number;
    label: string;
    type: string;
}

export type Settings = Record<string, boolean>;

export type Subject = [number, string, string]; // [id, shortcut, label]

export type TimetableAPI = {
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
}

export type TimetableLesson = {
    type: number;
    teacher: number;
    room: string;
    subjectName: string;
    subjectShortcut: string;
    oldTeacher: number;
    oldSubject: string[];
    group: { id: number, text: string, num: string };
    empty: boolean = false;
}

export type TimetableHours = {
    start: string;
    end: string;
}

export type ClassbookAPI = {
    topic: string;
    date: Date;
    dayHour: number;
    absence: number = -1;
}

export type ClassbookLesson = {
    topic: string;

}

export type Absence = {
    type: number;
    subject: number;
    reason: number;
    minutes: number;
}

export type Mark = {
    mark: number;
    weight: number;
    subject: number;
    teacher: number;
    topic: string;
    description: string;
    type: number;
    created: Moment;
}

export type Substitution = {
    substitutionId: number;
    teacherId: number;
    subjectId: number;
    groupId: number;
    hour: number;
    date: moment.Moment;
    created: moment.Moment;
}