import { Injectable } from "@angular/core";
import { SchoolInfo } from './School.d';
export type { SchoolInfo };

@Injectable({ providedIn: 'root' })
export class School {
    
    public schoolInfo!: SchoolInfo;
    public errorReason: number = -1;

    getAPI(data: SchoolInfo): void {
        if (data.error) {
            this.errorReason = data.error;
            return;
        }

        this.schoolInfo = data;
    }

    public getIsActiveSchool(): boolean {
        return this.errorReason == -1;
    }

}