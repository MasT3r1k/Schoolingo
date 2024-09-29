import { themes } from "./Theme";

export type Person = {
    id: number;
    firstName: string;
    lastName: string;
    gender: number;
}

export type Settings = Record<string, boolean>;