import { Injectable } from "@angular/core";
import { SchoolInfo, SchoolYear } from './School.d';
import moment from "moment";
export type { SchoolInfo, SchoolYear };

@Injectable({ providedIn: 'root' })
export class School {
    
    public schoolInfo!: SchoolInfo;
    public schoolYear!: SchoolYear;
    public errorReason: number = -1;

    public setSchoolInfo(data: SchoolInfo): void {
        if (data.error) {
            this.errorReason = data.error;
            return;
        }

        this.schoolInfo = data;
    }

    public setSchoolYear(data: SchoolYear): void {
        if (data.error) {
            this.errorReason = data.error;
            return;
        }

        this.schoolYear = {
            start: moment(data.start),
            end: moment(data.end),
            error: -1
        };
    }

    public getIsActiveSchool(): boolean {
        return this.errorReason == -1;
    }

}