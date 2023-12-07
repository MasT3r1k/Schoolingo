import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { getTable, Table } from '@Components/table/Table';
import { TableColumn, TableOptions } from '@Components/table/Table';
import { Locale } from '@Schoolingo/Locale';

type Student = {
  name: string;
  class: number;

}

@Component({
  selector: 'app-pupilcard',
  templateUrl: './pupilcard.component.html',
  styleUrl: './pupilcard.component.css'
})
export class PupilcardComponent implements OnInit {
  public tableName: string = 'student-list';

  searchStudent = new FormControl('');


  columns: TableColumn[] = [
    {
      name: "firstName"
    },
    {
      name: "lastName"
    },
    {
      name: "class"
    },
    {
      name: "sex"
    },
    {
      name: "city"
    }
  ];

  _dat: any[] = [];
  data: any[] = [
    ["Fylyp", "Bašek Strakonický", "B2I", "muž", "Strakonice"],
    ["Fylyp", "Bašek", "B2I", "muž", "Strakonice"],
    ["Fylyp", "Fylyp", "B2I", "muž", "Strakonice"],
    ["Fylyp", "Bašek", "B2I", "muž", "Strakonice"],
    ["Fylyp", "Bašek", "B2I", "muž", "Strakonice"],
    ["Fylyp", "Bašek", "B2I", "muž", "Strakonice"],
    ["Fylyp", "Bašek", "B2I", "muž", "Strakonice"],
    ["Fylyp", "Bašek", "B2I", "muž", "Strakonice"],
    ["Fylyp", "Bašek", "B2I", "muž", "Strakonice"],
    ["Fylyp", "Bašek", "B2I", "muž", "Strakonice"],
    ["Fylyp", "Bašek", "B2I", "muž", "Strakonice"],
    ["Fylyp", "Bašek", "B2I", "muž", "Strakonice"],
    ["Fylyp", "Bašek", "B2I", "muž", "Strakonice"],
    ["Fylyp", "Bašek", "B2I", "muž", "Strakonice"],
  ]

  options: TableOptions = {
    tableType: 'interactive-list'
  };
  
  constructor(
    public locale: Locale
  ){}

  public declare table: Table;

  ngOnInit(): void {
    setTimeout(() => {
      this.table = getTable(this.tableName);
      // for(let i = 0;i < 1200;i++) {
      //   this.data.push(["Fylyp", "Bašek", "B2I", "muž", "Strakonice"]);
      // }
      this.table.updateValue(this.data);
    })
  }

  public updateFilter(event: Event): void {
    if (this.searchStudent.value == '') {
      this.table.updateFilter([]);
      return;
    }
    this.table.updateFilter([
      {
        column: this.columns[0].name,
        contains: this.searchStudent.value?.toString()
      },
      {
        column: this.columns[1].name,
        contains: this.searchStudent.value?.toString()
      }
    
    ])
  }

}
