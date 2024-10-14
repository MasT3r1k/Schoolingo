import { Injectable } from "@angular/core";
import { SchoolInfo } from './School.d';
export type { SchoolInfo };

@Injectable({ providedIn: 'root' })
export class School {
    
    public schoolInfo!: SchoolInfo;

    getAPI(data: SchoolInfo): void {
        if (data.name == "") {
            // Failed to get data
            return;
        }

        this.schoolInfo = data;
    }

}