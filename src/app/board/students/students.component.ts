import { NgClass, NgStyle } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Data, dataAPI, DatalistComponent, errorAPI, Metadata } from '@Components/Datalist/Datalist';
import { TabsComponent } from '@Components/Tabs/Tabs';
import { Schoolingo } from '@Schoolingo';
import { Permission } from '@Schoolingo/Permissions';
import { Utils } from '@Schoolingo/Utils';
import { BehaviorSubject, debounceTime, Subscription } from 'rxjs';
import { studentInfoAPI } from './students';
import { IconsModule } from '../../Modules/Icons.module';

@Component({
  standalone: true,
  imports: [DatalistComponent, TabsComponent, FormsModule, ReactiveFormsModule, NgStyle, NgClass, IconsModule],
  templateUrl: './students.component.html',
  styleUrls: ['./students.component.css', '../../Styles/card.css', '../../Styles/input.css', '../../Styles/item.css', '../../Styles/app.css']
})
export class studentsComponent implements OnInit {
  private listeners: Subscription[] = [];

  constructor(
    public schoolingo: Schoolingo,
    public perms: Permission
  ){}

  public selectedTab = new BehaviorSubject(0);
  public student_selectedTab = new BehaviorSubject(0);
  public selectedStudent = -1;
  public loadedStudent: studentInfoAPI | 'error' | null = null;
  public selectedRow = -1;
  public maximazedWindow = false;
  public hasAccess = true;
  public students = new BehaviorSubject([] as Data[][]);
  public studentCount = 0;
  public metadata: Metadata = { rows: 0 };
  public datalist!: DatalistComponent;
  public search = new FormControl();

  receivedDatalist(value: typeof this.datalist): void {
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
    this.schoolingo.socketService.emit('main:getStudentInfo', { studentId: id[0].id });
  }

  ngOnInit(): void {

    this.listeners.push(this.schoolingo.socketService.addFunction("main:getStudents").subscribe((data: dataAPI | errorAPI) => {
      if ('error' in data) {
        this.hasAccess = false;
        return;
      }
      if ('data' in data) {
        this.hasAccess = true;
        let studentList: Data[][] = []
        data.data.forEach((student: any) => {
          studentList.push([
            { id: student.personId },
            { value: student.firstName, isLocale: false },
            { value: student.lastName, isLocale: false },
            { value: this.selectedTab.getValue() ? this.schoolingo.locale.getLocale('students/inArchive') : student.className, isLocale: false } ,
            { value: Utils.makeMoment(student.birthday).format("D. MMMM YYYY") + ' (' + Utils.getAge(Utils.makeMoment(student.birthday)) + ' ' + this.schoolingo.locale.getLocale('ageUnit') + ')', isLocale: false },
            { value: Utils.formatAddress({ code2: student.code2, street: student.street, houseNumber: student.houseNumber, city: student.cityName, postcode: student.postcode }) || this.schoolingo.locale.getLocale('addressNotSet'), isLocale: false }
          ])
        });
        this.metadata.rows = data.rows;
        if (this.selectedTab.getValue() === 0) this.studentCount = data.rows;
        this.students.next(studentList);
      }
    }));

    this.listeners.push(this.schoolingo.socketService.addFunction("main:getStudentInfo").subscribe((data: studentInfoAPI | errorAPI) => {
      if ('error' in data) {
        this.loadedStudent = 'error';
        return;
      }
      this.loadedStudent = data;
      setTimeout(() => this.student_selectedTab.next(0), 150)
    }));

    this.search.valueChanges.pipe(debounceTime(300)).subscribe(() => this.reset())

    this.selectedTab.subscribe(() => {
      this.selectedRow = -1;
      this.selectedStudent = -1;
      setTimeout(() => this.datalist.loadData());
    });
  }

  public toggleMaximize(): void {
    this.maximazedWindow = !this.maximazedWindow;
    setTimeout(() => this.student_selectedTab.next(this.student_selectedTab.getValue()))
  }

  ngOnDestroy(): void {
    this.listeners.forEach((sub: Subscription) => sub.unsubscribe());
  }

}
