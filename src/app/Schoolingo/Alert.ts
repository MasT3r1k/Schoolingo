import { AlertTypes } from './Alert.d';
export { AlertTypes }

export class AlertButton {
    public text = '';
    public callback: Function = () => { };

    constructor(text: string, callback: Function) {
        this.text = text;
        this.callback = callback;
    }
}

export class Alert {
    public visible = true;

    public type: AlertTypes = 'success';
    public text = '';
    public closeable = false;

    public buttons: AlertButton[] = [];

    constructor(type: AlertTypes, text: string, closeable: boolean = false) {
        this.type = type;
        this.text = text;
        this.closeable = closeable;
    }

    public addButton(text: string, callback: Function): void {
        this.buttons.push(new AlertButton(text, callback));
    }

    public close(): void {
        this.visible = false;
    }
}