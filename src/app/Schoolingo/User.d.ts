// User roles
export type UserRoles = 'systemadmin' | 'manager' | 'principal' | 'teacher' | 'parent' | 'student';
// User Permissions
export type UserPermissions = UserRoles | 'nonlogged' | 'onlynonlogged' | 'all' | 'classteacher';


export type UserMain = {
    username: string;
    firstName: string;
    lastName: string;
    locale: string;
    sex: string;
    type: UserRoles;
    class: string[];
    userBirthNumber: string;
    classTeacher: number;
    recommendChangePassword: boolean;
    GDPR: boolean;
    cookies: boolean;
    teacherId?: number;
    studentId?: number;
    isPrincipal?: boolean;
}

export type Teacher = Omit<UserMain, "class" | "type" | "locale" | "username" | "userBirthNumber" | "classTeacher" > & {teacherId: number};

export type User = UserMain | Teacher | null;


export type LoginData = {
    status: number;
    message: string;
    token?: string;
    expires?: Date;
}