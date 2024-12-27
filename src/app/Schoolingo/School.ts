import { Injectable } from "@angular/core";
import { SchoolInfo, SchoolYear } from './School.d';
import moment from "moment";
import { Modules } from "./Modules";
export type { SchoolInfo, SchoolYear };

@Injectable({ providedIn: 'root' })
export class School {

    constructor(
        private modules: Modules
    ) { }
    
    public schoolInfo!: SchoolInfo;
    public schoolYear!: SchoolYear;
    public errorReason: number = -1;

    public setSchoolInfo(data: SchoolInfo, modules: number): void {
        if (data.error) {
            this.errorReason = data.error;
            return;
        }

        this.schoolInfo = data;
        this.modules.setModules(modules)
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

    public getStudentLimit(): string {
        if (!this.schoolInfo.studentsLimit) return "";
        return this.schoolInfo.studentsLimit === -1 ? "∞" : this.schoolInfo.studentsLimit.toString();
    }

    public getIsActiveSchool(): boolean {
        return this.errorReason == -1;
    }

}