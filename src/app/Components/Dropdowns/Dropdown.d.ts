import { BehaviorSubject } from "rxjs";

export type ContextButtonRightText = 'arrow' | string;

export type ContextButton = {
    isActive: boolean = true;
} & ({
    type: 'function';
    func: Function;
    label: string;
    rightText?: ContextButtonRightText;
} | {
    type: 'toggle';
    value: BehaviorSubject<boolean>;
    label: string;
} | {
    type: 'text',
    label: string;
} | {
    type: 'line',
} | {
    type: 'calendar',
    date: BehaviorSubject<date>;
})

export type ContextMenu = {
    title: string = '';
    position?: [number, number] = [0,0];
    isOpen: boolean = false;
    items: ContextButton[] = [];
}