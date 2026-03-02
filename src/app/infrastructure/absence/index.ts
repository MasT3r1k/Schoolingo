import { permType } from "@Schoolingo/permission";

export interface AbsenceConfig {
    locale: string;
    icon?: string;
    perms: permType[];
    reasons: string[];
}

export interface WorkingModeConfig {
    locale: string;
    color: string;
    icon: string;
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
    { locale: 'unexcused',  icon: 'letter-n', perms: ['classteacher', 'principal'],  reasons: []},
    { locale: 'non_count',  icon: 'minus',    perms: ['classteacher', 'principal'],  reasons: ['school_event'] }, 
    { locale: 'late',       icon: 'letter-p', perms: ['teacher'],  reasons: ['oversleep', 'connection'] },
    { locale: 'early',      icon: 'letter-o', perms: ['teacher'],  reasons: ['connection'] },
    { locale: 'distance',   icon: 'letter-d', perms: ['classteacher', 'principal'],  reasons: [] },
]

export const working_mode: WorkingModeConfig[] = [
    { locale: 'inability_to_work', color: '#EF5350', icon: 'stethoskop' },
    { locale: 'vacation', color: '#42A5F5', icon: 'palm' },
    { locale: 'school_event', color: '#66BB6A', icon: 'users-group' },
    { locale: 'education', color: '#AB47BC', icon: 'school' },
    { locale: 'business_trip', color: '#FFA726', icon: 'briefcase' },
    { locale: 'personal_obstacle', color: '#78909C', icon: 'clock-pause' },
    { locale: 'other', color: '#FFEE58', icon: 'home-edit' },
]