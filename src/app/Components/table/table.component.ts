import { Component, Input, OnInit } from '@angular/core';
import { Table, TableColumn, TableOptions, TableValue } from './Table';
import { Router } from '@angular/router';
import { Locale } from '@Schoolingo/Locale';

@Component({
  selector: 'schoolingo-table',
  templateUrl: './table.component.html',
  styleUrl: './table.component.css'
})
export class TableComponent implements OnInit {
  private routerSub;

  constructor(
    public tableService: Table,
    private router: Router,
    public locale: Locale
  ) {
    this.routerSub = this.router.events.subscribe((url: any) => {
      if (url?.routerEvent) return;

      if ((!url?.routerEvent?.urlAfterRedirects && !url?.url) || (url?.routerEvent?.urlAfterRedirects == '/login' || url?.url == '/login') || url.type != 1) { return; }
      
      setTimeout(() => {if (this.table) this.table.updateFilter([]).updatePage()});
      

    });
  }

  @Input() name: string = '';
  @Input() options: TableOptions = {
    allowMultiSelect: false,
    tableType: 'list'
  };
  @Input() columns: TableColumn[] = [];
  @Input() data: TableValue[] = [];
  public declare table: Table;

  public visibleRows: (string | number | boolean)[][] = [];
  ngOnInit(): void {
    this.table = this.tableService.createTable(this.name, this.columns, this.data).updateOptions(this.options);
  }

  ngOnDestroy(): void {
    this.routerSub.unsubscribe();
  }

  public getId(row: TableValue): number {
    return this.data.indexOf(row);
  }

  public sortTable(id: number): void {
    let old = this.table.order;
    this.table.order = [id, (old[0] == id && old[1] == 'asc') ? 'desc' : 'asc']
    this.table.updatePage();
  }

  public runRowClick(id: number): void {
    this.table.selectedItem = (this.table.selectedItem == id) ? undefined : id;
    if (this.table.rowClickFunction && this.table.selectedItem != undefined) {
      this.table.rowClickFunction(id);
    }
  }

}
