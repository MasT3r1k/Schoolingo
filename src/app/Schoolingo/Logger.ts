import { Injectable } from "@angular/core";

@Injectable()
export class Logger {
    constructor() {}

    public send(name: string, log: string): void {
        console.log(`%c${name}%c ${log}`, "background: #2999ed;color: #fff;padding: 4px 8px;font-size:11px;font-weight:500;border-radius:16px 16px;", "color: #cdcdcd;");
    }

    public clear(): void {
        console.clear();
    }

}