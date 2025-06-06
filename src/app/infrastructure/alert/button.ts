export interface AlertButton {
    color: 'primary' | 'secondary' | string;
    text: string;
    action: Function;
} 