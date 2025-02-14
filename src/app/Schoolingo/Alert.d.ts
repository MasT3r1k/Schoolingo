export interface Alert {
    type: 'success' | 'info' | 'warning' | 'error';
    text: string;
}