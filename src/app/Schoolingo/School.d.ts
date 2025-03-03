export type SchoolInfo = {
    code: string;
    name: string;
    district: string;
    startHour: [number, number];
    lessonHour: number;
    breakTime: number;
    resetPasswordWithEmail: boolean;
    fastLogin: boolean;
    warningAbsence: number;
    breaks: Record<number, number> = {};
    studentsLimit: number;
    loginExpires: number;
} & {
    error: number;
}

export type SchoolYear = {
    start: moment.Moment;
    end: moment.Moment;
    midterm: moment.Moment;
} & {
    error: number;
}