import { Injectable } from "@angular/core";

export type AlertSettings = {
    closeable: boolean;
}

@Injectable({ providedIn: 'root' })
export class AlertManagerClass {
    private alerts: Record<string, Alert[]> = {};
    public add(alert: Alert): void {
        if (!this.alerts[alert.getId()]) {
            this.alerts[alert.getId()] = [];
        }
        this.alerts[alert.getId()].push(alert)
    }

    public getAlerts(id: string): Alert[] {
        return this.alerts[id] ?? [];
    }

}

export class Alert {
    private parent = '';
    public text = '';
    public settings: AlertSettings | object = {};
    
    public getId(): string {
        return this.parent;
    }

    constructor(parent: string, text: string, settings: AlertSettings | object = {}) {
        this.parent = parent;
        this.text = text;
        this.settings = settings;

        alertManager.add(this);

    }


}


export let alertManager: AlertManagerClass = new AlertManagerClass();