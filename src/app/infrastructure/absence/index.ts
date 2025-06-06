import { permType } from "@Schoolingo/permission";

export interface AbsenceConfig {
    locale: string;
    icon?: string;
    perms: permType[];
    reasons: string[];
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
    { locale: 'absence',    icon: 'slash',    perms: ['teacher'],  reasons: [] },
    { locale: 'excused',    icon: 'x',        perms: ['classteacher', 'principal'],  reasons: ['illness', 'family', 'doctor', 'oversleep', 'connection', 'hospitalization'] },
    { locale: 'unexcused',  icon: 'letter-n', perms: ['classteacher', 'principal'],  reasons: [] },
    { locale: 'non_count',  icon: 'minus',    perms: ['classteacher', 'principal'],  reasons: ['schoolEvent'] }, 
    { locale: 'late',       icon: 'letter-p', perms: ['teacher'],  reasons: ['oversleep', 'connection'] },
    { locale: 'early',      icon: 'letter-o', perms: ['teacher'],  reasons: ['connection'] },
    { locale: 'distance',   icon: 'letter-d', perms: ['classteacher', 'principal'],  reasons: [] },
];