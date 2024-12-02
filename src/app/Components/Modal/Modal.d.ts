import { BehaviorSubject } from "rxjs";

export type modalItem = {
    type: 'tabs',
    items: string[]
} | {
    type: 'value' | 'date',
    label: string;
    value: {
        object: any;
        key: string;
    } & ({
        isLocale?: true;
        localePrefix?: string;
    } | {
        isLocale?: false;
    })
} | {
    type: 'line';
} | {
    type: 'component';
    component: Type<any>;
};

export type modalOptions = {
    closeable?: boolean;
    title: {
        icon?: string;
        text: string;
    };
    size: 'size-1' | 'size-2';
    items: modalItem[];
}