import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";

@Component({
    host: {'error': 'failed-load-app'},
    standalone: true,
    imports: [CommonModule],
    templateUrl: './failedLoadApp.html',
    styleUrls: ['./failedLoadApp.css']
})

export class failedLoadAppError {
}