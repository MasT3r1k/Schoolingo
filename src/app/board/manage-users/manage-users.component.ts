import { NgStyle, NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Data, dataAPI, DatalistComponent, errorAPI, Metadata } from '@Components/Datalist/Datalist';
import { Schoolingo } from '@Schoolingo';
import { Permission } from '@Schoolingo/Permissions';
import { BehaviorSubject, Subscription } from 'rxjs';
import { studentInfoAPI } from '../students/students';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

function getUserRole(studentInfo: { studentId: number | null, teacherId: number | null, parentId: number | null }): string {
  if (studentInfo.studentId !== null) return "student";
  else if (studentInfo.teacherId !== null) return "teacher";
  else if (studentInfo.parentId !== null) return "parent";
  return "unknown";
}

@Component({
  standalone: true,
  imports: [DatalistComponent, FormsModule, ReactiveFormsModule, NgClass],
  templateUrl: './manage-users.component.html',
  styleUrls: ['./manage-users.component.css', '../../Styles/card.css', '../../Styles/input.css', '../../Styles/item.css', '../../Styles/app.css']
})
export class ManageUsersComponent {
  constructor(
    public schoolingo: Schoolingo,
    public perms: Permission,
    private sanitizer: DomSanitizer
  ) {}

  private listeners: Subscription[] = [];

  public selectedTab = new BehaviorSubject<number>(0);
  public user_selectedTab = new BehaviorSubject<number>(0);
  public selectedUser = -1;
  public loadedUser: studentInfoAPI | 'error' | null = null;
  public selectedRow = -1;
  public maximazedWindow = false;
  public hasAccess = true;
  public users = new BehaviorSubject<Data[][]>([]);
  public userCount = 0;
  public metadata: Metadata = { rows: 0 };
  public datalist!: DatalistComponent;
  public search = new FormControl();

  receivedDatalist(value: DatalistComponent): void {
    this.datalist = value;
  }

  onClick = (id: { id: number }[], index: number) => {
    console.log(id);
  }

  public getTags(user: any): string {
    let tags = [];
    if (user.manager == -1) {
      tags.push("<div class='badge blue'>" + this.schoolingo.locale.getLocale('roles/manager') + "</div>");
    }
    if (user.principal) {
      tags.push("<div class='badge blue'>" + this.schoolingo.locale.getLocale('roles/principal') + "</div>");
    }
    return `
    <div class='flex-items badges'>
    ${tags.join('')}
    </div>`;
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
              { value: user.username, isLocale: false },
              { value: user.firstName, isLocale: false },
              { value: user.lastName, isLocale: false },
              { value: 'roles/' + getUserRole(user), isLocale: true },
              { html: this.getTags(user) }
            ]);
          });

          this.metadata.rows = data.rows;
          if (this.selectedTab.getValue() === 0) this.userCount = data.rows;
          this.users.next(userList);
        }
      }));
  }
}
