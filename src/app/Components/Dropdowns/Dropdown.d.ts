import { BehaviorSubject } from "rxjs";

export type ContextButton = {
    label: string;
    isActive: boolean = true;
} & {
    type: 'function';
    func: Function;
}

export type ContextMenu = {
    title: string = '';
    position?: [number, number] = [0,0];
    isOpen: boolean = false;
    items: ContextButton[] = [];
}