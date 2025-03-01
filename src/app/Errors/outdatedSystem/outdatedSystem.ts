import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";

@Component({
    host: {'error': 'outdated-system'},
    standalone: true,
    imports: [CommonModule],
    templateUrl: './outdatedSystem.html',
    styleUrls: ['./outdatedSystem.css']
})

export class outdatedSystemError {
}