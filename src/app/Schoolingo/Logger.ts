import { Injectable } from "@angular/core";

@Injectable()
export class Logger {
    constructor() {}

    /**
     * Send logger to console with custom style of title and message
     * @param name Title of logger
     * @param log Message of logger
     */
    public send(name: string, log: string): void {
        console.log(`%c${name}%c ${log}`, "background: #2999ed;color: #fff;padding: 4px 8px;font-size:11px;font-weight:500;border-radius:16px 16px;", "color: #cdcdcd;");
    }

    /**
     * Clears console output
     */
    public clear(): void {
        console.clear();
    }

}