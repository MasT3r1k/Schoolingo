import { NgClass, NgStyle } from "@angular/common";
import { Component, inject, Input } from "@angular/core";
import { Alert } from "@Schoolingo/alert";
import { Locale } from "@Schoolingo/locale";
import { IconsModule } from "@Schoolingo/icons";

@Component({
    selector: 'alert',
    templateUrl: './Alert.html',
    standalone: true,
    imports: [IconsModule],
    styleUrl: './Alert.css'
})
export class AlertComponent {
    public l = inject(Locale)

    constructor() {}

    @Input() alert!: Alert;

}