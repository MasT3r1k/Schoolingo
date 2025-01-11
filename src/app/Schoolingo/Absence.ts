export interface AbsenceConfig {
    locale: string;
    icon?: string;
}

export enum AbsenceType {
    ABSENCE,
    EXCUSED,
    UNEXCUSED,
    NON_COUNT,
    LATE,
    EARLY,
    DISTANCE
}

export const absence: AbsenceConfig[] = [
    { locale: 'absence', icon: 'slash' },
    { locale: 'excused', icon: 'x' },
    { locale: 'unexcused', icon: 'letter-n' },
    { locale: 'non_count', icon: 'minus' },
    { locale: 'late', icon: 'letter-p' },
    { locale: 'early', icon: 'letter-o' },
    { locale: 'distance', icon: 'letter-d' },
];