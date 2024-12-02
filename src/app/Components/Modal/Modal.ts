import { Component } from "@angular/core";
import { Locale } from "@Schoolingo/Locale";
import { modalOptions, modalItem } from "@Components/Modal/Modal.d";
import { NgClass, NgStyle } from "@angular/common";
import { TabsComponent } from "@Components/Tabs/Tabs";
export { modalOptions, modalItem }

let modals: Modal[] = [];

@Component({
    selector: 'schoolingo-modals',
    templateUrl: './Modal.html',
    standalone: true,
    imports: [NgClass, TabsComponent, NgStyle],
    styleUrls: ['./Modal.css', '../../Styles/input.css'],
    outputs: ['modal']
})

export class ModalComponent {
    constructor( public locale: Locale ) { }

    public getModals(): Modal[] {
        return modals.filter((modal: Modal) => modal.isOpened);
    }

    public closeAllModals(): void {
        this.getModals().forEach((modal: Modal) => modal.close());
    }

    public getDate(item: modalItem): string {
        if (item.type == "date") {
            let a = item.value.object.getValue()[item.value.key].format('DD.MM.YYYY');
            return a;
        }else {
            return '';
        }
    }
}

export class Modal {
    public isOpened: boolean = false;
    public options!: modalOptions;
    constructor(options: modalOptions) {
        this.options = options;
        modals.push(this);
    }

    public open(): void {
        this.isOpened = true;
    }
    public close(): void {
        this.isOpened = false;
    }

}