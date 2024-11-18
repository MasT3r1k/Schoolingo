export type AbsenceConfig = {
    locale: string;
    icon?: string;
}

export const absence: AbsenceConfig[] = [
    { locale: 'absence', icon: 'slash' },
    { locale: 'excused', icon: 'x' },
    { locale: 'unexcused' },
    { locale: 'non_count', icon: 'minus' },
    { locale: 'late' },
    { locale: 'early' },
    { locale: 'distance' },
];