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

type TableValue = (string | number | boolean)[];

type TableFilter = {
    column: string;
    contains?: string;
    startsWith?: string;
    endsWith?: string;
};

type TableFilterType = 'and' | 'or';

let tables: Table[] = [];

export function getTable(table: string): Table {
    return tables.filter((tab) => tab.name == table)?.[0];
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
    public ordered: string | null = null;

    public page: number = 1;

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

            let used: string[][] = [];

            this.filter.forEach((f: TableFilter, index: number) => {
                let columnId = this.columns.findIndex((search: TableColumn) => search.name == f.column);
                if (columnId == -1) return this.logger.send('Table', 'Column not found.');

                if (!columns.includes(columnId)) columns.push(columnId);


                if (f?.startsWith) {
                    let text = removeDiacritics(f.startsWith.toLowerCase()).split(' ');
                    if (!used[0]) used[0] = [];
                    for(let i = 0;i < text.length;i++) {
                        if (!used[0].includes(text[i]) && text[i] != '') {
                            used[0].push(text[i]);
                        }
                    }
                }
                if (f?.contains) {
                    let text = removeDiacritics(f.contains.toLowerCase()).split(' ');
                    if (!used[1]) used[1] = [];

                    for(let i = 0;i < text.length;i++) {
                        if (used[1].filter((___) => ___ == text[i]).length <= text.filter((___) => ___ == text[i]).length && text[i] != '') {
                            used[1][index] = text[i];
                        }
                    }

                }
                if (f?.endsWith) {
                    let text = removeDiacritics(f.endsWith.toLowerCase()).split(' ');
                    if (!used[2]) used[2] = [];

                    for(let i = 0;i < text.length;i++) {
                        if (!used[2].includes(text[i]) && text[i] != '') {
                            used[2].push(text[i]);
                        }
                    }
                }
                
            })

            console.log(used);

            this.data.forEach((value: TableValue) => {
                let num: number = 0;
                let usedText: number[] = [];
                for(let i = 0;i < columns.length;i++) {
                    for(let y = 0;y < used?.[1].length;y++) {
                        if (removeDiacritics(value[i].toString().toLowerCase()).includes(used?.[1]?.[y]) && !usedText.includes(y)) {
                            usedText.push(y);
                            num++;
                            break;
                        }
                    }
                }

                if (num >= used[1].length) {
                    filteredData.push(value);
                }
            });

            this.filteredData = filteredData;



            // let filteredData: TableValue[] = [];
            // let column: number[] = [];

            // this.filter.forEach((_: TableFilter) => {

            //     let columnId = this.columns.findIndex((search: TableColumn) => search.name == _.column);
            //     if (columnId == -1) return this.logger.send('Table', 'Column not found.');


            //     ((this.filterType == 'and' && filteredData.length > 0) ? filteredData : this.data).forEach((value: TableValue) => {

            //         var text: string[];
            //         let textL: string[] = [];

            //         let vc = removeDiacritics(value[columnId].toString().toLowerCase()).split(' ');
            //         let vcB: number = 0;

            //         if (_.startsWith) {
            //             text = removeDiacritics(_?.startsWith.toString().toLowerCase()).split(' ');
            //             for(let i = 0;i < text.length;i++) {
            //                 if (!textL.includes(text[i]) && text[i] != '') textL.push(text[i]);
            //             }
            //         }

            //         if (_.contains) {
            //             text = removeDiacritics(_?.contains.toString().toLowerCase()).split(' ');
            //             for(let i = 0;i < text.length;i++) {
            //                 if (!textL.includes(text[i]) && text[i] != '') textL.push(text[i]);
            //             }
            //         }

            //         if (_.endsWith) {
            //             text = removeDiacritics(_?.endsWith.toString().toLowerCase()).split(' ');
            //             for(let i = 0;i < text.length;i++) {
            //                 if (!textL.includes(text[i]) && text[i] != '') textL.push(text[i]);
            //             }
            //         }

            //         for(let i = 0;i < textL.length;i++) {
            //             // TODO: KDYŽ BUDE SLOUPEC OBSAHOVAT VÍC JAK JEDNO SLOVO
            //             console.log(vc)
            //             console.log(textL[i])
            //             for(let y = 0;y < vc.length;y++) {
            //                 if (vc[y].includes(textL[i])) {
            //                     vcB++;
            //                 }
            //             }
            //         }
            //         if (vc.length == vcB) filteredData.push(value);

            //     })
                
            // })
            // this.filteredData = filteredData;
        } else {
            this.filteredData = this.data;
        }
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