import { Type } from "@angular/core";
import { modules } from "@Schoolingo/Modules";
import { permType } from "@Schoolingo/Permissions";
import { BehaviorSubject } from "rxjs";

export type ModuleTitle = {
    title: string;
    link?: string[];
}

export type Module = {
    selectedTab?: BehaviorSubject<number> = new BehaviorSubject(0);
    titles: ModuleTitle[];
    perms?: permType[] = [];
    modules?: modules[] = [];
    component: Type<any> | Type<any>[] | null;
}