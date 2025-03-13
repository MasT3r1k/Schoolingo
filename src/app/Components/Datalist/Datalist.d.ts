import { SafeHtml } from "@angular/platform-browser";

export type Data = {
    value: string;
} & ({
    isLocale: true;
    localePrefix?: string;
    localeSuffix?: string;
} | {
    isLocale: false;
}) | {
    id: number;
} | {
    html: string;
};

export interface DatalistOptions {
    url?: string;
    search?: boolean;
    ignore?: string[];
    titles?: string[];
    hideInfo?: boolean;
    hideColumns?: number[];
    hidePagination?: boolean;
    disableLocales?: boolean[];
    noDynamic?: boolean;
}

export interface errorAPI {
    error: string;
    errorCode: string;
} 

export type dataAPI = ({
    rows: number;
    data: any[];
} | errorAPI);

export interface Metadata {
    rows: number;
}