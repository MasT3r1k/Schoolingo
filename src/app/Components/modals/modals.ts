import { FormError } from "@Schoolingo/FormManager";
import { Injectable, Renderer2, RendererFactory2 } from "@angular/core";

export type Modal = {
    name: string;
    options: ModalOptions;
};

export type ModalOptions = {
    title: string;
    disableEscape?: boolean;
    allowMultiModals?: boolean;

};

export type modalList = 'homework' | 'changeTheme' | null;

@Injectable()
export class Modals {
    private renderer: Renderer2;


    constructor(    private rendererFactory: RendererFactory2,
        ) {
        this.renderer = this.rendererFactory.createRenderer(null, null);

        this.renderer.listen(window, 'keydown', (event: any) => {
            if (!event.key) return;
            switch(event.key) {
                case "Escape":
                    this.modals.forEach((modal: Modal) => {
                        if (modal.options.disableEscape === true) return;
                        this.modals.splice(this.modals.indexOf(modal));
                    });
                    break;
            }
        })
    }

    public modals: Modal[] = [];

    public openModal(name: string, options: ModalOptions): void {
        if (this.modals[this.modals.length - 1] && !this.modals[this.modals.length - 1].options?.allowMultiModals) { return; }
        this.modals.push({ name, options });
    }

    private modal: modalList = null;
    public data: any = {};
    public formErrors: FormError[] = [];
    
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