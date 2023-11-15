import { Injectable } from "@angular/core";

@Injectable()
export class Logger {
    constructor() {}

    public send(name: string, log: string): void {
        console.log(`%c${name}%c ${log}`, "background: #2999ed;color: #fff;padding: 4px 8px;font-size:12px;font-weight:500;", "color: #cdcdcd;");
    }

}