import { Type } from "@angular/core";

interface ModalItem {
    type: 'component',
    component: Type<any>;
}

interface Modal {
    title: string;
    title_placeholders?: Record<string, string>;
    width?: number;
    forceScrollbar?: boolean;
    closeable: boolean;
    items: ModalItem[];
    isOpen: boolean;
    children?: Modal[];
    index?: number;
    dropdown: string | null;
    data?: any;
}

type ModalSetup = Omit<Modal, 'dropdown'|'isOpen'>;

export class ModalManager {
    private modals: { [key: string]: Modal } = {};
    public addModal(name: string, modal: ModalSetup): void { this.modals[name] = { ...modal, title_placeholders: modal.title_placeholders ?? {}, children: modal.children || [], dropdown: '', isOpen: false, index: modal.index ?? 500 } }
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
            case "width":
                modal.width = value;
        }
    }

    public openDropdown(name: string, dropdown: string | null): void {
        if (!this.modals[name]) return
        this.modals[name].dropdown = dropdown
    }
    public closeDropdown(name: string): void {
        if (!this.modals[name]) return
        this.modals[name].dropdown = null
    }

    public openModal(name: string, data?: any): void {
        if (!this.modals[name]) return
        this.modals[name].isOpen = true
        if (data) this.modals[name].data = data;
    }

    public getModalData(name: string): any {
        return this.modals[name]?.data;
    }

    public closeModal(name: string): void { 
        if (!this.modals[name]) return
        this.modals[name].isOpen = false
        // Optional: clear data on close? Maybe not if we want to preserve state?
        // this.modals[name].data = undefined;
    }
    
    public closeAllModals(): void {
        Object.values(this.modals).forEach((modal) => {
            modal.isOpen = false;
        })
    }

}