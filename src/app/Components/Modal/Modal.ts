import { Component, ContentChildren, OnInit, Renderer2 } from "@angular/core";
import { Locale } from "@Schoolingo/Locale";
import { modalOptions, modalItem } from "@Components/Modal/Modal.d";
import { NgClass, NgComponentOutlet, NgStyle } from "@angular/common";
import { TabsComponent } from "@Components/Tabs/Tabs";
import { IconsModule } from "../../Modules/Icons.module";
export { modalOptions, modalItem }

let modals: Modal[] = [];

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

@Component({
    selector: 'schoolingo-modals',
    templateUrl: './Modal.html',
    standalone: true,
    imports: [NgClass, TabsComponent, NgStyle, NgComponentOutlet, IconsModule],
    styleUrls: ['./Modal.css', '../../Styles/input.css'],
    outputs: ['modal']
})

export class ModalComponent implements OnInit {
    constructor( public locale: Locale, private renderer: Renderer2 ) { }

    ngOnInit(): void {
        this.renderer.listen("window", "keydown", (event: any) => {
            if (event.code === "Escape") {
                this.closeAllModals();
            }
        });
    }

    public getModals(): Modal[] {
        return modals.filter((modal: Modal) => modal.isOpened);
    }

    public closeAllModals(): void {
        this.getModals().forEach((modal: Modal) => {
            if (modal.options.closeable) modal.close()
        });
    }

    public getDate(item: modalItem): string {
        return item.type == 'date' ? item.value.object.getValue()[item.value.key].format('DD.MM.YYYY') : '';
    }
}