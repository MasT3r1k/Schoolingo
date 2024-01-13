import { Injectable } from "@angular/core";
import { Logger } from "@Schoolingo/Logger";
import { removeDiacritics } from "@Schoolingo/SearchFilter";


export type TableTypes = 'list' | 'interactive-list';

export type TableColumn = {
  name: string;
};

export type TableOptions = {
  allowMultiSelect?: boolean;
  tableType?: TableTypes;
};

export type TableValue = (string | number | boolean)[];

type TableFilter = {
    column: string;
    contains?: string;
    startsWith?: string;
    endsWith?: string;
};

type TableFilterType = 'and' | 'or';
export type tableOrder = 'asc' | 'desc';

let tables: Table[] = [];

export function getTable(table: string): Table {
    return tables.filter((tab) => tab.name == table)?.[0];
}

const sortStringArray = (stringArray: string[], mode?: tableOrder) => {
    if (!mode || mode === 'asc') {
      return stringArray.sort((a, b) => a.localeCompare(b))
    }
    return stringArray.sort((a, b) => b.localeCompare(a))
}


@Injectable()
export class Table {
    constructor(
        private logger: Logger
    ) {}

    public name: string = '';
    public options: TableOptions = {};
    public columns: TableColumn[] = [];
    public data: TableValue[] = [];
    public filteredData: TableValue[] = [];
    public showPerPage: number = 20;
    public visibleRows: TableValue[] = [];
    public filter: TableFilter[] = [];
    public filterType: TableFilterType = 'or';
    public order: [number, 'asc' | 'desc'] = [0, 'asc'];

    public declare rowClickFunction: Function

    public page: number = 1;
    public selectedItem: number | undefined = undefined;

    public createTable(name: string, columns: TableColumn[], values: TableValue[] = [], options: TableOptions = { allowMultiSelect: false, tableType: 'list' }): Table {
        this.name = name;
        this.columns = columns;
        this.data = values;
        this.options = options;
        this.showPage(1);
        tables.push(this);
        return this;
    }

    public updateOptions(options: TableOptions): Table {
        Object.entries(options).forEach((_: any) => {
            try {
                (this.options as any)[_[0]] = _[1];
            }catch(e) {}
        });
        return this;
    }

    public showPage(page: number): Table {
        this.page = page;
        this.updatePage();
        return this;
    }

    public updatePage(): void {
        if (this.filter.length > 0) {

            let filteredData: TableValue[] = [];

            let columns: number[] = [];
            let text: string[] = [];

            this.filter.forEach((f: TableFilter, index: number) => {
                let columnId = this.columns.findIndex((search: TableColumn) => search.name == f.column);
                if (columnId == -1) return this.logger.send('Table', 'Column not found.');

                if (!columns.includes(columnId)) columns.push(columnId);

                if (f?.startsWith) {
                    text = removeDiacritics(f.startsWith.toLowerCase()).split(' ');
                }

                if (f?.contains) {
                    text = removeDiacritics(f.contains.toLowerCase()).split(' ');
                }

                if (f?.endsWith) {
                    text = removeDiacritics(f.endsWith.toLowerCase()).split(' ');
                }
                
            });

            if (text[text.length -1] == '') { text.pop(); }

            this.data.forEach((value: TableValue) => {
                let used: string[] = JSON.parse(JSON.stringify(text));
                let usedLength = used.length;

                for(let i = 0;i < columns.length;i++) {
                    for(let y = 0;y < usedLength;y++) {
                        let values: string[] = removeDiacritics(value[i].toString().toLowerCase()).split(' ');
                        if (values.length == 0) return;

                        values.forEach(str => {
                            if (used.length == 0) { return; }
                            let isContain = str.includes(used[y]);
                            let isExist = filteredData.includes(value);
                            if (isContain) {
                                used.splice(y, 1);
                                usedLength--;
                            }
    
                            if (!isContain && isExist && text.length > 1) {
                                let index = filteredData.indexOf(value);
                                filteredData.splice(index, 1);
                                return;
                            }
    
                            if (isContain && !isExist) {
                                filteredData.push(value);
                                return;
                            }
                        })
                    }
                }


                if (used.length !== 0) {
                    let index = filteredData.indexOf(value);
                    if (index == -1) return;
                    filteredData.splice(index, 1);
                }
            });


            this.filteredData = filteredData;
        } else {
            this.filteredData = this.data;
        }

        this.filteredData = this.filteredData.sort(
            (a: TableValue, b: TableValue) => 
            (this.order[1] === 'asc')
                ? a[this.order[0]].toString().localeCompare(b[this.order[0]].toString())
                : b[this.order[0]].toString().localeCompare(a[this.order[0]].toString())
        );

        this.visibleRows = this.filteredData.slice((this.page - 1) * this.showPerPage, this.page * this.showPerPage);
    }

    public updateFilter(filterOptions: TableFilter[], type: TableFilterType = 'or'): Table {
        this.filter = filterOptions;
        this.filterType = type;
        this.updatePage();
        return this;
    }

    public updateValue(value: TableValue[]): Table {
        this.data = value;
        this.updatePage();
        return this;
    }


}