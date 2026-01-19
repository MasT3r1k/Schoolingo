export namespace EMPLOYEE_CONFIG {
    export type EMPLOYEE_STATUS = 'all' | 'active' | 'inactive' | 'terminated'
    export const EMPLOYEE_STATUSES: EMPLOYEE_STATUS[] = ['all', 'active', 'inactive', 'terminated'];

    export type EMPLOYEE_ROLE = 'teacher' | 'admin_staff' | 'maintenance' | 'management' | 'personnel' | 'other';
    export const EMPLOYEE_ROLES: EMPLOYEE_ROLE[] = ['teacher', 'admin_staff', 'maintenance', 'management', 'personnel', 'other']
}