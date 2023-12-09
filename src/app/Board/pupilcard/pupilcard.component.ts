import { Component, OnInit, Renderer2 } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
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
    ["Fylyp", "Bašek2", "B2I", "muž", "Strakonice"],
    ["Fylyp", "Fylyp", "B2I", "muž", "Strakonice"],
    ["Fylyp", "Bašek3", "B2I", "muž", "Strakonice"],
    ["Fylyp", "Bašek4", "B2I", "muž", "Strakonice"],
    ["Fylyp", "Bašek5", "B2I", "muž", "Strakonice"],
    ["Fylyp", "Bašek6", "B2I", "muž", "Strakonice"],
    ["Fylyp", "Bašek7", "B2I", "muž", "Strakonice"],
    ["Fylyp", "Bašek8", "B2I", "muž", "Strakonice"],
    ["Fylyp", "Bašek9", "B2I", "muž", "Strakonice"],
    ["Fylyp", "Bašek10", "B2I", "muž", "Strakonice"],
    ["Fylyp", "Bašek11", "B2I", "muž", "Strakonice"],
    ["Fylyp", "Bašek12", "B2I", "muž", "Strakonice"],
    ["Fylyp", "Bašek13", "B2I", "muž", "Strakonice"],
  ]

  options: TableOptions = {
    tableType: 'interactive-list'
  };

  
  constructor(
    public locale: Locale,
    private renderer: Renderer2
  ) {}

  public declare table: Table;

  ngOnInit(): void {
    setTimeout(() => {
      this.table = getTable(this.tableName);
      for(let i = 0;this.data.length < 1200;i++) {
        this.data.push(["Fylyp", "Bašek" + this.data.length, "B2I", "muž", "Strakonice"]);
      }
      if (!this.table) return;
      this.table.updateValue(this.data);
      this.table.rowClickFunction = (id: number) => {
        console.log('You clicked student (' + this.data[id][0] + ' ' + this.data[id][1] + ') from ' + this.data[id][4])
      };
    });

    this.renderer.listen(window, 'keydown', (event: KeyboardEvent) => {
      if (event.key && (event?.target as HTMLElement).nodeName !== 'INPUT') {
        switch(event.key) {
          case "Escape":
            if (this.table.selectedItem != undefined) this.table.selectedItem = undefined;
            break;
        }
        //console.log(event);
      }
    });
  }

  public updateFilter(): void {
    if (!this.table) return;
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
