import { CommonModule, NgComponentOutlet } from "@angular/common";
import { Component, Input, OnInit, Type } from "@angular/core";
import { Schoolingo } from "@Schoolingo";
import { domainNotFoundError } from "./DomainNotFound/domainNotFound";
import { noSystemAccessError } from "./noSystemAccess/noSystemAccess";
import { outdatedSystemError } from "./outdatedSystem/outdatedSystem";
import { failedLoadAppError } from "./failedLoadApp/failedLoadApp";

@Component({
    selector: 'error-main',
    standalone: true,
    imports: [CommonModule, NgComponentOutlet],
    templateUrl: './index.html',
    styleUrls: ['./error.css', '../Styles/card.css']
})

export class ErrorMain implements OnInit {

    @Input() error!: number;
    public errors: Record<number | string, Type<any> | string> = {
        1001: noSystemAccessError,
        1002: domainNotFoundError,
        1003: outdatedSystemError,
        1004: failedLoadAppError,
        1005: "School year not found"
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

    ngOnInit(): void {}

}