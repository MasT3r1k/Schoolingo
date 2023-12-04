import { Component, Input } from '@angular/core';
import { Table } from './Table';

export type TableTypes = 'list' | 'interactive-list';

export type TableColumn = {
  name: string;
};

export type TableOptions = {
  allowMultiSelect?: boolean;
  tableType?: TableTypes;
};

@Component({
  selector: 'schoolingo-table',
  templateUrl: './table.component.html',
  styleUrl: './table.component.css'
})
export class TableComponent {
  constructor(
    public table: Table
  ) {}

  @Input() name: string = '';
  @Input() options: TableOptions = {
    allowMultiSelect: false,
    tableType: 'list'
  };
  @Input() columns: TableColumn[] = [];
  @Input() data: (string|number|boolean)[][] = [];
  private lastData: number = this.data.length;

  public page: number = 1;
  public visibleRows: (string | number | boolean)[][] = [];
  ngOnInit(): void {
    this.table.createTable(this.name, this.columns, this.data);
  }

}
