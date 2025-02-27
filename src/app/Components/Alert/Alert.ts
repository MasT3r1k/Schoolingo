import { NgClass, NgStyle } from "@angular/common";
import { Component, Input } from "@angular/core";
import { Alert } from "@Schoolingo/Alert";
import { Locale } from "@Schoolingo/Locale";
import { IconsModule } from "../../Modules/Icons.module";

@Component({
    selector: 'alert',
    templateUrl: './Alert.html',
    standalone: true,
    imports: [NgClass, NgStyle, IconsModule],
    styleUrl: './Alert.css'
})
export class AlertComponent {

    constructor(public locale: Locale) {}

    @Input() alert!: Alert;

}