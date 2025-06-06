import moment from "moment";

export interface User {
    fullName: string;
    expires: Date;
    username: string;
    personId: number;
    gender: number;
    role: 'student' | 'teacher' | 'parent';
    birthday: moment.Moment;
    avatar: {
        seed: string;
        type: string;
        eyebrows: string;
        eyes: string;
        mouth: string;
    };
    locale: string;
    theme: string;
    level: number;
    xp: number;
    requiredXP: number;
    children: Child[];
    classes: SchoolClass[]
}

export interface SchoolClass {
    classId: number;
    className: string;
    students: number;
}

export interface Child {
    childId: number;
    firstName: string;
    lastName: string;
    gender: number;
}