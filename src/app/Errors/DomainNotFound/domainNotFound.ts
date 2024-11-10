import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";

@Component({
    standalone: true,
    imports: [CommonModule],
    templateUrl: './domainNotFound.html',
    styleUrls: ['./domainNotFound.css']
})

export class domainNotFoundError implements OnInit {

    constructor() {

    }

    ngOnInit(): void {
        
    }

}