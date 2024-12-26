import moment from "moment";

export type Profile = {
    username: string;
    autoSelectNextWeek: boolean;
    birthday: moment.Moment;
    fastlogin: boolean;
    passwordChanged: moment.Moment | null;
    twofa: boolean;
    className: string;
    scopeName: string;
    scopeYears: number;
    birthnum: number;
    birthplace: number;
    address: number;
    GDPR: number;
    insuranceId: number;
    insuranceCode: string;
    insuranceName: string;
};