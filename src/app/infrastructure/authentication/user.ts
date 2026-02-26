import moment from "moment";

export interface User {
    full_name: string;
    expires: Date;
    username: string;
    user_id: number;
    person_id: number;
    gender: number;
    role: 'student' | 'teacher' | 'parent';
    roles: string[];
    permissions: string[];

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
    password_changed: Date;
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
    class_id: number;
    class_name: string;
    scope_id: number;
    scope_name: string;
    scope_years: number;
    students: number;
}

export interface Child {
    childId: number;
    first_name: string;
    last_name: string;
    gender: number;
    classes: SchoolClass[];
}

export interface UserEmail {
    type: 'personal' | 'school' | 'work' | 'other';
    email: string;
    description: string;
    is_verified: boolean;
    is_created: boolean;
    code_until: Date | null;
}

export interface UserPhone {
    code: string;
    number: string;
    description: string;
    is_verified: boolean;
    is_created: boolean;
    code_until: Date | null;
}