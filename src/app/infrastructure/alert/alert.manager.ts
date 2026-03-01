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

    public alert(type: SweetAlertIcon, text: string, actions: AlertButton[] = [], timer?: number): Alert {
        const existing = this.alerts.find((alert) => alert.type == type && alert.text == text);
        if (existing) {
            existing.visible = true;
            if (timer) {
                this.setAlertTimeout(existing, timer);
            }
            return existing;
        }

        const alert = new Alert(type, text, actions);
        this.alerts.push(alert);
        if (timer) {
            this.setAlertTimeout(alert, timer);
        }
        return alert;
    }

    private setAlertTimeout(alert: Alert, timer: number): void {
        if (alert.timerHandle) {
            clearTimeout(alert.timerHandle);
        }
        alert.timerHandle = setTimeout(() => {
            alert.close();
            this.removeAlert(alert);
        }, timer);
    }

    public getAlerts(): typeof this.alerts {
        return this.alerts;
    }
} 