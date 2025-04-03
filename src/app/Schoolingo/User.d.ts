import moment from "moment";
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
    scopeId: number;
    person: personDetails;
    class: string;
} | {
    type: 'teacher';
    person: personDetails;
    class: string[];
} | {
    type: 'parent',
    person: personDetails;
    children: child[];
}) & {
    type: UserRoles;
    id: number;
    manager: number;
    isPrincipal: boolean;
    birthday: moment.Moment;
}

export type child = (personDetails & { class: string });