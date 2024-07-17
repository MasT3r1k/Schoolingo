export type UserRoles = 'admin' | 'principal' | 'teacher' | 'parent' | 'student';

export type modulePerm = {
    name: string;
    canView: boolean;
    canEdit: boolean;
    isManager: boolean;
}

export type UserPerms =
{
    role: 'admin' | 'principal'
} | {
    role: 'teacher',
    class: number[],
    modules: modulePerm[],
} | {
    role: 'parent',
    children: number[],
} | {
    role: 'student',
    class: number
}