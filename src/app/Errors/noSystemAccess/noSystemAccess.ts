import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";

@Component({
    host: {'error': 'no-system-access'},
    standalone: true,
    imports: [CommonModule],
    templateUrl: './noSystemAccess.html',
    styleUrls: ['./noSystemAccess.css']
})

export class noSystemAccessError {
}