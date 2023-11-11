export type Subject = [string, string]; // [shortcut, label]

export type Lesson = {
    subject: number;
    teacher: number;
    type?: number;
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