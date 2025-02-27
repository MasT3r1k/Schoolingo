import { AlertTypes } from './Alert.d';
export { AlertTypes }

export class AlertButton {
    public text: string = '';
    public callback: Function = () => { };

    constructor(text: string, callback: Function) {
        this.text = text;
        this.callback = callback;
    }
}

export class Alert {
    public visible: boolean = true;

    public type: AlertTypes = 'success';
    public text: string = '';
    public closeable: boolean = false;

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