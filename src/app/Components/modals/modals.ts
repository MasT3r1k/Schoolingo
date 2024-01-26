import { Injectable } from "@angular/core";

export type modalList = 'newHomework' | null;

@Injectable()
export class Modals {
    constructor(
    ) {}

    private modal: modalList = null;
    public data: any = {};

    public showModal(modal: modalList, data?: any): void {
        this.modal = modal;
        if (data) {
            this.data = data;
        }
    }

    public getModal(): modalList {
        return this.modal;
    }

}