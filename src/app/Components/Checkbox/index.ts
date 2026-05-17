import { Component, Input } from "@angular/core";
import { IconsModule } from "@Schoolingo/icons";

@Component({
    selector: 'schoolingo-checkbox',
    templateUrl: './Checkbox.html',
    standalone: true,
    imports: [IconsModule],
    styleUrl: './Checkbox.css'
})
export class CheckboxComponent {
    constructor() {}

    @Input() checked: boolean = false;
}