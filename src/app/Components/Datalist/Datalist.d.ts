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
    hideColumns?: number[];
    hidePagination?: boolean;
    disableLocales?: boolean[];
    noDynamic?: boolean;
}

export type dataAPI = ({
    rows: number;
    data: any[];
} | {
    error: string;
    errorCode: string;
}
);

export interface Metadata {
    rows: number;
}