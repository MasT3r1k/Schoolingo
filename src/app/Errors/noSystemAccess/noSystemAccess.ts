import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";

@Component({
    host: {'error': 'no-system-access'},
    standalone: true,
    imports: [CommonModule],
    templateUrl: './noSystemAccess.html',
    styleUrls: ['./noSystemAccess.css']
})

export class noSystemAccessError implements OnInit {

    constructor() {}

    ngOnInit(): void {}

}