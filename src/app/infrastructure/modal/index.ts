import { Type } from "@angular/core";

interface ModalItem {
    type: 'component',
    component: Type<any>;
}

interface Modal {
    title: string;
    closeable: boolean;
    items: ModalItem[];
    isOpen: boolean;
    children?: Modal[];
    dropdown: string | null;
}

type ModalSetup = Omit<Modal, 'dropdown'|'isOpen'>;

export class ModalManager {
    private modals: { [key: string]: Modal } = {};
    public addModal(name: string, modal: ModalSetup): void { this.modals[name] = { ...modal, children: modal.children || [], dropdown: '', isOpen: false } }
    public getModals(): (Modal & {id: string})[] {
        return Object.entries(this.modals).filter(([modal1, modal2]) => modal2?.isOpen == true).map(([modal1, modal2]) => ({...modal2, id: modal1}));
    }

    public updateModal(name: string, key: string, value: any): void {
        let modal = this.modals[name];
        if (!modal) return;
        switch(key) {
            case "title":
                modal.title = value;
                break;
        }
    }

    public openDropdown(name: string, dropdown: string | null): void { this.modals[name].dropdown = dropdown }
    public closeDropdown(name: string): void { this.modals[name].dropdown = null }

    public openModal(name: string) { this.modals[name].isOpen = true }
    public closeModal(name: string) { this.modals[name].isOpen = false}
    

}