import { UserRoles } from "./Permissions";

export interface degree {
    degree: string;
    shortcut: string;
    isBefore: boolean;
    weight: number;
}

export interface personDetails {
    personId: number;
    firstName: string;
    lastName: string;
    sex: number;
    degrees: degree[];
}

export type user = ({
    type: 'student';
    person: personDetails;
    class: string;
} | {
    type: 'teacher';
    person: personDetails;
    class: string[];
} | {
    type: 'parent',
    person: personDetails;
}) & {
    type: UserRoles;
    id: number;
    manager: number;
}

export type child = (personDetails & { class: string });