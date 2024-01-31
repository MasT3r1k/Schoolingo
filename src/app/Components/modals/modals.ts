import { Injectable } from "@angular/core";
import { formError } from 'src/app/login/login.component';

export type modalList = 'newHomework' | null;

@Injectable()
export class Modals {
    constructor(
        
    ) {}

    private modal: modalList = null;
    public data: any = {};
    public formErrors: formError[] = [];
    
    public errorFilter(name: string): boolean | string {
        let filter = this.formErrors.filter((err) => err.input == name);
        return (filter.length == 0) ? false : filter[0].locale;
    }

    public showModal(modal: modalList, data?: any): void {
        this.formErrors = [];
        if (data) {
            this.data = data;
            console.log(data);
        }
        this.modal = modal;
    }

    public getModal(): modalList {
        return this.modal;
    }

}