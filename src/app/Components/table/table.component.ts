import { Component, Input } from '@angular/core';
import { Table, TableColumn, TableOptions } from './Table';
import { Router } from '@angular/router';
import { Locale } from '@Schoolingo/Locale';

@Component({
  selector: 'schoolingo-table',
  templateUrl: './table.component.html',
  styleUrl: './table.component.css'
})
export class TableComponent {
  private routerSub;

  constructor(
    public tableService: Table,
    private router: Router,
    public locale: Locale
  ) {
    this.routerSub = this.router.events.subscribe((url: any) => {
      if (url?.routerEvent) return;

      if ((!url?.routerEvent?.urlAfterRedirects && !url?.url) || (url?.routerEvent?.urlAfterRedirects == '/login' || url?.url == '/login') || url.type != 1) { return; }
      
      setTimeout(() => this.table.updateFilter([]).updatePage());
      

    });
  }

  @Input() name: string = '';
  @Input() options: TableOptions = {
    allowMultiSelect: false,
    tableType: 'list'
  };
  @Input() columns: TableColumn[] = [];
  @Input() data: (string|number|boolean)[][] = [];
  public declare table: Table;

  public visibleRows: (string | number | boolean)[][] = [];
  ngOnInit(): void {
    this.table = this.tableService.createTable(this.name, this.columns, this.data).updateOptions(this.options);

  }

}
