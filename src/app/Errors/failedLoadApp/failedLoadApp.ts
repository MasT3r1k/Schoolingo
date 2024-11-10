import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";

@Component({
    host: {'error': 'failed-load-app'},
    standalone: true,
    imports: [CommonModule],
    templateUrl: './failedLoadApp.html',
    styleUrls: ['./failedLoadApp.css']
})

export class failedLoadAppError implements OnInit {

    constructor() {}

    ngOnInit(): void {}

}