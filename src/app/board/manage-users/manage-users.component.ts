import { NgStyle, NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Data, dataAPI, DatalistComponent, errorAPI, Metadata } from '@Components/Datalist/Datalist';
import { TabsComponent } from '@Components/Tabs/Tabs';
import { Schoolingo } from '@Schoolingo';
import { Permission } from '@Schoolingo/Permissions';
import { BehaviorSubject, Subscription } from 'rxjs';
import { studentInfoAPI } from '../students/students';
import moment from 'moment';
import { Utils } from '@Schoolingo/Utils';

function getUserRole(studentInfO: { studentId: number, teacherId: number, parentId: number }): string {
  if (studentInfO.studentId !== null) return "student";
  if (studentInfO.teacherId !== null) return "teacher";
  if (studentInfO.parentId !== null) return "parent";
  return "unknown";
}

@Component({
  standalone: true,
  imports: [DatalistComponent, FormsModule, ReactiveFormsModule, NgStyle, NgClass],
  templateUrl: './manage-users.component.html',
  styleUrls: ['./manage-users.component.css', '../../Styles/card.css', '../../Styles/input.css', '../../Styles/item.css', '../../Styles/app.css']
})
export class ManageUsersComponent {
  constructor(
    public schoolingo: Schoolingo,
    public perms: Permission
  ) {}

  private listeners: Subscription[] = [];

  public selectedTab = new BehaviorSubject(0);
  public student_selectedTab = new BehaviorSubject(0);
  public selectedStudent = -1;
  public loadedStudent: studentInfoAPI | 'error' | null = null;
  public selectedRow = -1;
  public maximazedWindow = false;
  public hasAccess = true;
  public users = new BehaviorSubject([] as Data[][]);
  public studentCount = 0;
  public metadata: Metadata = { rows: 0 };
  public datalist!: DatalistComponent;
  public search = new FormControl();

  receivedDatalist(value: DatalistComponent): void {
    this.datalist = value;
  }

  onClick = (id: { id: number }[], index: number) => {
  }

  ngOnInit(): void {
      this.listeners.push(this.schoolingo.socketService.addFunction("users:getUsers").subscribe((data: dataAPI | errorAPI) => {
        if ('error' in data) {
          this.hasAccess = false;
          return;
        }
        if ('data' in data) {
          this.hasAccess = true;
          let userList: Data[][] = []
          data.data.forEach((user: any) => {
            userList.push([
              { id: user.userId },
              {value: user.username, isLocale: false},
              {value: user.firstName, isLocale: false},
              {value: user.lastName, isLocale: false},
              {value: 'roles/' + getUserRole(user), isLocale: true},
              {value: "", isLocale: false},
              {value: "", isLocale: false}])
          });
          this.metadata.rows = data.rows;
          if (this.selectedTab.getValue() === 0) this.studentCount = data.rows;
          this.users.next(userList);
        }
      }));
  }
}
