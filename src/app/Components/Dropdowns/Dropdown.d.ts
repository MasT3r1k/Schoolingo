import { BehaviorSubject } from "rxjs";

export type ContextButton = {
    isActive: boolean = true;
} & ({
    type: 'function';
    func: Function;
    label: string;
} | {
    type: 'toggle';
    value: BehaviorSubject<boolean>;
    label: string;
} | {
    type: 'text',
    label: string;
} | {
    type: 'line',
})

export type ContextMenu = {
    title: string = '';
    position?: [number, number] = [0,0];
    isOpen: boolean = false;
    items: ContextButton[] = [];
}