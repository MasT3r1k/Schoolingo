export type degree = {
    degree: string;
    shortcut: string;
    isBefore: boolean;
}

export type personDetails = {
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
    selectedChildren: number = 0;
    children: (personDetails & { class: string })[];
}) & {
    locale: string;
}