import { Injectable } from "@angular/core";
import { TableColumn } from "./table.component";

type TableValue = (string | number | boolean)[];

let tables: Table[] = [];

export function getTable(table: string): Table {
    return tables.filter((tab) => tab.name == table)?.[0];
}


@Injectable()
export class Table {
    constructor() {}

    public name: string = '';


    public createTable(name: string, columns: TableColumn[], values: TableValue[]): Table {
        this.name = name;
        tables.push(this);
        return this;
    }

    public updateValue(value: any): Table {
        return this;
    }


}