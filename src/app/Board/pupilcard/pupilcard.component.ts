import { HttpClient } from '@angular/common/http';
import { Component, OnInit, Renderer2 } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Dropdowns } from '@Components/Dropdown/Dropdown';
import { getTable, Table } from '@Components/table/Table';
import { TableColumn, TableOptions } from '@Components/table/Table';
import { Tabs } from '@Components/Tabs/Tabs';
import { Locale } from '@Schoolingo/Locale';
import { SocketService } from '@Schoolingo/Socket';
import { debounceTime } from 'rxjs';

type Student = {
  firstName: string;
  lastName: string;
  class: string;
  city: string;
  sex: number;
};

@Component({
  templateUrl: './pupilcard.component.html',
  styleUrls: ['./pupilcard.component.css', '../board.css', '../../input.css'],
})
export class PupilcardComponent implements OnInit {
  constructor(
    public locale: Locale,
    private renderer: Renderer2,
    private socketService: SocketService,
    public tabs: Tabs,
    private http: HttpClient,
    public dropdown: Dropdowns
  ) {}

  public tableName: string = 'student-list';
  public creatingNewOne: boolean = false;

  searchStudent = new FormControl('');
  searchPlace = new FormControl('');

  columns: TableColumn[] = [
    {
      name: 'firstName',
    },
    {
      name: 'lastName',
    },
    {
      name: 'class',
    },
    {
      name: 'sex',
    },
    {
      name: 'city',
    },
  ];

  _dat: any[] = [];
  data: any[] = [];

  gender: any = null;
  genders: any[] = ['muž', 'žena'];
  class: any = null;
  classes: any[] = ['B3.I', 'B2.I'];

  addresses: any[] = [];
  addressesDropdown: string = 'searchAddresses';

  options: TableOptions = {
    tableType: 'interactive-list',
  };

  public declare table: Table;

  ngOnInit(): void {
    this.dropdown.addDropdown(this.addressesDropdown);
    setTimeout(() => {
      this.table = getTable(this.tableName);
      if (!this.table) return;
      this.table.updateValue(this.data);
      this.table.order = [1, 'asc'];
      this.table.rowClickFunction = (id: number) => {
        console.log(
          'You clicked student (' +
            this.data[id][0] +
            ' ' +
            this.data[id][1] +
            ') from ' +
            this.data[id][4]
        );
      };

      this.socketService.getSocket().Socket?.emit('getStudents');
      this.socketService.addFunction('listStudents', (student: Student[]) => {
        this.data = [];
        for (let i = 0; i < student.length; i++) {
          this.data.push([
            student[i].firstName,
            student[i].lastName,
            student[i].class,
            this.genders[student[i].sex],
            student[i].city,
          ]);
        }
        this.table.updateValue(this.data);
      });
    });

    this.renderer.listen(window, 'keydown', (event: KeyboardEvent) => {
      if (event.key && (event?.target as HTMLElement).nodeName !== 'INPUT') {
        switch (event.key) {
          case 'Escape':
            if (this.table.selectedItem != undefined)
              this.table.selectedItem = undefined;
            if (this.creatingNewOne) this.creatingNewOne = false;
            break;
        }
        //console.log(event);
      }
    });

    this.searchStudent.valueChanges
      .pipe(debounceTime(300))
      .subscribe((): void => {
        this.updateFilter();
      });

    this.searchPlace.valueChanges
      .pipe(debounceTime(300))
      .subscribe((value: string | null): void => {
        if (!value || value == '') return;
        this.http
          .get(
            'https://api.locationiq.com/v1/autocomplete?key=pk.6e7bdb2789440ab001b900727b68e395&q=' +
              value +
              '&limit=5&dedupe=1'
          )
          .subscribe((response: any): void => {
            this.addresses = response;
          });
      });
  }

  ngOnDestroy(): void {
    this.socketService.socketFunctions['listStudents'] = {};
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
        contains: this.searchStudent.value?.toString(),
      },
      {
        column: this.columns[1].name,
        contains: this.searchStudent.value?.toString(),
      },
    ]);
  }
}
