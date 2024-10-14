export interface degree {
    degree: string;
    shortcut: string;
    isBefore: boolean;
}

export interface personDetails {
    personId: number;
    firstName: string;
    lastName: string;
    sex: number;
    degress: degree[];
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
    id: number;
}

export type child = (personDetails & { class: string });