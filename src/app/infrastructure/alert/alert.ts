import { SweetAlertIcon } from "sweetalert2";
import { AlertButton } from "./button";

export interface Alert {
    type: SweetAlertIcon;
    text: string;
    actions: AlertButton[];
    _closeable: boolean;
    visible: boolean;
}

export class Alert {
    constructor(type: SweetAlertIcon, text: string, actions: AlertButton[]) {
        this.type = type;
        this.text = text;
        this.actions = actions;
        this._closeable = false;
        this.visible = true;
    }

    public close(): void {
        this.visible = false;
    }

    public closeable(state: boolean): void {
        this._closeable = state;
    }

}