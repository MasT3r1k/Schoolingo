import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";

@Component({
    host: {'error': 'domain-not-found'},
    standalone: true,
    imports: [CommonModule],
    templateUrl: './domainNotFound.html',
    styleUrls: ['./domainNotFound.css']
})

export class domainNotFoundError { 
}