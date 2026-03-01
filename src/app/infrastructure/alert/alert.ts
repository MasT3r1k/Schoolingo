import { SweetAlertIcon } from "sweetalert2";
import { AlertButton } from "./button";

export interface Alert {
    type: SweetAlertIcon;
    text: string;
    actions: AlertButton[];
    _closeable: boolean;
    visible: boolean;
    timerHandle?: any;
}

export class Alert {
    constructor(type: SweetAlertIcon, text: string, actions: AlertButton[] = []) {
        this.type = type;
        this.text = text;
        this.actions = actions;
        this._closeable = true;
        this.visible = true;
    }

    public close(): void {
        this.visible = false;
        if (this.timerHandle) {
            clearTimeout(this.timerHandle);
        }
    }

    public closeable(state: boolean): void {
        this._closeable = state;
    }

}