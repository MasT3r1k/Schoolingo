import { Component, OnInit, Renderer2 } from '@angular/core';
import { FormControl } from '@angular/forms';
import { getTable, Table } from '@Components/table/Table';
import { TableColumn, TableOptions } from '@Components/table/Table';
import { Locale } from '@Schoolingo/Locale';
import { SocketService } from '@Schoolingo/Socket';

type Student = {
  firstName: string;
  lastName: string;
  class: string;
  city: string;
  sex: string;
}

@Component({
  templateUrl: './pupilcard.component.html',
  styleUrls: ['./pupilcard.component.css', '../boardv2.css']
})
export class PupilcardComponent implements OnInit {
  public tableName: string = 'student-list';
  public creatingNewOne: boolean = false;

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
  data: any[] = []

  options: TableOptions = {
    tableType: 'interactive-list'
  };

  
  constructor(
    public locale: Locale,
    private renderer: Renderer2,
    private socketService: SocketService
  ) {}

  public declare table: Table;

  ngOnInit(): void {
    setTimeout(() => {
      this.table = getTable(this.tableName);
      if (!this.table) return;
      this.table.updateValue(this.data);
      this.table.rowClickFunction = (id: number) => {
        console.log('You clicked student (' + this.data[id][0] + ' ' + this.data[id][1] + ') from ' + this.data[id][4])
      };

    this.socketService.getSocket().Socket?.emit('getStudents');
    this.socketService.addFunction('listStudents', (student: Student[]) => {
      for(let i = 0;i < student.length;i++) {
        this.data.push([student[i].firstName, student[i].lastName, student[i].class, student[i].sex, student[i].city]);
      }
      this.table.updateValue(this.data);
    });      

    });

    this.renderer.listen(window, 'keydown', (event: KeyboardEvent) => {
      if (event.key && (event?.target as HTMLElement).nodeName !== 'INPUT') {
        switch(event.key) {
          case "Escape":
            if (this.table.selectedItem != undefined) this.table.selectedItem = undefined;
            if (this.creatingNewOne) this.creatingNewOne = false;
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
