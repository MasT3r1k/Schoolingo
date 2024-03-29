import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Dropdowns } from '@Components/Dropdown/Dropdown';
import { getTable, Table } from '@Components/table/Table';
import { TableColumn, TableOptions } from '@Components/table/Table';
import { Tabs } from '@Components/Tabs/Tabs';
import { FormInput } from '@Schoolingo/FormManager';
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
    private socketService: SocketService,
    public tabs: Tabs,
    public dropdown: Dropdowns
  ) {}

  private listeners: any[] = [];

  public tableName: string = 'student-list';
  public creatingNewOne: boolean = false;


  searchStudent = new FormControl('');
  searchPlace = new FormControl('');

  columns: TableColumn[] = [
    { name: 'firstName' },
    { name: 'lastName'  },
    { name: 'class'     },
    { name: 'sex'       },
    { name: 'city'      },
  ];

  _dat: any[] = [];
  data: any[] = [];

  gender: any = null;
  genders: any[] = ['genders/0', 'genders/1'];
  class: any = null;
  classes: any[] = ['B2.I', 'B3.I'];

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
      this.listeners.push(this.socketService.addFunction('listStudents').subscribe((student: Student[]) => {
        this.data = [];
        for (let i = 0; i < student.length; i++) {
          this.data.push([
            student[i].firstName,
            student[i].lastName,
            student[i].class,
            this.locale.getLocale('genders/' + student[i].sex),
            student[i].city,
          ]);
        }
        this.table.updateValue(this.data);
      }));
    });

    this.searchStudent.valueChanges
      .pipe(debounceTime(300))
      .subscribe((): void => {
        this.updateFilter();
      });

  }

  ngOnDestroy(): void {

    this.listeners.forEach((listen: any) => {if (listen.unsubscribe) {listen.unsubscribe()}});

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

  /*** Creating new student  */
  public selectedTabInCreatingStudent: number = 0;
  public progressInCreatingStudentAlert: string = '';
  public progressInCreatingStudentAlertInterval!: any;
  public selectTabInCreatingStudent(id: number): void {
    this.progressInCreatingStudentAlert = '';
    clearTimeout(this.progressInCreatingStudentAlertInterval);
    if (this.selectedTabInCreatingStudent === 0 && id > 0) {
      this.progressInCreatingStudentAlert = 'pupilcard/firstFillInformation';
      this.progressInCreatingStudentAlertInterval = setTimeout(() => {
        this.progressInCreatingStudentAlert = '';
      }, 3500);
      return;
    }
    this.selectedTabInCreatingStudent = id;
  }

  public studentCreateInputsBasicInfo: FormInput[] = [
    {
      type: 'text',
      name: 'firstName',
      label: 'firstName',
    },
    {
      type: 'text',
      name: 'lastName',
      label: 'lastName',
    },
    {
      type: 'date',
      name: 'birthday',
      label: 'birthday',
    },
    { /** TODO: SELECT  */
      type: 'select',
      select: 'row',
      name: 'sex',
      label: 'sex',
      options: ['genders/0', 'genders/1'],
      value: 'genders/0',
      optionAsLocale: true
    },
    { /** TODO: SELECT  */
      type: 'text',
      name: 'class',
      label: 'class',
    },
    { /** TODO: SUPPORT FOR MORE emails */
      type: 'text',
      name: 'email',
      label: 'email',
    },
    { /** TODO: SUPPORT FOR MORE phone numbers */
      type: 'text',
      name: 'phone',
      label: 'phone',
    },
  ];

  public studentCreateInputsAddress: FormInput[] = [
    {
      type: 'text',
      name: 'street',
      label: 'street'
    }, {
      type: 'text',
      name: 'number',
      label: 'houseNumber'
    }, {
      type: 'text',
      name: 'city',
      label: 'city'
    }, {
      type: 'text', 
      name: 'postcode', 
      label: 'postcode'
    }, {
      type: 'text',
      name: 'nationality',
      label: 'nationality'
    }, {
      type: 'text',
      name: 'district',
      label: 'district'
    }, {
      type: 'text',
      name: 'cityPart',
      label: 'cityPart'
    }
  ]

  /*** Details of student */

  public studentInfoInputs: FormInput[] = [
    {
      type: 'text',
      name: 'firstName',
      label: 'firstName',
      readonly: true,
      value: () => this.data[this.table.selectedItem as number][0]
    },
    {
      type: 'text',
      name: 'lastName',
      label: 'lastName',
      readonly: true,
      value: () => this.data[this.table.selectedItem as number][1]
    },
    {
      type: 'text',
      name: 'class',
      label: 'class',
      readonly: true,
      value: () => this.data[this.table.selectedItem as number][2]
    },
    {
      type: 'text',
      name: 'sex',
      label: 'sex',
      readonly: true,
      value: () => this.data[this.table.selectedItem as number][3]
    }
  ]


}