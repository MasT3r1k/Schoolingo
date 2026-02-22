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
        const existing = this.alerts.find((alert) => alert.type == type && alert.text == text);
        if (existing) {
            existing.visible = true;
            this.setAlertTimeout(existing);
            return existing;
        }

        const alert = new Alert(type, text, actions);
        this.alerts.push(alert);
        this.setAlertTimeout(alert);
        return alert;
    }

    private setAlertTimeout(alert: Alert): void {
        setTimeout(() => {
            alert.close();
            this.removeAlert(alert);
        }, 5000);
    }

    public getAlerts(): typeof this.alerts {
        return this.alerts;
    }
} 