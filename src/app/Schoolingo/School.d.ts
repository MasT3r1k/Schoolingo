export type SchoolInfo = {
    code: string;
    name: string;
    shortName: string;
    district: string;
    startHour: [number, number];
    lessonHour: number;
    breakTime: number;
    resetPasswordWithEmail: boolean;
    fastLogin: boolean;
    warningAbsence: number;
    breaks: Record<number, number> = {};
    studentsLimit: number;
    gdpr: {
        firstname: string;
        lastname: string;
        phone: string;
        email: string;
        mobile: string;
        databox: string;
        web: string;
    };
    fleetvehicles_mileage_unit: string;
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