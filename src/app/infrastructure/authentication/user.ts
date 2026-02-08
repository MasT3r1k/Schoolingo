import moment from "moment";

export interface User {
    fullName: string;
    expires: Date;
    username: string;
    userId: number;
    personId: number;
    gender: number;
    role: 'student' | 'teacher' | 'parent';
    manager: number;
    birthday: moment.Moment;
    avatar: {
        seed: string;
        type: string;
        eyebrows: string;
        eyes: string;
        mouth: string;
    };
    locale: string;
    theme: number;
    level: number;
    '2fa': boolean;
    passwordChanged: Date;
    lastLogins7Days: number;
    failedLogins7Days: number;
    emails: UserEmail[];
    phones: UserPhone[];
    xp: number;
    requiredXP: number;
    children: Child[];
    classes: SchoolClass[];
}

export interface SchoolClass {
    classId: number;
    className: string;
    scopeId: number;
    students: number;
    scopeName: string;
    scopeYears: number;
}

export interface Child {
    childId: number;
    firstName: string;
    lastName: string;
    gender: number;
    classes: SchoolClass[];
}

export interface UserEmail {
    type: 'personal' | 'school' | 'work' | 'other';
    email: string;
    description: string;
    is_verified: boolean;
    is_created: boolean;
}

export interface UserPhone {
    code: string;
    number: string;
    description: string;
    is_verified: boolean;
    is_created: boolean;
}