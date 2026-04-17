import { NgClass, NgStyle } from "@angular/common";
import { Component, inject } from "@angular/core";
import { Alert } from "@Schoolingo/alert";
import { Locale } from "@Schoolingo/locale";
import { IconsModule } from "@Schoolingo/icons";
import { AuthAlertManager } from "../../infrastructure/alert/auth.alert.manager";
import { BoardAlertManager } from "../../infrastructure/alert/board.alert.manager";

@Component({
    selector: 'alerts-container',
    templateUrl: './Alert.html',
    standalone: true,
    imports: [IconsModule, NgStyle],
    styleUrl: './Alert.css'
})
export class AlertComponent {
    public l = inject(Locale);
    public authAM = inject(AuthAlertManager);
    public boardAM = inject(BoardAlertManager);

    constructor() {}

    public getAlerts() {
        return [...this.authAM.getAlerts(), ...this.boardAM.getAlerts()];
    }
}