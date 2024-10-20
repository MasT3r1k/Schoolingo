export type Absence = {
    locale: string;
    icon?: string;
}

export const absence: Absence[] = [
    { locale: 'absence', icon: 'slash' },
    { locale: 'excused', icon: 'x' },
    { locale: 'unexcused' },
    { locale: 'non_count', icon: 'minus' },
    { locale: 'late' },
    { locale: 'early' },
    { locale: 'distance' },
];