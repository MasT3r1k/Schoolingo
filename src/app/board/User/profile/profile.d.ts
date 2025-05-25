import { personDetails } from "@Schoolingo/User";
import moment from "moment";

export interface Profile {
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
    teacher: personDetails;
    emails: { email: string;description: string }[];
    phones: { code: number;number: string;description: string }[];
};

export interface SidebarItem {
  label: string;
  perms: string[];
  content: SidebarContent;
}
