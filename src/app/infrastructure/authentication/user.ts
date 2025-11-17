import moment from "moment";

export interface User {
    fullName: string;
    expires: Date;
    username: string;
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
    emails: UserEmail[];
    phones: UserPhone[];
    xp: number;
    requiredXP: number;
    children: Child[];
    classes: SchoolClass[]
}

export interface SchoolClass {
    classId: number;
    className: string;
    scopeId: number;
    students: number;
}

export interface Child {
    childId: number;
    firstName: string;
    lastName: string;
    gender: number;
}

export interface UserEmail {
    email: string;
    description: string;
    is_verified: boolean;
}

export interface UserPhone {
    code: string;
    number: string;
    description: string;
    is_verified: boolean;
}