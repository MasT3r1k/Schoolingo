export interface Device {
    active: boolean;
    isSocket: boolean;
    id: number;
    ip: string;
    userAgent: string;
    expires: Moment;
}