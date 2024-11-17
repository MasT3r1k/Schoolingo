export type SchoolInfo = {
    name: string;
    startHour: [number, number];
    lessonHour: number;
    breakTime: number;
    resetPasswordWithEmail: boolean;
    warningAbsence: number;
    breaks: Record<number, number> = {};
} & {
    error: number;
}

export type SchoolYear = {
    start: moment.Moment;
    end: moment.Moment;
} & {
    error: number;
}