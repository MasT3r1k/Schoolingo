import { Type } from "@angular/core";
import { BehaviorSubject } from "rxjs";

export type ModuleTitle = {
    title: string;
    link?: string[];
}

export type Module = {
    selectedTab?: BehaviorSubject<number> = new BehaviorSubject(0);
    titles: ModuleTitle[];
    component: Type<any> | Type<any>[] | null;
}