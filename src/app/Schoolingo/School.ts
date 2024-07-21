import { Injectable } from "@angular/core";
import { SchoolInfo } from './School.d';
export type { SchoolInfo };

@Injectable({ providedIn: 'root' })
export class School {
    
    public name!: string;

    getAPI(data: SchoolInfo): void {

        this.name = data.name;

    }

}