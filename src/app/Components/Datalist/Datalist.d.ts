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
};

export interface DatalistOptions {
    url?: string;
    search?: boolean;
    ignore?: string[];
    titles?: string[];
    hideInfo?: boolean;
    hidePagination?: boolean;
    disableLocales?: boolean[];
    noDynamic?: boolean;
}

export interface dataAPI {
    rows: number;
    data: any[];
}

export interface Metadata {
    rows: number;
}