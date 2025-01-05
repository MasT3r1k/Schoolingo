import { Injectable } from "@angular/core";

@Injectable()
export class Logger {
    /**
     * Send logger to console with custom style of title and message
     * @param name Title of logger
     * @param log Message of logger
     */
    public send(name: string, log: string): void {
        console.log(
            `%c${name}%c ${log}%c`,
            "background: hsl(206deg, 84%, 55%);color: #fff;padding: 4px 8px;font-size:11px;font-weight:500;margin-right: 4px;",
            "color: #fff;",
            "color: hsl(206deg, 84%, 55%);"
            );
    }

    /**
     * Clears console output
     */
    public clear(): void {
        console.clear();
    }

}