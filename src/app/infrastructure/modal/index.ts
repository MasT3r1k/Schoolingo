import { Type } from "@angular/core";

interface ModalItem {
    type: 'component',
    component: Type<any>;
}

interface Modal {
    title?: string;
    title_placeholders?: Record<string, string>;
    description?: string;
    description_placeholders?: Record<string, string>;
    type?: 'normal' | 'danger';
    icon?: string;
    width?: number | string;
    forceScrollbar?: boolean;
    hiddenOverflow?: boolean;
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
    public addModal(name: string, modal: ModalSetup): void {
        this.modals[name] = {
            title: '',
            ...modal,
            type: modal.type ?? 'normal',
            title_placeholders: modal.title_placeholders ?? {},
            description_placeholders: modal.description_placeholders ?? {},
            children: modal.children || [],
            dropdown: '',
            isOpen: false,
            index: modal.index ?? 500
        } as Modal
    }

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
            case "description":
                modal.description = value;
                break;
            case "width":
                modal.width = value;
                break;
            case "icon":
                modal.icon = value;
                break;
            default:
                console.error(`Tried edit ${key} with value ${value} in modal ${name}`)
        }
    }

    public addTitlePlaceholders(name: string, key: string, value: string): void {
        let modal = this.modals[name];
        if (!modal) return;
        if (!modal.title_placeholders) {
            modal.title_placeholders = {};
        }
        modal.title_placeholders[key] = value;
    }

    public addDescriptionPlaceholders(name: string, key: string, value: string): void {
        let modal = this.modals[name];
        if (!modal) return;
        if (!modal.description_placeholders) {
            modal.description_placeholders = {};
        }
        modal.description_placeholders[key] = value;
    }

    public openDropdown(name: string, dropdown: string | null): void {
        if (!this.modals[name]) return
        this.modals[name].dropdown = dropdown
    }
    public closeDropdown(name: string): void {
        if (!this.modals[name]) return
        this.modals[name].dropdown = null
    }

    public openModal(name: string, data: any = null): void {
        if (!this.modals[name]) return
        this.modals[name].isOpen = true
        this.modals[name].data = data;
    }

    public getModalData(name: string): any {
        return this.modals[name]?.data;
    }

    public closeModal(name: string): void { 
        if (!this.modals[name]) return
        this.modals[name].isOpen = false
    }
    
    public closeAllModals(): void {
        Object.values(this.modals).forEach((modal) => {
            modal.isOpen = false;
        })
    }

}