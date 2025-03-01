import { AbsenceConfig } from './Absence.d';
export { AbsenceConfig };

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
    { locale: 'absence',    icon: 'slash',      reasons: [] },
    { locale: 'excused',    icon: 'x',          reasons: ['illness', 'family', 'doctor', 'oversleep', 'connection', 'hospitalization'] },
    { locale: 'unexcused',  icon: 'letter-n',   reasons: [] },
    { locale: 'non_count',  icon: 'minus',      reasons: ['schoolEvent'] }, 
    { locale: 'late',       icon: 'letter-p',   reasons: ['oversleep', 'connection'] },
    { locale: 'early',      icon: 'letter-o',   reasons: ['connection'] },
    { locale: 'distance',   icon: 'letter-d',   reasons: [] },
];