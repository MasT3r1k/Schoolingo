import { AlertTypes } from './Alert.d';
export { AlertTypes }

export class Alert {
    public visible: boolean = true;

    public type: AlertTypes = 'success';
    public text: string = '';
    public closeable: boolean = false;

    constructor(type: AlertTypes, text: string, closeable: boolean = false) {
        this.type = type;
        this.text = text;
        this.closeable = closeable;
    }

    public close(): void {
        this.visible = false;
    }
}