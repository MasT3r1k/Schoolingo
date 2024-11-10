import { CommonModule, NgComponentOutlet } from "@angular/common";
import { Component, Input, OnInit, Type } from "@angular/core";
import { domainNotFoundError } from "./DomainNotFound/domainNotFound";
import { noSystemAccessError } from "./noSystemAccess/noSystemAccess";
import { Schoolingo } from "@Schoolingo";

@Component({
    selector: 'error-main',
    standalone: true,
    imports: [CommonModule, NgComponentOutlet],
    templateUrl: './index.html',
    styleUrls: ['./error.css', '../Styles/card.css']
})

export class ErrorMain implements OnInit {

    public errors: Record<number | string, Type<noSystemAccessError | Component>> = {
        1001: noSystemAccessError,
        1002: domainNotFoundError
    };

    constructor(
        public schoolingo: Schoolingo
    ) {

    }

    @Input() error: number = -1;

    ngOnInit(): void {
    }

}