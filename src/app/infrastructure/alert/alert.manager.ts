import { Injectable } from "@angular/core";
import { SweetAlertIcon } from 'sweetalert2'
import { AlertButton } from "./button";
import { Alert } from "./alert";

@Injectable()
export class BaseAlertManager {
    protected alerts: Alert[] = [];

    public removeAlert(alert: Alert): void {
        this.alerts = this.alerts.filter(a => a != alert);
    }

    public alert(type: SweetAlertIcon, text: string, actions: AlertButton[] = []): Alert {
        if (this.alerts.some((alert) => alert.type == type && alert.text == text)) return this.alerts.filter((alert) => alert.type == type && alert.text == text)[0];

        const alert = new Alert(type, text, actions);
        this.alerts.push(alert);
        return alert;
    }

    public getAlerts(): typeof this.alerts {
        return this.alerts;
    }
} 