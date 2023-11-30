import { Teacher } from "./User.d";

export type Subject = [number, string, string]; // [id, shortcut, label]

export type Lesson = {
    subject: number;
    teacher: number;
    type?: number;
}

export type TTableLesson = {
    subject?: Subject;
    teacher?: Teacher;
    isEmpty?: boolean;
}

export type TTableDay = {
    date: [number, number, number];
    day: string;
    lessons: TTableLesson[];
    holiday?: Holiday;
    isFullDay: boolean;
}

export type SchoolSettings = {
    startTime: [number, number],        // [hours, minutes]
    lessonHour: number,       // Length of lesson, In Minutes
    breakTimeMinutes: number            // Default length of breaks, In Minutes
}

export type SchoolBreaks = {
    beforeHour: number;                 // Before Index hour
    minutes: number;                    // Custom length of breaks, In Minutes
}

export type ScheduleLessonHour = {
    start: string;
    end: string;
}

export type grade = {
    subjectId: number;
    title: string;
    weight: number;
    date: Date;
    grade: number;
}

export type Holiday = {
    date?: {
        day: number;
        month: number;
    }
    calculateDate?: {}
    name: string;
}