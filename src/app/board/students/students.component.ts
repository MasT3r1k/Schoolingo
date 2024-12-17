import { NgClass, NgStyle } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Data, dataAPI, DatalistComponent, Metadata } from '@Components/Datalist/Datalist';
import { TabsComponent } from '@Components/Tabs/Tabs';
import { Schoolingo } from '@Schoolingo';
import { Permission } from '@Schoolingo/Permissions';
import { Utils } from '@Schoolingo/Utils';
import moment from 'moment';
import { BehaviorSubject, debounceTime, Subscription } from 'rxjs';

@Component({
  standalone: true,
  imports: [DatalistComponent, TabsComponent, FormsModule, ReactiveFormsModule, NgStyle, NgClass],
  templateUrl: './students.component.html',
  styleUrls: ['./students.component.css', '../../Styles/card.css', '../../Styles/input.css']
})
export class studentsComponent implements OnInit {
  private listeners: Subscription[] = [];

  constructor(
    public schoolingo: Schoolingo,
    public perms: Permission
  ){}

  public selectedTab: BehaviorSubject<number> = new BehaviorSubject(0);
  public selectedStudent: number = -1;
  public selectedRow: number = -1;
  public hasAccess: boolean = true;
  public students: BehaviorSubject<Data[][] | any> = new BehaviorSubject([]);
  public studentCount: number = 0;
  public metadata: Metadata = { rows: 0 };
  public datalist!: DatalistComponent;
  public search: FormControl<string> = new FormControl();

  receivedDatalist(value: DatalistComponent): void {
    this.datalist = value;
  }

  public reset(): void {
    this.selectedRow = -1;
    setTimeout(() => {
      this.selectedStudent = -1;
    }, 300)
  }

  onClick = (id: { id: number }[], index: number) => {
    if (this.selectedRow === index) {
      this.reset();
      return;
    }


    this.selectedRow = index;
    this.selectedStudent = id[0].id;
  }

  ngOnInit(): void {

    this.listeners.push(this.schoolingo.socketService.addFunction("main:getStudents").subscribe((data: dataAPI | any) => {
      console.log(data)
      if (data.error != undefined) {
        this.hasAccess = false;
        return;
      }
      if (data.data) {
        this.hasAccess = true;
        let studentList: Data[][] = []
        data.data.forEach((student: any) => {
          studentList.push([
            { id: student.personId },
            {value: student.firstName, isLocale: false},
            {value: student.lastName, isLocale: false},
            {value: student.className, isLocale: false},
            {value: moment(student.birthday).format("D. MMMM YYYY") + ' (' + Utils.getAge(moment(student.birthday)) + ' ' + this.schoolingo.locale.getLocale('ageUnit') + ')', isLocale: false},
            {value: Utils.formatAddress({ code2: student.code2, street: student.street, houseNumber: student.houseNumber, city: student.cityName, postcode: student.postcode }), isLocale: false}])
        });
        this.metadata.rows = data.rows;
        if (this.selectedTab.getValue() === 0) this.studentCount = data.rows;
        this.students.next(studentList);
      }
    }));

    this.search.valueChanges.pipe(debounceTime(300)).subscribe(() => this.reset())

    this.selectedTab.subscribe(() => {
      this.selectedRow = -1;
      this.selectedStudent = -1;
      setTimeout(() => this.datalist.loadData());
    });
  }

  ngOnDestroy(): void {
    this.listeners.forEach((sub: Subscription) => sub.unsubscribe());
  }

}
