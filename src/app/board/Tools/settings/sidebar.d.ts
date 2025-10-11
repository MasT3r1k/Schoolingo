export type SettingsItem = {
    label: string;
    description?: string;
    value?: () => any;
} & ({
    type: 'checkbox';
} | {
    type: 'input';
    placeholder?: string;
    readOnly?: boolean;
} | {
    type: 'note';
});