export interface Device {
    active: boolean;
    isSocket: boolean;
    id: number;
    ip: string;
    ipShow: boolean = false;
    userAgent: string;
    expires: Moment;
}