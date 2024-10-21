import { Injectable } from "@angular/core";
import { SchoolInfo } from './School.d';
export type { SchoolInfo };

@Injectable({ providedIn: 'root' })
export class School {
    
    public schoolInfo!: SchoolInfo;

    private isSchool: boolean = true;

    getAPI(data: SchoolInfo): void {
        if (data.name == "") {
            // Failed to get data
            this.isSchool = false;
            return;
        }

        this.schoolInfo = data;
    }

    public getIsActiveSchool(): boolean {
        return this.isSchool;
    }

}