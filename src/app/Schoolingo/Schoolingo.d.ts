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
    subjectName: string;
    subjectShortcut: string;
}

export type TimetableLesson = {
    type: number;
    teacher: number;
    room: string;
    subjectName: string;
    subjectShortcut: string;
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