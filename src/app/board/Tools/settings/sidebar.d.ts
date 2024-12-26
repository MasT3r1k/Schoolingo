export type SettingsItem = {
    label: string;
    description?: string;
} & ({
    type: 'checkbox';
} | {
    type: 'input';
    placeholder?: string;
} | {
    type: 'note';
});