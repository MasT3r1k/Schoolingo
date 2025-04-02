import { CommonModule } from "@angular/common";
import { Component, Input, Type } from "@angular/core";
import { Schoolingo } from "@Schoolingo";
import { AppConfig } from "@Schoolingo/App";

@Component({
    selector: 'error-main',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './index.html',
    styleUrls: ['./error.css', '../Styles/card.css']
})

export class ErrorMain {
    App = AppConfig;

    @Input() error!: number;
    public errors: Record<number | string, Type<any> | string> = {
        1001: "noSystemAccessError",
        1002: "domainNotFoundError",
        1003: "outdatedSystemError",
        1004: "failedLoadAppError",
        1005: "schoolYearNotFoundError",
    };

    public getComponent(error: number): any {
        let err = this.errors[error];
        if (typeof err !== "string") {
            return this.errors[error];
        }
    }

    constructor(
        public schoolingo: Schoolingo
    ) {}

}